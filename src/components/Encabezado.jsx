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

// Rutas estáticas servidas desde la carpeta /public
const logoJpg = "/logo-avrill.jpeg";
const logoSvg = "/LogoN.svg";

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
  const [logoActual, setLogoActual] = useState(logoJpg);

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

  return (
    <>
      <style>{`
        /* Botón Contenedor del Logo */
        .logo-avrill-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
        }

        /* Dimensiones del Logo Agrandado y Responsive */
        .logo-avrill-img {
          display: block;
          width: auto;
          height: clamp(56px, 7.5vw, 86px);
          max-height: 86px;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.25s ease, filter 0.3s ease;
          user-select: none;
        }

        .logo-avrill-btn:hover .logo-avrill-img {
          transform: scale(1.04);
        }

        /* Soporte para Modo Oscuro en el Logo */
        body.modo-oscuro .logo-avrill-img {
          filter: drop-shadow(0px 2px 8px rgba(255, 255, 255, 0.2)) brightness(1.15);
        }

        /* Switch de Modo Oscuro */
        .switch-modo-nav {
          width: 46px;
          height: 26px;
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
          width: 20px;
          height: 20px;
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
          gap: 6px;
          cursor: pointer;
          color: var(--verde-oscuro, #334537);
          font-weight: 600;
          font-size: 13px;
          transition: background 0.2s ease;
        }

        .btn-zoom-nav:hover {
          background: rgba(74, 93, 78, 0.08);
        }

        body.modo-oscuro .btn-zoom-nav {
          color: var(--texto, #f2f5f3);
        }

        @media (max-width: 600px) {
          .logo-avrill-img {
            height: clamp(48px, 11vw, 60px);
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
          {/* Logo con fallback automático */}
          <button
            className="logo-avrill-btn"
            onClick={() => navigate("/")}
            aria-label="Ir al inicio de Avrill"
            type="button"
          >
            <img
              src={logoActual}
              alt="Avrill un spa en casa"
              className="logo-avrill-img"
              onError={() => {
                if (logoActual !== logoSvg) {
                  setLogoActual(logoSvg);
                }
              }}
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
            {/* Switch Modo Oscuro */}
            <button
              type="button"
              className={`switch-modo-nav ${modoOscuro ? "modo-activo" : ""}`}
              onClick={toggleModoOscuro}
              aria-label="Cambiar modo oscuro o claro"
              title={modoOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              <span className="switch-circulo-nav">
                {modoOscuro ? <FiMoon size={12} /> : <FiSun size={12} />}
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
              <FiZoomIn size={15} />
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