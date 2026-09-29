// Servicio de Inteligencia Artificial para el Asistente Botánico de Avrill (API Google Gemini)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const PROMPT_SISTEMA = `
Eres la Asistente Virtual Botánica de "Avrill · Un spa en casa", una tienda costarricense de cosmética artesanal y aromaterapia.
Tu objetivo es recomendar productos botánicos artesanales (jabones de glicerina, sales de baño de Epsom, body splash con aceites esenciales, jabones decorativos) basados en el tipo de piel o necesidad del usuario.
Responde de manera amable, natural, breve y profesional en español.
Nuestros precios están en Colones Costarricenses (CRC).
`;

export async function consultarAsistenteIA(mensajeUsuario, historial = []) {
  if (!GEMINI_API_KEY) {
    // Respuesta de respaldo amigable en caso de no configurar la API Key en el archivo .env
    return "¡Hola! Bienvenido a Avrill. Te sugiero probar nuestro Jabón Botánico de Lavanda para relajar e hidratar la piel, o nuestras Sales de Baño de Epsom para descanso muscular.";
  }

  try {
    const contents = [
      { role: "user", parts: [{ text: PROMPT_SISTEMA }] },
      ...historial.map((msg) => ({
        role: msg.emisor === "usuario" ? "user" : "model",
        parts: [{ text: msg.texto }],
      })),
      { role: "user", parts: [{ text: mensajeUsuario }] },
    ];

    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!respuesta.ok) {
      throw new Error(`Error en la API de IA: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    const textoGenerado =
      datos?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude procesar tu solicitud en este momento. Por favor pregúntame de nuevo.";

    return textoGenerado;
  } catch (error) {
    console.error("Error al consultar la IA:", error);
    return "En este momento tenemos una interrupción de conexión con la IA. Puedes consultarnos directamente por WhatsApp.";
  }
}