import { useEffect, useState } from "react";
import { useAppContext } from "../routes/Routing";
import {
  FiSun,
  FiMoon,
  FiZoomIn,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiLogIn,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// Referencia al logo guardado en la carpeta public
const logoAvrillEspecial = "/logo-avrill.jpeg.svg";
const logoRespaldoJpg = "/logo-avrill.jpeg";
const logoRespaldoSvg = "/LogoN.svg";

const numeroWhatsApp = "50662848105";
const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
  "Hola Avrill Cosmética, deseo consultar sobre sus productos artesanales"
)}`;

export default function Encabezado() {
  const {
    rutaActual,
    usuarioActivo,
    carrito,
    navigate,
    cerrarSesion,
    modoOscuro,
    toggleModoOscuro,
    tamanoTexto,
    cambiarTamanoTexto,
  } = useAppContext();

  const [desplazado, setDesplazado] = useState(false);
  const [logoSrc, setLogoSrc] = useState(logoAvrillEspecial);

  useEffect(() => {
    const manejarDesplazamiento = () => {
      setDesplazado(window.scrollY > 60);
    };

    window.addEventListener("scroll", manejarDesplazamiento, { passive: true });
    manejarDesplazamiento();

    return () => window.removeEventListener("scroll", manejarDesplazamiento);
  }, []);

  const claseActiva = (ruta) => (rutaActual === ruta ? "activo" : "");
  const rutaCuenta = usuarioActivo?.rol === "admin" ? "/dashboard" : "/usuario";

  const irAlTaller = () => {
    const desplazar = () =>
      document.getElementById("taller")?.scrollIntoView({ behavior: "smooth" });

    if (rutaActual !== "/") {
      navigate("/");
      setTimeout(desplazar, 150);
    } else {
      desplazar();
    }
  };

  const alternarZoomTexto = () => {
    if (tamanoTexto === "normal") cambiarTamanoTexto("grande");
    else if (tamanoTexto === "grande") cambiarTamanoTexto("extra");
    else cambiarTamanoTexto("normal");
  };

  const manejarErrorImagen = () => {
    if (logoSrc === logoAvrillEspecial) {
      setLogoSrc(logoRespaldoJpg);
    } else if (logoSrc === logoRespaldoJpg) {
      setLogoSrc(logoRespaldoSvg);
    }
  };

  return (
    <>
      <style>{`
        /* Contenedor del Encabezado */
        .encabezado-contenido {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 28px;
          gap: 20px;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Botón Contenedor del Logo */
        .logo-avrill-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          padding: 2px;
          margin: 0;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* 🌟 LOGO AGRANDADO CON CONTRASTE DESTACADO */
        .logo-avrill-img {
          display: block;
          width: auto;
          height: clamp(68px, 8.5vw, 95px); /* Aumento sustancial de presencia */
          max-height: 95px;
          max-width: 100%;
          object-fit: contain;
          /* Filtro de contraste sutil y sombra para separarlo del fondo */
          filter: drop-shadow(0px 3px 6px rgba(51, 69, 55, 0.12)) contrast(1.05);
          transition: transform 0.25s ease, filter 0.3s ease;
          user-select: none;
        }

        .logo-avrill-btn:hover .logo-avrill-img {
          transform: scale(1.05);
          filter: drop-shadow(0px 4px 10px rgba(51, 69, 55, 0.2)) contrast(1.08);
        }

        /* Adaptación en Modo Oscuro */
        body.modo-oscuro .logo-avrill-img {
          filter: drop-shadow(0px 2px 10px rgba(255, 255, 255, 0.25)) brightness(1.18);
        }

        /* Menú Navegación Central */
        .navegacion {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .navegacion button {
          font-size: 0.95rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 999px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        /* Acciones Derecha */
        .encabezado-acciones {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Switch Modo Oscuro */
        .switch-modo-nav {
          width: 44px;
          height: 24px;
          background-color: var(--arena, #e2dacd);
          border: 1px solid var(--borde, #d4cbbe);
          border-radius: 999px;
          padding: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background-color 0.3s ease;
        }

        .switch-modo-nav.modo-activo {
          background-color: var(--verde-oscuro, #334537);
        }

        .switch-circulo-nav {
          width: 18px;
          height: 18px;
          background-color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          color: var(--verde-oscuro, #334537);
        }

        .switch-modo-nav.modo-activo .switch-circulo-nav {
          transform: translateX(20px);
          background-color: #fdfbf7;
          color: #f1c40f;
        }

        /* Control de Zoom */
        .btn-zoom-nav {
          background: transparent;
          border: 1px solid var(--borde, #d4cbbe);
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          color: var(--verde-oscuro, #334537);
          font-weight: 600;
          font-size: 0.85rem;
          transition: background 0.2s ease;
        }

        .btn-zoom-nav:hover {
          background: rgba(74, 93, 78, 0.08);
        }

        body.modo-oscuro .btn-zoom-nav {
          color: var(--texto, #f2f5f3);
        }

        @media (max-width: 900px) {
          .encabezado-contenido {
            flex-wrap: wrap;
            justify-content: center;
            padding: 10px 16px;
          }
          .logo-avrill-img {
            height: clamp(55px, 12vw, 75px);
          }
        }
      `}</style>

      <header className="encabezado">
        <div className={`topbar${desplazado ? " topbar-oculta" : ""}`}>
          <p>
            Envíos a toda Costa Rica vía Correos de Costa Rica · Fórmulas
            100% botánicas · Hecho a mano
          </p>
        </div>

        <div className="encabezado-contenido">
          {/* Logo Agrandado y con Contraste */}
          <button
            className="logo-avrill-btn"
            onClick={() => navigate("/")}
            aria-label="Ir al inicio de Avrill"
            type="button"
          >
            <img
              src={logoSrc}
              alt="Avrill un spa en casa"
              className="logo-avrill-img"
              onError={manejarErrorImagen}
            />
          </button>

          <nav className="navegacion">
            <button
              className={claseActiva("/")}
              onClick={() => navigate("/")}
            >
              Inicio
            </button>

            <button
              className={claseActiva("/catalogo")}
              onClick={() => navigate("/catalogo")}
            >
              Catálogo
            </button>

            <button onClick={irAlTaller}>Taller &amp; Contacto</button>
          </nav>

          <div className="encabezado-acciones">
            {/* Control Modo Oscuro */}
            <button
              type="button"
              className={`switch-modo-nav ${modoOscuro ? "modo-activo" : ""}`}
              onClick={toggleModoOscuro}
              aria-label="Cambiar modo oscuro o claro"
              title={modoOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              <span className="switch-circulo-nav">
                {modoOscuro ? <FiMoon size={11} /> : <FiSun size={11} />}
              </span>
            </button>

            {/* Control Zoom */}
            <button
              type="button"
              className="btn-zoom-nav"
              onClick={alternarZoomTexto}
              aria-label="Ajustar tamaño de texto"
              title={`Aumentar texto. Actual: ${tamanoTexto?.toUpperCase() || "NORMAL"}`}
            >
              <FiZoomIn size={14} />
              <span>{tamanoTexto === "normal" ? "1x" : tamanoTexto === "grande" ? "1.2x" : "1.5x"}</span>
            </button>

            <a
              className="pill-whatsapp"
              href={enlaceWhatsApp}
              target="_blank"
              rel="noreferrer"
              aria-label="Escríbenos a WhatsApp"
            >
              <FaWhatsapp size={16} />
              WhatsApp
            </a>

            <button
              className="icono-accion boton-carrito"
              onClick={() => navigate("/carrito")}
              aria-label="Abrir el carrito"
              title="Carrito"
            >
              <FiShoppingCart size={19} />
              {carrito.length > 0 && (
                <span className="contador-carrito">
                  {carrito.length}
                </span>
              )}
            </button>

            {usuarioActivo ? (
              <>
                <button
                  className={`navegacion-cuenta ${claseActiva(
                    rutaCuenta
                  )}`}
                  onClick={() => navigate(rutaCuenta)}
                >
                  <FiUser size={18} />
                  {usuarioActivo.rol === "admin" ? "Dashboard" : "Mi cuenta"}
                </button>

                <button
                  className="navegacion-cuenta navegacion-salir"
                  onClick={cerrarSesion}
                >
                  <FiLogOut size={16} />
                  Salir
                </button>
              </>
            ) : (
              <button
                className={`navegacion-cuenta ${claseActiva("/login")}`}
                onClick={() => navigate("/login")}
              >
                <FiLogIn size={18} />
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}