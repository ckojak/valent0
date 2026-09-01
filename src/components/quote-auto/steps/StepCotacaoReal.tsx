import { useState } from "react";
import { ArrowLeft, CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { ProtocoloBadge } from "../ProtocoloBadge";
import { criarCheckoutSegfy } from "@/lib/segfy.functions";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";

export function StepCotacaoReal({ protocolo }: { protocolo: string }) {
  const telefone = useContatoTelefone();
  const [loading, setLoading] = useState(false);
  const checkout = useServerFn(criarCheckoutSegfy);

  const waUrl = buildWhatsappUrl(
    telefone,
    `Olá! Fiz minha cotação no site da VALENT.\nProtocolo: ${protocolo}\nQuero finalizar a contratação.`,
  );

  const pagar = async () => {
    setLoading(true);
    try {
      const res = await checkout({ data: { protocolo } });
      if (res.status === "ok") {
        window.location.href = res.checkoutUrl;
        return;
      }
      if (res.status === "erro") toast.error(res.mensagem);
      else
        toast.info(
          "Pagamento online em breve. Um especialista finaliza sua contratação pelo WhatsApp.",
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <ShieldCheck className="h-4 w-4" />
        Cotação oficial
      </div>

      <ProtocoloBadge protocolo={protocolo} variant="destaque" />

      <p className="text-sm text-muted-foreground">
        Preencha os dados abaixo para ver os preços reais das seguradoras parceiras, calculados na hora.
        Guarde seu protocolo: é por ele que nosso time localiza sua cotação.
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

      {/* Bloco de contratação — pronto para o endpoint de pagamento da Segfy. */}
      <div className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-base font-extrabold text-foreground">
          Escolheu sua opção? Finalize a contratação
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pagamento online seguro. Se preferir, um especialista conclui com você pelo WhatsApp.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={pagar}
            disabled={loading}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover disabled:opacity-60"
          >
            <CreditCard className="h-4 w-4" />
            {loading ? "Abrindo pagamento..." : "Contratar e pagar"}
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-wa px-4 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </div>
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
