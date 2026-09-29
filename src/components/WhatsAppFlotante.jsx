const numeroWhatsApp = "50662848105";

const mensaje = "Hola Kimberly de Avrill Cosmética, deseo consultar sobre sus productos artesanales";

export default function WhatsAppFlotante() {
  const enlace = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      className="whatsapp-flotante"
      href={enlace}
      rel="noreferrer"
      target="_blank"
      aria-label="Contactar por WhatsApp"
    >
      <svg
        viewBox="0 0 32 32"
        width="32"
        height="32"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.04 3C8.87 3 3 8.88 3 16.05c0 2.3.6 4.55 1.75 6.53L3 29l6.63-1.73a13.02 13.02 0 0 0 6.4 1.63h.01C23.2 28.9 29 23.03 29 15.85 29 8.88 23.21 3 16.04 3zm0 23.7a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-3.94 1.03 1.05-3.84-.26-.4a10.7 10.7 0 0 1-1.64-5.7c0-5.9 4.8-10.7 10.7-10.7s10.7 4.8 10.7 10.7-4.8 10.63-10.77 10.63zm5.87-8.02c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.51-.16-.72.16-.21.32-.82 1.05-1 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.58-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.44 5.45 4.82.76.33 1.36.53 1.82.67.77.25 1.46.21 2.01.13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z" />
      </svg>
    </a>
  );
}