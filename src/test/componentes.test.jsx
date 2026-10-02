import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AsistenteIA from "../components/AsistenteIA";
import EditorProducto from "../components/EditorProducto";
import Encabezado from "../components/Encabezado";
import FacturaProforma from "../components/FacturaProforma";
import Footer from "../components/Footer";
import LoginFormulario from "../components/LoginFormulario";
import MapaMapbox from "../components/MapaMapbox";
import MapaPuntero from "../components/MapaPuntero";
import NotificacionBienvenida from "../components/NotificacionBienvenida";
import NotificacionCompra from "../components/NotificacionCompra";
import PanelIngresos from "../components/PanelIngresos";
import Sidebar from "../components/Sidebar";
import TarjetaProducto from "../components/TarjetaProducto";
import WhatsAppFlotante from "../components/WhatsAppFlotante";

const mocks = vi.hoisted(() => {
  const mapa = {
    addControl: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
    flyTo: vi.fn(),
    setView: vi.fn(),
    setMaxBounds: vi.fn(),
    panTo: vi.fn(),
  };
  const marcador = {
    addTo: vi.fn(),
    on: vi.fn(),
    getLatLng: vi.fn(() => ({ lat: 9.9, lng: -84.1 })),
    getLngLat: vi.fn(() => ({ lat: 9.9, lng: -84.1 })),
    setLatLng: vi.fn(),
    setLngLat: vi.fn().mockReturnThis(),
  };

  return {
    contexto: {},
    iniciarSesion: vi.fn(),
    registrarUsuario: vi.fn(),
    navigate: vi.fn(),
    agregarAlCarrito: vi.fn(),
    cerrarSesion: vi.fn(),
    toggleModoOscuro: vi.fn(),
    cambiarTamanoTexto: vi.fn(),
    onUbicar: vi.fn(),
    onCerrar: vi.fn(),
    onGuardar: vi.fn(),
    onEliminar: vi.fn(),
    consultarIA: vi.fn(),
    enviarCorreo: vi.fn(),
    exportarExcel: vi.fn(),
    exportarPdf: vi.fn(),
    formatoMoneda: vi.fn((valor) => `₡${valor}`),
    formatoPorcentaje: vi.fn((valor) => `${valor}%`),
    obtenerTokenMapbox: vi.fn(() => ""),
    soportaWebGL: vi.fn(() => false),
    validarTokenMapbox: vi.fn(),
    buscarEnMapbox: vi.fn(),
    buscarEnNominatim: vi.fn(() => Promise.resolve([])),
    direccionDesdeMapbox: vi.fn(),
    direccionDesdeNominatim: vi.fn(() => Promise.resolve("San José")),
    mapa,
    marcador,
    mapboxMapa: vi.fn(function () { return mapa; }),
    mapboxMarcador: vi.fn(function () { return marcador; }),
  };
});

vi.mock("../routes/Routing", () => ({
  useAppContext: () => mocks.contexto,
}));

vi.mock("../services/ia", () => ({
  consultarAsistenteIA: mocks.consultarIA,
}));

vi.mock("../services/correo", () => ({
  enviarFacturaPorCorreo: mocks.enviarCorreo,
}));

vi.mock("../utils/exportarIngresos", () => ({
  exportarIngresosExcel: mocks.exportarExcel,
  exportarIngresosPdf: mocks.exportarPdf,
  formatearMoneda: mocks.formatoMoneda,
  formatearPorcentaje: mocks.formatoPorcentaje,
}));

vi.mock("../utils/geocodificacion", () => ({
  ESTILO_MAPBOX: "mapbox://styles/test",
  LIMITES_COSTA_RICA: { sur: 8, oeste: -86, norte: 12, este: -82 },
  obtenerTokenMapbox: mocks.obtenerTokenMapbox,
  soportaWebGL: mocks.soportaWebGL,
  validarTokenMapbox: mocks.validarTokenMapbox,
  buscarEnMapbox: mocks.buscarEnMapbox,
  buscarEnNominatim: mocks.buscarEnNominatim,
  direccionDesdeMapbox: mocks.direccionDesdeMapbox,
  direccionDesdeNominatim: mocks.direccionDesdeNominatim,
}));

vi.mock("leaflet", () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    map: vi.fn(() => mocks.mapa),
    latLngBounds: vi.fn(() => ({})),
    latLng: vi.fn(() => ({})),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => mocks.marcador),
  },
}));

vi.mock("mapbox-gl", () => ({
  default: {
    accessToken: "",
    Map: mocks.mapboxMapa,
    Marker: mocks.mapboxMarcador,
    NavigationControl: vi.fn(),
    AttributionControl: vi.fn(),
  },
}));

vi.mock("mapbox-gl/dist/mapbox-gl.css", () => ({}));

const producto = {
  id: 7,
  nombre: "Jabón de caléndula",
  categoria: "jabones",
  detalle: "Suave y botánico",
  precio: 3500,
  disponible: true,
  etiqueta: "Artesanal",
  imagen: "/jabon.jpg",
};

const pedido = {
  id: 11,
  numero: "PF-2026-0011",
  fecha: "2026-09-30T12:00:00.000Z",
  cliente: {
    nombre: "Ana Cliente",
    correo: "ana@example.com",
    telefono: "88887777",
    direccion: "San José, Costa Rica",
  },
  productos: [{ ...producto, cantidad: 2 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks.contexto, {
    rutaActual: "/",
    usuarioActivo: null,
    carrito: [],
    modoOscuro: false,
    tamanoTexto: "normal",
    iniciarSesion: mocks.iniciarSesion,
    registrarUsuario: mocks.registrarUsuario,
    navigate: mocks.navigate,
    agregarAlCarrito: mocks.agregarAlCarrito,
    cerrarSesion: mocks.cerrarSesion,
    toggleModoOscuro: mocks.toggleModoOscuro,
    cambiarTamanoTexto: mocks.cambiarTamanoTexto,
  });
  mocks.mapa.on.mockImplementation(() => mocks.mapa);
  mocks.marcador.addTo.mockImplementation(() => mocks.marcador);
  mocks.marcador.on.mockImplementation(() => mocks.marcador);
  mocks.enviarCorreo.mockResolvedValue({ destinatario: "ana@example.com" });
  mocks.consultarIA.mockResolvedValue("Recomiendo una fórmula suave.");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("componentes generales", () => {
  it("muestra la tarjeta de producto y permite navegar o agregar al carrito", () => {
    render(<TarjetaProducto producto={producto} />);

    expect(screen.getByRole("heading", { name: producto.nombre })).toBeTruthy();
    expect(screen.getByText("Jabones de Glicerina")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }));
    fireEvent.click(screen.getByRole("button", { name: /Agregar Jabón de caléndula/ }));

    expect(mocks.navigate).toHaveBeenCalledWith("/producto/7");
    expect(mocks.agregarAlCarrito).toHaveBeenCalledWith(producto);
  });

  it("deshabilita agregar cuando el producto está agotado", () => {
    render(<TarjetaProducto producto={{ ...producto, disponible: false }} />);

    expect(screen.getByText("Agotado")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Agregar Jabón de caléndula/ }).disabled).toBe(true);
  });

  it("muestra la bienvenida con el primer nombre y permite cerrarla", () => {
    render(<NotificacionBienvenida nombre="Ana María" onCerrar={mocks.onCerrar} />);

    expect(screen.getByRole("status").textContent).toContain("¡Bienvenido, Ana!");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar notificación" }));
    expect(mocks.onCerrar).toHaveBeenCalledOnce();
  });

  it("muestra y permite cerrar la notificación de compra", () => {
    render(<NotificacionCompra mensaje="Pedido PF-2026-0001 confirmado." onCerrar={mocks.onCerrar} />);

    expect(screen.getByRole("status").textContent).toContain("Pedido PF-2026-0001 confirmado.");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar notificación" }));
    expect(mocks.onCerrar).toHaveBeenCalledOnce();
  });

  it("configura el enlace de WhatsApp flotante", () => {
    render(<WhatsAppFlotante />);
    const enlace = screen.getByRole("link", { name: "Contactar por WhatsApp" });

    expect(enlace.getAttribute("href")).toContain("https://wa.me/50662848105");
    expect(enlace.getAttribute("target")).toBe("_blank");
  });

  it("renderiza el pie y confirma una suscripción válida al boletín", () => {
    render(<Footer />);
    fireEvent.change(screen.getByPlaceholderText("tu.correo@ejemplo.com"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Suscribirme" }));

    expect(screen.getByText("¡Gracias por suscribirte al boletín!")).toBeTruthy();
    expect(screen.getByRole("link", { name: /WhatsApp/ }).getAttribute("href")).toContain("wa.me");
  });

  it("renderiza opciones del sidebar y selecciona la sección solicitada", () => {
    const opciones = [
      { id: "pedidos", nombre: "Mis pedidos" },
      { id: "perfil", nombre: "Mi perfil" },
    ];
    const onCambiar = vi.fn();
    render(<Sidebar titulo="Mi cuenta" opciones={opciones} activa="pedidos" onCambiar={onCambiar} />);

    fireEvent.click(screen.getByRole("button", { name: "Mi perfil" }));
    expect(screen.getByRole("heading", { name: "Mi cuenta" })).toBeTruthy();
    expect(onCambiar).toHaveBeenCalledWith("perfil");
  });

  it("permite editar, guardar y cancelar los cambios de un producto", () => {
    render(<EditorProducto producto={producto} onGuardar={mocks.onGuardar} onEliminar={mocks.onEliminar} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByDisplayValue(producto.nombre), { target: { value: "Jabón nuevo" } });
    fireEvent.change(screen.getByDisplayValue("3500"), { target: { value: "4200" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(mocks.onGuardar).toHaveBeenCalledWith(7, expect.objectContaining({ nombre: "Jabón nuevo", precio: 4200 }));

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar edición" }));
    expect(screen.getByDisplayValue(producto.nombre)).toBeTruthy();
  });
});

describe("autenticación y navegación", () => {
  it("inicia sesión y dirige al panel correcto según el rol", async () => {
    mocks.iniciarSesion.mockResolvedValue({ rol: "admin" });
    render(<LoginFormulario />);
    fireEvent.change(screen.getByPlaceholderText("Escribe tu usuario"), { target: { value: " admin " } });
    fireEvent.change(screen.getByPlaceholderText("Escribe tu contraseña"), { target: { value: "clave-segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.iniciarSesion).toHaveBeenCalledWith({ usuario: "admin", clave: "clave-segura" });
  });

  it("permite cambiar a registro y lleva al perfil al registrar", async () => {
    mocks.registrarUsuario.mockResolvedValue({ id: 1 });
    render(<LoginFormulario />);
    fireEvent.click(screen.getByRole("button", { name: "Crear una cuenta nueva" }));
    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), { target: { value: "Ana Cliente" } });
    fireEvent.change(screen.getByPlaceholderText("Elige un usuario"), { target: { value: "ana" } });
    fireEvent.change(screen.getByPlaceholderText("Crea una contraseña"), { target: { value: "clave-muy-segura" } });
    fireEvent.change(screen.getByPlaceholderText("tucorreo@ejemplo.com"), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Número de teléfono"), { target: { value: "88887777" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrarme" }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/usuario"));
    expect(mocks.registrarUsuario).toHaveBeenCalledWith(expect.objectContaining({ usuario: "ana", correo: "ana@example.com" }));
  });

  it("muestra errores de credenciales y permite mostrar la contraseña", async () => {
    mocks.iniciarSesion.mockRejectedValue({ status: 401 });
    render(<LoginFormulario />);
    const clave = screen.getByPlaceholderText("Escribe tu contraseña");

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(screen.getByPlaceholderText("Escribe tu contraseña").type).toBe("text");
    fireEvent.change(screen.getByPlaceholderText("Escribe tu usuario"), { target: { value: "ana" } });
    fireEvent.change(clave, { target: { value: "incorrecta" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Usuario o contraseña incorrectos.")).toBeTruthy();
  });

  it("navega al carrito, alterna tema y ofrece acceso a cuenta desde el encabezado", () => {
    mocks.contexto.carrito = [producto];
    render(<Encabezado />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir el carrito" }));
    fireEvent.click(screen.getByRole("button", { name: "Cambiar modo oscuro o claro" }));
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(mocks.navigate).toHaveBeenNthCalledWith(1, "/carrito");
    expect(mocks.toggleModoOscuro).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenLastCalledWith("/login");
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("el encabezado muestra el panel de administración para una sesión admin", () => {
    mocks.contexto.usuarioActivo = { rol: "admin" };
    render(<Encabezado />);
    fireEvent.click(screen.getByRole("button", { name: /Dashboard/ }));

    expect(mocks.navigate).toHaveBeenCalledWith("/dashboard");
  });
});

describe("asistente, mapas y reportes", () => {
  it("abre el asistente, envía la consulta y presenta la respuesta", async () => {
    render(<AsistenteIA productos={[producto]} />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar con Asistente de IA" }));
    fireEvent.change(screen.getByPlaceholderText("Escribe tu consulta o tipo de piel..."), {
      target: { value: "Busco jabón para piel sensible" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Recomiendo una fórmula suave.")).toBeTruthy();
    expect(mocks.consultarIA).toHaveBeenCalledWith("Busco jabón para piel sensible", [producto]);
  });

  it("permite minimizar y cerrar el chat de IA", () => {
    render(<AsistenteIA />);
    fireEvent.click(screen.getByRole("button", { name: "Consultar con Asistente de IA" }));
    fireEvent.click(screen.getByRole("button", { name: "Minimizar chat" }));
    expect(screen.getByText("Boticaria Virtual Avrill")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar chat" }));
    expect(screen.getByRole("button", { name: "Consultar con Asistente de IA" })).toBeTruthy();
  });

  it("selecciona respaldo Leaflet cuando Mapbox no está disponible", async () => {
    render(<MapaPuntero valor="" onUbicar={mocks.onUbicar} />);
    await waitFor(() => expect(document.querySelector(".mapa-puntero")).toBeTruthy());
    expect(screen.getByText("Toca el mapa para marcar tu ubicación")).toBeTruthy();
    expect(mocks.validarTokenMapbox).not.toHaveBeenCalled();
  });

  it("inicializa Mapbox y libera el mapa al desmontar", async () => {
    const vista = render(<MapaMapbox token="token-test" punto={null} onElegirPunto={mocks.onUbicar} />);

    await waitFor(() => expect(mocks.mapboxMapa).toHaveBeenCalledOnce());
    await waitFor(() => expect(mocks.mapboxMarcador).toHaveBeenCalledOnce());
    expect(mocks.mapboxMapa.mock.calls[0][0]).toMatchObject({
      center: [-84.0657, 9.8893],
      zoom: 14,
      renderWorldCopies: false,
    });
    vista.unmount();
    await waitFor(() => expect(mocks.mapa.remove).toHaveBeenCalled());
  });

  it("muestra y envía una factura proforma por correo", async () => {
    render(<FacturaProforma pedido={pedido} onCerrar={mocks.onCerrar} />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Ana Cliente")).toBeTruthy();
    expect(screen.getByText("Jabón de caléndula")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Enviar por correo" }));
    expect(await screen.findByText("Factura enviada a ana@example.com.")).toBeTruthy();
    expect(mocks.enviarCorreo).toHaveBeenCalledWith(pedido);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar factura" }));
    expect(mocks.onCerrar).toHaveBeenCalledOnce();
  });

  it("presenta ingresos vacíos y permite exportar Excel cuando hay ventas", async () => {
    const vista = render(<PanelIngresos pedidos={[]} periodo="mes" onCambiarPeriodo={vi.fn()} />);
    expect(screen.getByText("Sin ingresos registrados en este periodo.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Excel" }).disabled).toBe(true);
    vista.rerender(
      <PanelIngresos
        pedidos={[{ id: 1, fecha: "2026-09-30", total: 12000, estado: "pendiente" }]}
        periodo="mes"
        onCambiarPeriodo={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Excel" }));
    await waitFor(() => expect(mocks.exportarExcel).toHaveBeenCalledOnce());
  });
});