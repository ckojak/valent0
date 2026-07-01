import { CheckCircle2, Home, MessageCircle } from "lucide-react";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";
import { formatBRL } from "@/lib/masks";
import { PRIORIDADE_LABEL, type Prioridade, type QuoteAuto } from "@/lib/quote-auto-data";
import type { ContatoFinalData } from "./StepContatoFinal";
import type { VeiculoData } from "./StepVeiculo";

export function StepSucesso({
  contato,
  veiculo,
  prioridade,
  quote,
  onFinish,
}: {
  contato: ContatoFinalData;
  veiculo: VeiculoData;
  prioridade: Prioridade | null;
  quote: QuoteAuto | null;
  onFinish: () => void;
}) {
  const telefone = useContatoTelefone();

  const msg = [
    `Olá! Sou ${contato.nome} e acabei de fazer uma cotação no site da VALENT.`,
    `Veículo: ${veiculo.marca} ${veiculo.modelo} ${veiculo.versao} (${veiculo.ano_fab}/${veiculo.ano_mod}).`,
    prioridade ? `Prioridade: ${PRIORIDADE_LABEL[prioridade]}.` : null,
    quote ? `Seguradora escolhida: ${quote.seguradora} — ${formatBRL(quote.premio_total)}/ano.` : null,
    "Podemos continuar por aqui?",
  ].filter(Boolean).join("\n");

  const waUrl = buildWhatsappUrl(telefone, msg);

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-success/15 text-success">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Tudo certo, {contato.nome.split(" ")[0]}!
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Salvamos sua cotação. Um consultor da VALENT vai te chamar no WhatsApp em minutos.
          Se preferir, adiante o contato agora — a mensagem já vem preenchida.
        </p>
      </div>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-success text-base font-bold text-white shadow-lg transition hover:brightness-110"
      >
        <MessageCircle className="h-5 w-5" />
        Falar no WhatsApp agora
      </a>

      <button
        type="button"
        onClick={onFinish}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Voltar para a home
      </button>
    </div>
  );
}
