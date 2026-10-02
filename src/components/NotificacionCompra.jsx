import { useEffect } from "react";

export default function NotificacionCompra({ mensaje, onCerrar }) {
  useEffect(() => {
    const temporizador = window.setTimeout(onCerrar, 8000);
    return () => window.clearTimeout(temporizador);
  }, [mensaje, onCerrar]);

  return (
    <div className="notificacion-flotante" role="status" aria-live="polite">
      <span className="notificacion-flotante-icono" aria-hidden="true">
        ✓
      </span>
      <div className="notificacion-flotante-texto">
        <h4>Compra confirmada</h4>
        <p>{mensaje}</p>
      </div>
      <button
        className="notificacion-cerrar"
        type="button"
        aria-label="Cerrar notificación"
        onClick={onCerrar}
      >
        ×
      </button>
    </div>
  );
}