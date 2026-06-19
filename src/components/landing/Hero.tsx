import { ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-soft via-background to-background" />
      <div className="absolute -top-32 -right-32 -z-10 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <div className="mx-auto max-w-2xl px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <ShieldCheck className="h-3.5 w-3.5" />
          VALENT Corretora &amp; Consultoria de Seguros
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
          Entendemos a importância de proteger o que você{" "}
          <span className="text-brand">mais valoriza!</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Escolha abaixo a categoria do seu seguro e cote agora mesmo, 100% online.
        </p>
      </div>
    </section>
  );
}
