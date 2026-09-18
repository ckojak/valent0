import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck } from "lucide-react";

import { StepSituacao } from "./steps/StepSituacao";
import { StepSeguroAtual, emptySeguroAtual, type SeguroAtualData } from "./steps/StepSeguroAtual";
import { StepVeiculo, type VeiculoData } from "./steps/StepVeiculo";
import { StepAvaliacaoRisco, emptyAvaliacaoRisco, type AvaliacaoRiscoData } from "./steps/StepAvaliacaoRisco";
import { StepSegurado, type SeguradoData } from "./steps/StepSegurado";
import { StepPerfilCondutor, type PerfilCondutorData } from "./steps/StepPerfilCondutor";
import { StepPrioridade } from "./steps/StepPrioridade";
import { StepCoberturas, type CoberturasData } from "./steps/StepCoberturas";
import { StepResumo } from "./steps/StepResumo";
import { StepWhatsapp } from "./steps/StepWhatsapp";
import { StepCotacaoReal } from "./steps/StepCotacaoReal";
import type { Situacao, Prioridade } from "@/lib/quote-auto-data";
import { insertLead } from "@/lib/leads";
import { segfySaveCustomer } from "@/lib/segfy/client";
import type { SegfyQuoteInput } from "@/lib/segfy/types";

type Stage =
  | "situacao"
  | "seguro_atual"
  | "veiculo"
  | "segurado"
  | "perfil_condutor"
  | "avaliacao_risco"
  | "prioridade"
  | "coberturas"
  | "resumo"
  | "whatsapp"
  | "cotacao";

const STAGE_ORDER: Stage[] = [
  "situacao",
  "seguro_atual",
  "veiculo",
  "segurado",
  "perfil_condutor",
  "avaliacao_risco",
  "prioridade",
  "coberturas",
  "resumo",
  "whatsapp",
  "cotacao",
];

// Situação em que o cliente vai renovar — exibimos o passo extra.
const SITUACOES_COM_SEGURO_ATUAL: Situacao[] = ["renovar"];


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
const emptySegurado: SeguradoData = {
  documento: "",
  cep: "",
  nome: "",
  nome_social: "",
  nascimento: "",
  sexo: "",
  email: "",
  celular: "",
};

const emptyPerfilCondutor: PerfilCondutorData = {
  relacao: "",
  estado_civil: "",
  profissao: "",
  profissao_id: "",
  nome: "",
  nome_social: "",
  nascimento: "",
  cpf: "",
  cep: "",
  email: "",
  celular: "",
  sexo: "",
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
  const [seguroAtual, setSeguroAtual] = useState<SeguroAtualData>(emptySeguroAtual);
  const [veiculo, setVeiculo] = useState<VeiculoData>(emptyVeiculo);
  const [avaliacaoRisco, setAvaliacaoRisco] = useState<AvaliacaoRiscoData>(emptyAvaliacaoRisco);
  const [segurado, setSegurado] = useState<SeguradoData>(emptySegurado);
  const [perfilCondutor, setPerfilCondutor] = useState<PerfilCondutorData>(emptyPerfilCondutor);

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

  // O passo "seguro_atual" só aparece para quem escolheu "renovar".
  const temSeguroAtual = situacao !== null && SITUACOES_COM_SEGURO_ATUAL.includes(situacao);

  const goTo = (s: Stage) => setStage(s);
  const back = () => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx <= 0) return;
    let prev = STAGE_ORDER[idx - 1];
    if (prev === "seguro_atual" && !temSeguroAtual) prev = "situacao";
    setStage(prev);
  };

  /**
   * Envia o lead parcial para a Segfy (aba Cotações Hfy > Orçamentos) assim que
   * temos o mínimo necessário, sem travar a navegação do wizard.
   * Usa o mesmo callback/reference da sessão para não duplicar registros.
   */
  // Campos aditivos do seguro atual + sexo — enviados junto ao payload já existente.
  const dadosSeguroAtual: Partial<SegfyQuoteInput> = temSeguroAtual
    ? {
        seguradora_atual: seguroAtual.seguradora_atual || undefined,
        numero_apolice_anterior: seguroAtual.numero_apolice_anterior || undefined,
        teve_sinistro:
          seguroAtual.teve_sinistro === ""
            ? null
            : seguroAtual.teve_sinistro === "sim",
        bonus_atual: seguroAtual.bonus_atual || undefined,
        bonus_futuro: seguroAtual.bonus_futuro || undefined,
        vigencia_fim_apolice: seguroAtual.vigencia_fim_apolice || undefined,
        ci_vigente: seguroAtual.ci_vigente || undefined,

      }
    : {};

  const mapUsoVeiculo = (value?: string) => {
    switch (value) {
      case "personal":
        return "Locomoção diária";
      case "job":
        return "Uso comercial";
      case "both":
        return "Locomoção diária e uso comercial";
      default:
        return value || "";
    }
  };

  const buildCondutor = (): SegfyQuoteInput["condutor"] => {
    const relacao = perfilCondutor.relacao || "Próprio";
    const isProprio = relacao === "Próprio";
    const usoFinal = perfilCondutor.uso || mapUsoVeiculo(avaliacaoRisco.tipo_uso) || "";

    return {
      nome: isProprio ? segurado.nome : perfilCondutor.nome || segurado.nome,
      nome_social: isProprio ? segurado.nome_social || "" : perfilCondutor.nome_social || "",
      nascimento: isProprio ? segurado.nascimento : perfilCondutor.nascimento || segurado.nascimento,
      cpf: isProprio ? segurado.documento : perfilCondutor.cpf || segurado.documento,
      cep: isProprio ? segurado.cep : perfilCondutor.cep || segurado.cep,
      profissao: perfilCondutor.profissao || "",
      profissao_id: perfilCondutor.profissao_id || "",
      estado_civil: perfilCondutor.estado_civil || "",
      uso: usoFinal,
      sexo: isProprio ? segurado.sexo || "" : perfilCondutor.sexo || "",
      email: isProprio ? segurado.email || "" : perfilCondutor.email || segurado.email || "",
      relacao,
      documento: segurado.documento,
      celular: isProprio ? segurado.celular || "" : perfilCondutor.celular || segurado.celular || "",
    };
  };

  const condutor = buildCondutor();

  const salvarParcialSegfy = (
    origem: string,
    overrides: Partial<SegfyQuoteInput> = {},
  ) => {
    const condutorFinal = overrides.condutor ?? condutor;
    const partialInput: SegfyQuoteInput = {
      callback: callbackId,
      reference: callbackId,
      telefone: whatsapp,
      email: condutorFinal.email || undefined,
      sexo: condutorFinal.sexo || undefined,
      situacao,
      prioridade,
      coberturas,
      veiculo,
      avaliacao_risco: avaliacaoRisco,
      segurado: {
        documento: segurado.documento,
        cep: segurado.cep,
        nome: segurado.nome,
        nome_social: segurado.nome_social || "",
        nascimento: segurado.nascimento,
        sexo: segurado.sexo || "",
        email: segurado.email || "",
        celular: segurado.celular || "",
      },
      condutor: condutorFinal,
      ...dadosSeguroAtual,
      ...overrides,
    };

    void segfySaveCustomer(partialInput).catch((err: unknown) => {
      console.error(
        `[SegfySaveCustomer:error] (${origem})`,
        err instanceof Error ? err.message : err,
      );
    });
  };

  const handleWhatsappSubmit = async (telefone: string) => {
    const telefoneLimpo = telefone.replace(/\D/g, "");

    setWhatsapp(telefoneLimpo);
    setSegurado((prev) => ({ ...prev, celular: prev.celular || telefoneLimpo }));
    setPerfilCondutor((prev) => ({ ...prev, celular: prev.celular || telefoneLimpo }));

    salvarParcialSegfy("pos-whatsapp", { telefone: telefoneLimpo, condutor: { ...buildCondutor(), celular: telefoneLimpo } });
    const payload = {
      client_name: condutor.nome || "Lead cotação auto",
      nome: condutor.nome || "Lead cotação auto",
      telefone: telefoneLimpo,
      email: condutor.email || segurado.email || "",
      tipo_seguro: "auto",
      form_type: "auto",
      form_title: "Cotação Auto",
      dados: {
        situacao,
        veiculo,
        segurado: {
          ...segurado,
          celular: segurado.celular || telefoneLimpo,
          documento: segurado.documento ? `***${segurado.documento.replace(/\D/g, '').slice(-4)}` : "",
        },
        condutor: { ...condutor, celular: condutor.celular || telefoneLimpo, cpf: condutor.cpf ? `***${condutor.cpf.replace(/\D/g, '').slice(-4)}` : "" },
        perfil_condutor: perfilCondutor,
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
      reference: callbackId,
      telefone: whatsapp,
      email: condutor.email || undefined,
      sexo: condutor.sexo || undefined,
      situacao,
      prioridade,
      coberturas,
      veiculo,
      avaliacao_risco: avaliacaoRisco,
      segurado: {
        documento: segurado.documento,
        cep: segurado.cep,
        nome: segurado.nome,
        nome_social: segurado.nome_social || "",
        nascimento: segurado.nascimento,
        sexo: segurado.sexo || "",
        email: segurado.email || "",
        celular: segurado.celular || "",
      },
      condutor,
      ...dadosSeguroAtual,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callbackId, coberturas, condutor, prioridade, situacao, veiculo, whatsapp, seguroAtual, avaliacaoRisco],

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

      <div className={`mx-auto px-4 py-6 sm:px-6 sm:py-10 ${stage === "cotacao" ? "max-w-7xl" : "max-w-2xl"}`}>
        <div
          key={stage}
          className={`${stage === "cotacao" ? "" : "rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
          {stage === "situacao" && (
            <StepSituacao
              value={situacao}
              onNext={(v) => {
                setSituacao(v);
                goTo(SITUACOES_COM_SEGURO_ATUAL.includes(v) ? "seguro_atual" : "veiculo");
              }}
            />
          )}
          {stage === "seguro_atual" && (
            <StepSeguroAtual
              initial={seguroAtual}
              onBack={back}
              onNext={(v) => { setSeguroAtual(v); goTo("veiculo"); }}
            />
          )}
          {stage === "veiculo" && (
            <StepVeiculo initial={veiculo} onBack={back} onNext={(v) => { setVeiculo(v); goTo("segurado"); }} />
          )}
          {stage === "segurado" && (
            <StepSegurado initial={segurado} onBack={back} onNext={(v) => { setSegurado(v); goTo("perfil_condutor"); }} />
          )}
          {stage === "perfil_condutor" && (
            <StepPerfilCondutor
              initial={perfilCondutor}
              segurado={segurado}
              onBack={back}
              onNext={(v) => {
                setPerfilCondutor(v);
                salvarParcialSegfy("pos-perfil-condutor", { condutor: buildCondutor() });
                goTo("avaliacao_risco");
              }}
            />
          )}
          {stage === "avaliacao_risco" && (
            <StepAvaliacaoRisco
              initial={avaliacaoRisco}
              onBack={back}
              onNext={(v) => {
                setAvaliacaoRisco(v);
                setPerfilCondutor((prev) => ({
                  ...prev,
                  uso: prev.uso || mapUsoVeiculo(v.tipo_uso) || "",
                }));
                goTo("prioridade");
              }}
            />
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
              segurado={segurado}
              perfilCondutor={perfilCondutor}
              condutor={condutor}
              prioridade={prioridade}
              coberturas={coberturas}
              onBack={back}
              onEditSegurado={() => goTo("segurado")}
              onEditPerfilCondutor={() => goTo("perfil_condutor")}
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