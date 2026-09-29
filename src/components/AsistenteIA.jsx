import React, { useState } from "react";
import { useAppContext } from "../routes/Routing";
import { consultarAsistenteIA } from "../services/ia";
import { BsStars } from "react-icons/bs";
import { FiMinus, FiX, FiMaximize2 } from "react-icons/fi";

export default function AsistenteIA({ productos = [] }) {
  const { usuarioActivo } = useAppContext();
  const [estado, setEstado] = useState("cerrado"); // Estados posibles: "cerrado", "abierto", "minimizado"
  const [mensajes, setMensajes] = useState([
    {
      autor: "ia",
      texto:
        "🌱 ¡Hola! Soy Avri, tu boticaria virtual de Avrill. ¿Qué tipo de piel tienes o qué beneficio buscas hoy?",
    },
  ]);
  const [entrada, setEntrada] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!entrada.trim() || cargando) return;

    const textoUsuario = entrada.trim();
    setEntrada("");
    setMensajes((prev) => [...prev, { autor: "usuario", texto: textoUsuario }]);
    setCargando(true);

    try {
      const respuesta = await consultarAsistenteIA(textoUsuario, productos);
      setMensajes((prev) => [...prev, { autor: "ia", texto: respuesta }]);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        {
          autor: "ia",
          texto:
            "Ocurrió un inconveniente al conectar con la asesora. Inténtalo de nuevo.",
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <style>{`
        /* Botón de IA Flotante (Cerrado) */
        .ia-flotante {
          align-items: center;
          background: var(--verde-oscuro, #334537);
          border: 1px solid var(--borde, #e8e2d8);
          border-radius: 999px;
          bottom: 1.6rem;
          right: 1.6rem;
          box-shadow: 0 16px 30px -14px rgba(51, 69, 55, 0.75);
          color: white;
          display: grid;
          height: 3.8rem;
          place-items: center;
          position: fixed;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 3.8rem;
          z-index: 40;
          cursor: pointer;
        }

        .ia-flotante:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 22px 36px -14px rgba(51, 69, 55, 0.9);
        }

        /* Capa con Transparencia y Blur cuando el modal está abierto */
        .ia-backdrop-overlay {
          position: fixed;
          inset: 0;
          background: rgba(25, 28, 26, 0.45);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 24px;
          animation: ia-overlay-fade 0.25s ease;
        }

        @keyframes ia-overlay-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Ventana del Modal Desplegado */
        .ia-modal-chat {
          width: min(380px, calc(100vw - 32px));
          height: 500px;
          background: var(--blanco, #ffffff);
          border: 1px solid var(--borde, #e8e2d8);
          border-radius: 20px;
          box-shadow: 0 24px 60px -20px rgba(45, 49, 46, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: ia-modal-pop 0.25s ease;
        }

        @keyframes ia-modal-pop {
          from { transform: translateY(20px) scale(0.96); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Estado Minimizado en Esquina Inferior */
        .ia-bar-minimizada {
          position: fixed;
          bottom: 1.6rem;
          right: 1.6rem;
          z-index: 2001;
          background: var(--verde-oscuro, #334537);
          color: white;
          border-radius: 14px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          cursor: pointer;
          border: 1px solid var(--borde, #e8e2d8);
          animation: ia-modal-pop 0.2s ease;
        }

        .ia-chat-header {
          background: var(--verde-oscuro, #334537);
          color: #ffffff;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ia-chat-header strong {
          display: block;
          font-size: 14px;
          color: #fdfbf7;
        }

        .ia-chat-header small {
          color: #c5a059;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ia-controles-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ia-btn-accion {
          background: transparent;
          border: none;
          color: #ffffff;
          cursor: pointer;
          opacity: 0.8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          transition: opacity 0.2s, background 0.2s;
        }

        .ia-btn-accion:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.15);
        }

        .ia-chat-mensajes {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--crema, #fdfbf7);
        }

        .ia-bubble {
          max-width: 82%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .ia-bubble.usuario {
          align-self: flex-end;
          background: var(--verde-oscuro, #334537);
          color: #ffffff;
          border-bottom-right-radius: 2px;
        }

        .ia-bubble.ia {
          align-self: flex-start;
          background: #f1ebd9;
          color: var(--texto, #191c1a);
          border-bottom-left-radius: 2px;
          border: 1px solid var(--borde, #e8e2d8);
        }

        .ia-chat-form {
          display: flex;
          padding: 12px;
          background: var(--blanco, #ffffff);
          border-top: 1px solid var(--borde, #e8e2d8);
          gap: 8px;
        }

        .ia-chat-form input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--borde, #e8e2d8);
          border-radius: 10px;
          outline: none;
          font-size: 13.5px;
          background: var(--crema-suave, #faf6f0);
        }

        .ia-chat-form button {
          background: var(--verde, #4a5d4e);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0 16px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .ia-cargando {
          font-size: 12px;
          color: #6e7570;
          font-style: italic;
        }
      `}</style>

      {/* 1. Botón Flotante (Cuando está Cerrado) */}
      {estado === "cerrado" && (
        <button
          className="ia-flotante"
          onClick={() => setEstado("abierto")}
          aria-label="Consultar con Asistente de IA"
          title="Asesora Virtual IA Avrill"
          type="button"
        >
          <BsStars size={22} color="#C5A059" />
        </button>
      )}

      {/* 2. Barra Minimizada (Mantiene la conversación en memoria) */}
      {estado === "minimizado" && (
        <div
          className="ia-bar-minimizada"
          onClick={() => setEstado("abierto")}
          title="Maximizar Boticaria Virtual"
        >
          <BsStars size={18} color="#C5A059" />
          <span style={{ fontSize: "13.5px", fontWeight: "600" }}>
            Boticaria Virtual Avrill
          </span>
          <button
            className="ia-btn-accion"
            onClick={(e) => {
              e.stopPropagation();
              setEstado("abierto");
            }}
            aria-label="Maximizar chat"
            title="Maximizar"
          >
            <FiMaximize2 size={14} />
          </button>
          <button
            className="ia-btn-accion"
            onClick={(e) => {
              e.stopPropagation();
              setEstado("cerrado");
            }}
            aria-label="Cerrar chat"
            title="Cerrar"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* 3. Modal Abierto (Con fondo transparente y difuminado) */}
      {estado === "abierto" && (
        <div
          className="ia-backdrop-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEstado("cerrado");
          }}
        >
          <div className="ia-modal-chat">
            <div className="ia-chat-header">
              <div>
                <strong>Boticaria Virtual Avrill</strong>
                <small>Asistencia &amp; Recomendaciones IA</small>
              </div>
              <div className="ia-controles-header">
                <button
                  className="ia-btn-accion"
                  onClick={() => setEstado("minimizado")}
                  aria-label="Minimizar chat"
                  title="Minimizar"
                >
                  <FiMinus size={18} />
                </button>
                <button
                  className="ia-btn-accion"
                  onClick={() => setEstado("cerrado")}
                  aria-label="Cerrar chat de IA"
                  title="Cerrar"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="ia-chat-mensajes">
              {mensajes.map((m, idx) => (
                <div key={idx} className={`ia-bubble ${m.autor}`}>
                  {m.texto}
                </div>
              ))}
              {cargando && (
                <div className="ia-cargando">
                  Avri está analizando las recomendaciones... 🌱
                </div>
              )}
            </div>

            <form onSubmit={enviarMensaje} className="ia-chat-form">
              <input
                type="text"
                placeholder="Escribe tu consulta o tipo de piel..."
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
              />
              <button type="submit" disabled={cargando}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}