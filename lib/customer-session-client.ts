"use client";

const BASE = "/api/customer-auth";

async function getCsrfToken(): Promise<string> {
  const res = await fetch(`${BASE}/csrf`);
  const data = await res.json();
  return data.csrfToken;
}

export async function customerSignIn(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const csrfToken = await getCsrfToken();
  const res = await fetch(`${BASE}/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({ email, password, csrfToken }),
  });
  const data = await res.json();
  const error = data?.url ? new URL(data.url).searchParams.get("error") : "CredentialsSignin";
  return { error: error ?? undefined };
}

export async function customerSignOut(callbackUrl: string) {
  const csrfToken = await getCsrfToken();
  await fetch(`${BASE}/signout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({ csrfToken, callbackUrl }),
  });
  window.location.href = callbackUrl;
}
