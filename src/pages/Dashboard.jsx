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
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState(null);
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
    { id: "inventario", nombre: "Inventario", icono: "I" },
    { id: "pedidos", nombre: "Pedidos pendientes", icono: "#" },
    { id: "clientes", nombre: "Clientes", icono: "C" },
    { id: "ingresos", nombre: "Ingresos", icono: "$" },
    { id: "solicitudes", nombre: "Solicitudes", icono: "?" },
  ];

  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === "pendiente"
  );

  const ingresosTotales = pedidos.reduce(
    (total, pedido) => total + pedido.total,
    0
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
          titulo="Administracion"
          opciones={opciones}
          activa={seccion}
          onCambiar={setSeccion}
        />

        <section className="contenido-privado">
          <div className="seccion-introduccion">
            <span className="eyebrow">Administracion</span>
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
                  Nuevo producto
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
                <div className="panel-vacio">
                  No hay pedidos registrados.
                </div>
              ) : (
                <div className="pedidos-lista">
                  {pedidos.map((pedido) => (
                    <article className="pedido-card" key={pedido.id}>
                      <h3>Pedido #{pedido.id}</h3>
                      <p>Cliente: {pedido.cliente?.nombre || pedido.usuario}</p>
                      <p>Correo: {pedido.cliente?.correo || "—"}</p>
                      <p>Teléfono: {pedido.cliente?.telefono || "—"}</p>
                      <p>Dirección: {pedido.cliente?.direccion || "—"}</p>
                      <p>Total: CRC {pedido.total}</p>
                      <p>
                        Factura proforma:{" "}
                        {pedido.factura?.numero ||
                          "PF-" + pedido.id}
                      </p>

                      <div className="pedido-acciones">
                        <button
                          className="btn-secundario"
                          onClick={() =>
                            setFacturaSeleccionada(pedido)
                          }
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
                            En preparacion
                          </option>
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
              <p>
                Administra los clientes de la base de datos: cambia su
                rol o elimina su cuenta.
              </p>

              <div className="usuarios-lista">
                {usuarios.map((usuario) => (
                  <article
                    className="usuario-card"
                    key={usuario.id}
                  >
                    <div className="usuario-info">
                      <h3>{usuario.nombre}</h3>
                      <p>@{usuario.usuario} · {usuario.correo}</p>
                      <p>Tel: {usuario.telefono}</p>
                      <p>Dirección: {usuario.direccion}</p>
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
                            window.confirm(
                              `¿Eliminar al usuario ${usuario.usuario}?`
                            )
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
            </section>
          )}

          {seccion === "ingresos" && (
            <section>
              <h2>Ingresos</h2>
              <div className="panel-vacio">
                <h3>Resumen de ventas</h3>
                <p>
                  Total registrado: CRC{" "}
                  {ingresosTotales.toLocaleString("es-CR")}
                </p>
                <p>Pedidos procesados: {pedidos.length}</p>
              </div>
            </section>
          )}

          {seccion === "solicitudes" && (
            <section>
              <h2>Solicitudes</h2>
              <div className="panel-vacio">
                No hay solicitudes nuevas por revisar.
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
