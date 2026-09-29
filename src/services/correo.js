import { CORREO_FACTURA, EMAILJS } from "../config";
import { construirFactura, facturaHtml } from "../utils/factura";

export async function enviarFacturaPorCorreo(pedido, destinatario) {
  const factura = construirFactura(pedido);
  const destino = destinatario || CORREO_FACTURA;

  if (
    !EMAILJS.serviceId ||
    !EMAILJS.templateId ||
    !EMAILJS.publicKey
  ) {
    throw new Error(
      "La factura proforma se generó correctamente, pero el envío por correo requiere configurar EmailJS en el archivo .env.local (VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID y VITE_EMAILJS_PUBLIC_KEY)."
    );
  }

  const html = facturaHtml(factura);

  const respuesta = await fetch(
    "https://api.emailjs.com/api/v1.0/email/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS.serviceId,
        template_id: EMAILJS.templateId,
        user_id: EMAILJS.publicKey,
        template_params: {
          to_email: destino,
          from_name: factura.emisor.nombreComercial,
          reply_to: factura.emisor.correo,
          numero: factura.numero,
          cliente: factura.receptor.nombre,
          fecha: new Date(factura.fechaEmision).toLocaleString(
            "es-CR"
          ),
          total: factura.total.toFixed(2),
          moneda: factura.moneda,
          factura_html: html,
          telefono_emisor: factura.emisor.telefono,
        },
      }),
    }
  );

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");
    throw new Error(
      `El servicio de correo respondió ${respuesta.status}${
        detalle ? `: ${detalle}` : ""
      }`
    );
  }

  return { enviado: true, destinatario: destino };
}