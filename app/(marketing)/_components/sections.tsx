import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/seo";

export type Feature = {
  icon: IconType;
  title: string;
  desc: string;
};

export function FeatureHero({
  eyebrow,
  title,
  lead,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt,
  imageFirst = false,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  imageSrc: string;
  imageAlt: string;
  imageFirst?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-orange-50">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className={imageFirst ? "md:order-2" : undefined}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            {eyebrow}
          </div>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-lg text-lg text-text-secondary">{lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-8 py-4 text-base shadow-lg")}
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-4 text-base font-semibold text-primary hover:bg-primary-light"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className={cn("relative", imageFirst && "md:order-1")}>
          <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden="true" />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsBand({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="border-y border-border bg-surface px-6 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <p className="text-5xl font-bold text-primary sm:text-6xl">{s.value}</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturesGrid({
  heading,
  subheading,
  features,
}: {
  heading: string;
  subheading: string;
  features: Feature[];
}) {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">{heading}</h2>
          <p className="mt-4 text-lg text-text-secondary">{subheading}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="rounded-2xl border border-border bg-background p-6 transition hover:border-primary hover:shadow-lg">
              <CardContent className="p-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({
  heading,
  faqs,
}: {
  heading: string;
  faqs: { question: string; answer: string }[];
}) {
  return (
    <section className="border-t border-border bg-surface px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">{heading}</h2>
          <p className="mt-3 text-text-secondary">
            Todo lo que necesitás saber antes de empezar.
          </p>
        </div>
        <Accordion className="mt-10 gap-3">
          {faqs.map((f) => (
            <AccordionItem
              key={f.question}
              value={f.question}
              className="rounded-xl border border-border bg-white px-5 not-last:border-b"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-text-primary sm:text-lg">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-text-secondary">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function CtaSection({
  title,
  description,
  ctaLabel,
  ctaHref = `mailto:${SITE.email}`,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
}) {
  return (
    <section className="bg-primary px-6 py-20 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-lg text-white/85">{description}</p>
        <Link
          href={ctaHref}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary transition hover:bg-orange-50"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
