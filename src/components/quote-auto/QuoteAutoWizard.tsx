import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck } from "lucide-react";

import { StepSituacao } from "./steps/StepSituacao";
import { StepVeiculo, type VeiculoData } from "./steps/StepVeiculo";
import { StepCondutor, type CondutorData } from "./steps/StepCondutor";
import { StepPrioridade } from "./steps/StepPrioridade";
import { StepCoberturas, type CoberturasData } from "./steps/StepCoberturas";
import { StepResumo } from "./steps/StepResumo";
import { StepWhatsapp } from "./steps/StepWhatsapp";
import { StepCotacaoReal } from "./steps/StepCotacaoReal";
import type { Situacao, Prioridade } from "@/lib/quote-auto-data";
import { insertLead } from "@/lib/leads";
import type { SegfyQuoteInput } from "@/lib/segfy/types";

type Stage =
  | "situacao"
  | "veiculo"
  | "condutor"
  | "prioridade"
  | "coberturas"
  | "resumo"
  | "whatsapp"
  | "cotacao";

const STAGE_ORDER: Stage[] = [
  "situacao",
  "veiculo",
  "condutor",
  "prioridade",
  "coberturas",
  "resumo",
  "whatsapp",
  "cotacao",
];

const emptyVeiculo: VeiculoData = {
  tipo: "car",
  marca: "",
  marca_id: "",
  modelo: "",
  modelo_id: "",
  ano_fab: "",
  ano_mod: "",
  versao: "",
  placa: "",
};
const emptyCondutor: CondutorData = {
  nome: "",
  nascimento: "",
  cpf: "",
  cep: "",
  profissao: "",
  profissao_id: "",
  estado_civil: "",
  uso: "",
};
const emptyCoberturas: CoberturasData = {
  carro_reserva: true,
  vidros: true,
  terceiros: true,
  guincho_24h: true,
};

export function QuoteAutoWizard() {
  const [stage, setStage] = useState<Stage>("situacao");
  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [veiculo, setVeiculo] = useState<VeiculoData>(emptyVeiculo);
  const [condutor, setCondutor] = useState<CondutorData>(emptyCondutor);
  const [prioridade, setPrioridade] = useState<Prioridade | null>(null);
  const [coberturas, setCoberturas] = useState<CoberturasData>(emptyCoberturas);
  const [whatsapp, setWhatsapp] = useState("");
  const [callbackId] = useState(() =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );

  const stepIndex = STAGE_ORDER.indexOf(stage);
  const progress = Math.min(100, Math.round(((stepIndex + 1) / STAGE_ORDER.length) * 100));

  const goTo = (s: Stage) => setStage(s);
  const back = () => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx > 0) setStage(STAGE_ORDER[idx - 1]);
  };

  const handleWhatsappSubmit = async (telefone: string) => {
    setWhatsapp(telefone);
    const payload = {
      nome: condutor.nome || "Lead cotação auto",
      telefone,
      tipo_seguro: "auto",
      dados: {
        situacao,
        veiculo,
        condutor: { ...condutor, cpf: condutor.cpf ? `***${condutor.cpf.slice(-4)}` : "" },
        prioridade,
        coberturas,
        fonte: "wizard_auto_cotacao_real",
      },
    };
    const { ok, error } = await insertLead(payload);
    if (!ok) {
      console.warn("[leads] falha ao gravar:", error);
      toast.error("Não conseguimos salvar seus dados, mas sua cotação já vai abrir.");
    } else {
      toast.success("Recebemos seus dados! Confira sua cotação abaixo.");
    }
    goTo("cotacao");
  };

  const quoteInput: SegfyQuoteInput = useMemo(
    () => ({
      callback: callbackId,
      telefone: whatsapp,
      situacao,
      prioridade,
      coberturas,
      veiculo,
      condutor,
    }),
    [callbackId, coberturas, condutor, prioridade, situacao, veiculo, whatsapp],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/seguros/$slug"
            params={{ slug: "auto" }}
            className="inline-flex h-9 items-center gap-1 rounded-lg border bg-background px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-accent"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Sair
          </Link>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-brand">
                <ShieldCheck className="h-3.5 w-3.5" />
                Cotação Seguro Auto
              </span>
              <span>
                Passo {stepIndex + 1} de {STAGE_ORDER.length}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div
          key={stage}
          className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {stage === "situacao" && (
            <StepSituacao
              value={situacao}
              onNext={(v) => { setSituacao(v); goTo("veiculo"); }}
            />
          )}
          {stage === "veiculo" && (
            <StepVeiculo initial={veiculo} onBack={back} onNext={(v) => { setVeiculo(v); goTo("condutor"); }} />
          )}
          {stage === "condutor" && (
            <StepCondutor initial={condutor} onBack={back} onNext={(v) => { setCondutor(v); goTo("prioridade"); }} />
          )}
          {stage === "prioridade" && (
            <StepPrioridade value={prioridade} onBack={back} onNext={(v) => { setPrioridade(v); goTo("coberturas"); }} />
          )}
          {stage === "coberturas" && (
            <StepCoberturas initial={coberturas} onBack={back} onNext={(v) => { setCoberturas(v); goTo("resumo"); }} />
          )}
          {stage === "resumo" && (
            <StepResumo
              situacao={situacao}
              veiculo={veiculo}
              condutor={condutor}
              prioridade={prioridade}
              coberturas={coberturas}
              onBack={back}
              onConfirm={() => goTo("whatsapp")}
            />
          )}
          {stage === "whatsapp" && (
            <StepWhatsapp onBack={back} onNext={handleWhatsappSubmit} />
          )}
          {stage === "cotacao" && <StepCotacaoReal input={quoteInput} />}
        </div>
      </div>
    </div>
  );
}