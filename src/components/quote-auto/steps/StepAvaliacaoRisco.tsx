import { useState } from "react";
import { ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ResidenceGarageOption =
  | "yes_with_electronic_gate"
  | "yes_without_electronic_gate"
  | "no_garage"
  | "not_kept_in_garage";

export type AvaliacaoRiscoData = {
  garagem_residencia: "" | ResidenceGarageOption;
  garagem_trabalho: string;
  garagem_estudo: string;
  tipo_uso: string;
  menores_26: string;
  idade_condutor_adicional: string;
  km_mensal: string;
  distancia_trabalho: string;
  tipo_residencia: string;
  isencao_fiscal: string;
};

export const emptyAvaliacaoRisco: AvaliacaoRiscoData = {
  garagem_residencia: "",
  garagem_trabalho: "",
  garagem_estudo: "",
  tipo_uso: "",
  menores_26: "",
  idade_condutor_adicional: "",
  km_mensal: "",
  distancia_trabalho: "",
  tipo_residencia: "",
  isencao_fiscal: "",
};

// Valores oficiais extraídos do formulário da Segfy (auto-bundle).
const GARAGEM_RESIDENCIA = [
  { value: "yes_with_electronic_gate", label: "Sim, com portão eletrônico" },
  { value: "yes_without_electronic_gate", label: "Sim, sem portão eletrônico" },
  { value: "no_garage", label: "Não possui" },
  { value: "not_kept_in_garage", label: "Não deixa em garagem" },
];
const GARAGEM_TRABALHO = [
  { value: "yes", label: "Sim, possui" },
  { value: "no", label: "Não possui" },
  { value: "does_not_work", label: "Não trabalha" },
  { value: "not_kept_in_garage", label: "Não deixa em garagem" },
  { value: "does_not_use", label: "Não utiliza para trabalhar" },
];
const GARAGEM_ESTUDO = [
  { value: "yes", label: "Sim, possui" },
  { value: "no", label: "Não possui" },
  { value: "does_not_study", label: "Não estuda" },
  { value: "not_kept_in_garage", label: "Não deixa em garagem" },
  { value: "does_not_use", label: "Não utiliza para estudar" },
];
const TIPO_USO = [
  { value: "personal", label: "Locomoção diária" },
  { value: "job", label: "Uso comercial" },
  { value: "both", label: "Locomoção diária e uso comercial" },
];
const MENORES_26 = [
  { value: "does_not_exist", label: "Não residem" },
  { value: "yes_female", label: "Sim, do sexo feminino" },
  { value: "yes_male", label: "Sim, do sexo masculino" },
  { value: "yes_both", label: "Sim, de ambos os sexos" },
  { value: "yes_does_not_use", label: "Sim, mas não utilizam o veículo" },
];
const IDADE_ADICIONAL = [
  { value: "age_18_to_24", label: "De 18 a 24 anos" },
  { value: "age_25", label: "25 anos" },
];
const TIPO_RESIDENCIA = [
  { value: "house", label: "Casa" },
  { value: "apartment", label: "Apartamento" },
  { value: "condominium", label: "Casa em condomínio" },
  { value: "farm", label: "Chácara" },
  { value: "other", label: "Outros" },
];
const ISENCAO_FISCAL = [
  { value: "not_isent", label: "Sem isenção" },
  { value: "pcd_isent", label: "PCD com isenção" },
  { value: "pcd_not_isent", label: "PCD sem isenção" },
  { value: "ipi", label: "IPI" },
  { value: "icms", label: "ICMS" },
  { value: "ipi_icms", label: "IPI/ICMS" },
];

export function StepAvaliacaoRisco({
  initial,
  onBack,
  onNext,
}: {
  initial: AvaliacaoRiscoData;
  onBack: () => void;
  onNext: (v: AvaliacaoRiscoData) => void;
}) {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof AvaliacaoRiscoData, string>>>({});

  const set = <K extends keyof AvaliacaoRiscoData>(k: K, v: AvaliacaoRiscoData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const precisaIdadeAdicional =
    data.menores_26 === "yes_female" || data.menores_26 === "yes_male" || data.menores_26 === "yes_both";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!data.garagem_residencia) next.garagem_residencia = "Selecione.";
    if (!data.garagem_trabalho) next.garagem_trabalho = "Selecione.";
    if (!data.garagem_estudo) next.garagem_estudo = "Selecione.";
    if (!data.tipo_uso) next.tipo_uso = "Selecione.";
    if (!data.menores_26) next.menores_26 = "Selecione.";
    if (precisaIdadeAdicional && !data.idade_condutor_adicional) next.idade_condutor_adicional = "Selecione.";
    if (!data.tipo_residencia) next.tipo_residencia = "Selecione.";
    if (!data.isencao_fiscal) next.isencao_fiscal = "Selecione.";
    if (!data.km_mensal.trim() || Number(data.km_mensal) <= 0) next.km_mensal = "Informe a média mensal.";
    if (!data.distancia_trabalho.trim() || Number(data.distancia_trabalho) < 0)
      next.distancia_trabalho = "Informe a distância.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

  const selectField = (
    key: keyof AvaliacaoRiscoData,
    label: string,
    options: Array<{ value: string; label: string }>,
  ) => (
    <div>
      <Label>{label}</Label>
      <Select value={String(data[key])} onValueChange={(v) => set(key, v as never)}>
        <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <ShieldAlert className="h-4 w-4" />
        Avaliação de risco
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        Essas respostas influenciam diretamente o preço calculado pelas seguradoras.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {selectField("garagem_residencia", "Garagem na residência", GARAGEM_RESIDENCIA)}
        {selectField("garagem_trabalho", "Garagem no trabalho", GARAGEM_TRABALHO)}
        {selectField("garagem_estudo", "Garagem no estudo", GARAGEM_ESTUDO)}
        {selectField("tipo_uso", "Tipo de uso", TIPO_USO)}
        {selectField("menores_26", "Reside com menores de 26 anos?", MENORES_26)}
        {precisaIdadeAdicional &&
          selectField("idade_condutor_adicional", "Idade do condutor adicional", IDADE_ADICIONAL)}
        {selectField("tipo_residencia", "Tipo de residência", TIPO_RESIDENCIA)}
        {selectField("isencao_fiscal", "Isenção fiscal", ISENCAO_FISCAL)}

        <div>
          <Label htmlFor="km_mensal">Km rodados por mês</Label>
          <Input
            id="km_mensal"
            inputMode="numeric"
            placeholder="Ex: 500"
            value={data.km_mensal}
            onChange={(e) => set("km_mensal", e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-1.5 h-11"
          />
          {errors.km_mensal && <p className="mt-1 text-xs text-destructive">{errors.km_mensal}</p>}
        </div>

        <div>
          <Label htmlFor="distancia_trabalho">Distância até o trabalho (km)</Label>
          <Input
            id="distancia_trabalho"
            inputMode="numeric"
            placeholder="Ex: 15"
            value={data.distancia_trabalho}
            onChange={(e) => set("distancia_trabalho", e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mt-1.5 h-11"
          />
          {errors.distancia_trabalho && (
            <p className="mt-1 text-xs text-destructive">{errors.distancia_trabalho}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button type="submit"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover">
          Continuar <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
