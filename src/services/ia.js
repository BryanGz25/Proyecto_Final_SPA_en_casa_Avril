/**
 * Servicio de Inteligencia Artificial para Avrill · Un spa en casa
 * El chat lo atiende el agente "Avri" (DeepSeek) dentro del workflow de n8n,
 * así ninguna clave de IA queda expuesta en el navegador.
 */

const N8N_CHAT_URL = import.meta.env.VITE_N8N_CHAT_URL || "https://bryanbs25.app.n8n.cloud/webhook/avrill-chat";

// Una sesión por carga de página para que el agente recuerde la conversación.
const sesionChat = crypto.randomUUID();

// Solo se envían los campos públicos del catálogo.
const catalogoPublico = (productos) =>
  productos.map(({ nombre, categoria, precio, disponible, etiqueta, detalle }) => ({
    nombre, categoria, precio, disponible, etiqueta, detalle,
  }));

export async function consultarAsistenteIA(mensajeUsuario, contextoProductos = []) {
  try {
    const response = await fetch(N8N_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensaje: mensajeUsuario,
        sessionId: sesionChat,
        productos: catalogoPublico(contextoProductos),
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) throw new Error(`Error del chat de n8n: ${response.status}`);

    const data = await response.json();
    if (!data.respuesta) throw new Error("Respuesta vacía del chat de n8n");
    return data.respuesta;
  } catch (error) {
    console.warn("Fallo de API o red. Usando fallback seguro:", error);
    return responderFallbackSeguro(mensajeUsuario);
  }
}

function responderFallbackSeguro(mensaje) {
  const txt = mensaje.toLowerCase().trim();

  // Detección de mensajes fuera de lugar / afectuosos / ajenos
  if (
    txt.includes("te amo") ||
    txt.includes("te quiero") ||
    txt.includes("casate") ||
    txt.includes("politica") ||
    txt.includes("futbol") ||
    txt.length < 2
  ) {
    return "Como boticaria virtual de Avrill, únicamente puedo asistirte con consultas sobre nuestros productos artesanales, cuidado de la piel y pedidos. 🌿 ¿En qué puedo orientarte hoy?";
  }

  if (txt.includes("piel seca") || txt.includes("hidrat")) {
    return "Para piel seca te recomiendo altamente nuestros **Jabones Artesanales de Glicerina Humectantes** y las **Sales de Baño**. ¡Le devolverán la suavidad e hidratación a tu piel! 🌿";
  }

  if (txt.includes("jabon") || txt.includes("recomiend")) {
    return "Contamos con hermosos Jabones de Glicerina con extractos naturales de lavanda, romero y caléndula (desde ₡3,500 CRC). Puedes explorarlos en la pestaña 'Catálogo'.";
  }

  if (txt.includes("envio") || txt.includes("correo") || txt.includes("donde")) {
    return "Hacemos envíos a todo Costa Rica mediante Correos de Costa Rica. En la GAM entregamos en 24 a 48 horas. Nuestro taller está en Desamparados Centro.";
  }

  return "¡Hola! Soy Avri 🌿. Estoy aquí para recomendarte nuestros jabones artesanales, sales y productos de spa hechos a mano en Costa Rica. ¿Qué tipo de piel tienes?";
}