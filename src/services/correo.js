// Endpoint oficial del Webhook de Producción de n8n
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://bryanbs25.app.n8n.cloud/webhook/avrill-pedido";

// El workflow de n8n envía la factura al cliente, la copia al admin y el WhatsApp.
// Devuelve { ok, numero, destinatario } o lanza un Error con el motivo.
export async function enviarFacturaPorCorreo(datosPedido) {
  let respuesta;
  try {
    respuesta = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosPedido),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    console.warn("No se pudo conectar con el Webhook de n8n:", error);
    throw new Error("No se pudo enviar la factura por correo. Puedes descargarla desde Mi cuenta.", { cause: error });
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok || !datos.ok) {
    const detalle = Array.isArray(datos.errores) ? ` ${datos.errores.join(" ")}` : "";
    throw new Error(`No se pudo enviar la factura por correo.${detalle}`);
  }

  return datos;
}
