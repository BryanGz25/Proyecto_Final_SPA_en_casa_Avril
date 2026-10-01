import { useState } from "react";
import { useAppContext } from "../routes/Routing";
import Encabezado from "../components/Encabezado";
import EditorProducto from "../components/EditorProducto";
import Sidebar from "../components/Sidebar";
import FacturaProforma from "../components/FacturaProforma";

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
  const [paginaProductosActual, setPaginaProductosActual] = useState(1);
  const [paginaPedidosActual, setPaginaPedidosActual] = useState(1);
  const [paginaClientesActual, setPaginaClientesActual] = useState(1);

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
    { id: "inventario", nombre: "Inventario", icono: "📦" },
    { id: "pedidos", nombre: "Pedidos pendientes", icono: "📋" },
    { id: "clientes", nombre: "Clientes", icono: "👥" },
    { id: "ingresos", nombre: "Ingresos & Gráficos", icono: "📊" },
  ];

  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === "pendiente"
  );
  const ingresosTotales = pedidos.reduce(
    (total, pedido) => total + pedido.total,
    0
  );

  // Paginación de Productos (Máximo 4 productos por vista)
  const totalPaginasProductos =
    Math.ceil(productos.length / PRODUCTOS_POR_PAGINA) || 1;
  const indiceInicialProd = (paginaProductosActual - 1) * PRODUCTOS_POR_PAGINA;
  const productosPaginados = productos.slice(
    indiceInicialProd,
    indiceInicialProd + PRODUCTOS_POR_PAGINA
  );

  // Paginación de Pedidos
  const totalPaginasPedidos =
    Math.ceil(pedidos.length / ELEMENTOS_POR_PAGINA) || 1;
  const pedidosPaginados = pedidos.slice(
    (paginaPedidosActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaPedidosActual * ELEMENTOS_POR_PAGINA
  );

  // Paginación de Clientes
  const totalPaginasClientes =
    Math.ceil(usuarios.length / ELEMENTOS_POR_PAGINA) || 1;
  const clientesPaginados = usuarios.slice(
    (paginaClientesActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaClientesActual * ELEMENTOS_POR_PAGINA
  );

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

          {seccion === "inventario" && (
            <section>
              <div className="dashboard-titulo">
                <h2>Productos</h2>
                <button
                  className="btn-principal"
                  onClick={() => setMostrarNuevo(!mostrarNuevo)}
                >
                  {mostrarNuevo ? "Cancelar" : "Nuevo producto"}
                </button>
              </div>

              {mostrarNuevo && (
                <form
                  className="editor-producto editor-producto-nuevo"
                  onSubmit={guardarNuevo}
                >
                  <h3>Crear producto</h3>
                  <input
                    placeholder="Nombre"
                    value={nuevo.nombre}
                    onChange={(event) =>
                      setNuevo({ ...nuevo, nombre: event.target.value })
                    }
                    required
                  />
                  <input
                    placeholder="Detalle"
                    value={nuevo.detalle}
                    onChange={(event) =>
                      setNuevo({ ...nuevo, detalle: event.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={nuevo.precio}
                    onChange={(event) =>
                      setNuevo({
                        ...nuevo,
                        precio: Number(event.target.value),
                      })
                    }
                    required
                  />
                  <input
                    placeholder="URL de imagen"
                    value={nuevo.imagen}
                    onChange={(event) =>
                      setNuevo({ ...nuevo, imagen: event.target.value })
                    }
                  />
                  <button className="btn-principal">Crear producto</button>
                </form>
              )}

              {/* Grid de Productos paginado (Máximo 4 por vista) */}
              <div className="dashboard-grid">
                {productosPaginados.map((producto) => (
                  <EditorProducto
                    key={producto.id}
                    producto={producto}
                    onGuardar={actualizarProducto}
                    onEliminar={eliminarProducto}
                  />
                ))}
              </div>

              {/* Paginación de Productos */}
              {totalPaginasProductos > 1 && (
                <div
                  className="paginacion-inventario"
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "20px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={paginaProductosActual === 1}
                    onClick={() =>
                      setPaginaProductosActual(
                        Math.max(1, paginaProductosActual - 1)
                      )
                    }
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPaginasProductos }, (_, idx) => {
                    const numPag = idx + 1;
                    return (
                      <button
                        key={numPag}
                        type="button"
                        className={
                          numPag === paginaProductosActual
                            ? "btn-principal pagina-activa"
                            : "btn-secundario"
                        }
                        onClick={() => setPaginaProductosActual(numPag)}
                      >
                        {numPag}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={paginaProductosActual === totalPaginasProductos}
                    onClick={() =>
                      setPaginaProductosActual(
                        Math.min(
                          totalPaginasProductos,
                          paginaProductosActual + 1
                        )
                      )
                    }
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </section>
          )}

          {seccion === "pedidos" && (
            <section>
              <h2>Pedidos recibidos</h2>
              {pedidos.length === 0 ? (
                <div className="panel-vacio">No hay pedidos registrados.</div>
              ) : (
                <>
                  <div className="pedidos-lista">
                    {pedidosPaginados.map((pedido) => (
                      <article className="pedido-card" key={pedido.id}>
                        <h3>Pedido #{pedido.id}</h3>
                        <p>
                          Cliente: {pedido.cliente?.nombre || pedido.usuario}
                        </p>
                        <p>Correo: {pedido.cliente?.correo || "—"}</p>
                        <p>Teléfono: {pedido.cliente?.telefono || "—"}</p>
                        <p>Dirección: {pedido.cliente?.direccion || "—"}</p>
                        <p>
                          Total: CRC {pedido.total.toLocaleString("es-CR")}
                        </p>

                        <div className="pedido-acciones">
                          <button
                            className="btn-secundario"
                            onClick={() => setFacturaSeleccionada(pedido)}
                          >
                            Ver factura proforma
                          </button>

                          <select
                            value={pedido.estado}
                            onChange={(event) =>
                              actualizarEstadoPedido(
                                pedido.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="en preparacion">
                              En preparación
                            </option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalPaginasPedidos > 1 && (
                    <div
                      className="paginacion-inventario"
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "20px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        type="button"
                        className="btn-secundario"
                        disabled={paginaPedidosActual === 1}
                        onClick={() =>
                          setPaginaPedidosActual(
                            Math.max(1, paginaPedidosActual - 1)
                          )
                        }
                      >
                        Anterior
                      </button>

                      {Array.from({ length: totalPaginasPedidos }, (_, idx) => {
                        const numPag = idx + 1;
                        return (
                          <button
                            key={numPag}
                            type="button"
                            className={
                              numPag === paginaPedidosActual
                                ? "btn-principal pagina-activa"
                                : "btn-secundario"
                            }
                            onClick={() => setPaginaPedidosActual(numPag)}
                          >
                            {numPag}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        className="btn-secundario"
                        disabled={paginaPedidosActual === totalPaginasPedidos}
                        onClick={() =>
                          setPaginaPedidosActual(
                            Math.min(
                              totalPaginasPedidos,
                              paginaPedidosActual + 1
                            )
                          )
                        }
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {seccion === "clientes" && (
            <section>
              <h2>Usuarios registrados</h2>
              <div className="usuarios-lista">
                {clientesPaginados.map((usuario) => (
                  <article className="usuario-card" key={usuario.id}>
                    <div className="usuario-info">
                      <h3>{usuario.nombre}</h3>
                      <p>
                        @{usuario.usuario} · {usuario.correo}
                      </p>
                      <p>Teléfono: {usuario.telefono}</p>
                    </div>

                    <div className="usuario-acciones">
                      <select
                        value={usuario.rol}
                        onChange={(event) =>
                          actualizarUsuario(usuario.id, {
                            ...usuario,
                            rol: event.target.value,
                          })
                        }
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        className="btn-peligro"
                        onClick={() => {
                          if (
                            window.confirm(`¿Eliminar a ${usuario.usuario}?`)
                          ) {
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

              {totalPaginasClientes > 1 && (
                <div
                  className="paginacion-inventario"
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "20px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={paginaClientesActual === 1}
                    onClick={() =>
                      setPaginaClientesActual(
                        Math.max(1, paginaClientesActual - 1)
                      )
                    }
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPaginasClientes }, (_, idx) => {
                    const numPag = idx + 1;
                    return (
                      <button
                        key={numPag}
                        type="button"
                        className={
                          numPag === paginaClientesActual
                            ? "btn-principal pagina-activa"
                            : "btn-secundario"
                        }
                        onClick={() => setPaginaClientesActual(numPag)}
                      >
                        {numPag}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={paginaClientesActual === totalPaginasClientes}
                    onClick={() =>
                      setPaginaClientesActual(
                        Math.min(
                          totalPaginasClientes,
                          paginaClientesActual + 1
                        )
                      )
                    }
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </section>
          )}

          {seccion === "ingresos" && (
            <section>
              <h2>Ingresos</h2>
              <div className="panel-vacio">
                <h3>Resumen de ventas</h3>
                <p>
                  Total registrado: CRC {ingresosTotales.toLocaleString("es-CR")}
                </p>
                <p>Pedidos procesados: {pedidos.length}</p>
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