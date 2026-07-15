"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { HiUserCircle, HiGift, HiXMark, HiEye, HiEyeSlash, HiArrowLeft } from "react-icons/hi2";

type ModalMode = "closed" | "choice" | "login" | "register";

export function MenuNavbar({
  restaurantSlug,
  isCustomerSession,
}: {
  restaurantSlug: string;
  isCustomerSession: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>("closed");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function closeModal() {
    setMode("closed");
  }

  function handleAuthSuccess() {
    closeModal();
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-20 flex items-center justify-end border-b border-border bg-background px-4 py-2.5">
      <div ref={ref} className="relative flex items-center gap-2">
        {isCustomerSession && session?.user ? (
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
            aria-label="Cuenta"
          >
            <HiUserCircle className="h-6 w-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("choice")}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-orange-500 px-3 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-50"
          >
            <HiGift className="h-4 w-4" />
            ¡Gana premios y recompensas!
          </button>
        )}

        {menuOpen && isCustomerSession && session?.user && (
          <div className="absolute right-0 top-10 w-48 rounded-xl border border-border bg-background p-1.5 shadow-lg">
            <p className="truncate px-2.5 py-1.5 text-sm font-semibold text-text-primary">
              {session.user.name}
            </p>
            <Link
              href={`/menu/${restaurantSlug}/account`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-2.5 py-1.5 text-sm text-text-primary hover:bg-surface"
            >
              Mi cuenta
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: `/menu/${restaurantSlug}` })}
              className="block w-full rounded-lg px-2.5 py-1.5 text-left text-sm text-danger hover:bg-surface"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        {mode !== "closed" && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-xs rounded-lg bg-background shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                {mode === "choice" ? (
                  <p className="text-sm font-semibold text-text-primary">
                    ¡Gana premios y recompensas!
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("choice")}
                    className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
                  >
                    <HiArrowLeft className="h-4 w-4" />
                    Volver
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Cerrar"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>

              {mode === "choice" && (
                <div className="flex flex-col gap-3 px-4 py-6">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="rounded-lg bg-orange-500 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Soy cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="rounded-lg border border-orange-500 px-3 py-3 text-center text-sm font-semibold text-orange-500 hover:bg-orange-50"
                  >
                    Nuevo cliente
                  </button>
                </div>
              )}

              {mode === "login" && (
                <LoginForm onSuccess={handleAuthSuccess} onSwitchToRegister={() => setMode("register")} />
              )}

              {mode === "register" && (
                <RegisterForm
                  restaurantSlug={restaurantSlug}
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setMode("login")}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Email o contraseña incorrectos.");
        return;
      }
      onSuccess();
    } catch (err) {
      console.error("[customer login] failed", err);
      setError("Error al iniciar sesión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-6">
      <h2 className="text-lg font-bold text-text-primary">Iniciar sesión</h2>
      <p className="mt-1 text-sm text-text-secondary">Accedé a tu cuenta para seguir tus pedidos.</p>

      <div className="mt-4 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-text-primary outline-none transition focus:border-primary"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-text-primary outline-none transition focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="mt-4 text-center text-sm text-text-secondary">
        ¿No tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Registrarse
        </button>
      </p>
    </form>
  );
}

function RegisterForm({
  restaurantSlug,
  onSuccess,
  onSwitchToLogin,
}: {
  restaurantSlug: string;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, restaurantSlug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo crear la cuenta.");
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) throw new Error("No pudimos iniciar sesión. Probá ingresar manualmente.");

      onSuccess();
    } catch (err) {
      console.error("[customer register] failed", err);
      setError(err instanceof Error ? err.message : "No pudimos crear tu cuenta. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-6">
      <h2 className="text-lg font-bold text-text-primary">Crear cuenta</h2>
      <p className="mt-1 text-sm text-text-secondary">Guardá tus datos para pedir más rápido.</p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-text-primary outline-none transition focus:border-primary"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-text-primary outline-none transition focus:border-primary"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-text-primary outline-none transition focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="mt-4 text-center text-sm text-text-secondary">
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Iniciar sesión
        </button>
      </p>
    </form>
  );
}
