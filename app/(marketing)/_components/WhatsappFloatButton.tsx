export default function WhatsappFloatButton() {
  return (
    <a
      href="https://wa.me/5491100000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover"
    >
      <span className="text-2xl" aria-hidden="true">
        ●
      </span>
    </a>
  );
}
