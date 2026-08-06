import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

  const [membership, user] = session?.user?.id
    ? await Promise.all([
        prisma.membership.findFirst({ where: { userId: session.user.id, role: "OWNER" } }),
        prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } }),
      ])
    : [null, null];

  const hasPassword = Boolean(user?.passwordHash);

  if (membership && hasPassword) {
    redirect("/dashboard");
  }

  return (
    <Suspense>
      <OnboardingForm
        initialName={session?.user?.name ?? ""}
        hasPassword={hasPassword}
        passwordOnly={Boolean(membership)}
      />
    </Suspense>
  );
}
