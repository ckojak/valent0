import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-brand text-brand-foreground">
              <Home className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <span className="font-display text-lg font-extrabold text-foreground">
              VAL<span className="text-brand">ENT</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Corretora &amp; Consultoria de Seguros. Cuidamos do que você mais valoriza com atendimento humano e tecnologia.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-foreground">Empresa</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-brand">Sobre nós</a></li>
            <li><a href="#" className="hover:text-brand">Atendimento</a></li>
            <li><a href="#" className="hover:text-brand">Imprensa</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold text-foreground">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-brand">Termos de uso</a></li>
            <li><a href="#" className="hover:text-brand">Privacidade (LGPD)</a></li>
            <li><a href="#" className="hover:text-brand">Cookies</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} VALENT Corretora &amp; Consultoria de Seguros. CNPJ 00.000.000/0001-00.</p>
          <p>Registro SUSEP nº 00000000.</p>
        </div>
      </div>
    </footer>
  );
}
