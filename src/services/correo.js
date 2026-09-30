// Endpoint oficial del Webhook de Producción de n8n
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://bryanbs25.app.n8n.cloud/webhook/avrill-pedido";

export async function enviarFacturaPorCorreo(datosPedido) {
  try {
    const respuesta = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosPedido)
    });

    return respuesta.ok;
  } catch (error) {
    console.warn("No se pudo conectar con el Webhook de n8n:", error);
    return false;
  }
}