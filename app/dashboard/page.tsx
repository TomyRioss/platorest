import { auth } from "@/lib/auth";

export default async function AdminHome() {
  const session = await auth();

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h1 className="mb-2 text-xl font-semibold text-text-primary">
        Panel admin
      </h1>
      <p className="text-text-secondary">
        Sesión: {session?.user?.email}
      </p>
    </div>
  );
}
