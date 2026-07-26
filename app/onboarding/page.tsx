import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

  const membership = session?.user?.id
    ? await prisma.membership.findFirst({ where: { userId: session.user.id, role: "OWNER" } })
    : null;

  if (membership) {
    redirect("/dashboard");
  }

  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  );
}
