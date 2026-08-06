import Link from "next/link";
import { Check } from "lucide-react";
import type { OnboardingProgress } from "@/lib/onboarding";

export function OnboardingWidget({
  progress,
  variant,
}: {
  progress: OnboardingProgress;
  variant: "compact" | "full";
}) {
  const { steps, percent } = progress;

  if (variant === "compact") {
    return (
      <div className="mx-2 mb-2 rounded-md bg-white/10 p-3">
        <p className="mb-2 text-xs font-semibold text-white">Primeros pasos ({percent}%)</p>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {steps.map((step) => (
            <Link
              key={step.label}
              href={step.href}
              className="flex items-center gap-2 text-xs text-white/80 hover:text-white"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  step.done ? "bg-orange-500" : "border border-white/40"
                }`}
              >
                {step.done && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              <span className={step.done ? "line-through opacity-70" : ""}>{step.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((step) => !step.done);

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Completá tu configuración inicial</h2>
        <span className="text-sm font-semibold text-orange-500">{percent}%</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-orange-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isLocked = currentIndex !== -1 && index > currentIndex;

          return (
            <div key={step.label} className="flex flex-1 sm:flex-col">
              <div className="flex flex-col items-center sm:w-full">
                <div className="flex w-full items-center sm:contents">
                  {index > 0 && (
                    <div
                      className={`hidden h-0.5 flex-1 sm:block ${
                        index <= currentIndex || currentIndex === -1 ? "bg-orange-500" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              </div>
              <Link
                href={step.href}
                aria-disabled={isLocked}
                className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm sm:mt-0 sm:flex-col sm:text-center ${
                  isCurrent
                    ? "border-orange-500 bg-orange-50 text-text-primary"
                    : "border-border text-text-secondary hover:bg-surface"
                } ${isLocked ? "opacity-50" : ""}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step.done
                      ? "bg-orange-500 text-white"
                      : isCurrent
                        ? "border-2 border-orange-500 text-orange-500"
                        : "border border-border text-text-secondary"
                  }`}
                >
                  {step.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className={step.done ? "text-text-primary line-through opacity-70" : ""}>
                  {step.label}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
