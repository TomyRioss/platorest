const FEATURES = [
  {
    title: "Smart POS",
    desc: "Cierres rápidos, cobros integrados con múltiples medios de pago y una interfaz pensada para el ritmo del salón.",
  },
  {
    title: "Inventario en tiempo real",
    desc: "Control de stock automático con alertas de bajo stock antes de que falte un insumo en cocina.",
  },
  {
    title: "Mapeo de mesas",
    desc: "Visualización 2D del salón: reservas, rotación y ocupación en tiempo real.",
  },
  {
    title: "Menú QR digital",
    desc: "Actualizá precios al instante y ofrecé un menú interactivo sin reimprimir nada.",
  },
  {
    title: "Kitchen Display System (KDS)",
    desc: "Comandas digitales en cocina: elimina el papel y reduce errores de preparación.",
  },
];

const SUPPORT_TIERS = [
  { name: "Remoto", desc: "Soporte por chat y videollamada, 24/7." },
  { name: "Presencial CABA/GBA", desc: "Visitas técnicas en sitio para instalación y mantenimiento." },
];

export default function FuncionalidadesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-3xl font-bold text-text-primary">Funcionalidades</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Todo lo que necesitás para operar tu restaurante, integrado en una sola plataforma.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded border border-border p-6">
            <h2 className="font-semibold text-text-primary">{f.title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-semibold text-text-primary">Soporte</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SUPPORT_TIERS.map((t) => (
          <div key={t.name} className="rounded bg-surface p-6">
            <h3 className="font-semibold text-text-primary">{t.name}</h3>
            <p className="mt-2 text-sm text-text-secondary">{t.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
