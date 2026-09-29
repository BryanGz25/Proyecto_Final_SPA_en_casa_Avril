import { useEffect } from "react";

export default function NotificacionBienvenida({
  nombre,
  onCerrar,
}) {
  useEffect(() => {
    const temporizador = setTimeout(onCerrar, 8000);

    return () => clearTimeout(temporizador);
  }, [onCerrar]);

  const primerNombre = (nombre || "").split(" ")[0];

  return (
    <div
      className="bienvenida-notificacion"
      role="status"
      aria-live="polite"
    >
      <div className="bienvenida-icono" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="currentColor"
        >
          <path d="M22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7h8.2a3 3 0 0 0 5.6 0H22zM12 3.6 9.4 7h5.2L12 3.6zM4 10h2.3a1 1 0 0 0 .2-.3L9.4 5H4a2 2 0 0 0-2 2v3zm16 0h-3.1l1-1.3a1 1 0 0 0 .2-.3L18.7 7H20a2 2 0 0 1 2 2v1z" />
        </svg>
      </div>

      <div className="bienvenida-contenido">
        <strong className="bienvenida-titulo">
          ¡Bienvenido, {primerNombre}!
        </strong>
        <p>
          Gracias por registrarte, {primerNombre}. Obtendrás un{" "}
          <span className="bienvenida-descuento">
            20% de descuento
          </span>{" "}
          en tu primera compra!!!
        </p>
      </div>

      <button
        className="bienvenida-cerrar"
        onClick={onCerrar}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}