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
import { USO_VEICULO } from "@/lib/quote-auto-data";

export type ResidenceGarageOption =
  | "yes_with_electronic_gate"
  | "yes_without_electronic_gate"
  | "no_garage"
  | "not_kept_in_garage";

export type AvaliacaoRiscoData = {
  garagem_residencia: "" | ResidenceGarageOption;
  garagem_trabalho: "" | "sim" | "nao";
  tipo_uso: string;
  km_mensal: string;
};

export const emptyAvaliacaoRisco: AvaliacaoRiscoData = {
  garagem_residencia: "",
  garagem_trabalho: "",
  tipo_uso: "",
  km_mensal: "",
};

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!data.garagem_residencia) next.garagem_residencia = "Selecione.";
    if (!data.garagem_trabalho) next.garagem_trabalho = "Selecione.";
    if (!data.tipo_uso) next.tipo_uso = "Selecione.";
    if (!data.km_mensal.trim() || Number(data.km_mensal) <= 0) next.km_mensal = "Informe a média mensal.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

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
        <div>
          <Label>Garagem na residência</Label>
          <Select
            value={data.garagem_residencia}
            onValueChange={(v) => set("garagem_residencia", v as ResidenceGarageOption)}
          >
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes_with_electronic_gate">Sim, com portão eletrônico</SelectItem>
              <SelectItem value="yes_without_electronic_gate">Sim, sem portão eletrônico</SelectItem>
              <SelectItem value="no_garage">Não possui</SelectItem>
              <SelectItem value="not_kept_in_garage">Não deixa em garagem</SelectItem>
            </SelectContent>
          </Select>
          {errors.garagem_residencia && <p className="mt-1 text-xs text-destructive">{errors.garagem_residencia}</p>}
        </div>

        <div>
          <Label>Garagem no trabalho</Label>
          <Select
            value={data.garagem_trabalho}
            onValueChange={(v) => set("garagem_trabalho", v as "sim" | "nao")}
          >
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
          {errors.garagem_trabalho && <p className="mt-1 text-xs text-destructive">{errors.garagem_trabalho}</p>}
        </div>

        <div>
          <Label>Tipo de uso</Label>
          <Select value={data.tipo_uso} onValueChange={(v) => set("tipo_uso", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {USO_VEICULO.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.tipo_uso && <p className="mt-1 text-xs text-destructive">{errors.tipo_uso}</p>}
        </div>

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
