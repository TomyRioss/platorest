import { SITE } from "@/lib/seo";

export default function WhatsappFloatButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 md:bottom-6 md:right-6">
      <div className="relative hidden rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg md:block">
        Agenda una demo guiada
        <span className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white shadow-[2px_-2px_2px_0_rgba(0,0,0,0.05)]" />
      </div>
      <a
        href={SITE.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Agenda una demo guiada por WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#128C7E] md:h-16 md:w-16"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-9 w-9"
          aria-hidden="true"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.89 13.86c-.24.67-1.39 1.29-1.93 1.37-.52.08-1.01.24-3.4-.72-2.88-1.14-4.71-4.06-4.85-4.25-.14-.18-1.16-1.54-1.16-2.94 0-1.4.72-2.08.98-2.37.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.18 0 .42-.07.65.5.24.59.82 2.04.89 2.19.07.15.12.32.02.52-.1.2-.15.33-.3.5-.15.18-.31.37-.44.5-.14.14-.28.29-.13.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.59-.13.24.08 1.53.72 1.79.85.27.13.45.2.51.31.07.11.07.63-.17 1.3z" />
        </svg>
      </a>
    </div>
  );
}
