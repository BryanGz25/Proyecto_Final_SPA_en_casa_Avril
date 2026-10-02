import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../routes/Routing";
import Encabezado from "../components/Encabezado";
import EditorProducto from "../components/EditorProducto";
import Sidebar from "../components/Sidebar";
import FacturaProforma from "../components/FacturaProforma";

// Íconos vectoriales de la librería react-icons
import {
  FiSearch,
  FiX,
  FiBox,
  FiInbox,
  FiUsers,
  FiBarChart2,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiTrendingUp,
  FiCalendar,
  FiAward,
  FiPieChart
} from "react-icons/fi";

const PRODUCTOS_POR_PAGINA = 4;
const ELEMENTOS_POR_PAGINA = 4;

export default function Dashboard() {
  const {
    productos,
    pedidos,
    usuarios,
    actualizarProducto,
    eliminarProducto,
    agregarProducto,
    actualizarEstadoPedido,
    actualizarUsuario,
    eliminarUsuario,
  } = useAppContext();

  const [seccion, setSeccion] = useState("inventario");
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  // Filtro de Tiempo para Reportería ("dia", "mes", "3meses", "6meses", "ano")
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");

  // 1. Estados Búsqueda Directa a Servidor - Inventario
  const [busquedaProductos, setBusquedaProductos] = useState("");
  const [sugerenciasProductos, setSugerenciasProductos] = useState([]);
  const [inventarioServidor, setInventarioServidor] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const tempBusquedaProductos = useRef(null);

  // 2. Estados Búsqueda Exacta por Factura/ID - Pedidos
  const [busquedaPedidos, setBusquedaPedidos] = useState("");
  const [pedidosServidor, setPedidosServidor] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // 3. Estados Búsqueda Exacta / Filtrada - Clientes
  const [busquedaClientes, setBusquedaClientes] = useState("");
  const [clientesServidor, setClientesServidor] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);

  // Paginación
  const [paginaProductosActual, setPaginaProductosActual] = useState(1);
  const [totalPaginasProductos, setTotalPaginasProductos] = useState(1);

  const [paginaPedidosActual, setPaginaPedidosActual] = useState(1);
  const [totalPaginasPedidos, setTotalPaginasPedidos] = useState(1);

  const [paginaClientesActual, setPaginaClientesActual] = useState(1);
  const [totalPaginasClientes, setTotalPaginasClientes] = useState(1);

  const [nuevo, setNuevo] = useState({
    nombre: "",
    categoria: "jabones",
    detalle: "",
    precio: 0,
    disponible: true,
    etiqueta: "Nuevo",
    imagen: "",
  });

  const opciones = [
    { id: "inventario", nombre: "Inventario", icono: <FiBox size={18} /> },
    { id: "pedidos", nombre: "Pedidos pendientes", icono: <FiInbox size={18} /> },
    { id: "clientes", nombre: "Clientes", icono: <FiUsers size={18} /> },
    { id: "ingresos", nombre: "Ingresos & Reportería", icono: <FiBarChart2 size={18} /> },
  ];

  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === "pendiente"
  );
  const ingresosTotales = pedidos.reduce(
    (total, pedido) => total + pedido.total,
    0
  );

  // --- LÓGICA DE REPORTERÍA Y CÁLCULOS SEGÚN RANGO DE TIEMPO ---
  const filtrarPedidosPorPeriodo = () => {
    const ahora = new Date();
    return pedidos.filter((pedido) => {
      const fecha = new Date(pedido.fecha || pedido.fechaEmision || ahora);
      if (periodoFiltro === "dia") {
        return fecha.toDateString() === ahora.toDateString();
      }
      if (periodoFiltro === "mes") {
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      }
      if (periodoFiltro === "3meses") {
        const hace3Meses = new Date();
        hace3Meses.setMonth(ahora.getMonth() - 3);
        return fecha >= hace3Meses;
      }
      if (periodoFiltro === "6meses") {
        const hace6Meses = new Date();
        hace6Meses.setMonth(ahora.getMonth() - 6);
        return fecha >= hace6Meses;
      }
      if (periodoFiltro === "ano") {
        return fecha.getFullYear() === ahora.getFullYear();
      }
      return true;
    });
  };

  const pedidosFiltradosReporte = filtrarPedidosPorPeriodo();
  const ingresosPeriodo = pedidosFiltradosReporte.reduce(
    (acc, p) => acc + (p.total || 0),
    0
  );

  // Cálculo de Productos Más Vendidos en el período
  const contadorProductos = {};
  pedidosFiltradosReporte.forEach((pedido) => {
    if (Array.isArray(pedido.productos)) {
      pedido.productos.forEach((prod) => {
        const nombre = prod.nombre || prod.descripcion || "Producto Botánico";
        const cantidad = prod.cantidad || 1;
        const precio = prod.precio || prod.precioUnitario || 0;
        if (!contadorProductos[nombre]) {
          contadorProductos[nombre] = { unidades: 0, montoTotal: 0 };
        }
        contadorProductos[nombre].unidades += cantidad;
        contadorProductos[nombre].montoTotal += cantidad * precio;
      });
    }
  });

  const listaMasVendidos = Object.entries(contadorProductos)
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);

  // Distribución de Ingresos por Categoría
  const ventasPorCategoria = productos.reduce((acc, prod) => {
    acc[prod.categoria] = (acc[prod.categoria] || 0) + 1;
    return acc;
  }, {});

  // --- FUNCIÓN PARA DESCARGAR O IMPRIMIR EL RESUMEN EN PDF ---
  const descargarResumenPDF = () => {
    const etiquetas = {
      dia: "Hoy",
      mes: "Mes Actual",
      "3meses": "Últimos 3 Meses",
      "6meses": "Últimos 6 Meses",
      ano: "Año Actual",
    };

    const marco = document.createElement("iframe");
    marco.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(marco);

    const doc = marco.contentWindow.document;

    const htmlPDF = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>Reporte de Ventas & Reportería - Avrill</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #2C3E35; background: #fff; }
          .encabezado-pdf { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C5A059; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-pdf { font-size: 28px; font-weight: bold; color: #2C3E35; letter-spacing: 2px; }
          .subtitulo-pdf { color: #C5A059; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
          .info-meta { text-align: right; font-size: 12px; color: #666; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
          .kpi-card { background: #fdfbf7; border: 1px solid #e8e2d8; padding: 16px; border-radius: 8px; text-align: center; }
          .kpi-card strong { display: block; font-size: 20px; color: #2C3E35; }
          .kpi-card span { font-size: 11px; color: #888; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #2C3E35; color: #fff; text-align: left; padding: 10px; font-size: 12px; }
          td { border-bottom: 1px solid #eee; padding: 10px; font-size: 12px; }
          .pie-pagina { margin-top: 50px; border-top: 1px solid #e8e2d8; padding-top: 20px; text-align: center; font-size: 11px; color: #888; }
        </style>
      </head>
      <body>
        <div class="encabezado-pdf">
          <div>
            <div class="logo-pdf">AVRILL</div>
            <div class="subtitulo-pdf">Un Spa en Casa · Reporte Oficial de Ventas</div>
          </div>
          <div class="info-meta">
            <p><strong>Período:</strong> ${etiquetas[periodoFiltro]}</p>
            <p><strong>Emisión:</strong> ${new Date().toLocaleDateString("es-CR")}</p>
          </div>
        </div>

        <h3>Resumen Ejecutivo de Rendimiento</h3>
        <div class="kpi-grid">
          <div class="kpi-card">
            <span>Ingresos en el Período</span>
            <strong>CRC ${ingresosPeriodo.toLocaleString("es-CR")}</strong>
          </div>
          <div class="kpi-card">
            <span>Pedidos Procesados</span>
            <strong>${pedidosFiltradosReporte.length}</strong>
          </div>
          <div class="kpi-card">
            <span>Catálogo Activo</span>
            <strong>${productos.length} Productos</strong>
          </div>
        </div>

        <h3>Top 5 Productos Más Vendidos (${etiquetas[periodoFiltro]})</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Unidades Vendidas</th>
              <th>Total Generado</th>
            </tr>
          </thead>
          <tbody>
            ${
              listaMasVendidos.length > 0
                ? listaMasVendidos
                    .map(
                      (p, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.unidades} unidades</td>
                <td>CRC ${p.montoTotal.toLocaleString("es-CR")}</td>
              </tr>
            `
                    )
                    .join("")
                : '<tr><td colspan="4" style="text-align:center;">No hay ventas registradas en este período.</td></tr>'
            }
          </tbody>
        </table>

        <div class="pie-pagina">
          <p>Documento generado automáticamente desde el Panel Administrativo de Avrill Cosmética Artesanal.</p>
          <p>Desamparados, San José, Costa Rica · Tel: +506 6284-8105</p>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlPDF);
    doc.close();

    marco.contentWindow.addEventListener("afterprint", () => marco.remove());
    marco.contentWindow.focus();
    marco.contentWindow.print();
    window.setTimeout(() => marco.remove(), 2000);
  };

  // --- CONSULTA DIRECTA BASE DE DATOS - INVENTARIO ---
  const consultarInventarioBD = async (termino = "", pagina = 1) => {
    const texto = termino.trim();
    const url = new URL("/api/productos", window.location.origin);

    if (texto) url.searchParams.set("q", texto);
    url.searchParams.set("_page", String(pagina));
    url.searchParams.set("_limit", String(PRODUCTOS_POR_PAGINA));

    try {
      setCargandoProductos(true);
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      const totalHeader = respuesta.headers.get("X-Total-Count");
      const totalRegistros = Number(totalHeader !== null ? totalHeader : datos.length);

      setInventarioServidor(Array.isArray(datos) ? datos : []);
      setTotalPaginasProductos(
        Math.max(1, totalRegistros > 0 ? Math.ceil(totalRegistros / PRODUCTOS_POR_PAGINA) : 1)
      );
      setPaginaProductosActual(pagina);
    } catch {
      setInventarioServidor(productos);
      setTotalPaginasProductos(Math.max(1, Math.ceil(productos.length / PRODUCTOS_POR_PAGINA)));
      setPaginaProductosActual(pagina);
    } finally {
      setCargandoProductos(false);
    }
  };

  // --- CONSULTA BÚSQUEDA EXACTA POR PEDIDO ---
  const consultarPedidosBD = async (termino = "", pagina = 1) => {
    const numeroLimpio = termino.replace(/[^0-9a-zA-Z-]/g, "").trim();

    try {
      setCargandoPedidos(true);

      if (!numeroLimpio) {
        const url = new URL("/api/pedidos", window.location.origin);
        url.searchParams.set("_page", String(pagina));
        url.searchParams.set("_limit", String(ELEMENTOS_POR_PAGINA));

        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const totalHeader = respuesta.headers.get("X-Total-Count");
        const totalRegistros = Number(totalHeader !== null ? totalHeader : datos.length);

        setPedidosServidor(Array.isArray(datos) ? datos : []);
        setTotalPaginasPedidos(
          Math.max(1, totalRegistros > 0 ? Math.ceil(totalRegistros / ELEMENTOS_POR_PAGINA) : 1)
        );
        setPaginaPedidosActual(pagina);
        return;
      }

      const urlExacta = new URL(`/api/pedidos/${numeroLimpio}`, window.location.origin);
      const resExacta = await fetch(urlExacta);

      if (resExacta.ok) {
        const pedidoEncontrado = await resExacta.json();
        setPedidosServidor([pedidoEncontrado]);
        setTotalPaginasPedidos(1);
        setPaginaPedidosActual(1);
      } else {
        const urlFiltro = new URL("/api/pedidos", window.location.origin);
        urlFiltro.searchParams.set("id", numeroLimpio);
        const resFiltro = await fetch(urlFiltro);
        const datosFiltro = await resFiltro.json();

        if (Array.isArray(datosFiltro) && datosFiltro.length > 0) {
          setPedidosServidor(datosFiltro);
          setTotalPaginasPedidos(1);
        } else {
          const coincidenciaExacta = pedidos.filter(
            (p) => String(p.id) === numeroLimpio
          );
          setPedidosServidor(coincidenciaExacta);
          setTotalPaginasPedidos(1);
        }
        setPaginaPedidosActual(1);
      }
    } catch {
      const coincidenciaLocal = pedidos.filter(
        (p) => String(p.id) === numeroLimpio
      );
      setPedidosServidor(coincidenciaLocal);
      setTotalPaginasPedidos(1);
      setPaginaPedidosActual(1);
    } finally {
      setCargandoPedidos(false);
    }
  };

  // --- CONSULTA DIRECTA DE CLIENTES ---
  const consultarClientesBD = async (termino = "", pagina = 1) => {
    const textoLimpio = termino.replace(/^@/g, "").trim();

    try {
      setCargandoClientes(true);

      if (!textoLimpio) {
        const url = new URL("/api/usuarios", window.location.origin);
        url.searchParams.set("_page", String(pagina));
        url.searchParams.set("_limit", String(ELEMENTOS_POR_PAGINA));

        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const totalHeader = respuesta.headers.get("X-Total-Count");
        const totalRegistros = Number(totalHeader !== null ? totalHeader : datos.length);

        setClientesServidor(Array.isArray(datos) ? datos : []);
        setTotalPaginasClientes(
          Math.max(1, totalRegistros > 0 ? Math.ceil(totalRegistros / ELEMENTOS_POR_PAGINA) : 1)
        );
        setPaginaClientesActual(pagina);
        return;
      }

      const urlFiltro = new URL("/api/usuarios", window.location.origin);
      urlFiltro.searchParams.set("q", textoLimpio);

      const respuesta = await fetch(urlFiltro);
      const datos = await respuesta.json();

      if (Array.isArray(datos)) {
        const filtradosExactos = datos.filter(
          (u) =>
            u.usuario.toLowerCase() === textoLimpio.toLowerCase() ||
            u.nombre.toLowerCase().includes(textoLimpio.toLowerCase()) ||
            String(u.id) === textoLimpio
        );

        setClientesServidor(filtradosExactos.length > 0 ? filtradosExactos : datos);
        setTotalPaginasClientes(1);
      } else {
        setClientesServidor([]);
        setTotalPaginasClientes(1);
      }
      setPaginaClientesActual(1);
    } catch {
      const locales = usuarios.filter(
        (u) =>
          u.usuario.toLowerCase() === textoLimpio.toLowerCase() ||
          u.nombre.toLowerCase().includes(textoLimpio.toLowerCase()) ||
          String(u.id) === textoLimpio
      );
      setClientesServidor(locales);
      setTotalPaginasClientes(1);
      setPaginaClientesActual(1);
    } finally {
      setCargandoClientes(false);
    }
  };

  // Carga Inicial
  useEffect(() => {
    consultarInventarioBD("", 1);
    consultarPedidosBD("", 1);
    consultarClientesBD("", 1);
  }, []);

  // Restablecimiento en tiempo real
  useEffect(() => {
    if (busquedaClientes.trim() === "") consultarClientesBD("", 1);
  }, [busquedaClientes]);

  useEffect(() => {
    if (busquedaPedidos.trim() === "") consultarPedidosBD("", 1);
  }, [busquedaPedidos]);

  // Predictivo - Inventario
  useEffect(() => {
    const termino = busquedaProductos.trim();
    if (!termino) {
      setSugerenciasProductos([]);
      return;
    }
    clearTimeout(tempBusquedaProductos.current);
    tempBusquedaProductos.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/productos?q=${encodeURIComponent(termino)}&_limit=5`);
        const datos = await res.json();
        setSugerenciasProductos(Array.isArray(datos) ? datos.slice(0, 5) : []);
      } catch {
        setSugerenciasProductos([]);
      }
    }, 250);
  }, [busquedaProductos]);

  const guardarNuevo = async (event) => {
    event.preventDefault();
    await agregarProducto(nuevo);
    setMostrarNuevo(false);
    setNuevo({
      nombre: "",
      categoria: "jabones",
      detalle: "",
      precio: 0,
      disponible: true,
      etiqueta: "Nuevo",
      imagen: "",
    });
    consultarInventarioBD(busquedaProductos, paginaProductosActual || 1);
  };

  return (
    <>
      <Encabezado />

      <main className="layout-privado">
        <Sidebar
          titulo="Administración"
          opciones={opciones}
          activa={seccion}
          onCambiar={setSeccion}
        />

        <section className="contenido-privado">
          <div className="seccion-introduccion">
            <span className="eyebrow">Administración</span>
            <h1>Panel Avrill</h1>
            <p>Gestiona productos, pedidos e inventario de la tienda.</p>
          </div>

          <div className="metricas">
            <article>
              <strong>{productos.length}</strong>
              <span>Productos</span>
            </article>
            <article>
              <strong>{pedidosPendientes.length}</strong>
              <span>Pedidos pendientes</span>
            </article>
            <article>
              <strong>CRC {ingresosTotales.toLocaleString("es-CR")}</strong>
              <span>Ingresos</span>
            </article>
          </div>

          {/* === 1. INVENTARIO === */}
          {seccion === "inventario" && (
            <section>
              <div
                className="dashboard-titulo"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <h2>Productos</h2>
                <button
                  className="btn-principal"
                  onClick={() => setMostrarNuevo(!mostrarNuevo)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <FiPlus size={16} />
                  {mostrarNuevo ? "Cancelar" : "Nuevo producto"}
                </button>
              </div>

              {/* Buscador Predictivo - Inventario */}
              <div style={{ position: "relative", marginBottom: "24px", maxWidth: "550px" }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSugerenciasProductos([]);
                    consultarInventarioBD(busquedaProductos, 1);
                  }}
                  style={{ display: "flex", gap: "8px" }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Buscar producto en BD..."
                      value={busquedaProductos}
                      onChange={(e) => setBusquedaProductos(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 36px",
                        borderRadius: "8px",
                        border: "1px solid var(--borde, #ccc)",
                        fontSize: "0.95rem",
                      }}
                    />
                    <FiSearch
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888",
                      }}
                    />
                    {busquedaProductos && (
                      <button
                        type="button"
                        onClick={() => {
                          setBusquedaProductos("");
                          setSugerenciasProductos([]);
                          consultarInventarioBD("", 1);
                        }}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#888",
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn-secundario"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FiSearch size={16} />
                    Buscar
                  </button>
                </form>

                {sugerenciasProductos.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#ffffff",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                      listStyle: "none",
                      padding: 0,
                      margin: "4px 0 0 0",
                      zIndex: 100,
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {sugerenciasProductos.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => {
                          setBusquedaProductos(item.nombre);
                          setSugerenciasProductos([]);
                          consultarInventarioBD(item.nombre, 1);
                        }}
                        style={{
                          padding: "10px 14px",
                          borderBottom: "1px solid #f0f0f0",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.9rem",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <span style={{ fontWeight: "500", color: "#2C3E35" }}>{item.nombre}</span>
                        <small style={{ color: "#888" }}>CRC {item.precio?.toLocaleString("es-CR")}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Formulario Nuevo Producto */}
              {mostrarNuevo && (
                <form
                  className="editor-producto editor-producto-nuevo"
                  onSubmit={guardarNuevo}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--borde, #e0e0e0)",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "30px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    maxWidth: "600px",
                    margin: "0 auto 30px auto",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "16px",
                      color: "var(--verde-oscuro, #2C3E35)",
                      fontSize: "1.25rem",
                      borderBottom: "2px solid var(--arena, #f2efe9)",
                      paddingBottom: "8px",
                    }}
                  >
                    Crear Nuevo Producto
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Nombre del producto</label>
                      <input
                        placeholder="Ej. Jabón Aclarante"
                        value={nuevo.nombre}
                        onChange={(event) => setNuevo({ ...nuevo, nombre: event.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Categoría</label>
                      <select
                        value={nuevo.categoria}
                        onChange={(event) => setNuevo({ ...nuevo, categoria: event.target.value })}
                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--borde, #ccc)" }}
                      >
                        <option value="jabones">Jabones</option>
                        <option value="sales">Sales</option>
                        <option value="splash">Splash</option>
                        <option value="decorativos">Decorativos</option>
                        <option value="cremas">Cremas</option>
                        <option value="bloqueador_solar">Bloqueador Solar</option>
                        <option value="jabones_especiales">Jabones Especiales</option>
                        <option value="bombas_bano_pies">Bombas de Baño y Pies</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Precio (CRC)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Precio en CRC"
                        value={nuevo.precio}
                        onChange={(event) => setNuevo({ ...nuevo, precio: Number(event.target.value) })}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>URL de Imagen</label>
                      <input
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={nuevo.imagen}
                        onChange={(event) => setNuevo({ ...nuevo, imagen: event.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
                    <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Detalle / Descripción</label>
                    <textarea
                      rows="3"
                      placeholder="Descripción completa del producto..."
                      value={nuevo.detalle}
                      onChange={(event) => setNuevo({ ...nuevo, detalle: event.target.value })}
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--borde, #ccc)", fontFamily: "inherit" }}
                      required
                    />
                  </div>

                  <div style={{ marginTop: "20px", textAlign: "right" }}>
                    <button type="submit" className="btn-principal" style={{ width: "100%", padding: "12px" }}>
                      Guardar Producto
                    </button>
                  </div>
                </form>
              )}

              {cargandoProductos && <p style={{ fontStyle: "italic", color: "#666" }}>Consultando base de datos...</p>}

              <div className="dashboard-grid">
                {inventarioServidor.map((producto) => (
                  <EditorProducto
                    key={producto.id}
                    producto={producto}
                    onGuardar={async (id, cambios) => {
                      await actualizarProducto(id, cambios);
                      consultarInventarioBD(busquedaProductos, paginaProductosActual);
                    }}
                    onEliminar={async (id) => {
                      await eliminarProducto(id);
                      consultarInventarioBD(busquedaProductos, paginaProductosActual);
                    }}
                  />
                ))}
              </div>

              {totalPaginasProductos > 1 && (
                <div className="paginacion-inventario" style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={paginaProductosActual === 1}
                    onClick={() => consultarInventarioBD(busquedaProductos, Math.max(1, paginaProductosActual - 1))}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <FiChevronLeft size={16} /> Anterior
                  </button>

                  {Array.from({ length: totalPaginasProductos }, (_, idx) => {
                    const numPag = idx + 1;
                    return (
                      <button
                        key={numPag}
                        type="button"
                        className={numPag === paginaProductosActual ? "btn-principal pagina-activa" : "btn-secundario"}
                        onClick={() => consultarInventarioBD(busquedaProductos, numPag)}
                      >
                        {numPag}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={paginaProductosActual === totalPaginasProductos}
                    onClick={() => consultarInventarioBD(busquedaProductos, Math.min(totalPaginasProductos, paginaProductosActual + 1))}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    Siguiente <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* === 2. PEDIDOS PENDIENTES === */}
          {seccion === "pedidos" && (
            <section>
              <h2>Pedidos recibidos</h2>

              <div style={{ marginBottom: "24px", maxWidth: "550px" }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    consultarPedidosBD(busquedaPedidos, 1);
                  }}
                  style={{ display: "flex", gap: "8px" }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Ingrese número de factura (Ej: #1790798066782)..."
                      value={busquedaPedidos}
                      onChange={(e) => setBusquedaPedidos(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 36px",
                        borderRadius: "8px",
                        border: "1px solid var(--borde, #ccc)",
                        fontSize: "0.95rem",
                      }}
                    />
                    <FiSearch
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888",
                      }}
                    />
                    {busquedaPedidos && (
                      <button
                        type="button"
                        onClick={() => {
                          setBusquedaPedidos("");
                          consultarPedidosBD("", 1);
                        }}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#888",
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn-secundario"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FiSearch size={16} />
                    Buscar
                  </button>
                </form>
              </div>

              {cargandoPedidos && <p style={{ fontStyle: "italic", color: "#666" }}>Buscando factura en BD...</p>}

              {pedidosServidor.length === 0 ? (
                <div className="panel-vacio">No existe ningún pedido registrado con el número introducido.</div>
              ) : (
                <>
                  <div className="pedidos-lista">
                    {pedidosServidor.map((pedido) => (
                      <article className="pedido-card" key={pedido.id}>
                        <h3>Pedido #{pedido.id}</h3>
                        <p>Cliente: {pedido.cliente?.nombre || pedido.usuario}</p>
                        <p>Correo: {pedido.cliente?.correo || "—"}</p>
                        <p>Teléfono: {pedido.cliente?.telefono || "—"}</p>
                        <p>Dirección: {pedido.cliente?.direccion || "—"}</p>
                        <p>Total: CRC {pedido.total.toLocaleString("es-CR")}</p>

                        <div className="pedido-acciones">
                          <button
                            className="btn-secundario"
                            onClick={() => setFacturaSeleccionada(pedido)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <FiFileText size={16} />
                            Ver factura proforma
                          </button>

                          <select
                            value={pedido.estado}
                            onChange={async (event) => {
                              await actualizarEstadoPedido(pedido.id, event.target.value);
                              consultarPedidosBD(busquedaPedidos, paginaPedidosActual);
                            }}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="en preparacion">En preparación</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalPaginasPedidos > 1 && (
                    <div className="paginacion-inventario" style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
                      <button
                        type="button"
                        className="btn-secundario"
                        disabled={paginaPedidosActual === 1}
                        onClick={() => consultarPedidosBD(busquedaPedidos, Math.max(1, paginaPedidosActual - 1))}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <FiChevronLeft size={16} /> Anterior
                      </button>

                      {Array.from({ length: totalPaginasPedidos }, (_, idx) => {
                        const numPag = idx + 1;
                        return (
                          <button
                            key={numPag}
                            type="button"
                            className={numPag === paginaPedidosActual ? "btn-principal pagina-activa" : "btn-secundario"}
                            onClick={() => consultarPedidosBD(busquedaPedidos, numPag)}
                          >
                            {numPag}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        className="btn-secundario"
                        disabled={paginaPedidosActual === totalPaginasPedidos}
                        onClick={() => consultarPedidosBD(busquedaPedidos, Math.min(totalPaginasPedidos, paginaPedidosActual + 1))}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        Siguiente <FiChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* === 3. CLIENTES === */}
          {seccion === "clientes" && (
            <section>
              <h2>Usuarios registrados</h2>

              <div style={{ marginBottom: "24px", maxWidth: "550px" }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    consultarClientesBD(busquedaClientes, 1);
                  }}
                  style={{ display: "flex", gap: "8px" }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Ingrese nombre de usuario o cliente exacto..."
                      value={busquedaClientes}
                      onChange={(e) => setBusquedaClientes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 36px",
                        borderRadius: "8px",
                        border: "1px solid var(--borde, #ccc)",
                        fontSize: "0.95rem",
                      }}
                    />
                    <FiSearch
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888",
                      }}
                    />
                    {busquedaClientes && (
                      <button
                        type="button"
                        onClick={() => {
                          setBusquedaClientes("");
                          consultarClientesBD("", 1);
                        }}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#888",
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn-secundario"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FiSearch size={16} />
                    Buscar
                  </button>
                </form>
              </div>

              {cargandoClientes && <p style={{ fontStyle: "italic", color: "#666" }}>Consultando usuario en BD...</p>}

              {clientesServidor.length === 0 ? (
                <div className="panel-vacio">No se encontró ningún usuario registrado con ese nombre.</div>
              ) : (
                <>
                  <div className="usuarios-lista">
                    {clientesServidor.map((usuario) => (
                      <article className="usuario-card" key={usuario.id}>
                        <div className="usuario-info">
                          <h3>{usuario.nombre}</h3>
                          <p>@{usuario.usuario} · {usuario.correo}</p>
                          <p>Teléfono: {usuario.telefono || "—"}</p>
                        </div>

                        <div className="usuario-acciones">
                          <select
                            value={usuario.rol}
                            onChange={async (event) => {
                              await actualizarUsuario(usuario.id, {
                                ...usuario,
                                rol: event.target.value,
                              });
                              consultarClientesBD(busquedaClientes, paginaClientesActual);
                            }}
                          >
                            <option value="cliente">Cliente</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            className="btn-peligro"
                            onClick={async () => {
                              if (window.confirm(`¿Eliminar a ${usuario.usuario}?`)) {
                                await eliminarUsuario(usuario.id);
                                consultarClientesBD(busquedaClientes, paginaClientesActual);
                              }
                            }}
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <FiTrash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalPaginasClientes > 1 && (
                    <div className="paginacion-inventario" style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
                      <button
                        type="button"
                        className="btn-secundario"
                        disabled={paginaClientesActual === 1}
                        onClick={() => consultarClientesBD(busquedaClientes, Math.max(1, paginaClientesActual - 1))}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <FiChevronLeft size={16} /> Anterior
                      </button>

                      {Array.from({ length: totalPaginasClientes }, (_, idx) => {
                        const numPag = idx + 1;
                        return (
                          <button
                            key={numPag}
                            type="button"
                            className={numPag === paginaClientesActual ? "btn-principal pagina-activa" : "btn-secundario"}
                            onClick={() => consultarClientesBD(busquedaClientes, numPag)}
                          >
                            {numPag}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        className="btn-secundario"
                        disabled={paginaClientesActual === totalPaginasClientes}
                        onClick={() => consultarClientesBD(busquedaClientes, Math.min(totalPaginasClientes, paginaClientesActual + 1))}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        Siguiente <FiChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* === 4. INGRESOS & REPORTERÍA Y MÉTRICAS DE TIEMPO === */}
          {seccion === "ingresos" && (
            <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  background: "#ffffff",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid var(--borde, #e0e0e0)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, color: "var(--verde-oscuro, #2C3E35)" }}>
                    Reportería & Analítica
                  </h2>
                  <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                    Filtra métricas por rango de tiempo y descarga reportes gerenciales en PDF.
                  </p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                  {/* Selector de Rango de Tiempo */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiCalendar size={18} color="var(--verde-oscuro, #2C3E35)" />
                    <select
                      value={periodoFiltro}
                      onChange={(e) => setPeriodoFiltro(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--borde, #ccc)",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      <option value="dia">Hoy</option>
                      <option value="mes">Mes actual</option>
                      <option value="3meses">Últimos 3 meses</option>
                      <option value="6meses">Últimos 6 meses</option>
                      <option value="ano">Año actual</option>
                    </select>
                  </div>

                  {/* Botón Descargar Resumen en PDF */}
                  <button
                    type="button"
                    className="btn-principal"
                    onClick={descargarResumenPDF}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <FiDownload size={16} />
                    Descargar Resumen PDF
                  </button>
                </div>
              </div>

              {/* Tarjetas KPI del Período */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <article
                  style={{
                    background: "#ffffff",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid var(--borde, #e0e0e0)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <FiTrendingUp size={22} color="var(--verde-oscuro, #2C3E35)" />
                    <span style={{ fontSize: "0.85rem", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
                      Ventas del Período
                    </span>
                  </div>
                  <strong style={{ fontSize: "1.5rem", color: "var(--verde-oscuro, #2C3E35)" }}>
                    CRC {ingresosPeriodo.toLocaleString("es-CR")}
                  </strong>
                </article>

                <article
                  style={{
                    background: "#ffffff",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid var(--borde, #e0e0e0)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <FiInbox size={22} color="var(--verde-oscuro, #2C3E35)" />
                    <span style={{ fontSize: "0.85rem", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
                      Pedidos Realizados
                    </span>
                  </div>
                  <strong style={{ fontSize: "1.5rem", color: "var(--verde-oscuro, #2C3E35)" }}>
                    {pedidosFiltradosReporte.length} Pedidos
                  </strong>
                </article>

                <article
                  style={{
                    background: "#ffffff",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid var(--borde, #e0e0e0)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <FiAward size={22} color="#C5A059" />
                    <span style={{ fontSize: "0.85rem", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
                      Producto Estrella
                    </span>
                  </div>
                  <strong style={{ fontSize: "1.1rem", color: "var(--verde-oscuro, #2C3E35)" }}>
                    {listaMasVendidos[0]?.nombre || "Sin ventas aún"}
                  </strong>
                </article>
              </div>

              {/* Módulo de Productos Más Vendidos */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--borde, #e0e0e0)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <FiAward size={20} color="#C5A059" />
                  <h3 style={{ margin: 0, color: "var(--verde-oscuro, #2C3E35)" }}>
                    Productos Más Vendidos
                  </h3>
                </div>

                {listaMasVendidos.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "#888" }}>
                    No hay registros de ventas para el período seleccionado.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {listaMasVendidos.map((prod, idx) => {
                      const maxUnidades = listaMasVendidos[0].unidades || 1;
                      const porcentaje = (prod.unidades / maxUnidades) * 100;
                      return (
                        <div key={prod.nombre} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                            <span style={{ fontWeight: "600", color: "#2C3E35" }}>
                              #{idx + 1} {prod.nombre}
                            </span>
                            <span style={{ color: "#666" }}>
                              <strong>{prod.unidades} uds</strong> · CRC {prod.montoTotal.toLocaleString("es-CR")}
                            </span>
                          </div>
                          <div style={{ width: "100%", background: "#f0f0f0", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${porcentaje}%`,
                                background: "#C5A059",
                                height: "100%",
                                borderRadius: "4px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Gráfico Visual de Categorías */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--borde, #e0e0e0)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <FiPieChart size={20} color="var(--verde-oscuro, #2C3E35)" />
                  <h3 style={{ margin: 0, color: "var(--verde-oscuro, #2C3E35)" }}>
                    Distribución de Productos por Categoría
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "16px",
                    height: "180px",
                    paddingBottom: "10px",
                    borderBottom: "2px solid #e0e0e0",
                  }}
                >
                  {Object.entries(ventasPorCategoria).map(([cat, cant]) => {
                    const maxCant = Math.max(...Object.values(ventasPorCategoria));
                    const alturaPct = (cant / maxCant) * 100;
                    return (
                      <div
                        key={cat}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                          justifyContent: "flex-end",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
                          {cant}
                        </span>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "36px",
                            height: `${alturaPct}%`,
                            backgroundColor: "var(--verde-oscuro, #2C3E35)",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.4s ease",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            marginTop: "8px",
                            color: "#2C3E35",
                            textTransform: "capitalize",
                          }}
                        >
                          {cat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      </main>

      {facturaSeleccionada && (
        <FacturaProforma
          pedido={facturaSeleccionada}
          onCerrar={() => setFacturaSeleccionada(null)}
        />
      )}
    </>
  );
}