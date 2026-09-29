export async function consultarAsistenteIA(mensajeUsuario, productos = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return responderFallback(mensajeUsuario);
  }

  const promptSistema = `
Eres Avri, la boticaria virtual y asesora de cuidado de la piel de "Avrill · Un spa en casa".
Tu objetivo es sugerir rutinas, responder dudas y recomendar productos del catálogo de Avrill en colones costarricenses (₡).
Catálogo actual de productos: ${JSON.stringify(
    productos.map((p) => ({ nombre: p.nombre, precio: p.precio, categoria: p.categoria }))
  )}
Sé siempre amable, concisa (máximo 3 oraciones), profesional y relajante.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${promptSistema}\n\nPregunta: ${mensajeUsuario}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) throw new Error("Error en la API de Gemini");
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return responderFallback(mensajeUsuario);
  }
}

function responderFallback(mensaje) {
  const txt = mensaje.toLowerCase();
  if (txt.includes("piel seca") || txt.includes("hidrat")) {
    return "Para la piel seca te recomiendo nuestras **Sales de Baño Humectantes** y los **Jabones Artesanales de Glicerina**. ¡Le devolverán la suavidad y elasticidad a tu piel! 🌿";
  }
  if (txt.includes("precio") || txt.includes("costo") || txt.includes("cuanto")) {
    return "Nuestros productos artesanales van desde los ₡2,500 hasta los ₡6,500 CRC. ¡Puedes ver los precios exactos en la pestaña de Catálogo!";
  }
  return "¡Hola! Soy Avri 🌿. Estoy aquí para recomendarte los mejores jabones artesanales, sales y productos de spa hechos a mano en Costa Rica. ¿En qué puedo ayudarte hoy?";
}