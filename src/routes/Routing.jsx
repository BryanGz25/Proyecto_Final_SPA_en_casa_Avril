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
import { apiSesion, apiUsuarios } from "../services/api";
import {
  obtenerCookie,
  guardarCookie,
  borrarCookie,
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
  const [carrito, setCarrito] = useState(obtenerCarritoStorage());
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [token, setToken] = useState(obtenerCookie("avrill_token") || "");
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [bienvenidaNombre, setBienvenidaNombre] = useState(null);

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
    const restaurarSesion = async () => {
      const idGuardado = obtenerCookie("avrill_id");
      const tokenGuardado = obtenerCookie("avrill_token");

      if (idGuardado && tokenGuardado) {
        try {
          const esValida = await apiSesion.validar(idGuardado, tokenGuardado);
          if (esValida) {
            const usuarioBD = await apiUsuarios.obtenerPorId(idGuardado);
            setUsuarioActivo(usuarioBD);
            setToken(tokenGuardado);
          } else {
            cerrarSesion();
          }
        } catch {
          cerrarSesion();
        }
      }
      setCargandoInicial(false);
    };

    restaurarSesion();
  }, []);

  const iniciarSesion = (usuario, tokenRecibido) => {
    setUsuarioActivo(usuario);
    setToken(tokenRecibido);
    guardarCookie("avrill_id", usuario.id);
    guardarCookie("avrill_token", tokenRecibido);
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setToken("");
    borrarCookie("avrill_id");
    borrarCookie("avrill_token");
  };

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
    usuarioActivo,
    token,
    iniciarSesion,
    cerrarSesion,
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
  else if (rutaActual === "/carrito") pagina = <Carrito />;
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
    </NavegacionContexto.Provider>
  );
}