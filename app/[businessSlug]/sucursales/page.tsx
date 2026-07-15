import { notFound } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { prisma } from "@/lib/prisma";
import { BranchesMapLoader } from "../branches-map-loader";
import "leaflet/dist/leaflet.css";

export default async function SucursalesPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug: businessSlug },
    include: {
      restaurants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!business) notFound();

  return (
    <main className="relative flex h-screen w-full flex-col bg-background p-4 md:p-8">
      <Link
        href={`/${businessSlug}`}
        className="absolute left-4 top-4 z-[2000] flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 shadow-sm hover:bg-surface md:left-8 md:top-8"
      >
        <HiArrowLeft className="h-5 w-5 text-text-primary" />
        <span className="text-sm font-semibold text-text-primary">Volver</span>
      </Link>
      <div className="mt-12 min-h-0 flex-1 md:mt-0">
        <BranchesMapLoader
          title="Sucursales"
          branches={business.restaurants.map((r) => ({ id: r.id, name: r.name, address: r.address, lat: r.lat, lng: r.lng }))}
        />
      </div>
    </main>
  );
}
