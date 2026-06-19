import { Home, MessageCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          {/* Logo placeholder: orange tile with a house framed by hand-like curves */}
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_6px_18px_-6px_oklch(0.7_0.19_47/0.6)]">
            <Home className="h-5 w-5" strokeWidth={2.4} />
            <span className="absolute -left-1 bottom-0 h-3 w-2 rounded-l-full bg-brand/70" aria-hidden />
            <span className="absolute -right-1 bottom-0 h-3 w-2 rounded-r-full bg-brand/70" aria-hidden />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              VAL<span className="text-brand">ENT</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Corretora &amp; Consultoria
            </span>
          </div>
        </a>

        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
