import { useState } from "react";

const numeroTelefono = "+506 6284-8105";
const enlaceTelefono = "tel:+50662848105";
const enlaceWhatsApp = `https://wa.me/50662848105?text=${encodeURIComponent(
  "Hola Avrill Cosmética, deseo consultar sobre sus productos"
)}`;

const enlacesExplorar = [
  { etiqueta: "Jabones Terapéuticos en Barra", ruta: "/catalogo" },
  { etiqueta: "Sales de Baño & Exfoliantes", ruta: "/catalogo" },
  { etiqueta: "Body Splash & Elixires Botánicos", ruta: "/catalogo" },
  { etiqueta: "Jabones Decorativos Temáticos", ruta: "/catalogo" },
  { etiqueta: "Políticas de Envío & Devolución", ruta: "/catalogo" },
];

const redes = [
  {
    nombre: "Facebook",
    url: "https://www.facebook.com",
    icono: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    nombre: "Instagram",
    url: "https://www.instagram.com",
    icono: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    nombre: "X",
    url: "https://x.com",
    icono: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [correoBoletin, setCorreoBoletin] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const suscribirse = (e) => {
    e.preventDefault();
    if (correoBoletin) {
      setConfirmacion("¡Gracias por suscribirte al boletín!");
      setCorreoBoletin("");
      setTimeout(() => setConfirmacion(""), 4000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-contenido">
        {/* Columna 1: Marca */}
        <div className="footer-columna footer-marca">
          <div className="footer-titulo">Avrill</div>
          <span className="footer-sub">Apotecario Natural</span>
          <p>
            Formulaciones botánicas elaboradas a mano en pequeños lotes, honrando
            la biodiversidad y la sabiduría de la tierra costarricense.
          </p>
          <div className="footer-redes">
            {redes.map((red) => (
              <a
                key={red.nombre}
                className="footer-red"
                href={red.url}
                rel="noreferrer"
                target="_blank"
                aria-label={`Ir a ${red.nombre} de Avrill`}
              >
                {red.icono}
              </a>
            ))}
          </div>
        </div>

        {/* Columna 2: Taller */}
        <div className="footer-columna">
          <h3>Taller &amp; Atelier</h3>
          <p>
            Desamparados, San José, Costa Rica.
            <br />
            De la Clínica Marcial Fallas 75m Sur.
            <br />
            Atención presencial y retiros programados.
          </p>
          <p>
            Lun - Sáb: 8:00 AM - 7:00 PM
            <br />
            correo: contacto@avrillcr.com
          </p>
          <a className="footer-enlace" href={enlaceTelefono}>
            {numeroTelefono}
          </a>
        </div>

        {/* Columna 3: Explorar */}
        <div className="footer-columna">
          <h3>Explorar</h3>
          <nav className="footer-lista" aria-label="Explorar">
            {enlacesExplorar.map((enlace) => (
              <a key={enlace.etiqueta} href={enlace.ruta}>
                {enlace.etiqueta}
              </a>
            ))}
          </nav>
        </div>

        {/* Columna 4: Boletín */}
        <div className="footer-columna">
          <h3>El Boletín del Boticario</h3>
          <p>
            Recibe notas estacionales sobre herbolaria, lanzamientos exclusivos
            de lotes reducidos y rituales botánicos.
          </p>

          <form className="footer-form" onSubmit={suscribirse}>
            <input
              type="email"
              value={correoBoletin}
              onChange={(event) => setCorreoBoletin(event.target.value)}
              placeholder="tu.correo@ejemplo.com"
              required
            />
            <button type="submit" className="btn-principal">
              Suscribirme
            </button>
          </form>

          {confirmacion && <span className="footer-aviso">{confirmacion}</span>}
        </div>
      </div>

      {/* Franja Inferior Copyright */}
      <div className="footer-final">
        <p>
          © {new Date().getFullYear()} Avrill · Cosmética Artesanal · Hecho
          conscientemente en Costa Rica
        </p>
        <a
          className="footer-whatsapp"
          href={enlaceWhatsApp}
          target="_blank"
          rel="noreferrer"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
    </footer>
  );
}