import { useAppContext } from "../routes/Routing";

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
  } = useAppContext();

  const claseActiva = (ruta) =>
    rutaActual === ruta ? "activo" : "";

  const rutaCuenta =
    usuarioActivo?.rol === "admin" ? "/dashboard" : "/usuario";

  const irAlTaller = () => {
    const desplazar = () =>
      document
        .getElementById("taller")
        ?.scrollIntoView({ behavior: "smooth" });

    if (rutaActual !== "/") {
      navigate("/");
      setTimeout(desplazar, 150);
    } else {
      desplazar();
    }
  };

  return (
    <header className="encabezado">
      <div className="topbar">
        <p>
          Envíos a toda Costa Rica vía Correos de Costa Rica · Fórmulas
          100% botánicas · Hecho a mano
        </p>
      </div>

      <div className="encabezado-contenido">
        <button
          className="logo"
          onClick={() => navigate("/")}
          aria-label="Ir al inicio de Avrill"
        >
          <img
            src="/logo-avrill.jpeg"
            alt="Avrill un spa en casa"
          />
          <span className="wordmark">
            <span className="wordmark-titulo">Avrill</span>
            <span className="wordmark-sub">Cosmética Artesanal</span>
          </span>
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
          <a
            className="pill-whatsapp"
            href={enlaceWhatsApp}
            target="_blank"
            rel="noreferrer"
            aria-label="Escríbenos a WhatsApp"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.146-.538-1.728-.715-2.85-2.483-2.936-2.599-.086-.115-.694-.925-.694-1.763 0-.838.438-1.25.594-1.42.156-.17.34-.213.454-.213.113 0 .227.001.326.006.104.005.244-.04.382.29.144.346.49 1.196.533 1.282.043.086.071.187.014.301-.057.114-.086.185-.171.284-.086.099-.18.222-.258.298-.086.084-.176.176-.076.348.1.171.444.734.953 1.189.654.584 1.206.765 1.378.851.172.086.273.072.373-.043.101-.115.433-.504.549-.677.114-.172.228-.143.385-.085.157.057.994.469 1.165.554.171.085.285.128.328.199.043.072.043.418-.101.823z" />
            </svg>
            WhatsApp
          </a>

          <button
            className="icono-accion boton-carrito"
            onClick={() => navigate("/carrito")}
            aria-label="Abrir el carrito"
            title="Carrito"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
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
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {usuarioActivo.rol === "admin" ? "Dashboard" : "Mi cuenta"}
              </button>

              <button
                className="navegacion-cuenta navegacion-salir"
                onClick={cerrarSesion}
              >
                Salir
              </button>
            </>
          ) : (
            <button
              className={`navegacion-cuenta ${claseActiva("/login")}`}
              onClick={() => navigate("/login")}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}