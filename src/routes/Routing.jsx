
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { productosIniciales } from "../data/productos";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Catalogo from "../pages/Catalogo";
import DetalleProducto from "../pages/DetalleProducto";
import Carrito from "../pages/Carrito";
import Dashboard from "../pages/Dashboard";
import VistaUsuario from "../pages/VistaUsuario";
import WhatsAppFlotante from "../components/WhatsAppFlotante";
import NotificacionBienvenida from "../components/NotificacionBienvenida";
import PrivateRoutes from "../routes/PrivateRoutes";
import { apiUsuarios, apiSesion, apiProductos } from "../services/api";
import { construirFactura } from "../utils/factura";
import {
  NOMBRE_COOKIE_TOKEN,
  NOMBRE_COOKIE_USUARIO,
  borrarCookie,
  escribirCookie,
  leerCookie,
} from "../services/cookies";




const usuariosIniciales = [
  {
    id: 1,
    usuario: "admin",
    clave: "admin123",
    rol: "admin",
    nombre: "Administrador Avrill",
    correo: "admin@avrill.com",
    telefono: "62848105",
    direccion: "San José, Costa Rica",
  },
  {
    id: 2,
    usuario: "prueba",
    clave: "prueba123",
    rol: "cliente",
    nombre: "Cliente Avrill",
    correo: "cliente@avrill.com",
    telefono: "60123456",
    direccion: "Escazú, San José, Costa Rica",
  },
];

const NavegacionContexto = createContext(null);

const leerStorage = (clave, valorInicial) => {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : valorInicial;
  } catch {
    return valorInicial;
  }
};

export function useAppContext() {
  return useContext(NavegacionContexto);
}

export function useNavigate() {
  const { navigate } = useAppContext();
  return navigate;
}

export default function Routing() {
  const [rutaActual, setRutaActual] = useState(
    window.location.pathname || "/"
  );

  const [usuarioActivo, setUsuarioActivo] = useState(() =>
    leerStorage("avrill_usuario", null)
  );

  const [productos, setProductos] = useState(() =>
    leerStorage("avrill_productos", productosIniciales)
  );

  const [carrito, setCarrito] = useState(() =>
    leerStorage("avrill_carrito", [])
  );

  const [pedidos, setPedidos] = useState(() =>
    leerStorage("avrill_pedidos", [])
  );

  const [usuarios, setUsuarios] = useState(usuariosIniciales);

  const [bienvenidaNombre, setBienvenidaNombre] = useState(null);

  useEffect(() => {
    let activo = true;

    apiUsuarios
      .listar()
      .then((lista) => {
        if (activo && Array.isArray(lista) && lista.length > 0) {
          setUsuarios(lista);
        }
      })
      .catch(() => {});

    apiProductos
      .listar()
      .then((lista) => {
        if (activo && Array.isArray(lista)) {
          setProductos(lista);
        }
      })
      .catch(() => {});

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("avrill_usuario", JSON.stringify(usuarioActivo));
  }, [usuarioActivo]);

  useEffect(() => {
    localStorage.setItem("avrill_productos", JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem("avrill_carrito", JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem("avrill_pedidos", JSON.stringify(pedidos));
  }, [pedidos]);

  useEffect(() => {
    const escucharNavegacion = () => {
      setRutaActual(window.location.pathname);
    };

    window.addEventListener("popstate", escucharNavegacion);

    return () => {
      window.removeEventListener("popstate", escucharNavegacion);
    };
  }, []);

  const navigate = (ruta) => {
    if (ruta === rutaActual) return;

    window.history.pushState({}, "", ruta);
    setRutaActual(ruta);
  };

  const crearSesionConToken = async (usuario) => {
    const { usuario: conToken, token } = await apiSesion.iniciar(usuario);

    escribirCookie(NOMBRE_COOKIE_TOKEN, token);
    escribirCookie(NOMBRE_COOKIE_USUARIO, String(conToken.id));

    localStorage.setItem(
      "avrill_ultima_actividad",
      Date.now().toString()
    );

    const usuarioLimpio = { ...conToken };
    delete usuarioLimpio.token;

    setUsuarioActivo(usuarioLimpio);

    return usuarioLimpio;
  };

  const iniciarSesion = async (usuario) => {
    const creada = await crearSesionConToken(usuario);

    return creada;
  };

  const restaurarSesion = (usuario) => {
    setUsuarioActivo(usuario);
  };

  const cerrarSesion = async () => {
    const idCookie = leerCookie(NOMBRE_COOKIE_USUARIO);
    const id = usuarioActivo?.id || (idCookie ? Number(idCookie) : null);

    if (id) {
      await apiSesion.cerrar(id);
    }

    borrarCookie(NOMBRE_COOKIE_TOKEN);
    borrarCookie(NOMBRE_COOKIE_USUARIO);
    localStorage.removeItem("avrill_ultima_actividad");
    setUsuarioActivo(null);
    navigate("/login");
  };

  const registrarUsuario = async (datos) => {
    const creado = await apiUsuarios.crear({
      ...datos,
      rol: "cliente",
    });

    setUsuarios((actuales) => [...actuales, creado]);

    const usuarioSesion = await crearSesionConToken(creado);
    setUsuarios((actuales) =>
      actuales.map((usuario) =>
        usuario.id === creado.id ? usuarioSesion : usuario
      )
    );

    setBienvenidaNombre(usuarioSesion.nombre);

    return usuarioSesion;
  };

  const actualizarUsuario = async (id, datos) => {
    const actualizado = await apiUsuarios.actualizar(id, datos);

    setUsuarios((actuales) =>
      actuales.map((usuario) =>
        usuario.id === id ? actualizado : usuario
      )
    );

    if (usuarioActivo?.id === id) {
      setUsuarioActivo(actualizado);
    }

    return actualizado;
  };

  const eliminarUsuario = async (id) => {
    await apiUsuarios.eliminar(id);

    setUsuarios((actuales) =>
      actuales.filter((usuario) => usuario.id !== id)
    );

    if (usuarioActivo?.id === id) {
      setUsuarioActivo(null);
    }
  };

  const agregarAlCarrito = (producto) => {
    if (!producto.disponible) return;

    setCarrito((actual) => {
      const existente = actual.find(
        (item) => item.id === producto.id
      );

      if (existente) {
        return actual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    setCarrito((actual) =>
      actual.map((item) =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((actual) =>
      actual.filter((item) => item.id !== id)
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalCarrito = carrito.reduce(
    (total, producto) =>
      total + producto.precio * producto.cantidad,
    0
  );

  const crearPedido = (datosEntrega) => {
    if (!usuarioActivo || carrito.length === 0) return null;

    const id = Date.now();
    const fecha = new Date().toISOString();
    const numero = `PF-${new Date().getFullYear()}-${String(
      pedidos.length + 1
    ).padStart(4, "0")}`;

    const cliente = {
      nombre: datosEntrega?.nombre || usuarioActivo.nombre,
      correo: datosEntrega?.correo || usuarioActivo.correo || "",
      telefono: datosEntrega?.telefono || usuarioActivo.telefono || "",
      direccion:
        datosEntrega?.direccion || usuarioActivo.direccion || "",
      identificacion:
        datosEntrega?.identificacion ||
        usuarioActivo.identificacion ||
        "",
      coordenadas:
        datosEntrega?.lat != null && datosEntrega?.lng != null
          ? {
              lat: datosEntrega.lat,
              lng: datosEntrega.lng,
            }
          : null,
    };

    const pedidoBase = {
      id,
      usuario: usuarioActivo.usuario,
      cliente,
      productos: carrito,
      total: totalCarrito,
      estado: "pendiente",
      fecha,
      factura: construirFactura({
        id,
        numero,
        fecha,
        cliente,
        productos: carrito,
      }),
    };

    setPedidos((actuales) => [...actuales, pedidoBase]);
    vaciarCarrito();

    return pedidoBase;
  };

  const actualizarEstadoPedido = (id, estado) => {
    setPedidos((actuales) =>
      actuales.map((pedido) =>
        pedido.id === id ? { ...pedido, estado } : pedido
      )
    );
  };

  const agregarProducto = async (producto) => {
    try {
      const creado = await apiProductos.crear(producto);

      setProductos((actuales) => [...actuales, creado]);

      return creado;
    } catch {
      const creado = { ...producto, id: Date.now() };

      setProductos((actuales) => [...actuales, creado]);

      return creado;
    }
  };

  const actualizarProducto = async (id, cambios) => {
    try {
      const actualizado = await apiProductos.actualizar(id, cambios);

      setProductos((actuales) =>
        actuales.map((producto) =>
          producto.id === id ? actualizado : producto
        )
      );

      return actualizado;
    } catch {
      setProductos((actuales) =>
        actuales.map((producto) =>
          producto.id === id
            ? { ...producto, ...cambios }
            : producto
        )
      );

      return null;
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await apiProductos.eliminar(id);
    } catch {
      // el producto se quita de la vista aunque falle el servidor
    }

    setProductos((actuales) =>
      actuales.filter((producto) => producto.id !== id)
    );
  };

  const contexto = {
    rutaActual,
    usuarioActivo,
    usuarios,
    productos,
    carrito,
    pedidos,
    totalCarrito,
    navigate,
    iniciarSesion,
    cerrarSesion,
    restaurarSesion,
    registrarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    agregarAlCarrito,
    cambiarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    crearPedido,
    actualizarEstadoPedido,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  };

  let pagina;

  if (rutaActual === "/") {
    pagina = <Home />;
  } else if (rutaActual === "/login") {
    pagina = <Login />;
  } else if (rutaActual === "/catalogo") {
    pagina = <Catalogo />;
  } else if (rutaActual.startsWith("/producto/")) {
    pagina = <DetalleProducto />;
  } else if (rutaActual === "/carrito") {
    pagina = <Carrito />;
  } else if (rutaActual === "/dashboard") {
    pagina = (
      <PrivateRoutes soloAdmin>
        <Dashboard />
      </PrivateRoutes>
    );
  } else if (rutaActual === "/usuario") {
    pagina = (
      <PrivateRoutes>
        <VistaUsuario />
      </PrivateRoutes>
    );
  } else {
    pagina = <Home />;
  }

  return (
    <NavegacionContexto.Provider value={contexto}>
      {pagina}
      <WhatsAppFlotante />
      {bienvenidaNombre && (
        <NotificacionBienvenida
          nombre={bienvenidaNombre}
          onCerrar={() => setBienvenidaNombre(null)}
        />
      )}
    </NavegacionContexto.Provider>
  );
}
