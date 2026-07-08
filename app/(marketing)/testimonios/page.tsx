import TestimonioForm from "./_components/TestimonioForm";

const TESTIMONIALS = [
  { name: "Laura Gómez", role: "Dueña, Buenos Aires", quote: "Bajamos los tiempos de cierre a la mitad." },
  { name: "Martín Pérez", role: "Chef ejecutivo, Madrid", quote: "El KDS terminó con los errores de comanda." },
  { name: "Sofía Ramírez", role: "Gerente, Rosario", quote: "El inventario en tiempo real nos salvó de quiebres de stock." },
];

export default function TestimoniosPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-3xl font-bold text-text-primary">Testimonios</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Lo que dicen los equipos que ya usan PlatoRest.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="rounded border border-border bg-surface p-6">
            <p className="text-text-primary">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-4 text-sm font-medium text-text-primary">{t.name}</p>
            <p className="text-sm text-text-secondary">{t.role}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-xl">
        <h2 className="text-xl font-semibold text-text-primary">Dejá tu testimonio</h2>
        <div className="mt-4">
          <TestimonioForm />
        </div>
      </div>
    </main>
  );
}
