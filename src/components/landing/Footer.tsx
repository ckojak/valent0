import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-extrabold text-brand">
              Seguro<span className="text-cta">Já</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Corretora digital de seguros. Comparamos as maiores seguradoras do Brasil para você
            economizar com tranquilidade.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-brand">Empresa</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-brand">Sobre nós</a></li>
            <li><a href="#" className="hover:text-brand">Carreiras</a></li>
            <li><a href="#" className="hover:text-brand">Imprensa</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold text-brand">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-brand">Termos de uso</a></li>
            <li><a href="#" className="hover:text-brand">Privacidade (LGPD)</a></li>
            <li><a href="#" className="hover:text-brand">Cookies</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} SeguroJá Corretora de Seguros LTDA. CNPJ 00.000.000/0001-00.</p>
          <p>Registro SUSEP nº 00000000.</p>
        </div>
      </div>
    </footer>
  );
}
