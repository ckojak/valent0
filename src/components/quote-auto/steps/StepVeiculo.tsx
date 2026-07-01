import { useMemo, useState } from "react";
import { Car, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MARCAS, MODELOS_POR_MARCA, VERSOES } from "@/lib/quote-auto-data";
import { formatPlaca } from "@/lib/masks";

export type VeiculoData = {
  marca: string;
  modelo: string;
  ano_fab: string;
  ano_mod: string;
  versao: string;
  placa: string;
};

const ANOS = Array.from({ length: 26 }, (_, i) => String(2026 - i));

export function StepVeiculo({
  initial,
  onBack,
  onNext,
}: {
  initial: VeiculoData;
  onBack: () => void;
  onNext: (v: VeiculoData) => void;
}) {
  const [data, setData] = useState<VeiculoData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof VeiculoData, string>>>({});

  const modelos = useMemo(
    () => (data.marca ? (MODELOS_POR_MARCA[data.marca] ?? []) : []),
    [data.marca],
  );

  const set = <K extends keyof VeiculoData>(k: K, v: VeiculoData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!data.marca) next.marca = "Selecione a marca.";
    if (!data.modelo) next.modelo = "Selecione o modelo.";
    if (!data.ano_fab) next.ano_fab = "Ano de fabricação.";
    if (!data.ano_mod) next.ano_mod = "Ano do modelo.";
    if (!data.versao) next.versao = "Selecione a versão.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <Car className="h-4 w-4" />
        Sobre o seu veículo
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Marca</Label>
          <Select value={data.marca} onValueChange={(v) => { set("marca", v); set("modelo", ""); }}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {MARCAS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.marca && <p className="mt-1 text-xs text-destructive">{errors.marca}</p>}
        </div>

        <div>
          <Label>Modelo</Label>
          <Select value={data.modelo} onValueChange={(v) => set("modelo", v)} disabled={!data.marca}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {modelos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.modelo && <p className="mt-1 text-xs text-destructive">{errors.modelo}</p>}
        </div>

        <div>
          <Label>Ano de fabricação</Label>
          <Select value={data.ano_fab} onValueChange={(v) => set("ano_fab", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.ano_fab && <p className="mt-1 text-xs text-destructive">{errors.ano_fab}</p>}
        </div>

        <div>
          <Label>Ano do modelo</Label>
          <Select value={data.ano_mod} onValueChange={(v) => set("ano_mod", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.ano_mod && <p className="mt-1 text-xs text-destructive">{errors.ano_mod}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label>Versão</Label>
          <Select value={data.versao} onValueChange={(v) => set("versao", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Ex: 1.0 Turbo Comfortline" /></SelectTrigger>
            <SelectContent>
              {VERSOES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.versao && <p className="mt-1 text-xs text-destructive">{errors.versao}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="placa">Placa <span className="text-xs font-normal text-muted-foreground">(opcional)</span></Label>
          {/* MOCK: campo visual pronto para futura integração com API paga
              (FIPE / consulta de placa de terceiros). Nenhum autopreenchimento aqui. */}
          <Input
            id="placa"
            placeholder="ABC-1D23"
            value={data.placa}
            onChange={(e) => set("placa", formatPlaca(e.target.value))}
            className="mt-1.5 h-11 uppercase tracking-wider"
            maxLength={8}
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Informar a placa acelera a cotação, mas não é obrigatório.
          </p>
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
