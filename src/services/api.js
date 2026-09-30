const BASE = "/api";
const TIEMPO_LIMITE = 10000;

const peticion = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opciones,
    signal: opciones.signal || AbortSignal.timeout(TIEMPO_LIMITE),
  });

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.error || `Error del servidor: ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }
  return datos;
};

export const apiUsuarios = {
  listar: () => peticion("/usuarios"),

  obtener: (id) => peticion(`/usuarios/${encodeURIComponent(id)}`),

  actualizar: (id, cambios) =>
    peticion(`/usuarios/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(cambios),
    }),

  eliminar: (id) =>
    peticion(`/usuarios/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const apiProductos = {
  listar: () => peticion("/productos"),

  crear: (datos) =>
    peticion("/productos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  actualizar: (id, cambios) =>
    peticion(`/productos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(cambios),
    }),

  eliminar: (id) =>
    peticion(`/productos/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const apiPedidos = {
  listar: () => peticion("/pedidos"),

  crear: (pedido) =>
    peticion("/pedidos", {
      method: "POST",
      body: JSON.stringify(pedido),
    }),

  actualizar: (id, cambios) =>
    peticion(`/pedidos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(cambios),
    }),
};

export const apiSesion = {
  iniciar: (credenciales) =>
    peticion("/auth/login", {
      method: "POST",
      body: JSON.stringify(credenciales),
    }),

  registrar: (datos) =>
    peticion("/auth/register", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  cambiarClave: (claveActual, claveNueva) =>
    peticion("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ claveActual, claveNueva }),
    }),

  validar: async () => {
    try {
      return await peticion("/auth/session");
    } catch {
      return null;
    }
  },

  cerrar: () => peticion("/auth/logout", { method: "POST" }),
};
