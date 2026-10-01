import { useState } from "react";
import { useAppContext } from "../routes/Routing";
import Encabezado from "../components/Encabezado";
import MapaPuntero from "../components/MapaPuntero";
import { enviarFacturaPorCorreo } from "../services/correo";
import { CORREO_FACTURA } from "../config";

const soloDigitos = (valor) => String(valor || "").replace(/\D/g, "");

export default function Carrito() {
  const {
    carrito,
    totalCarrito,
    cambiarCantidad,
    eliminarDelCarrito,
    crearPedido,
    usuarioActivo,
    navigate,
  } = useAppContext();

  const [formulario, setFormulario] = useState({
    nombre: usuarioActivo?.nombre || "",
    correo: usuarioActivo?.correo || "",
    telefono: soloDigitos(usuarioActivo?.telefono),
    identificacion: soloDigitos(usuarioActivo?.identificacion),
    direccion: usuarioActivo?.direccion || "",
    lat: null,
    lng: null,
  });

  const [direccionMapa, setDireccionMapa] = useState(
    usuarioActivo?.direccion || "San José, Costa Rica"
  );

  const [error, setError] = useState("");
  const [mensajeFactura, setMensajeFactura] = useState("");
  const [enviando, setEnviando] = useState(false);

  const formato = (valor) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      maximumFractionDigits: 0,
    }).format(valor);

  const cambiar = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const usarUbicacion = ({ direccion, lat, lng }) => {
    cambiar("direccion", direccion);
    cambiar("lat", lat);
    cambiar("lng", lng);
  };

  const buscarEnMapa = () => {
    setDireccionMapa(formulario.direccion || "San José, Costa Rica");
  };

  const validarFormulario = () => {
    const nombre = formulario.nombre.trim();
    const correo = formulario.correo.trim();
    const { telefono, identificacion } = formulario;
    const direccion = formulario.direccion.trim();

    if (nombre.length < 3) {
      return "El nombre debe tener al menos 3 caracteres.";
    }

    if (nombre.length > 60) {
      return "El nombre no puede superar los 60 caracteres.";
    }

    if (correo.length > 100) {
      return "El correo no puede superar los 100 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      return "Ingresa un correo electrónico válido.";
    }

    if (!/^\d{8,15}$/.test(telefono)) {
      return "El teléfono debe tener solo números, entre 8 y 15 dígitos.";
    }

    if (identificacion && !/^\d{9,12}$/.test(identificacion)) {
      return "La identificación debe tener solo números, entre 9 y 12 dígitos.";
    }

    if (direccion.length < 5) {
      return "Escribe una dirección más completa.";
    }

    if (direccion.length > 150) {
      return "La dirección no puede superar los 150 caracteres.";
    }

    return "";
  };

  const confirmarPedido = async () => {
    if (!usuarioActivo) {
      navigate("/login");
      return;
    }

    if (
      !formulario.nombre ||
      !formulario.correo ||
      !formulario.telefono ||
      !formulario.direccion
    ) {
      setError(
        "Completa todos los datos de entrega antes de confirmar."
      );
      return;
    }

    const problema = validarFormulario();

    if (problema) {
      setError(problema);
      return;
    }

    setError("");
    setMensajeFactura("");
    setEnviando(true);

    const pedido = await crearPedido(formulario);

    if (!pedido) {
      setEnviando(false);
      setError("No se pudo crear el pedido. Inténtalo de nuevo.");
      return;
    }

    let aviso = `Pedido creado correctamente. Factura proforma ${pedido.factura?.numero}.`;

    try {
      const resultado = await enviarFacturaPorCorreo(
        pedido,
        CORREO_FACTURA
      );

      aviso = `Pedido creado correctamente. La factura proforma fue enviada a ${resultado.destinatario}.`;
      setMensajeFactura(
        `La factura proforma fue enviada a ${resultado.destinatario}.`
      );
    } catch (correoError) {
      aviso = `${aviso}\nAviso del correo: ${correoError.message}`;
      setMensajeFactura(correoError.message);
    } finally {
      setEnviando(false);
      alert(aviso);
      navigate("/usuario");
    }
  };

  return (
    <>
      <Encabezado />

      <main className="pagina">
        <section className="seccion-introduccion">
          <span className="eyebrow">Tu selección</span>
          <h1>Carrito de compras</h1>
        </section>

        {carrito.length === 0 ? (
          <div className="panel-vacio">
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos para comenzar tu pedido.</p>

            <button
              className="btn-principal"
              onClick={() => navigate("/catalogo")}
            >
              Explorar catálogo
            </button>
          </div>
        ) : (
          <>
            <section className="carrito-layout">
              <div className="carrito-lista">
                {carrito.map((producto) => (
                  <article
                    className="carrito-item"
                    key={producto.id}
                  >
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                    />

                    <div>
                      <h3>{producto.nombre}</h3>
                      <p>{formato(producto.precio)}</p>

                      <div className="cantidad-control">
                        <button
                          onClick={() =>
                            cambiarCantidad(
                              producto.id,
                              producto.cantidad - 1
                            )
                          }
                        >
                          −
                        </button>

                        <span>{producto.cantidad}</span>

                        <button
                          onClick={() =>
                            cambiarCantidad(
                              producto.id,
                              producto.cantidad + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn-texto"
                        onClick={() =>
                          eliminarDelCarrito(producto.id)
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="resumen-carrito">
                <h2>Resumen</h2>
                <p>Total del pedido</p>
                <strong>{formato(totalCarrito)}</strong>
              </aside>
            </section>

            <section className="datos-entrega">
              <div className="dashboard-titulo">
                <h2>Datos de entrega</h2>
              </div>

              {error && <p className="mensaje-error">{error}</p>}

              <div className="entrega-layout">
                <form className="formulario formulario-entrega">
                  <label>Nombre del cliente</label>
                  <input
                    value={formulario.nombre}
                    onChange={(event) =>
                      cambiar("nombre", event.target.value)
                    }
                    placeholder="Nombre completo"
                    autoComplete="name"
                    minLength={3}
                    maxLength={60}
                    required
                  />

                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    value={formulario.correo}
                    onChange={(event) =>
                      cambiar("correo", event.target.value.trim())
                    }
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    maxLength={100}
                    required
                  />

                  <label>Número de teléfono</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{8,15}"
                    value={formulario.telefono}
                    onChange={(event) =>
                      cambiar("telefono", soloDigitos(event.target.value))
                    }
                    placeholder="Solo números, 8 a 15 dígitos"
                    autoComplete="tel-national"
                    title="Solo números: de 8 a 15 dígitos."
                    minLength={8}
                    maxLength={15}
                    required
                  />

                  <label>Cédula / Identificación</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{9,12}"
                    value={formulario.identificacion}
                    onChange={(event) =>
                      cambiar(
                        "identificacion",
                        soloDigitos(event.target.value)
                      )
                    }
                    placeholder="Cédula o DIMEX para la factura"
                    title="Solo números: de 9 a 12 dígitos."
                    minLength={9}
                    maxLength={12}
                  />

                  <label>
                    Dirección (busca en el mapa para mayor
                    precisión)
                  </label>
                  <div className="busqueda-direccion">
                    <input
                      value={formulario.direccion}
                      onChange={(event) =>
                        cambiar("direccion", event.target.value)
                      }
                      placeholder="Escribe tu dirección"
                      autoComplete="street-address"
                      minLength={5}
                      maxLength={150}
                      required
                    />

                    <button
                      type="button"
                      className="btn-secundario"
                      onClick={buscarEnMapa}
                    >
                      Ubicar
                    </button>
                  </div>

                  {enviando && (
                    <p className="mensaje-exito">
                      Generando factura proforma y enviándola por
                      correo…
                    </p>
                  )}

                  {mensajeFactura && (
                    <p className="mensaje-exito">
                      {mensajeFactura}
                    </p>
                  )}

                  <button
                    type="button"
                    className="btn-principal btn-ancho"
                    onClick={confirmarPedido}
                    disabled={enviando}
                  >
                    {enviando ? "Enviando…" : "Confirmar pedido"}
                  </button>
                </form>

                <div className="mapa-entrega">
                  <MapaPuntero
                    valor={direccionMapa}
                    onUbicar={usarUbicacion}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}