import { useState } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCEP,
  formatCPF,
  formatDateBR,
  isValidCEP,
  isValidCPF,
  isValidDateBR,
} from "@/lib/masks";
import { ESTADO_CIVIL, USO_VEICULO } from "@/lib/quote-auto-data";

export type CondutorData = {
  nome: string;
  nascimento: string;
  cpf: string;
  cep: string;
  estado_civil: string;
  uso: string;
};

export function StepCondutor({
  initial,
  onBack,
  onNext,
}: {
  initial: CondutorData;
  onBack: () => void;
  onNext: (v: CondutorData) => void;
}) {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof CondutorData, string>>>({});

  const set = <K extends keyof CondutorData>(k: K, v: CondutorData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (data.nome.trim().length < 2) next.nome = "Informe seu nome.";
    if (!isValidDateBR(data.nascimento)) next.nascimento = "DD/MM/AAAA";
    if (!isValidCPF(data.cpf)) next.cpf = "CPF incompleto.";
    if (!isValidCEP(data.cep)) next.cep = "CEP incompleto.";
    if (!data.estado_civil) next.estado_civil = "Selecione.";
    if (!data.uso) next.uso = "Selecione.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <User className="h-4 w-4" />
        Perfil do condutor principal
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" value={data.nome} onChange={(e) => set("nome", e.target.value)} className="mt-1.5 h-11" />
          {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome}</p>}
        </div>

        <div>
          <Label htmlFor="nascimento">Data de nascimento</Label>
          <Input id="nascimento" inputMode="numeric" placeholder="DD/MM/AAAA"
            value={data.nascimento}
            onChange={(e) => set("nascimento", formatDateBR(e.target.value))}
            className="mt-1.5 h-11" maxLength={10} />
          {errors.nascimento && <p className="mt-1 text-xs text-destructive">{errors.nascimento}</p>}
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" inputMode="numeric" placeholder="000.000.000-00"
            value={data.cpf}
            onChange={(e) => set("cpf", formatCPF(e.target.value))}
            className="mt-1.5 h-11" maxLength={14} />
          {errors.cpf && <p className="mt-1 text-xs text-destructive">{errors.cpf}</p>}
        </div>

        <div>
          <Label htmlFor="cep">CEP de pernoite</Label>
          <Input id="cep" inputMode="numeric" placeholder="00000-000"
            value={data.cep}
            onChange={(e) => set("cep", formatCEP(e.target.value))}
            className="mt-1.5 h-11" maxLength={9} />
          {errors.cep && <p className="mt-1 text-xs text-destructive">{errors.cep}</p>}
        </div>

        <div>
          <Label>Estado civil</Label>
          <Select value={data.estado_civil} onValueChange={(v) => set("estado_civil", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {ESTADO_CIVIL.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.estado_civil && <p className="mt-1 text-xs text-destructive">{errors.estado_civil}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label>Uso do veículo</Label>
          <Select value={data.uso} onValueChange={(v) => set("uso", v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {USO_VEICULO.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.uso && <p className="mt-1 text-xs text-destructive">{errors.uso}</p>}
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
