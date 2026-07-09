import { auth, signOut } from "@/lib/auth";

export default async function AdminHome() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-background p-6">
        <h1 className="mb-2 text-xl font-semibold text-text-primary">
          Panel admin
        </h1>
        <p className="mb-6 text-text-secondary">
          Sesión: {session?.user?.email}
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
