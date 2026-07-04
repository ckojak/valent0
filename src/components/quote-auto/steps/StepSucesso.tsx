import { CheckCircle2, Home, MessageCircle, HeartHandshake, Search, Sparkles } from "lucide-react";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";
import { formatBRL } from "@/lib/masks";
import { PRIORIDADE_LABEL, type Prioridade, type QuoteAuto } from "@/lib/quote-auto-data";
import type { ContatoFinalData } from "./StepContatoFinal";
import type { VeiculoData } from "./StepVeiculo";

const VALUES = [
  { icon: HeartHandshake, label: "Atendimento humanizado" },
  { icon: Search, label: "Análise personalizada" },
  { icon: Sparkles, label: "Melhores opções" },
];

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
  const firstName = contato.nome.split(" ")[0] ?? "";

  return (
    <div className="-mx-4 -my-8 rounded-none bg-navy px-6 py-14 text-center text-white sm:mx-0 sm:my-0 sm:rounded-3xl">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand text-white shadow-[0_10px_40px_-10px_oklch(0.7_0.19_47/0.7)]">
        <CheckCircle2 className="h-10 w-10" strokeWidth={2.2} />
      </div>

      <h2 className="mt-6 font-display text-2xl font-extrabold sm:text-3xl">
        Obrigado{firstName ? `, ${firstName}` : ""}! Sua solicitação foi enviada com sucesso.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
        Em poucos minutos um especialista Valent entrará em contato com você pelo WhatsApp.
      </p>

      <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-brand/40 text-brand">
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-10 max-w-sm">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-wa text-base font-bold text-white shadow-lg transition hover:brightness-110"
        >
          <MessageCircle className="h-5 w-5" />
          Falar no WhatsApp
        </a>
        <button
          type="button"
          onClick={onFinish}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Voltar para a home
        </button>
      </div>

      <p className="mt-10 text-xs text-white/50">
        Valent Seguros — Corretora &amp; Consultoria de Seguros · SUSEP nº 212126836
      </p>
    </div>
  );
}
