"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";

export function PostHogIdentify() {
  const { data: session, status } = useSession();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      wasAuthenticated.current = true;
      posthog.identify(session.user.id, {
        name: session.user.name ?? undefined,
      });
    }
    if (status === "unauthenticated" && wasAuthenticated.current) {
      wasAuthenticated.current = false;
      posthog.reset();
    }
  }, [status, session?.user?.id, session?.user?.name]);

  return null;
}
