import { ChevronLeft, Send } from "lucide-react";
import type { CoberturasData } from "./StepCoberturas";
import type { CondutorData } from "./StepCondutor";
import type { VeiculoData } from "./StepVeiculo";
import {
  PRIORIDADE_LABEL,
  SITUACAO_LABEL,
  type Prioridade,
  type Situacao,
} from "@/lib/quote-auto-data";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2.5 last:border-b-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function StepResumo({
  situacao,
  veiculo,
  condutor,
  prioridade,
  coberturas,
  onBack,
  onConfirm,
}: {
  situacao: Situacao | null;
  veiculo: VeiculoData;
  condutor: CondutorData;
  prioridade: Prioridade | null;
  coberturas: CoberturasData;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const coberturasLabel = [
    coberturas.carro_reserva && "Carro reserva",
    coberturas.vidros && "Vidros",
    coberturas.terceiros && "Terceiros",
    coberturas.guincho_24h && "Guincho 24h",
  ].filter(Boolean).join(", ") || "Nenhuma adicional";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Confirme os dados
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Se algo estiver diferente, é só voltar e ajustar.
        </p>
      </div>

      <div className="rounded-xl border bg-secondary/30 p-4">
        <Row label="Situação" value={situacao ? SITUACAO_LABEL[situacao] : "—"} />
        <Row label="Veículo" value={[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ") || "—"} />
        <Row label="Ano fab/mod" value={`${veiculo.ano_fab}/${veiculo.ano_mod}`} />
        {veiculo.placa && <Row label="Placa" value={veiculo.placa} />}
        <Row label="Condutor" value={condutor.nome} />
        <Row label="Nascimento" value={condutor.nascimento} />
        <Row label="CEP" value={condutor.cep} />
        <Row label="Profissão" value={condutor.profissao || "—"} />
        <Row label="Estado civil" value={condutor.estado_civil} />
        <Row label="Uso" value={condutor.uso} />
        <Row label="Prioridade" value={prioridade ? PRIORIDADE_LABEL[prioridade] : "—"} />
        <Row label="Coberturas" value={coberturasLabel} />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button type="button" onClick={onConfirm}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover">
          <Send className="h-4 w-4" />
          Analisar cotações
        </button>
      </div>
    </div>
  );
}
