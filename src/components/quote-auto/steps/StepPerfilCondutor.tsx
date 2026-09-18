import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, IdCard } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import { segfyListProfessions } from "@/lib/segfy/client";
import type { SegfyOption } from "@/lib/segfy/types";
import { ESTADO_CIVIL, USO_VEICULO } from "@/lib/quote-auto-data";

export type PerfilCondutorData = {
  relacao: string;
  estado_civil: string;
  profissao: string;
  profissao_id?: string;
  nome?: string;
  nome_social?: string;
  nascimento?: string;
  cpf?: string;
  cep?: string;
  email?: string;
  celular?: string;
  sexo?: "" | "male" | "female";
  uso?: string;
};

export function StepPerfilCondutor({
  initial,
  segurado,
  onBack,
  onNext,
}: {
  initial: PerfilCondutorData;
  segurado: { nome: string; nome_social?: string; nascimento: string; documento: string; cep: string; email?: string; celular?: string; sexo?: "" | "male" | "female" };
  onBack: () => void;
  onNext: (v: PerfilCondutorData) => void;
}) {
  const [data, setData] = useState<PerfilCondutorData>({
    ...initial,
    relacao: initial.relacao || "",
    estado_civil: initial.estado_civil || "",
    profissao: initial.profissao || "",
    profissao_id: initial.profissao_id || "",
    nome: initial.nome || segurado.nome || "",
    nome_social: initial.nome_social || segurado.nome_social || "",
    nascimento: initial.nascimento || segurado.nascimento || "",
    cpf: initial.cpf || segurado.documento || "",
    cep: initial.cep || segurado.cep || "",
    email: initial.email || segurado.email || "",
    celular: initial.celular || segurado.celular || "",
    sexo: initial.sexo || segurado.sexo || "",
    uso: initial.uso || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PerfilCondutorData, string>>>({});
  const [profissoes, setProfissoes] = useState<SegfyOption[]>([]);

  useEffect(() => {
    void segfyListProfessions().then((res) => setProfissoes(res.items)).catch(() => undefined);
  }, []);

  const profissaoOptions: SearchableSelectOption[] = profissoes.map((p) => ({
    value: String(p.id),
    label: String(p.name),
  }));

  const set = <K extends keyof PerfilCondutorData>(key: K, value: PerfilCondutorData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleRelacaoChange = (value: string) => {
    set("relacao", value);
    if (value === "Próprio") {
      set("nome", segurado.nome || "");
      set("nome_social", segurado.nome_social || "");
      set("nascimento", segurado.nascimento || "");
      set("cpf", segurado.documento || "");
      set("cep", segurado.cep || "");
      set("email", segurado.email || "");
      set("celular", segurado.celular || "");
      set("sexo", segurado.sexo || "");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof PerfilCondutorData, string>> = {};
    if (!data.relacao) next.relacao = "Selecione a relação.";
    if (!data.estado_civil) next.estado_civil = "Selecione o estado civil.";
    if (!data.profissao) next.profissao = "Selecione a profissão.";
    if (!data.uso) next.uso = "Selecione o uso do veículo.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <IdCard className="h-4 w-4" />
        Perfil do condutor
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Relação com o segurado</Label>
          <Select value={data.relacao} onValueChange={handleRelacaoChange}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Próprio">Próprio</SelectItem>
              <SelectItem value="Filho(a)">Filho(a)</SelectItem>
              <SelectItem value="Pai/Mãe">Pai/Mãe</SelectItem>
              <SelectItem value="Cônjuge">Cônjuge</SelectItem>
              <SelectItem value="Outro">Outros</SelectItem>
            </SelectContent>
          </Select>
          {errors.relacao && <p className="mt-1 text-xs text-destructive">{errors.relacao}</p>}
        </div>

        <div>
          <Label>Estado civil</Label>
          <Select value={data.estado_civil} onValueChange={(value) => set("estado_civil", value)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {ESTADO_CIVIL.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.estado_civil && <p className="mt-1 text-xs text-destructive">{errors.estado_civil}</p>}
        </div>

        <div>
          <Label>Profissão</Label>
          <SearchableSelect
            value={data.profissao_id || ""}
            options={profissaoOptions}
            placeholder="Selecione"
            searchPlaceholder="Buscar profissão"
            onChange={(selectedValue) => {
              const selected = profissaoOptions.find((p) => p.value === selectedValue);
              if (!selected) return;
              set("profissao", selected.label);
              set("profissao_id", selected.value);
            }}
          />
          {errors.profissao && <p className="mt-1 text-xs text-destructive">{errors.profissao}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label>Uso do veículo</Label>
          <Select value={data.uso || ""} onValueChange={(value) => set("uso", value)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {USO_VEICULO.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.uso && <p className="mt-1 text-xs text-destructive">{errors.uso}</p>}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onBack} className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button type="submit" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover">
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
