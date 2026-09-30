import { useRef, useState } from "react";
import { useAppContext } from "../routes/Routing";
import Encabezado from "../components/Encabezado";
import Footer from "../components/Footer";
import TarjetaProducto from "../components/TarjetaProducto";

const numeroWhatsApp = "50662848105";

const enlaceWhatsApp = (mensaje) =>
  `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

const imagenHistoria =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKJPmZVfahTq45ipXu_RdV5iCsrh1TMIFZubLzUNURrpiXfwc-jPkgD_AgEC9cEo6oqtuHBUrdrd2ugApIhpzcFozCzJDWqGHUfdoepfSH1sKdSr9jywPNrlsJsVfl-DFh35QGGJgISDQ9DKKoeZnNiryfkIl_lou9no8R4IalDizQ3WPtfyIVySmYK6w2Lmh8de50s4zMeSvwiRK80TRH-wTWnGlqJoCqU1qSq8Rls5v7QfUG2aw2uw";

const imagenMapa =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAcf6rYO_JQEfEfnwUKjxL2J93Mp7ST8DYNPeHdEz9Cq6tzvnBN5gfDrLRTZo8NPnlr6rdjBK34PMulfl1ihW04R1txHYtVLajAaX4iH1YH-9H2OIREDzq57q0g2KLtnAEYKve-BNCS0Vyu2wsWShno1BIzLKd_EF8Hjve8Tce0EMHkwLNgH_yAojCUOiw5HUGKPKS8DjPECiITp28USbCRuiMNUEzMGoXbgUtX_nVzv1caoTYG8fftZQ";

const stats = [
  {
    cifra: "100%",
    detalle: "Glicerina Vegetal Pura",
    variante: "primario",
  },
  {
    cifra: "Extractos",
    detalle: "Infusiones herbales vivas",
    variante: "acento",
  },
  {
    cifra: "0% Químicos",
    detalle: "Sin sulfatos ni parabenos",
    variante: "primario",
  },
  {
    cifra: "Envíos GAM",
    detalle: "Y a todo el país",
    variante: "acento",
  },
];

const pilares = [
  {
    titulo: "Humectación Profunda",
    texto:
      "La glicerina de origen vegetal retiene de forma natural la humedad sobre la epidermis, dejando una textura elástica, aterciopelada y protegida durante el día.",
    detalle:
      "Crea un escudo dérmico que reduce un 45% la pérdida de agua transepidérmica.",
    icono: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2.69 5.64 9.16A6 6 0 0 0 12 20.5a6 6 0 0 0 6.36-11.34z" />
        <path d="M12 7.5c.9 1.5 1.5 2.4 1.5 3.3a1.5 1.5 0 0 1-3 0" />
      </svg>
    ),
  },
  {
    titulo: "Exfoliación Suave",
    texto:
      "Semillas seleccionadas y sales minerales que eliminan células muertas y retiran toxinas sin microplásticos ni sensación de tirantez o abrasión.",
    detalle:
      "Granos esféricos micronizados ideales para cutis sensible o rosácea.",
    icono: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M5.6 5.6 8 8M18.4 5.6 16 8M5.6 18.4 8 16M18.4 18.4 16 16" />
      </svg>
    ),
  },
  {
    titulo: "Tono & Luminosidad",
    texto:
      "Propiedades aclarantes sutiles derivadas de plantas medicinales y arcillas botánicas que reviven el brillo natural y unifican visualmente la tez.",
    detalle:
      "Con infusión activa de caléndula bioactiva y cúrcuma silvestre.",
    icono: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    titulo: "Extractos Vivos",
    texto:
      "Aceites esenciales puros de romero, caléndula y lavanda, conservando los principios fitoterapéuticos vivos en cada vertido en frío.",
    detalle: "Cero fragancias sintéticas; 100% aromaterapia funcional real.",
    icono: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22c0-5 4-8 4-12a4 4 0 0 0-8 0c0 4 4 7 4 12z" />
        <path d="M9.5 9h5M10.5 12h3M12 15c0 2 0 4-.5 5" />
      </svg>
    ),
  },
];

const categorias = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "jabones", etiqueta: "Jabones" },
  { clave: "sales", etiqueta: "Sales de Baño" },
  { clave: "splash", etiqueta: "Body Splash" },
  { clave: "decorativos", etiqueta: "Temáticos" },
];

const IconoCheque = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4 12 14.01l-3-3" />
  </svg>
);

const IconoPin = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconoTelefono = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconoEnvio = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const opcionesPiel = [
  "Piel Seca y delicada",
  "Piel Grasa / Con tendencia acneica",
  "Aclarado suave / Manchas",
  "Estrés / Sales terapéuticas",
  "Regalos / Recuerdos para eventos",
];

const opcionesProducto = [
  "Jabones de Glicerina Humectantes ₡3,500",
  "Sales de Baño & Manzanilla ₡4,800",
  "Body Splash Floral & Cítrico ₡5,200",
  "Jabones Decorativos Temáticos (Desde ₡4,000)",
  "Combo Rutina Completa Botánica",
];

export default function Home() {
  const { productos, navigate } = useAppContext();

  const [categoria, setCategoria] = useState("todos");
  const [pilarAbierto, setPilarAbierto] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
    piel: opcionesPiel[0],
    producto: opcionesProducto[0],
    ubicacion: "",
    nota: "",
  });
  const [toast, setToast] = useState("");
  const refTemporizador = useRef(null);

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    clearTimeout(refTemporizador.current);
    refTemporizador.current = setTimeout(() => setToast(""), 3200);
  };

  const cambiarFormulario = (campo, valor) =>
    setFormulario((actuales) => ({ ...actuales, [campo]: valor }));

  const enviarFormulario = (event) => {
    event.preventDefault();

    let mensaje =
      `Hola Kimberly de Avrill Cosmética! Mi nombre es ${formulario.nombre}.%0A` +
      `Estoy interesada(o) en: ${formulario.producto}.%0A` +
      `Mi tipo de piel o necesidad: ${formulario.piel}.%0A` +
      `Mi cantón / ubicación: ${formulario.ubicacion || "San José"}.%0A` +
      `Mi teléfono de contacto: ${formulario.telefono}.`;

    if (formulario.nota.trim().length > 0) {
      mensaje += `%0ANota adicional: ${formulario.nota}`;
    }

    mostrarToast("Redirigiendo a WhatsApp directo con Kimberly...");
    setTimeout(() => {
      window.open(enlaceWhatsApp(mensaje), "_blank");
    }, 700);
  };

  const productosFiltrados =
    categoria === "todos"
      ? productos
      : productos.filter(
          (producto) => producto.categoria === categoria
        );

  return (
    <>
      <Encabezado />

      <main>
        <section className="hero">
          <div className="hero-contenido">
            <span className="hero-badge">
              <span className="hero-punto" aria-hidden="true" />
              Hecho a mano en Costa Rica · Ritual Botánico
            </span>

            <h1>
              El arte del cuidado{" "}
              <em className="hero-italica">consciente</em> y natural de
              tu piel
            </h1>

            <p>
              Jabones de glicerina realizados de forma artesanal con
              extractos puros de plantas, colorantes botánicos y
              aceites esenciales pensados para nutrir la salud, tersura
              y luminosidad de tu piel.
            </p>

            <div className="hero-ctas">
              <button
                className="btn-cta-primario"
                onClick={() => navigate("/catalogo")}
              >
                Explorar Catálogo
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </button>

              <a
                className="btn-cta-secundario"
                href={enlaceWhatsApp(
                  "Hola Avrill, quisiera consultar sobre sus productos artesanales"
                )}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp (+506 6284-8105)
              </a>
            </div>

            <div className="hero-metricas">
              <span className="hero-metrica">
                Envíos por Correos de Costa Rica
              </span>
              <span className="hero-metrice-espacio" aria-hidden="true">
                ·
              </span>
              <span className="hero-metrica">100% Biodegradable</span>
              <span className="hero-metrice-espacio" aria-hidden="true">
                ·
              </span>
              <span className="hero-metrica">Cruelty-Free</span>
            </div>
          </div>
        </section>

        <section className="banda-stats" aria-label="Compromisos de Avrill">
          <div className="stats-grid">
            {stats.map((stat) => (
              <article
                className={`stat-card stat-${stat.variante}`}
                key={stat.cifra}
              >
                <strong>{stat.cifra}</strong>
                <span>{stat.detalle}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="home-seccion">
          <div className="encabezado-seccion">
            <div>
              <span className="eyebrow">Pilares de Cuidado</span>
              <h2>Propiedades de Nuestras Fórmulas</h2>
            </div>
            <p>
              Elaboramos mezclas sinérgicas que respetan el manto
              hidrolipídico, combinando sabiduría herbolaria y estética
              artesanal.
            </p>
          </div>

          <div className="pillares-grid">
            {pilares.map((pilar, indice) => {
              const abierto = pilarAbierto === indice;

              return (
                <article
                  className={`pilar-card ${abierto ? "abierto" : ""}`}
                  key={pilar.titulo}
                  onClick={() =>
                    setPilarAbierto(abierto ? null : indice)
                  }
                  aria-expanded={abierto}
                >
                  <div className="pilar-icono">{pilar.icono}</div>

                  <div className="pilar-cabecera">
                    <h3>{pilar.titulo}</h3>
                    <span className="pilar-mas" aria-hidden="true">
                      {abierto ? "−" : "+"}
                    </span>
                  </div>

                  <p>{pilar.texto}</p>

                  {abierto && (
                    <span className="pilar-detalle">{pilar.detalle}</span>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-seccion fondo-crema" id="catalogo">
          <div className="encabezado-seccion">
            <div>
              <span className="eyebrow">Elaboración Artesanal</span>
              <h2>Catálogo Botánico Seleccionado</h2>
            </div>

            <div className="catalogo-tabs" role="tablist">
              {categorias.map((cat) => (
                <button
                  className={categoria === cat.clave ? "activo" : ""}
                  key={cat.clave}
                  onClick={() => setCategoria(cat.clave)}
                >
                  {cat.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <section className="productos-grid">
            {productosFiltrados
              .slice(0, 4)
              .map((producto) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                />
              ))}
          </section>

          <div className="lote-banner">
            <div className="lote-info">
              <span className="lote-icono" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2.69 5.64 9.16A6 6 0 0 0 12 20.5a6 6 0 0 0 6.36-11.34z" />
                  <path d="M12 7.5c.9 1.5 1.5 2.4 1.5 3.3a1.5 1.5 0 0 1-3 0" />
                </svg>
              </span>
              <div>
                <h4>
                  ¿Buscas un lote personalizado para boda, baby shower o
                  regalo corporativo?
                </h4>
                <p>
                  Diseñamos aromas, etiquetas y formas a medida con
                  empaques biodegradables.
                </p>
              </div>
            </div>
            <a
              className="btn-cta-primario"
              href={enlaceWhatsApp(
                "Hola Kimberly, me gustaría cotizar un pedido especial personalizado"
              )}
              target="_blank"
              rel="noreferrer"
            >
              Cotizar Lote Personalizado
            </a>
          </div>
        </section>

        <section className="historia" id="historia">
          <div
            className="historia-fondo"
            style={{ backgroundImage: `url("${imagenHistoria}")` }}
            aria-hidden="true"
          />
          <div className="historia-overlay" aria-hidden="true" />

          <div className="historia-contenido">
            <div className="historia-texto">
              <span className="eyebrow historia-eyebrow">
                Nuestra Historia &amp; Esencia
              </span>
              <h2>
                Pasión por la Botánica Pura —{" "}
                <em>Hecho con el Corazón</em>
              </h2>

              <blockquote className="historia-cita">
                "Avrill nace del anhelo de reencontrarnos con la
                naturaleza en nuestra rutina más íntima. Cada jabón es
                batido, aromatizado y vertido a mano en Desamparados,
                respetando el descanso de los extractos y sin prisas
                industriales."
              </blockquote>

              <p className="historia-parrafo">
                Detrás de cada pieza se encuentra la dedicación de{" "}
                <strong>Kimberly Gómez Jiménez</strong>, artesana
                cosmética costarricense convencida de que la salud
                dérmica no requiere sintéticos agresivos. Seleccionamos
                únicamente glicerina vegetal pura de grado cosmético,
                aceites esenciales prensados en frío y botánicos
                cultivados localmente.
              </p>

              <div className="historia-sellos">
                <div>
                  <strong>100%</strong>
                  <span>Ingredientes Limpios</span>
                </div>
                <div>
                  <strong>0% Crueldad</strong>
                  <span>Libre de Testeo Animal</span>
                </div>
                <div>
                  <strong>Lotes</strong>
                  <span>Siempre Frescos</span>
                </div>
                <div>
                  <strong>CR</strong>
                  <span>Orgullo Desamparadeño</span>
                </div>
              </div>
            </div>

            <aside className="historia-perfil">
              <div className="perfil-cabecera">
                <span className="perfil-avatar">KG</span>
                <div>
                  <h3>Kimberly Gómez Jiménez</h3>
                  <span className="perfil-rol">
                    Fundadora y Artesana Formuladora
                  </span>
                  <span className="perfil-ubicacion">
                    Desamparados, San José
                  </span>
                </div>
              </div>

              <div className="perfil-items">
                <p>
                  <IconoCheque aria-hidden="true" />
                  <span>
                    <strong>Glicerina Humectante:</strong> Formulación que
                    crea una barrera emoliente natural.
                  </span>
                </p>
                <p>
                  <IconoCheque aria-hidden="true" />
                  <span>
                    <strong>Terapéutica Aclaradora:</strong> Extractos que
                    ayudan a homogeneizar manchas superficiales.
                  </span>
                </p>
                <p>
                  <IconoCheque aria-hidden="true" />
                  <span>
                    <strong>Diseños Festivos:</strong> Creaciones
                    personalizadas para ocasiones memorables.
                  </span>
                </p>
              </div>

              <a
                className="btn-artesana"
                href={enlaceWhatsApp(
                  "Hola Kimberly, quisiera conversar sobre sus formulaciones artesanales"
                )}
                target="_blank"
                rel="noreferrer"
              >
                Hablar con Kimberly
              </a>
            </aside>
          </div>
        </section>

        <section className="home-seccion" id="taller">
          <div className="taller-grid">
            <div className="taller-info">
              <span className="eyebrow">Encuéntranos en San José</span>
              <h2>Taller &amp; Atelier Avrill</h2>
              <p className="taller-intro">
                Atendemos pedidos a toda Costa Rica mediante Correos de
                Costa Rica y brindamos atención cercana en nuestro punto
                de Desamparados para retiros programados y consultas
                directas.
              </p>

              <div className="info-cards">
                <article className="info-card">
                  <IconoPin aria-hidden="true" />
                  <div>
                    <h4>Dirección en Desamparados</h4>
                    <p>
                      Costa Rica, San José, Desamparados centro, 75
                      metros sur de la Clínica Marcial Fallas.
                    </p>
                  </div>
                </article>

                <article className="info-card">
                  <IconoTelefono aria-hidden="true" />
                  <div>
                    <h4>Atención Directa &amp; Pedidos</h4>
                    <p>
                      Teléfono &amp; WhatsApp:{" "}
                      <strong className="info-fuerte">
                        +506 6284-8105
                      </strong>
                    </p>
                    <p className="info-suave">
                      Respuesta ágil todos los días de 8:00 AM a 7:00 PM
                    </p>
                  </div>
                </article>

                <article className="info-card">
                  <IconoEnvio aria-hidden="true" />
                  <div>
                    <h4>Despachos Nacionales</h4>
                    <p>
                      Entrega rápida en GAM (24-48 horas) y todo Costa
                      Rica por Correos de Costa Rica con código de
                      rastreo.
                    </p>
                  </div>
                </article>
              </div>

              <a
                className="mapa-taller"
                href="https://maps.google.com/?q=Cl%C3%ADnica+Marcial+Fallas+Desamparados"
                target="_blank"
                rel="noreferrer"
                style={{ backgroundImage: `url("${imagenMapa}")` }}
              >
                <span className="mapa-etiqueta">
                  Desamparados Centro, Costa Rica (Ver en Google Maps)
                </span>
              </a>
            </div>

            <div className="cartilla-formulario">
              <div className="cartilla-cabecera">
                <span className="eyebrow">Cotización Rápida</span>
                <h3>Solicitud Botánica Personalizada</h3>
                <p>
                  Envía tus preferencias y te contactaremos de inmediato
                  por WhatsApp con disponibilidad, tiempos de curado y
                  costos de envío.
                </p>
              </div>

              <form className="taller-form" onSubmit={enviarFormulario}>
                <label>
                  Nombre Completo
                  <input
                    type="text"
                    maxLength={30}
                    value={formulario.nombre}
                    onChange={(event) =>
                      cambiarFormulario("nombre", event.target.value)
                    }
                    placeholder="Ej. Mariana Valverde"
                    required
                  />
                </label>

                <div className="form-fila">
                  <label>
                    Teléfono o WhatsApp
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={30}
                      value={formulario.telefono}
                      onChange={(event) =>
                        cambiarFormulario(
                          "telefono",
                          event.target.value.replace(/\D/g, "").slice(0, 30)
                        )
                      }
                      placeholder="88888888"
                      required
                    />
                  </label>
                  <label>
                    Tipo de Piel / Necesidad
                    <select
                      value={formulario.piel}
                      onChange={(event) =>
                        cambiarFormulario("piel", event.target.value)
                      }
                    >
                      {opcionesPiel.map((opcion) => (
                        <option key={opcion}>{opcion}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Productos de Interés
                  <select
                    value={formulario.producto}
                    onChange={(event) =>
                      cambiarFormulario("producto", event.target.value)
                    }
                  >
                    {opcionesProducto.map((opcion) => (
                      <option key={opcion}>{opcion}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Cantón / Provincia de Envío
                  <input
                    type="text"
                    maxLength={100}
                    value={formulario.ubicacion}
                    onChange={(event) =>
                      cambiarFormulario("ubicacion", event.target.value)
                    }
                    placeholder="Ej. Heredia centro / San Pedro / Desamparados"
                  />
                </label>

                <label>
                  Nota adicional o consulta
                  <textarea
                    rows="2"
                    maxLength={300}
                    value={formulario.nota}
                    onChange={(event) =>
                      cambiarFormulario("nota", event.target.value)
                    }
                    placeholder="¿Tienes alguna preferencia en aromas o alergia a algún botánico?"
                  />
                </label>

                <button className="btn-enviar-form" type="submit">
                  Enviar Pedido Directo a WhatsApp
                </button>
                <p className="form-pie">
                  Sin intermediarios · Contacto directo con Kimberly
                  Gómez
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {toast && <div className="toast-notificacion">{toast}</div>}
    </>
  );
}