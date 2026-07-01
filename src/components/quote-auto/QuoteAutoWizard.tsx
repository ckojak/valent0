import { useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck } from "lucide-react";

import { StepSituacao } from "./steps/StepSituacao";
import { StepVeiculo, type VeiculoData } from "./steps/StepVeiculo";
import { StepCondutor, type CondutorData } from "./steps/StepCondutor";
import { StepPrioridade } from "./steps/StepPrioridade";
import { StepCoberturas, type CoberturasData } from "./steps/StepCoberturas";
import { StepResumo } from "./steps/StepResumo";
import { StepLoadingAnalise } from "./steps/StepLoadingAnalise";
import { StepResultados } from "./steps/StepResultados";
import { StepComparativo } from "./steps/StepComparativo";
import { StepContatoFinal, type ContatoFinalData } from "./steps/StepContatoFinal";
import { StepSucesso } from "./steps/StepSucesso";
import {
  generateAutoQuotes,
  type QuoteAuto,
  type Situacao,
  type Prioridade,
} from "@/lib/quote-auto-data";
import { insertLead } from "@/lib/leads";

type Stage =
  | "situacao"
  | "veiculo"
  | "condutor"
  | "prioridade"
  | "coberturas"
  | "resumo"
  | "loading"
  | "resultados"
  | "comparativo"
  | "contato"
  | "sucesso";

const STAGE_ORDER: Stage[] = [
  "situacao",
  "veiculo",
  "condutor",
  "prioridade",
  "coberturas",
  "resumo",
  "loading",
  "resultados",
  "comparativo",
  "contato",
  "sucesso",
];

const emptyVeiculo: VeiculoData = {
  marca: "",
  modelo: "",
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
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("situacao");
  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [veiculo, setVeiculo] = useState<VeiculoData>(emptyVeiculo);
  const [condutor, setCondutor] = useState<CondutorData>(emptyCondutor);
  const [prioridade, setPrioridade] = useState<Prioridade | null>(null);
  const [coberturas, setCoberturas] = useState<CoberturasData>(emptyCoberturas);
  const [quotes, setQuotes] = useState<QuoteAuto[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [contato, setContato] = useState<ContatoFinalData | null>(null);

  const stepIndex = STAGE_ORDER.indexOf(stage);
  const visibleSteps = STAGE_ORDER.length - 1; // esconde "sucesso" da contagem
  const progress = Math.min(100, Math.round(((stepIndex + 1) / visibleSteps) * 100));

  const goTo = (s: Stage) => setStage(s);
  const back = () => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx > 0) setStage(STAGE_ORDER[idx - 1]);
  };

  const runAnalise = () => {
    setStage("loading");
    // MOCK: aguardar 2.5s simula a chamada ao multicálculo real.
    setTimeout(() => {
      const seed = `${veiculo.marca}-${veiculo.modelo}-${veiculo.ano_mod}-${condutor.cpf}`;
      setQuotes(generateAutoQuotes(seed));
      setStage("resultados");
    }, 2500);
  };

  const handleContatoSubmit = async (data: ContatoFinalData) => {
    setContato(data);
    const payload = {
      nome: data.nome,
      telefone: data.telefone,
      email: data.email || null,
      tipo_seguro: "auto",
      dados: {
        situacao,
        veiculo,
        condutor: { ...condutor, cpf: `***${condutor.cpf.slice(-4)}` }, // não gravar CPF completo em jsonb
        prioridade,
        coberturas,
        quote_escolhida_id: selectedQuoteId,
        quotes_mock: quotes.map((q) => ({
          id: q.id,
          seguradora: q.seguradora,
          premio_total: q.premio_total,
        })),
      },
    };
    const { ok, error } = await insertLead(payload);
    if (!ok) {
      // Falha não bloqueia; usuário continua o fluxo.
      console.warn("[leads] falha ao gravar:", error);
      toast.error("Não conseguimos salvar seus dados agora, mas você já pode falar com nosso time.");
    } else {
      toast.success("Cotação registrada! Nosso time vai te chamar no WhatsApp.");
    }
    setStage("sucesso");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho fino com progresso */}
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
                Passo {Math.min(stepIndex + 1, visibleSteps)} de {visibleSteps}
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
              onNext={(v) => {
                setSituacao(v);
                goTo("veiculo");
              }}
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
              onConfirm={runAnalise}
            />
          )}
          {stage === "loading" && <StepLoadingAnalise />}
          {stage === "resultados" && (
            <StepResultados
              quotes={quotes}
              onCompare={() => goTo("comparativo")}
              onSelect={(id) => { setSelectedQuoteId(id); goTo("contato"); }}
            />
          )}
          {stage === "comparativo" && (
            <StepComparativo
              quotes={quotes}
              onBack={() => goTo("resultados")}
              onSelect={(id) => { setSelectedQuoteId(id); goTo("contato"); }}
            />
          )}
          {stage === "contato" && (
            <StepContatoFinal
              initial={contato}
              onBack={() => goTo("resultados")}
              onSubmit={handleContatoSubmit}
            />
          )}
          {stage === "sucesso" && contato && (
            <StepSucesso
              contato={contato}
              veiculo={veiculo}
              prioridade={prioridade}
              quote={quotes.find((q) => q.id === selectedQuoteId) ?? null}
              onFinish={() => navigate({ to: "/" })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
