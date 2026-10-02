/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { productosIniciales } from "../data/productos";
import Home from "../pages/Home";
import Catalogo from "../pages/Catalogo";
import DetalleProducto from "../pages/DetalleProducto";
import Carrito from "../pages/Carrito";
import Login from "../pages/Login";
import VistaUsuario from "../pages/VistaUsuario";
import Dashboard from "../pages/Dashboard";
import PrivateRoutes from "./PrivateRoutes"; // 👈 Importación correcta desde la misma carpeta /routes/
import WhatsAppFlotante from "../components/WhatsAppFlotante";
import AsistenteIA from "../components/AsistenteIA";
import NotificacionBienvenida from "../components/NotificacionBienvenida";
import NotificacionCompra from "../components/NotificacionCompra";
import { apiPedidos, apiProductos, apiSesion, apiUsuarios } from "../services/api";
import { construirFactura } from "../utils/factura";
import {
  obtenerCarritoStorage,
  guardarCarritoStorage,
} from "../utils/storage";

const NavegacionContexto = createContext(null);

export function useAppContext() {
  return useContext(NavegacionContexto);
}

export function useNavigate() {
  const { navigate } = useAppContext();
  return navigate;
}

export default function Routing() {
  const [rutaActual, setRutaActual] = useState(window.location.pathname || "/");
  const [productos, setProductos] = useState(productosIniciales);
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carrito, setCarrito] = useState(obtenerCarritoStorage());
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [bienvenidaNombre, setBienvenidaNombre] = useState(null);
  const [notificacionCompra, setNotificacionCompra] = useState(null);

  // Accesibilidad y Modo Oscuro
  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("avrill_modo_oscuro") === "true";
  });
  const [tamanoTexto, setTamanoTexto] = useState(() => {
    return localStorage.getItem("avrill_tamano_texto") || "normal";
  });

  useEffect(() => {
    if (modoOscuro) {
      document.body.classList.add("modo-oscuro");
    } else {
      document.body.classList.remove("modo-oscuro");
    }
    localStorage.setItem("avrill_modo_oscuro", modoOscuro);
  }, [modoOscuro]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("txt-normal", "txt-grande", "txt-extra");
    html.classList.add(`txt-${tamanoTexto}`);
    localStorage.setItem("avrill_tamano_texto", tamanoTexto);
  }, [tamanoTexto]);

  const toggleModoOscuro = () => setModoOscuro((prev) => !prev);
  const cambiarTamanoTexto = (tamano) => setTamanoTexto(tamano);

  // Navegación SPA
  const navigate = (ruta) => {
    window.history.pushState({}, "", ruta);
    setRutaActual(ruta);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const manejarPopState = () => setRutaActual(window.location.pathname);
    window.addEventListener("popstate", manejarPopState);
    return () => window.removeEventListener("popstate", manejarPopState);
  }, []);

  useEffect(() => {
    guardarCarritoStorage(carrito);
  }, [carrito]);

  useEffect(() => {
    let activo = true;
    const cargarDatosIniciales = async () => {
      try {
        const [listaProductos, sesion] = await Promise.all([
          apiProductos.listar(),
          apiSesion.validar(),
        ]);
        if (!activo) return;

        if (Array.isArray(listaProductos)) setProductos(listaProductos);
        const usuario = sesion?.usuario || null;
        setUsuarioActivo(usuario);

        if (usuario) {
          const [listaPedidos, listaUsuarios] = await Promise.all([
            apiPedidos.listar().catch(() => []),
            usuario.rol === "admin" ? apiUsuarios.listar().catch(() => []) : [],
          ]);
          if (!activo) return;
          setPedidos(Array.isArray(listaPedidos) ? listaPedidos : []);
          setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : []);
        }
      } catch {
        if (activo) {
          setUsuarioActivo(null);
          setPedidos([]);
          setUsuarios([]);
        }
      } finally {
        if (activo) setCargandoInicial(false);
      }
    };

    cargarDatosIniciales();
    return () => {
      activo = false;
    };
  }, []);

  const iniciarSesion = async (credenciales) => {
    const respuesta = await apiSesion.iniciar(credenciales);
    const usuario = respuesta.usuario;
    setUsuarioActivo(usuario);

    const [listaPedidos, listaUsuarios] = await Promise.all([
      apiPedidos.listar().catch(() => []),
      usuario.rol === "admin" ? apiUsuarios.listar().catch(() => []) : [],
    ]);
    setPedidos(Array.isArray(listaPedidos) ? listaPedidos : []);
    setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : []);
    return usuario;
  };

  const registrarUsuario = async (datos) => {
    const respuesta = await apiSesion.registrar(datos);
    setUsuarioActivo(respuesta.usuario);
    setPedidos([]);
    return respuesta.usuario;
  };

  const cambiarClave = async (claveActual, claveNueva) => {
    const respuesta = await apiSesion.cambiarClave(claveActual, claveNueva);
    setUsuarioActivo(respuesta.usuario);
    return respuesta.usuario;
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setPedidos([]);
    setUsuarios([]);
    navigate("/login");
    apiSesion.cerrar().catch(() => {});
  };

  const actualizarUsuario = async (id, cambios) => {
    const actualizado = await apiUsuarios.actualizar(id, cambios);
    setUsuarios((actuales) => actuales.map((usuario) =>
      String(usuario.id) === String(id) ? actualizado : usuario
    ));
    if (String(usuarioActivo?.id) === String(id)) setUsuarioActivo(actualizado);
    return actualizado;
  };

  const eliminarUsuario = async (id) => {
    await apiUsuarios.eliminar(id);
    setUsuarios((actuales) => actuales.filter((usuario) => String(usuario.id) !== String(id)));
  };

  const agregarProducto = async (producto) => {
    const creado = await apiProductos.crear(producto);
    setProductos((actuales) => [...actuales, creado]);
    return creado;
  };

  const actualizarProducto = async (id, cambios) => {
    const actualizado = await apiProductos.actualizar(id, cambios);
    setProductos((actuales) => actuales.map((producto) =>
      String(producto.id) === String(id) ? actualizado : producto
    ));
    return actualizado;
  };

  const eliminarProducto = async (id) => {
    await apiProductos.eliminar(id);
    setProductos((actuales) => actuales.filter((producto) => String(producto.id) !== String(id)));
  };

  const actualizarEstadoPedido = async (id, estado) => {
    const actualizado = await apiPedidos.actualizar(id, { estado });
    setPedidos((actuales) => actuales.map((pedido) =>
      String(pedido.id) === String(id) ? actualizado : pedido
    ));
  };

  const crearPedido = async (datosEntrega) => {
    if (!usuarioActivo || carrito.length === 0) return null;

    const id = Date.now();
    const fecha = new Date().toISOString();
    const numero = `PF-${new Date().getFullYear()}-${String(pedidos.length + 1).padStart(4, "0")}`;
    const cliente = {
      nombre: datosEntrega?.nombre || usuarioActivo.nombre,
      correo: datosEntrega?.correo || usuarioActivo.correo || "",
      telefono: datosEntrega?.telefono || usuarioActivo.telefono || "",
      direccion: datosEntrega?.direccion || usuarioActivo.direccion || "",
      identificacion: datosEntrega?.identificacion || "",
      coordenadas: datosEntrega?.lat != null && datosEntrega?.lng != null
        ? { lat: datosEntrega.lat, lng: datosEntrega.lng }
        : null,
    };
    const pedido = {
      id,
      cliente,
      productos: carrito,
      fecha,
      factura: construirFactura({ id, numero, fecha, cliente, productos: carrito }),
    };

    const creado = await apiPedidos.crear(pedido);
    const pedidoConFactura = {
      ...creado,
      factura: construirFactura(creado),
    };
    setPedidos((actuales) => [...actuales, pedidoConFactura]);
    setCarrito([]);
    return pedidoConFactura;
  };

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      setCarrito((actual) => actual.filter((producto) => producto.id !== id));
      return;
    }
    setCarrito((actual) => actual.map((producto) =>
      producto.id === id ? { ...producto, cantidad } : producto
    ));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((actual) => actual.filter((producto) => producto.id !== id));
  };

  const totalCarrito = carrito.reduce(
    (total, producto) => total + Number(producto.precio) * producto.cantidad,
    0
  );

  const vaciarCarrito = () => setCarrito([]);

  /*
   * Los datos de sesión los controla el servidor mediante cookie HttpOnly.
   * El estado de usuario en React es solo para renderizado, nunca autorización.
   */

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { ...producto, cantidad }];
    });
  };

  const contexto = {
    rutaActual,
    navigate,
    productos,
    setProductos,
    carrito,
    setCarrito,
    agregarAlCarrito,
    cambiarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    totalCarrito,
    usuarioActivo,
    iniciarSesion,
    registrarUsuario,
    cambiarClave,
    cerrarSesion,
    pedidos,
    usuarios,
    actualizarUsuario,
    eliminarUsuario,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    actualizarEstadoPedido,
    crearPedido,
    mostrarNotificacion: setNotificacionCompra,
    modoOscuro,
    toggleModoOscuro,
    tamanoTexto,
    cambiarTamanoTexto,
  };

  if (cargandoInicial) {
    return (
      <main className="pagina paginas-cargando">
        <p>Cargando aplicación...</p>
      </main>
    );
  }

  let pagina = <Home />;
  if (rutaActual === "/catalogo") pagina = <Catalogo />;
  else if (rutaActual.startsWith("/producto/")) pagina = <DetalleProducto />;
  else if (rutaActual === "/carrito")
    pagina = (
      <PrivateRoutes>
        <Carrito />
      </PrivateRoutes>
    );
  else if (rutaActual === "/login") pagina = <Login />;
  else if (rutaActual === "/usuario")
    pagina = (
      <PrivateRoutes>
        <VistaUsuario />
      </PrivateRoutes>
    );
  else if (rutaActual === "/dashboard")
    pagina = (
      <PrivateRoutes soloAdmin>
        <Dashboard />
      </PrivateRoutes>
    );

  return (
    <NavegacionContexto.Provider value={contexto}>
      {pagina}
      <WhatsAppFlotante />
      <AsistenteIA productos={productos} />
      {bienvenidaNombre && (
        <NotificacionBienvenida
          nombre={bienvenidaNombre}
          onCerrar={() => setBienvenidaNombre(null)}
        />
      )}
      {notificacionCompra && (
        <NotificacionCompra
          mensaje={notificacionCompra}
          onCerrar={() => setNotificacionCompra(null)}
        />
      )}
    </NavegacionContexto.Provider>
  );
}