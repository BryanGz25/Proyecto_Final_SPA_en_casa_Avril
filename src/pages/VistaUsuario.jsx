import { useState } from "react";
import { useAppContext } from "../routes/Routing";
import Encabezado from "../components/Encabezado";
import Sidebar from "../components/Sidebar";
import FacturaProforma from "../components/FacturaProforma";

export default function VistaUsuario() {
  const {
    usuarioActivo,
    pedidos,
    actualizarUsuario,
    cambiarClave,
    navigate,
  } = useAppContext();

  const [seccion, setSeccion] = useState("pedidos");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState(null);
  const [perfil, setPerfil] = useState({
    nombre: usuarioActivo?.nombre || "",
    correo: usuarioActivo?.correo || "",
    telefono: usuarioActivo?.telefono || "",
    direccion: usuarioActivo?.direccion || "",
    usuario: usuarioActivo?.usuario || "",
  });
  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");

  const misPedidos = pedidos.filter(
    (pedido) => pedido.usuario === usuarioActivo?.usuario
  );

  const opciones = [
    { id: "pedidos", nombre: "Mis pedidos", icono: "#" },
    { id: "perfil", nombre: "Mi perfil", icono: "P" },
    { id: "productos", nombre: "Ver productos", icono: "P" },
    { id: "carrito", nombre: "Mi carrito", icono: "+" },
  ];

  const cambiarSeccion = (id) => {
    setSeccion(id);

    if (id === "productos") {
      navigate("/catalogo");
    }

    if (id === "carrito") {
      navigate("/carrito");
    }
  };

  const guardarPerfil = async (event) => {
    event.preventDefault();
    setMensaje("");
    setError("");

    try {
      if (claveActual || claveNueva) {
        if (!claveActual || !claveNueva) {
          throw new Error("Completa la contraseña actual y la nueva para cambiarla.");
        }
        await cambiarClave(claveActual, claveNueva);
        setClaveActual("");
        setClaveNueva("");
      }

      await actualizarUsuario(usuarioActivo.id, {
        nombre: perfil.nombre,
        correo: perfil.correo,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
      });
      setMensaje("Tu perfil se actualizó correctamente.");
    } catch (errorActualizacion) {
      setError(errorActualizacion.message || "No se pudo actualizar el perfil. Inténtalo de nuevo.");
    }
  };

  return (
    <>
      <Encabezado />

      <main className="layout-privado">
        <Sidebar
          titulo={usuarioActivo?.nombre || "Mi cuenta"}
          opciones={opciones}
          activa={seccion}
          onCambiar={cambiarSeccion}
        />

        <section className="contenido-privado">
          <div className="seccion-introduccion">
            <span className="eyebrow">Mi cuenta</span>
            <h1>Hola, {usuarioActivo?.nombre}</h1>
            <p>Consulta tus pedidos y descubre nuestros productos.</p>
          </div>

          {seccion === "pedidos" && (
            <section>
              <h2>Mis pedidos</h2>

              {misPedidos.length === 0 ? (
                <div className="panel-vacio">
                  <h3>Aun no tienes pedidos</h3>
                  <p>
                    Explora el catalogo y agrega tus productos
                    favoritos al carrito.
                  </p>

                  <button
                    className="btn-principal"
                    onClick={() => navigate("/catalogo")}
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                <div className="pedidos-lista">
                  {misPedidos.map((pedido) => (
                    <article
                      className="pedido-card"
                      key={pedido.id}
                    >
                      <h3>Pedido #{pedido.id}</h3>
                      <p>Factura: {pedido.factura?.numero || "PF"}</p>
                      <p>Total: {new Intl.NumberFormat("es-CR", {
                        style: "currency",
                        currency: "CRC",
                        maximumFractionDigits: 0,
                      }).format(pedido.total)}</p>
                      <p>Estado: {pedido.estado}</p>
                      <p>Productos: {pedido.productos.length}</p>

                      <button
                        className="btn-secundario"
                        onClick={() =>
                          setFacturaSeleccionada(pedido)
                        }
                      >
                        Ver factura proforma
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {seccion === "perfil" && (
            <section>
              <h2>Mi perfil</h2>
              <p>
                Actualiza tus datos desde la base de datos de
                usuarios.
              </p>

              {mensaje && (
                <p className="mensaje-exito">{mensaje}</p>
              )}
              {error && <p className="mensaje-error">{error}</p>}

              <form
                className="formulario formulario-perfil"
                onSubmit={guardarPerfil}
              >
                <label>Nombre completo</label>
                <input
                  value={perfil.nombre}
                  onChange={(event) =>
                    setPerfil({
                      ...perfil,
                      nombre: event.target.value,
                    })
                  }
                  required
                />

                <label>Usuario</label>
                <input value={perfil.usuario} disabled />

                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={perfil.correo}
                  onChange={(event) =>
                    setPerfil({
                      ...perfil,
                      correo: event.target.value,
                    })
                  }
                  required
                />

                <label>Teléfono</label>
                <input
                  type="tel"
                  value={perfil.telefono}
                  onChange={(event) =>
                    setPerfil({
                      ...perfil,
                      telefono: event.target.value,
                    })
                  }
                  required
                />

                <label>Dirección</label>
                <input
                  value={perfil.direccion}
                  onChange={(event) =>
                    setPerfil({
                      ...perfil,
                      direccion: event.target.value,
                    })
                  }
                  required
                />

                <label>Contraseña actual</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={claveActual}
                  onChange={(event) => setClaveActual(event.target.value)}
                  maxLength={72}
                  required={Boolean(claveNueva)}
                  placeholder="Déjala vacía para no cambiarla"
                />

                <label>Nueva contraseña</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={claveNueva}
                  onChange={(event) => setClaveNueva(event.target.value)}
                  minLength={10}
                  maxLength={72}
                  required={Boolean(claveActual)}
                />

                <button className="btn-principal">
                  Guardar cambios
                </button>
              </form>
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