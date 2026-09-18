import { useState } from "react";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { segfyLookupInsured, segfyLookupZipCode } from "@/lib/segfy/client";
import { formatCEP, formatCPF, formatDateBR, isValidCEP, isValidCPF, isValidDateBR, isValidEmail } from "@/lib/masks";

function pickString(payload: unknown, keys: string[]): string {
  if (!payload || typeof payload !== "object") return "";
  const source = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  const nested = source.data;
  if (nested && typeof nested === "object") return pickString(nested, keys);
  return "";
}

function normalizeBirthDate(value: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  return formatDateBR(value);
}

function isValidDocument(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 || digits.length === 14;
}

export type SeguradoData = {
  documento: string;
  cep: string;
  nome: string;
  nome_social?: string;
  nascimento: string;
  sexo?: "" | "male" | "female";
  email?: string;
  celular?: string;
};

export function StepSegurado({
  initial,
  onBack,
  onNext,
}: {
  initial: SeguradoData;
  onBack: () => void;
  onNext: (v: SeguradoData) => void;
}) {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof SeguradoData, string>>>({});
  const [addressPreview, setAddressPreview] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingInsured, setLoadingInsured] = useState(false);

  const set = <K extends keyof SeguradoData>(key: K, value: SeguradoData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof SeguradoData, string>> = {};

    if (!isValidDocument(data.documento)) next.documento = "Informe um CPF ou CNPJ válido.";
    if (!data.nome.trim()) next.nome = "Informe o nome do segurado.";
    if (!isValidDateBR(data.nascimento)) next.nascimento = "Informe a data de nascimento válida.";
    if (!isValidCEP(data.cep)) next.cep = "CEP incompleto.";
    if (!data.email || !isValidEmail(data.email)) next.email = "Informe um e-mail válido.";
    if (!data.sexo) next.sexo = "Selecione o sexo.";

    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

  const handleCepBlur = async () => {
    if (!isValidCEP(data.cep)) return;
    setLoadingCep(true);
    try {
      const res = await segfyLookupZipCode(data.cep);
      const city = pickString(res.payload, ["city", "cidade"]);
      const state = pickString(res.payload, ["state", "uf"]);
      const neighborhood = pickString(res.payload, ["district", "bairro"]);
      const parts = [neighborhood, city, state].filter(Boolean);
      setAddressPreview(parts.join(" - "));
    } catch {
      setAddressPreview("");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleDocumentBlur = async () => {
    if (!isValidDocument(data.documento)) return;
    setLoadingInsured(true);
    try {
      const res = await segfyLookupInsured(data.documento);
      const nome = pickString(res.payload, ["name", "nome", "insured_name"]);
      const nascimento = pickString(res.payload, ["birth_date", "nascimento", "insured_birth_date"]);
      setData((prev) => ({
        ...prev,
        nome: nome || prev.nome,
        nascimento: nascimento ? normalizeBirthDate(nascimento) : prev.nascimento,
      }));
    } catch {
      // segue manualmente quando a busca não encontra cadastro
    } finally {
      setLoadingInsured(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <UserRound className="h-4 w-4" />
        Dados do segurado
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="segurado-documento">CPF / CNPJ</Label>
          <Input
            id="segurado-documento"
            inputMode="numeric"
            value={data.documento}
            onChange={(e) => set("documento", formatCPF(e.target.value))}
            onBlur={handleDocumentBlur}
            className="mt-1.5 h-11"
            placeholder="000.000.000-00"
          />
          {errors.documento && <p className="mt-1 text-xs text-destructive">{errors.documento}</p>}
          {loadingInsured && <p className="mt-1 text-xs text-muted-foreground">Consultando dados do segurado...</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="segurado-nome">Nome completo / Razão social</Label>
          <Input
            id="segurado-nome"
            value={data.nome}
            onChange={(e) => set("nome", e.target.value)}
            className="mt-1.5 h-11"
          />
          {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="segurado-nome-social">Nome social</Label>
          <Input
            id="segurado-nome-social"
            value={data.nome_social || ""}
            onChange={(e) => set("nome_social", e.target.value)}
            className="mt-1.5 h-11"
            placeholder="Opcional"
          />
        </div>

        <div>
          <Label htmlFor="segurado-nascimento">Data de nascimento</Label>
          <Input
            id="segurado-nascimento"
            inputMode="numeric"
            value={data.nascimento}
            onChange={(e) => set("nascimento", formatDateBR(e.target.value))}
            className="mt-1.5 h-11"
            placeholder="DD/MM/AAAA"
          />
          {errors.nascimento && <p className="mt-1 text-xs text-destructive">{errors.nascimento}</p>}
        </div>

        <div>
          <Label>Sexo</Label>
          <Select value={data.sexo || ""} onValueChange={(value) => set("sexo", value as "male" | "female")}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Feminino</SelectItem>
              <SelectItem value="male">Masculino</SelectItem>
            </SelectContent>
          </Select>
          {errors.sexo && <p className="mt-1 text-xs text-destructive">{errors.sexo}</p>}
        </div>

        <div>
          <Label htmlFor="segurado-email">E-mail</Label>
          <Input
            id="segurado-email"
            type="email"
            value={data.email || ""}
            onChange={(e) => set("email", e.target.value)}
            className="mt-1.5 h-11"
            placeholder="voce@email.com"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="segurado-celular">Celular / WhatsApp</Label>
          <Input
            id="segurado-celular"
            inputMode="tel"
            value={data.celular || ""}
            onChange={(e) => set("celular", e.target.value)}
            className="mt-1.5 h-11"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <Label htmlFor="segurado-cep">CEP do pernoite</Label>
          <Input
            id="segurado-cep"
            inputMode="numeric"
            value={data.cep}
            onChange={(e) => set("cep", formatCEP(e.target.value))}
            onBlur={handleCepBlur}
            className="mt-1.5 h-11"
            placeholder="00000-000"
          />
          {errors.cep && <p className="mt-1 text-xs text-destructive">{errors.cep}</p>}
          {loadingCep && <p className="mt-1 text-xs text-muted-foreground">Consultando CEP...</p>}
          {!loadingCep && addressPreview && <p className="mt-1 text-xs text-muted-foreground">{addressPreview}</p>}
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
