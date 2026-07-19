import Link from "next/link";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa6";

const FOOTER_SECTIONS = [
  {
    title: "Producto",
    links: [
      ...(process.env.NEXT_PUBLIC_SHOW_PRICING === "true"
        ? [{ label: "Precios", href: "/precios" }]
        : []),
      { label: "Demo gratis", href: "/menu/demo" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Contacto", href: "mailto:hola@platorest.com" },
      { label: "WhatsApp", href: "https://wa.me/5491171410652" },
    ],
  },
];

const SOCIALS = [
  { label: "WhatsApp", href: "https://wa.me/5491171410652", icon: FaWhatsapp },
  { label: "Instagram", href: "https://www.instagram.com/platorest.ok/", icon: FaInstagram },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61591386167046", icon: FaFacebookF },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
              PlatoRest
            </Link>
            <p className="mt-3 text-sm text-text-secondary">
              El único sistema todo-en-uno que tu restaurante necesita para crecer.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition hover:border-primary hover:bg-primary hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm uppercase tracking-wider text-primary">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-border pt-6 text-sm text-text-secondary sm:flex-row">
          <p>© {new Date().getFullYear()} PlatoRest. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
