import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import Catalogo from "../pages/Catalogo";
import DetalleProducto from "../pages/DetalleProducto";
import Carrito from "../pages/Carrito";
import Login from "../pages/Login";
import VistaUsuario from "../pages/VistaUsuario";
import Dashboard from "../pages/Dashboard";

const mocks = vi.hoisted(() => ({
  contexto: {},
  navigate: vi.fn(),
  agregarAlCarrito: vi.fn(),
  cambiarCantidad: vi.fn(),
  eliminarDelCarrito: vi.fn(),
  crearPedido: vi.fn(),
  mostrarNotificacion: vi.fn(),
  actualizarUsuario: vi.fn(),
  cambiarClave: vi.fn(),
  actualizarProducto: vi.fn(),
  eliminarProducto: vi.fn(),
  agregarProducto: vi.fn(),
  actualizarEstadoPedido: vi.fn(),
  eliminarUsuario: vi.fn(),
  enviarCorreo: vi.fn(),
}));

vi.mock("../routes/Routing", () => ({
  useAppContext: () => mocks.contexto,
}));

vi.mock("../components/Encabezado", () => ({
  default: () => <header>Encabezado Avrill</header>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <footer>Pie de página Avrill</footer>,
}));

vi.mock("../components/TarjetaProducto", () => ({
  default: ({ producto }) => <article data-testid="tarjeta-producto">{producto.nombre}</article>,
}));

vi.mock("../components/LoginFormulario", () => ({
  default: () => <form aria-label="Formulario de acceso">Formulario de acceso</form>,
}));

vi.mock("../components/MapaPuntero", () => ({
  default: ({ valor }) => <div data-testid="mapa-puntero">{valor}</div>,
}));

vi.mock("../components/FacturaProforma", () => ({
  default: ({ pedido, onCerrar }) => (
    <div role="dialog">
      Factura {pedido.id}
      <button onClick={onCerrar}>Cerrar factura</button>
    </div>
  ),
}));

vi.mock("../components/EditorProducto", () => ({
  default: ({ producto }) => <article>{producto.nombre}</article>,
}));

vi.mock("../components/PanelIngresos", () => ({
  default: () => <section>Panel de ingresos de prueba</section>,
}));

vi.mock("../components/Sidebar", () => ({
  default: ({ titulo, opciones, activa, onCambiar }) => (
    <aside>
      <h2>{titulo}</h2>
      {opciones.map((opcion) => (
        <button
          type="button"
          key={opcion.id}
          aria-pressed={activa === opcion.id}
          onClick={() => onCambiar(opcion.id)}
        >
          {opcion.nombre}
        </button>
      ))}
    </aside>
  ),
}));

vi.mock("../services/correo", () => ({
  enviarFacturaPorCorreo: mocks.enviarCorreo,
}));

const productos = [
  {
    id: 1,
    nombre: "Jabón Botánico",
    categoria: "jabones",
    detalle: "Glicerina vegetal",
    precio: 3500,
    disponible: true,
    etiqueta: "Nuevo",
    imagen: "/jabon.jpg",
  },
  {
    id: 2,
    nombre: "Sales Relajantes",
    categoria: "sales",
    detalle: "Sales de baño",
    precio: 4800,
    disponible: true,
    etiqueta: "Relax",
    imagen: "/sales.jpg",
  },
];

const usuario = {
  id: 3,
  nombre: "Ana Cliente",
  usuario: "ana",
  correo: "ana@example.com",
  telefono: "+506 8888-7777",
  direccion: "San José, Costa Rica",
  rol: "cliente",
};

const pedido = {
  id: 21,
  usuario: "ana",
  estado: "pendiente",
  total: 7000,
  fecha: "2026-09-30T12:00:00.000Z",
  factura: { numero: "PF-2026-0021" },
  productos: [{ ...productos[0], cantidad: 2 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks.contexto, {
    rutaActual: "/",
    productos,
    pedidos: [],
    usuarios: [],
    carrito: [],
    totalCarrito: 0,
    usuarioActivo: usuario,
    navigate: mocks.navigate,
    agregarAlCarrito: mocks.agregarAlCarrito,
    cambiarCantidad: mocks.cambiarCantidad,
    eliminarDelCarrito: mocks.eliminarDelCarrito,
    crearPedido: mocks.crearPedido,
    mostrarNotificacion: mocks.mostrarNotificacion,
    actualizarUsuario: mocks.actualizarUsuario,
    cambiarClave: mocks.cambiarClave,
    actualizarProducto: mocks.actualizarProducto,
    eliminarProducto: mocks.eliminarProducto,
    agregarProducto: mocks.agregarProducto,
    actualizarEstadoPedido: mocks.actualizarEstadoPedido,
    eliminarUsuario: mocks.eliminarUsuario,
  });
  mocks.enviarCorreo.mockResolvedValue({ destinatario: "ana@example.com" });
  mocks.crearPedido.mockResolvedValue({ ...pedido, factura: { numero: "PF-2026-0021" } });
  mocks.actualizarUsuario.mockResolvedValue(usuario);

  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => [],
    headers: { get: () => null },
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("páginas públicas", () => {
  it("muestra inicio, filtra productos y navega al catálogo", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /El arte del cuidado/ })).toBeTruthy();
    expect(screen.getAllByTestId("tarjeta-producto")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Jabones" }));
    expect(screen.getAllByTestId("tarjeta-producto")).toHaveLength(1);
    expect(screen.getByText("Jabón Botánico")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Explorar Catálogo/ }));
    expect(mocks.navigate).toHaveBeenCalledWith("/catalogo");
  });

  it("muestra el catálogo y filtra por categoría", () => {
    render(<Catalogo />);

    expect(screen.getByRole("heading", { name: "Catálogo artesanal" })).toBeTruthy();
    expect(screen.getAllByTestId("tarjeta-producto")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Sales" }));
    expect(screen.getAllByTestId("tarjeta-producto")).toHaveLength(1);
    expect(screen.getByText("Sales Relajantes")).toBeTruthy();
  });

  it("muestra detalle de producto, agrega al carrito y gestiona id inexistente", () => {
    mocks.contexto.rutaActual = "/producto/1";
    render(<DetalleProducto />);

    expect(screen.getByRole("heading", { name: "Jabón Botánico" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(mocks.agregarAlCarrito).toHaveBeenCalledWith(productos[0]);

    cleanup();
    mocks.contexto.rutaActual = "/producto/999";
    render(<DetalleProducto />);
    expect(screen.getByRole("heading", { name: "Producto no encontrado" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Volver al catálogo" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/catalogo");
  });

  it("presenta la página de login y su formulario", () => {
    render(<Login />);

    expect(screen.getByRole("heading", { name: "Inicia sesión" })).toBeTruthy();
    expect(screen.getByRole("form", { name: "Formulario de acceso" })).toBeTruthy();
  });
});

describe("carrito y áreas privadas", () => {
  it("muestra el estado vacío y permite volver al catálogo", () => {
    mocks.contexto.carrito = [];
    render(<Carrito />);

    expect(screen.getByRole("heading", { name: "Tu carrito está vacío" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Explorar catálogo" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/catalogo");
  });

  it("actualiza cantidades y elimina productos del carrito", () => {
    mocks.contexto.carrito = [{ ...productos[0], cantidad: 1 }];
    mocks.contexto.totalCarrito = 3500;
    render(<Carrito />);

    expect(screen.getByRole("heading", { name: "Carrito de compras" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(mocks.cambiarCantidad).toHaveBeenCalledWith(1, 2);
    expect(mocks.eliminarDelCarrito).toHaveBeenCalledWith(1);
    expect(screen.getByTestId("mapa-puntero")).toBeTruthy();
  });

  it("valida los datos de entrega, crea el pedido y navega al perfil", async () => {
    mocks.contexto.carrito = [{ ...productos[0], cantidad: 2 }];
    mocks.contexto.totalCarrito = 7000;
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Carrito />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));
    await waitFor(() => expect(mocks.crearPedido).toHaveBeenCalledOnce());
    expect(mocks.enviarCorreo).toHaveBeenCalledWith(pedido, expect.any(String));
    await waitFor(() => expect(mocks.mostrarNotificacion).toHaveBeenCalledWith(expect.stringContaining("Pedido PF-2026-0021 confirmado.")));
    expect(mocks.navigate).toHaveBeenCalledWith("/usuario");
    expect(alerta).not.toHaveBeenCalled();
  });

  it("confirma la venta aunque falle el correo y notifica ese resultado", async () => {
    mocks.contexto.carrito = [{ ...productos[0], cantidad: 2 }];
    mocks.contexto.totalCarrito = 7000;
    mocks.enviarCorreo.mockRejectedValue(new Error("Webhook no disponible"));
    render(<Carrito />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    await waitFor(() => expect(mocks.crearPedido).toHaveBeenCalledOnce());
    await waitFor(() => expect(mocks.mostrarNotificacion).toHaveBeenCalledWith(expect.stringContaining("El pedido quedó guardado, pero no se pudo enviar la factura por correo")));
    expect(mocks.navigate).toHaveBeenCalledWith("/usuario");
  });

  it("muestra la venta confirmada antes de que responda el servicio de correo", async () => {
    let resolverCorreo;
    mocks.contexto.carrito = [{ ...productos[0], cantidad: 2 }];
    mocks.contexto.totalCarrito = 7000;
    mocks.enviarCorreo.mockReturnValue(new Promise((resolve) => {
      resolverCorreo = resolve;
    }));
    render(<Carrito />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    await waitFor(() => expect(mocks.mostrarNotificacion).toHaveBeenCalledWith(
      "Pedido PF-2026-0021 confirmado. La factura se está enviando por correo."
    ));
    expect(mocks.navigate).toHaveBeenCalledWith("/usuario");

    resolverCorreo({ destinatario: "ana@example.com" });
    await waitFor(() => expect(mocks.mostrarNotificacion).toHaveBeenCalledWith(
      "Pedido PF-2026-0021 confirmado. La factura fue enviada a ana@example.com."
    ));
  });

  it("muestra perfil de cliente, permite cambiar sección y guardar datos", async () => {
    render(<VistaUsuario />);

    expect(screen.getByRole("heading", { name: "Hola, Ana Cliente" })).toBeTruthy();
    expect(screen.getByText("Aun no tienes pedidos")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Mi perfil" }));
    fireEvent.change(screen.getByDisplayValue("Ana Cliente"), { target: { value: "Ana Actualizada" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(mocks.actualizarUsuario).toHaveBeenCalledWith(3, expect.objectContaining({ nombre: "Ana Actualizada" })));
    expect(await screen.findByText("Tu perfil se actualizó correctamente.")).toBeTruthy();
  });

  it("muestra panel administrativo y permite cambiar entre módulos", async () => {
    render(<Dashboard />);

    expect(screen.getByRole("heading", { name: "Panel Avrill" })).toBeTruthy();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Pedidos pendientes" }));
    expect(screen.getByRole("heading", { name: "Pedidos recibidos" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clientes" }));
    expect(screen.getByRole("heading", { name: "Usuarios registrados" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ingresos & Reportería" }));
    expect(screen.getByRole("heading", { name: "Reportería & Analítica" })).toBeTruthy();
  });
});