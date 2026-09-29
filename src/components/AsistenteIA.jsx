import { useState, useRef, useEffect } from "react";
import { consultarAsistenteIA } from "../services/ia";

export default function AsistenteIA() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([
    {
      emisor: "ia",
      texto: "¡Hola! Soy tu asesora botánica de Avrill 🌿. ¿Qué tipo de piel tienes o qué rutina te gustaría crear?",
    },
  ]);

  const finalChatRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      finalChatRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [historial, abierto]);

  const enviarConsulta = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() || cargando) return;

    const textoUsuario = mensaje.trim();
    setMensaje("");
    setHistorial((prev) => [...prev, { emisor: "usuario", texto: textoUsuario }]);
    setCargando(true);

    const respuestaIA = await consultarAsistenteIA(textoUsuario, historial);

    setHistorial((prev) => [...prev, { emisor: "ia", texto: respuestaIA }]);
    setCargando(false);
  };

  return (
    <aside className="asistente-ia-contenedor" aria-label="Asistente Botánico Virtual">
      {!abierto ? (
        <button
          className="asistente-ia-boton-flotante"
          onClick={() => setAbierto(true)}
          aria-label="Abrir asistente de IA botánico"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.587-1.112l-3.83 1.01 1.033-3.72A9.96 9.96 0 0 1 2 12 10 10 0 0 1 12 2zm0 2a8 8 0 0 0-8 8c0 1.54.437 2.98 1.196 4.205l-.64 2.302 2.368-.624A7.96 7.96 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z" />
          </svg>
          <span>Asesora IA</span>
        </button>
      ) : (
        <div className="asistente-ia-modal">
          <header className="asistente-ia-cabecera">
            <div>
              <strong>Asesora Botánica IA 🌿</strong>
              <small>Avrill Cosmética Natural</small>
            </div>
            <button onClick={() => setAbierto(false)} aria-label="Cerrar chat de IA">
              ✕
            </button>
          </header>

          <div className="asistente-ia-mensajes">
            {historial.map((msg, idx) => (
              <div key={idx} className={`mensaje-ia ${msg.emisor}`}>
                <p>{msg.texto}</p>
              </div>
            ))}
            {cargando && (
              <div className="mensaje-ia ia cargando">
                <p>Consultando fórmulas botánicas...</p>
              </div>
            )}
            <div ref={finalChatRef} />
          </div>

          <form onSubmit={enviarConsulta} className="asistente-ia-form">
            <input
              type="text"
              placeholder="Ej: Tengo piel seca y busco hidratación..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={cargando}
            />
            <button type="submit" disabled={cargando || !mensaje.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}