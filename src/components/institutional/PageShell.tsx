import type { ReactNode } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
