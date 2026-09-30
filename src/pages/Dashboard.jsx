import { useState } from "react";
import { useAppContext } from "../routes/Routing";
import Encabezado from "../components/Encabezado";
import EditorProducto from "../components/EditorProducto";
import Sidebar from "../components/Sidebar";
import FacturaProforma from "../components/FacturaProforma";

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
    { id: "inventario", nombre: "Inventario", icono: "­ƒôª" },
    { id: "pedidos", nombre: "Pedidos pendientes", icono: "­ƒôï" },
    { id: "clientes", nombre: "Clientes", icono: "­ƒæÑ" },
    { id: "ingresos", nombre: "Ingresos & Gr├íficos", icono: "­ƒôè" },
  ];

  const pedidosPendientes = pedidos.filter((pedido) => pedido.estado === "pendiente");
  const ingresosTotales = pedidos.reduce((total, pedido) => total + pedido.total, 0);

  // Datos agregados para el gr├ífico de categor├¡as
  const ventasPorCategoria = productos.reduce((acc, prod) => {
    acc[prod.categoria] = (acc[prod.categoria] || 0) + 1;
    return acc;
  }, {});

  const guardarNuevo = (event) => {
    event.preventDefault();
    agregarProducto(nuevo);
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
  };

  return (
    <>
      <Encabezado />

      <main className="layout-privado">
        <Sidebar
          titulo="Administraci├│n"
          opciones={opciones}
          activa={seccion}
          onCambiar={setSeccion}
        />

        <section className="contenido-privado">
          <div className="seccion-introduccion">
            <span className="eyebrow">Administraci├│n</span>
            <h1>Panel Avrill</h1>
            <p>Gestiona productos, pedidos e inventario de la tienda.</p>
          </div>

          <div className="metricas">
            <article>
              <strong>{productos.length}</strong>
              <span>Productos totales</span>
            </article>
            <article>
              <strong>{pedidosPendientes.length}</strong>
              <span>Pedidos pendientes</span>
            </article>
            <article>
              <strong>CRC {ingresosTotales.toLocaleString("es-CR")}</strong>
              <span>Ingresos Totales</span>
            </article>
          </div>

          {seccion === "inventario" && (
            <section>
              <div className="dashboard-titulo">
                <h2>Productos</h2>
                <button className="btn-principal" onClick={() => setMostrarNuevo(!mostrarNuevo)}>
                  {mostrarNuevo ? "Cancelar" : "Nuevo producto"}
                </button>
              </div>

              {mostrarNuevo && (
                <form className="editor-producto editor-producto-nuevo" onSubmit={guardarNuevo}>
                  <h3>Crear producto</h3>
                  <input
                    placeholder="Nombre"
                    value={nuevo.nombre}
                    onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Detalle"
                    value={nuevo.detalle}
                    onChange={(e) => setNuevo({ ...nuevo, detalle: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={nuevo.precio}
                    onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })}
                    required
                  />
                  <input
                    placeholder="URL de imagen"
                    value={nuevo.imagen}
                    onChange={(e) => setNuevo({ ...nuevo, imagen: e.target.value })}
                  />
                  <button className="btn-principal">Crear producto</button>
                </form>
              )}

              <div className="dashboard-grid">
                {productos.map((producto) => (
                  <EditorProducto
                    key={producto.id}
                    producto={producto}
                    onGuardar={actualizarProducto}
                    onEliminar={eliminarProducto}
                  />
                ))}
              </div>
            </section>
          )}

          {seccion === "pedidos" && (
            <section>
              <h2>Pedidos recibidos</h2>
              {pedidos.length === 0 ? (
                <div className="panel-vacio">No hay pedidos registrados.</div>
              ) : (
                <div className="pedidos-lista">
                  {pedidos.map((pedido) => (
                    <article className="pedido-card" key={pedido.id}>
                      <h3>Pedido #{pedido.id}</h3>
                      <p>Cliente: {pedido.cliente?.nombre || pedido.usuario}</p>
                      <p>Correo: {pedido.cliente?.correo || "ÔÇö"}</p>
                      <p>Tel├®fono: {pedido.cliente?.telefono || "ÔÇö"}</p>
                      <p>Direcci├│n: {pedido.cliente?.direccion || "ÔÇö"}</p>
                      <p>Total: CRC {pedido.total.toLocaleString("es-CR")}</p>

                      <div className="pedido-acciones">
                        <button className="btn-secundario" onClick={() => setFacturaSeleccionada(pedido)}>
                          Ver factura proforma
                        </button>

                        <select
                          value={pedido.estado}
                          onChange={(e) => actualizarEstadoPedido(pedido.id, e.target.value)}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="en preparacion">En preparaci├│n</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {seccion === "clientes" && (
            <section>
              <h2>Usuarios registrados</h2>
              <div className="usuarios-lista">
                {usuarios.map((usuario) => (
                  <article className="usuario-card" key={usuario.id}>
                    <div className="usuario-info">
                      <h3>{usuario.nombre}</h3>
                      <p>@{usuario.usuario} ┬À {usuario.correo}</p>
                      <p>Tel├®fono: {usuario.telefono}</p>
                    </div>

                    <div className="usuario-acciones">
                      <select
                        value={usuario.rol}
                        onChange={(e) =>
                          actualizarUsuario(usuario.id, { ...usuario, rol: e.target.value })
                        }
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        className="btn-peligro"
                        onClick={() => {
                          if (window.confirm(`┬┐Eliminar a ${usuario.usuario}?`)) {
                            eliminarUsuario(usuario.id);
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {seccion === "ingresos" && (
            <section>
              <h2>Ingresos y Anal├¡tica Visual</h2>
              <div className="panel-grafico-contenedor">
                <h3>Distribuci├│n del Inventario por Categor├¡a</h3>
                {/* Gr├ífico de barras interactivo generado mediante SVG */}
                <div className="grafico-barras">
                  {Object.entries(ventasPorCategoria).map(([cat, cant]) => (
                    <div key={cat} className="columna-grafico">
                      <div
                        className="barra"
                        style={{ height: `${cant * 40}px` }}
                        title={`${cant} productos`}
                      >
                        <span>{cant}</span>
                      </div>
                      <span className="etiqueta-columna">{cat}</span>
                    </div>
                  ))}
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
