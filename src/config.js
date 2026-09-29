export const EMISOR = {
  nombre: "Avrill",
  cedula: "3-101-000000",
  nombreComercial: "Avrill · Un spa en casa",
  telefono: "+506 6284-8105",
  correo: "contacto@avrillcr.com",
  direccion: "San José, Desamparados, Centro de Desamparados",
  actividad: "4723 - Venta al por menor de cosméticos y artículos de tocador",
  condicionVenta: "Contado",
  medioPago: "Efectivo / SINPE Móvil",
  plazoCredito: "0 días",
  porcentajeIva: 13,
  moneda: "CRC",
};

export const CORREO_FACTURA = "contacto@avrillcr.com";

export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";

export const EMAILJS = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "",
};

export const correoConfigurado = () =>
  Boolean(EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey);