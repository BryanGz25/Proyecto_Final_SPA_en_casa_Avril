import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import jsonServer from "json-server";

const directorio = path.dirname(fileURLToPath(import.meta.url));
const archivoBaseDatos = path.join(directorio, "db.json");
const puerto = Number(process.env.API_PORT || 3002);
const host = process.env.API_HOST || "127.0.0.1";
const duracionSesion = 2 * 60 * 60 * 1000;
const intentosMaximos = 8;
const ventanaIntentos = 15 * 60 * 1000;
const sesiones = new Map();
const intentosLogin = new Map();
const hashFalso = bcrypt.hashSync("avrill-login-dummy", 10);
const servidor = jsonServer.create();
const router = jsonServer.router(archivoBaseDatos);

servidor.use(jsonServer.bodyParser);

const responderError = (respuesta, codigo, mensaje) =>
  respuesta.status(codigo).json({ error: mensaje });

const usuarioPublico = (usuario) => {
  if (!usuario) return null;
  const datosPublicos = { ...usuario };
  delete datosPublicos.clave;
  delete datosPublicos.token;
  delete datosPublicos.codigoDescuentoHash;
  return datosPublicos;
};

const obtenerCookie = (solicitud, nombre) => {
  const cookies = solicitud.headers.cookie || "";
  const valor = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${nombre}=`));
  return valor ? decodeURIComponent(valor.slice(nombre.length + 1)) : null;
};

const obtenerSesion = (solicitud) => {
  const token = obtenerCookie(solicitud, "avrill_session");
  const sesion = token ? sesiones.get(token) : null;
  if (!sesion || sesion.expira <= Date.now()) {
    if (token) sesiones.delete(token);
    return null;
  }

  const usuario = router.db
    .get("usuarios")
    .find((registro) => String(registro.id) === String(sesion.usuarioId))
    .value();

  if (!usuario) {
    sesiones.delete(token);
    return null;
  }

  return { token, usuario };
};

const establecerCookie = (respuesta, token, maxAge) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  respuesta.setHeader(
    "Set-Cookie",
    `avrill_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`
  );
};

const crearSesion = (respuesta, usuario) => {
  const token = crypto.randomBytes(32).toString("base64url");
  sesiones.set(token, {
    usuarioId: usuario.id,
    expira: Date.now() + duracionSesion,
  });
  establecerCookie(respuesta, token, Math.floor(duracionSesion / 1000));
  return usuarioPublico(usuario);
};

const obtenerIntentos = (solicitud) => {
  const llave = solicitud.ip || solicitud.socket.remoteAddress || "desconocido";
  const actual = intentosLogin.get(llave);
  if (!actual || actual.inicia + ventanaIntentos <= Date.now()) {
    return { llave, intentos: 0, inicia: Date.now() };
  }
  return { llave, ...actual };
};

const origenPermitido = (origen) => {
  const permitidosConfigurados = (process.env.APP_ORIGINS || "")
    .split(",")
    .map((valor) => valor.trim())
    .filter(Boolean);
  if (permitidosConfigurados.includes(origen)) return true;
  if (process.env.NODE_ENV === "production") return false;

  try {
    const url = new URL(origen);
    return url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
};

servidor.use((solicitud, respuesta, siguiente) => {
  const metodoEscritura = !["GET", "HEAD", "OPTIONS"].includes(solicitud.method);
  if (metodoEscritura) {
    const origen = solicitud.get("origin");
    if (!origen || !origenPermitido(origen)) {
      return responderError(respuesta, 403, "Origen no permitido.");
    }
  }
  siguiente();
});

servidor.post("/auth/login", async (solicitud, respuesta) => {
  const { usuario: nombreUsuario, clave } = solicitud.body || {};
  if (
    typeof nombreUsuario !== "string" ||
    typeof clave !== "string" ||
    nombreUsuario.length > 40 ||
    clave.length > 40
  ) {
    return responderError(respuesta, 400, "Usuario o contraseña incorrectos.");
  }

  const intentos = obtenerIntentos(solicitud);
  if (intentos.intentos >= intentosMaximos) {
    return responderError(respuesta, 429, "Demasiados intentos. Espera unos minutos y vuelve a intentar.");
  }

  const usuario = router.db
    .get("usuarios")
    .find((registro) => registro.usuario?.toLowerCase() === nombreUsuario.trim().toLowerCase())
    .value();
  const hash = typeof usuario?.clave === "string" ? usuario.clave : hashFalso;
  let claveValida;

  try {
    claveValida = await bcrypt.compare(clave, hash);
  } catch {
    claveValida = false;
  }

  if (!usuario || !claveValida || !/^\$2[aby]\$/.test(hash)) {
    intentosLogin.set(intentos.llave, {
      inicia: intentos.inicia,
      intentos: intentos.intentos + 1,
    });
    return responderError(respuesta, 401, "Usuario o contraseña incorrectos.");
  }

  intentosLogin.delete(intentos.llave);
  const publicUser = crearSesion(respuesta, usuario);
  return respuesta.json({ usuario: publicUser });
});

servidor.post("/auth/register", async (solicitud, respuesta) => {
  const datos = solicitud.body || {};
  const nombreUsuario = typeof datos.usuario === "string" ? datos.usuario.trim() : "";
  const clave = typeof datos.clave === "string" ? datos.clave : "";
  const correo = typeof datos.correo === "string" ? datos.correo.trim().toLowerCase() : "";

  if (!/^[\p{L}\p{N}_.-]{3,40}$/u.test(nombreUsuario)) {
    return responderError(respuesta, 400, "El usuario debe tener entre 3 y 40 caracteres válidos.");
  }
  if (clave.length < 10 || clave.length > 72) {
    return responderError(respuesta, 400, "La contraseña debe tener entre 10 y 72 caracteres.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return responderError(respuesta, 400, "Escribe un correo válido.");
  }

  const usuarios = router.db.get("usuarios");
  const repetido = usuarios.find((registro) =>
    registro.usuario?.toLowerCase() === nombreUsuario.toLowerCase() ||
    registro.correo?.toLowerCase() === correo
  ).value();
  if (repetido) return responderError(respuesta, 409, "Ese usuario o correo ya está registrado.");

  const nuevo = {
    usuario: nombreUsuario,
    clave: await bcrypt.hash(clave, 12),
    nombre: String(datos.nombre || "").trim().slice(0, 100),
    correo,
    telefono: String(datos.telefono || "").replace(/\D/g, "").slice(0, 30),
    rol: "cliente",
    token: null,
  };
  usuarios.insert(nuevo).write();
  const usuarioCreado = usuarios.find(
    (registro) => registro.usuario === nombreUsuario
  ).value();
  if (!usuarioCreado) return responderError(respuesta, 500, "No se pudo crear la cuenta.");

  const publicUser = crearSesion(respuesta, usuarioCreado);
  return respuesta.status(201).json({ usuario: publicUser });
});

servidor.post("/auth/change-password", async (solicitud, respuesta) => {
  const sesion = obtenerSesion(solicitud);
  if (!sesion) return responderError(respuesta, 401, "Inicia sesión para continuar.");

  const { claveActual, claveNueva } = solicitud.body || {};
  if (
    typeof claveActual !== "string" ||
    typeof claveNueva !== "string" ||
    claveNueva.length < 10 ||
    claveNueva.length > 72
  ) {
    return responderError(respuesta, 400, "La nueva contraseña debe tener entre 10 y 72 caracteres.");
  }

  const claveValida = await bcrypt.compare(claveActual, sesion.usuario.clave).catch(() => false);
  if (!claveValida) return responderError(respuesta, 401, "La contraseña actual es incorrecta.");

  const actualizado = router.db
    .get("usuarios")
    .find((usuario) => String(usuario.id) === String(sesion.usuario.id))
    .assign({ clave: await bcrypt.hash(claveNueva, 12) })
    .write();

  for (const [token, datosSesion] of sesiones) {
    if (String(datosSesion.usuarioId) === String(actualizado.id)) sesiones.delete(token);
  }

  return respuesta.json({ usuario: crearSesion(respuesta, actualizado) });
});

servidor.get("/auth/session", (solicitud, respuesta) => {
  const sesion = obtenerSesion(solicitud);
  if (!sesion) return respuesta.json({ usuario: null });
  return respuesta.json({ usuario: usuarioPublico(sesion.usuario) });
});

servidor.post("/auth/logout", (solicitud, respuesta) => {
  const token = obtenerCookie(solicitud, "avrill_session");
  if (token) sesiones.delete(token);
  establecerCookie(respuesta, "", 0);
  return respuesta.json({ ok: true });
});

servidor.use((solicitud, respuesta, siguiente) => {
  if (!/^\/usuarios(?:\/|$)/.test(solicitud.path)) return siguiente();

  const sesion = obtenerSesion(solicitud);
  if (!sesion) return responderError(respuesta, 401, "Inicia sesión para continuar.");
  const esAdmin = sesion.usuario.rol === "admin";
  const idUsuario = solicitud.path.match(/^\/usuarios\/([^/]+)$/)?.[1];

  if (solicitud.method === "GET") {
    if (!esAdmin && String(sesion.usuario.id) !== String(idUsuario)) {
      return responderError(respuesta, 403, "Acceso denegado.");
    }
    if (idUsuario) {
      const usuario = router.db
        .get("usuarios")
        .find((registro) => String(registro.id) === String(idUsuario))
        .value();
      return usuario
        ? respuesta.json(usuarioPublico(usuario))
        : responderError(respuesta, 404, "Usuario no encontrado.");
    }
    if (!esAdmin) return responderError(respuesta, 403, "Acceso denegado.");
    return respuesta.json(router.db.get("usuarios").value().map(usuarioPublico));
  }

  if (solicitud.method === "POST") {
    return responderError(respuesta, 405, "Usa el endpoint seguro de registro.");
  }

  if (!["PUT", "PATCH", "DELETE"].includes(solicitud.method) || !idUsuario) {
    return responderError(respuesta, 405, "Método no permitido.");
  }
  if (!esAdmin && String(sesion.usuario.id) !== String(idUsuario)) {
    return responderError(respuesta, 403, "Acceso denegado.");
  }
  if (solicitud.method === "DELETE" && !esAdmin) {
    return responderError(respuesta, 403, "Acceso denegado.");
  }
  if (solicitud.method === "DELETE" && String(sesion.usuario.id) === String(idUsuario)) {
    return responderError(respuesta, 409, "No puedes eliminar tu propia cuenta activa.");
  }

  const registro = router.db
    .get("usuarios")
    .find((usuario) => String(usuario.id) === String(idUsuario));
  const existente = registro.value();
  if (!existente) return responderError(respuesta, 404, "Usuario no encontrado.");

  if (solicitud.method === "DELETE") {
    router.db.get("usuarios").remove((usuario) => String(usuario.id) === String(idUsuario)).write();
    return respuesta.status(204).end();
  }

  const camposPermitidos = esAdmin
    ? ["nombre", "correo", "telefono", "direccion", "rol"]
    : ["nombre", "correo", "telefono", "direccion"];
  const cambios = {};
  for (const campo of camposPermitidos) {
    if (Object.hasOwn(solicitud.body || {}, campo)) cambios[campo] = solicitud.body[campo];
  }
  if (Object.hasOwn(solicitud.body || {}, "clave") || Object.hasOwn(solicitud.body || {}, "token")) {
    return responderError(respuesta, 400, "No se permite modificar credenciales desde este endpoint.");
  }
  const actualizado = registro.assign(cambios).write();
  if (String(sesion.usuario.id) === String(idUsuario)) sesion.usuario = actualizado;
  return respuesta.json(usuarioPublico(actualizado));
});

servidor.use((solicitud, respuesta, siguiente) => {
  if (/^\/pedidos(?:\/|$)/.test(solicitud.path)) {
    const sesion = obtenerSesion(solicitud);
    if (!sesion) return responderError(respuesta, 401, "Inicia sesión para continuar.");

    const idPedido = solicitud.path.match(/^\/pedidos\/([^/]+)$/)?.[1];
    const esAdmin = sesion.usuario.rol === "admin";

    if (solicitud.method === "GET") {
      const pedidos = router.db.get("pedidos").value() || [];
      if (idPedido) {
        const pedido = pedidos.find((registro) => String(registro.id) === idPedido);
        if (!pedido || (!esAdmin && pedido.usuario !== sesion.usuario.usuario)) {
          return responderError(respuesta, 404, "Pedido no encontrado.");
        }
        return respuesta.json(pedido);
      }
      return respuesta.json(esAdmin
        ? pedidos
        : pedidos.filter((pedido) => pedido.usuario === sesion.usuario.usuario));
    }

    if (solicitud.method === "POST") {
      const lineasSolicitadas = solicitud.body?.productos;
      if (!Array.isArray(lineasSolicitadas) || lineasSolicitadas.length === 0) {
        return responderError(respuesta, 400, "El pedido debe incluir productos.");
      }

      const productos = router.db.get("productos").value() || [];
      const lineas = [];
      for (const linea of lineasSolicitadas) {
        const producto = productos.find((registro) => String(registro.id) === String(linea.id));
        const cantidad = Number(linea.cantidad);
        if (!producto || !producto.disponible || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
          return responderError(respuesta, 400, "Hay productos o cantidades inválidas en el pedido.");
        }
        lineas.push({ ...producto, cantidad });
      }

      const total = lineas.reduce((suma, producto) => suma + Number(producto.precio) * producto.cantidad, 0);
      const datosCliente = solicitud.body?.cliente || {};
      const lat = Number(datosCliente.coordenadas?.lat);
      const lng = Number(datosCliente.coordenadas?.lng);
      const coordenadas = datosCliente.coordenadas
        && Number.isFinite(lat) && Number.isFinite(lng)
        && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
        ? { lat, lng }
        : null;
      const pedido = {
        id: Date.now(),
        usuario: sesion.usuario.usuario,
        cliente: {
          nombre: String(datosCliente.nombre || sesion.usuario.nombre).trim().slice(0, 100),
          correo: String(datosCliente.correo || sesion.usuario.correo || "").trim().slice(0, 254),
          telefono: String(datosCliente.telefono || sesion.usuario.telefono || "").replace(/\D/g, "").slice(0, 30),
          direccion: String(datosCliente.direccion || "").trim().slice(0, 300),
          identificacion: String(datosCliente.identificacion || "").trim().slice(0, 40),
          coordenadas,
        },
        productos: lineas,
        total,
        estado: "pendiente",
        fecha: new Date().toISOString(),
        factura: null,
      };
      router.db.get("pedidos").push(pedido).write();
      return respuesta.status(201).json(pedido);
    }

    if (["PATCH", "PUT"].includes(solicitud.method) && esAdmin && idPedido) {
      const estadosPermitidos = ["pendiente", "confirmado", "en preparacion", "entregado", "cancelado"];
      const estado = solicitud.body?.estado;
      if (!estadosPermitidos.includes(estado)) {
        return responderError(respuesta, 400, "Estado de pedido no válido.");
      }
      const pedidoActualizado = router.db.get("pedidos")
        .find((pedido) => String(pedido.id) === idPedido)
        .assign({ estado })
        .write();
      return pedidoActualizado
        ? respuesta.json(pedidoActualizado)
        : responderError(respuesta, 404, "Pedido no encontrado.");
    }

    return responderError(respuesta, 403, "Operación no permitida.");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(solicitud.method) && /^\/productos(?:\/|$)/.test(solicitud.path)) {
    const sesion = obtenerSesion(solicitud);
    if (!sesion) return responderError(respuesta, 401, "Inicia sesión para continuar.");
    if (sesion.usuario.rol !== "admin") return responderError(respuesta, 403, "Acceso denegado.");
  }
  siguiente();
});

servidor.use(router);
servidor.disable("x-powered-by");
servidor.listen(puerto, host, () => {
  console.log(`API autenticada lista en http://${host}:${puerto}`);
});
