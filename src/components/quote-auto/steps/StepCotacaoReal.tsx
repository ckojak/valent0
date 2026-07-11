import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function StepCotacaoReal() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <ShieldCheck className="h-4 w-4" />
        Cotação oficial
      </div>
      <p className="text-sm text-muted-foreground">
        Preencha os dados abaixo para ver os preços reais das seguradoras parceiras, calculados na hora.
      </p>
      <div className="overflow-hidden rounded-2xl border" style={{ height: "78vh", minHeight: 520 }}>
        <iframe
          src="https://valent.seucorretor.digital/#/home?simplificado=true"
          title="Cotação de Seguro Auto — Valent"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          scrolling="yes"
        />
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o início
      </Link>
    </div>
  );
}