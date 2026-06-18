import { ShieldCheck, Phone } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-tight text-brand">
              Washington <span className="text-cta">Seguros</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Corretora de Seguros
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
          <a href="#como-funciona" className="hover:text-brand">Como funciona</a>
          <a href="#beneficios" className="hover:text-brand">Benefícios</a>
          <a href="#faq" className="hover:text-brand">Dúvidas</a>
        </nav>

        <a
          href="tel:08000000000"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand/20 bg-brand-soft px-3 text-sm font-semibold text-brand transition hover:bg-accent"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">0800 000 0000</span>
          <span className="sm:hidden">Ligar</span>
        </a>
      </div>
    </header>
  );
}
