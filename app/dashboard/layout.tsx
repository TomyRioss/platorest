import { headers } from "next/headers";
import { auth, signOut } from "@/lib/auth";
import { Smartphone, ChevronDown, Headset, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "./sidebar-nav";
import { QrDownloadButton } from "./qr-download-button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const membership = session?.user?.id
    ? await prisma.membership.findFirst({
        where: { userId: session.user.id, role: "OWNER" },
        include: { business: true },
        orderBy: { id: "asc" },
      })
    : null;

  const business = membership?.business;

  let trialDaysLeft: number | null = null;
  if (business?.trialEndsAt) {
    const diff = new Date(business.trialEndsAt).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { slug: true },
  });
  const host = (await headers()).get("host");
  const menuUrl = restaurant ? `${host ? `https://${host}` : ""}/menu/${restaurant.slug}` : "";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <header className="z-10 flex h-16 shrink-0 items-center bg-primary shadow-md">
        <div className="flex h-full w-56 shrink-0 flex-col justify-center px-5">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-medium tracking-normal text-white">
              PlatoRest
            </span>
          </div>
          {trialDaysLeft !== null && (
            <span className="mt-0.5 text-[11px] font-semibold text-yellow-300">
              {trialDaysLeft > 0
                ? `⏳ ${trialDaysLeft} días de prueba`
                : "⚠️ Trial expirado"}
            </span>
          )}
        </div>
        <div className="flex h-16 flex-1 items-center justify-end pl-6">
          <a
            href="https://wa.me/5491171410652"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-6 flex cursor-pointer items-center gap-2 text-sm font-medium text-white hover:text-white/80"
          >
            <Headset className="h-5 w-5" />
            Soporte
          </a>

          <div className="h-6 w-px bg-white/30" />

          <DropdownMenu>
            <DropdownMenuTrigger className="group flex h-16 min-w-40 cursor-pointer items-center justify-between gap-1.5 pr-6 pl-6 text-sm font-medium text-white outline-none">
              {session?.user?.name}
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={0}
              className="h-(--anchor-height) rounded-none p-0 duration-200 ease-out"
            >
              <form
                className="h-full"
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <DropdownMenuItem
                  nativeButton
                  render={<button type="submit" className="w-full" />}
                  className="h-full justify-center gap-2 rounded-none px-4"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-56 shrink-0 flex-col bg-primary py-6">
          <SidebarNav />

          {restaurant && (
            <div className="mt-auto border-t border-white/15 px-3 pt-4">
              <div className="flex items-stretch overflow-hidden rounded-md bg-white">
                <a
                  href={`/menu/${restaurant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  <Smartphone className="h-6 w-6" />
                  Vista previa
                </a>
                <Separator orientation="vertical" className="!h-auto bg-border" />
                <QrDownloadButton menuUrl={menuUrl} slug={restaurant.slug} />
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
