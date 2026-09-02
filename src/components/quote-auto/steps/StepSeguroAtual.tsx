import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateBR, isValidDateBR } from "@/lib/masks";

export type SeguroAtualData = {
  seguradora_atual: string;
  numero_apolice_anterior: string;
  teve_sinistro: "" | "sim" | "nao";
  bonus_atual: string;
  bonus_futuro: string;
  vigencia_inicio: string;
  vigencia_fim: string;
};

export const emptySeguroAtual: SeguroAtualData = {
  seguradora_atual: "",
  numero_apolice_anterior: "",
  teve_sinistro: "",
  bonus_atual: "",
  bonus_futuro: "",
  vigencia_inicio: "",
  vigencia_fim: "",
};

const BONUS_CLASSES = Array.from({ length: 10 }, (_, i) => String(i));

const SEGURADORAS = [
  "Porto Seguro",
  "Azul Seguros",
  "Allianz",
  "Tokio Marine",
  "Bradesco Seguros",
  "Suhai Seguradora",
  "Liberty Seguros",
  "HDI Seguros",
  "Mapfre",
  "SulAmérica",
  "Itaú Seguros",
  "Outra",
];

export function StepSeguroAtual({
  initial,
  onBack,
  onNext,
}: {
  initial: SeguroAtualData;
  onBack: () => void;
  onNext: (v: SeguroAtualData) => void;
}) {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof SeguroAtualData, string>>>({});

  const set = <K extends keyof SeguroAtualData>(k: K, v: SeguroAtualData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!data.seguradora_atual.trim()) next.seguradora_atual = "Informe a seguradora.";
    if (!data.numero_apolice_anterior.trim()) next.numero_apolice_anterior = "Informe o número da apólice.";
    if (!data.teve_sinistro) next.teve_sinistro = "Selecione.";
    if (data.vigencia_inicio && !isValidDateBR(data.vigencia_inicio)) next.vigencia_inicio = "DD/MM/AAAA";
    if (data.vigencia_fim && !isValidDateBR(data.vigencia_fim)) next.vigencia_fim = "DD/MM/AAAA";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <FileText className="h-4 w-4" />
        Dados do seu seguro atual
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        Essas informações ajudam a aproveitar seu bônus na nova cotação.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Seguradora atual</Label>
          <Select value={data.seguradora_atual} onValueChange={(v) => set("seguradora_atual", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {SEGURADORAS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.seguradora_atual && <p className="mt-1 text-xs text-destructive">{errors.seguradora_atual}</p>}
        </div>

        <div>
          <Label htmlFor="apolice">Nº da apólice anterior</Label>
          <Input id="apolice" inputMode="numeric" placeholder="Ex: 1234567890"
            value={data.numero_apolice_anterior}
            onChange={(e) => set("numero_apolice_anterior", e.target.value)}
            className="mt-1.5 h-11" />
          {errors.numero_apolice_anterior && <p className="mt-1 text-xs text-destructive">{errors.numero_apolice_anterior}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label>Teve sinistro nos últimos 12 meses?</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {([["sim", "Sim"], ["nao", "Não"]] as const).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => set("teve_sinistro", v)}
                className={`h-11 rounded-xl border text-sm font-medium transition ${
                  data.teve_sinistro === v
                    ? "border-brand bg-brand-soft text-brand"
                    : "bg-background text-foreground hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.teve_sinistro && <p className="mt-1 text-xs text-destructive">{errors.teve_sinistro}</p>}
        </div>

        <div>
          <Label>Classe de bônus atual</Label>
          <Select value={data.bonus_atual} onValueChange={(v) => set("bonus_atual", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {BONUS_CLASSES.map((b) => <SelectItem key={b} value={b}>Classe {b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Bônus futuro/pretendido</Label>
          <Select value={data.bonus_futuro} onValueChange={(v) => set("bonus_futuro", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {BONUS_CLASSES.map((b) => <SelectItem key={b} value={b}>Classe {b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vigencia_inicio">Início da vigência atual</Label>
          <Input id="vigencia_inicio" inputMode="numeric" placeholder="DD/MM/AAAA"
            value={data.vigencia_inicio}
            onChange={(e) => set("vigencia_inicio", formatDateBR(e.target.value))}
            className="mt-1.5 h-11" maxLength={10} />
          {errors.vigencia_inicio && <p className="mt-1 text-xs text-destructive">{errors.vigencia_inicio}</p>}
        </div>

        <div>
          <Label htmlFor="vigencia_fim">Fim da vigência atual</Label>
          <Input id="vigencia_fim" inputMode="numeric" placeholder="DD/MM/AAAA"
            value={data.vigencia_fim}
            onChange={(e) => set("vigencia_fim", formatDateBR(e.target.value))}
            className="mt-1.5 h-11" maxLength={10} />
          {errors.vigencia_fim && <p className="mt-1 text-xs text-destructive">{errors.vigencia_fim}</p>}
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
