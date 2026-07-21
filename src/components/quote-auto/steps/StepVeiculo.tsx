import { useEffect, useMemo, useState } from "react";
import { Car, ChevronLeft, ChevronRight, Info, KeyRound, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import { MARCAS } from "@/lib/quote-auto-data";
import { segfyDecodePlate, segfyListBrands, segfyListModels } from "@/lib/segfy/client";
import type { SegfyOption, VehicleKind } from "@/lib/segfy/types";
import { formatPlaca } from "@/lib/masks";

export type VeiculoData = {
  tipo: VehicleKind;
  marca: string;
  marca_id?: string;
  modelo: string;
  modelo_id?: string;
  ano_fab: string;
  ano_mod: string;
  versao: string;
  placa: string;
};

const ANOS = Array.from({ length: 26 }, (_, i) => String(2026 - i));

function pickString(payload: unknown, keys: string[]): string {
  if (!payload || typeof payload !== "object") return "";
  const source = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  const nested = source.data;
  if (nested && typeof nested === "object") {
    return pickString(nested, keys);
  }
  return "";
}

function pickFromArrayItem(payload: unknown, listKey: string, keys: string[]): string {
  if (!payload || typeof payload !== "object") return "";
  const source = payload as Record<string, unknown>;
  const list = source[listKey];
  if (Array.isArray(list) && list.length > 0 && list[0] && typeof list[0] === "object") {
    return pickString(list[0], keys);
  }
  const nested = source.data;
  if (nested && typeof nested === "object") {
    return pickFromArrayItem(nested, listKey, keys);
  }
  return "";
}

function pickModelFipeCode(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const source = payload as Record<string, unknown>;
  const models = source.models;
  if (Array.isArray(models) && models.length > 0 && models[0] && typeof models[0] === "object") {
    const firstModel = models[0] as Record<string, unknown>;
    const dataFipe = firstModel.data_fipe;
    if (dataFipe && typeof dataFipe === "object" && typeof (dataFipe as Record<string, unknown>).fipe_code === "string") {
      return String((dataFipe as Record<string, unknown>).fipe_code);
    }
  }
  const nested = source.data;
  if (nested && typeof nested === "object") {
    return pickModelFipeCode(nested);
  }
  return "";
}

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
  const [brandOptions, setBrandOptions] = useState<SegfyOption[]>([]);
  const [modelOptions, setModelOptions] = useState<SegfyOption[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [decodeLoading, setDecodeLoading] = useState(false);
  // Placa é o caminho principal. "manual" só aparece se a pessoa não tiver a placa em mãos.
  const [mode, setMode] = useState<"placa" | "manual">(initial.marca ? "manual" : "placa");

  const canLoadModels = Boolean(data.marca_id && data.ano_fab && data.ano_mod);

  const brandSearchOptions = useMemo<SearchableSelectOption[]>(
    () =>
      (brandOptions.length > 0 ? brandOptions : MARCAS.map((name) => ({ id: name, name }))).map((opt) => ({
        value: String(opt.id),
        label: String(opt.name),
      })),
    [brandOptions],
  );

  const modelSearchOptions = useMemo<SearchableSelectOption[]>(
    () =>
      modelOptions.map((opt) => ({
        value: String(opt.id),
        label: String(opt.name),
      })),
    [modelOptions],
  );

  useEffect(() => {
    let active = true;
    async function loadBrands() {
      setBrandsLoading(true);
      try {
        const res = await segfyListBrands({ vehicleType: data.tipo || "car" });
        if (!active) return;
        if (res.items.length > 0) {
          setBrandOptions(res.items);
        }
      } catch {
        if (!active) return;
        setBrandOptions(MARCAS.map((name) => ({ id: name, name })));
      } finally {
        if (active) setBrandsLoading(false);
      }
    }
    loadBrands();
    return () => {
      active = false;
    };
  }, [data.tipo]);

  useEffect(() => {
    if (!canLoadModels) {
      setModelOptions([]);
      return;
    }
    let active = true;
    async function loadModels() {
      setModelsLoading(true);
      try {
        const res = await segfyListModels({
          vehicleType: data.tipo || "car",
          brandId: data.marca_id || data.marca,
          brand: data.marca,
          model: data.modelo,
          year: data.ano_mod || undefined,
        });
        if (!active) return;
        if (res.items.length > 0) {
          setModelOptions(res.items);
          return;
        }
        setModelOptions([]);
      } catch {
        if (!active) return;
        setModelOptions([]);
      } finally {
        if (active) setModelsLoading(false);
      }
    }
    loadModels();
    return () => {
      active = false;
    };
  }, [canLoadModels, data.tipo, data.marca, data.marca_id, data.ano_mod]);

  const set = <K extends keyof VeiculoData>(k: K, v: VeiculoData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submitPlaca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.placa.replace(/[^A-Z0-9]/gi, "").length < 7) {
      setErrors({ placa: "Digite a placa completa." });
      return;
    }

    let nextData = data;
    setDecodeLoading(true);
    try {
      const decoded = await segfyDecodePlate(data.placa);
      const decodedPayload = decoded.payload;

      const marca =
        pickString(decodedPayload, ["brand_name", "brand", "marca"]) ||
        pickFromArrayItem(decodedPayload, "brands", ["value", "text", "name"]);
      const marcaId =
        pickString(decodedPayload, ["brand_id", "marca_id", "fipe_brand_id"]) ||
        pickFromArrayItem(decodedPayload, "brands", ["id", "brand_id", "value"]);
      const modelo =
        pickString(decodedPayload, ["model_name", "model", "modelo"]) ||
        pickFromArrayItem(decodedPayload, "models", ["value", "text", "name"]);
      const modeloId =
        pickString(decodedPayload, ["model_id", "modelo_id", "fipe_model_id"]) ||
        pickFromArrayItem(decodedPayload, "models", ["model_id", "id", "value"]);
      const tipo =
        pickString(decodedPayload, ["vehicle_type", "tipo"]) ||
        pickFromArrayItem(decodedPayload, "brands", ["vehicle_type"]);
      const anoFab = pickString(decodedPayload, ["manufacture_year", "ano_fabricacao", "year"]);
      const anoMod = pickString(decodedPayload, ["model_year", "ano_modelo", "year_model"]);
      const versao =
        pickModelFipeCode(decodedPayload) ||
        pickString(decodedPayload, ["version_name", "version", "versao"]);

      nextData = {
        ...data,
        tipo: (tipo as VehicleKind) || data.tipo,
        marca: marca || data.marca,
        marca_id: marcaId || data.marca_id,
        modelo: modelo || data.modelo,
        modelo_id: modeloId || data.modelo_id,
        ano_fab: anoFab || data.ano_fab,
        ano_mod: anoMod || data.ano_mod,
        versao: versao || data.versao,
      };
      setData((old) => ({
        ...old,
        ...nextData,
      }));

      toast.success("Dados do veículo encontrados pela placa.");
    } catch {
      toast.message("Não foi possível decodificar a placa agora", {
        description: "Você pode continuar preenchendo marca, modelo e versão manualmente.",
      });
    } finally {
      setDecodeLoading(false);
    }

    if (!nextData.marca || !nextData.marca_id || !nextData.modelo) {
      toast.error("Não foi possível completar marca/modelo pela placa.", {
        description: "Preencha manualmente para continuar a cotação sem erro no cálculo.",
      });
      setMode("manual");
      return;
    }

    onNext(nextData);
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!data.marca) next.marca = "Selecione a marca.";
    if (!data.ano_fab) next.ano_fab = "Ano de fabricação.";
    if (!data.ano_mod) next.ano_mod = "Ano do modelo.";
    if (!data.modelo) next.modelo = "Selecione o modelo.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext(data);
  };

  if (mode === "placa") {
    return (
      <form onSubmit={submitPlaca} className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm font-medium text-brand">
          <Car className="h-4 w-4" />
          Sobre o seu veículo
        </div>

        <div>
          <Label htmlFor="placa">Placa do veículo</Label>
          <div className="relative mt-1.5">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="placa"
              placeholder="ABC-1D23"
              value={data.placa}
              onChange={(e) => set("placa", formatPlaca(e.target.value))}
              className="h-12 pl-10 text-center text-lg uppercase tracking-[0.2em]"
              maxLength={8}
              autoFocus
            />
          </div>
          {errors.placa && <p className="mt-1 text-xs text-destructive">{errors.placa}</p>}
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Com a placa, buscamos os dados do seu veículo automaticamente.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>
          <button
            type="submit"
            disabled={decodeLoading}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover"
          >
            {decodeLoading ? "Buscando placa..." : "Continuar"} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMode("manual")}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-brand hover:underline"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Não tenho a placa em mãos — quero informar manualmente
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitManual} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <Car className="h-4 w-4" />
        Sobre o seu veículo
      </div>

      <button
        type="button"
        onClick={() => setMode("placa")}
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-brand hover:underline"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Prefiro informar a placa
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Marca</Label>
          <SearchableSelect
            value={data.marca_id || ""}
            options={brandSearchOptions}
            placeholder={brandsLoading ? "Carregando marcas..." : "Selecione a marca"}
            searchPlaceholder="Buscar marca"
            onChange={(selectedValue) => {
              const selected = brandSearchOptions.find((b) => b.value === selectedValue);
              if (!selected) return;
              set("marca", selected.label);
              set("marca_id", selected.value);
              set("ano_fab", "");
              set("ano_mod", "");
              set("modelo", "");
              set("modelo_id", "");
              set("versao", "");
            }}
            disabled={brandsLoading}
          />
          {errors.marca && <p className="mt-1 text-xs text-destructive">{errors.marca}</p>}
        </div>

        <div>
          <Label>Ano de fabricação</Label>
          <Select value={data.ano_fab} onValueChange={(v) => {
            set("ano_fab", v);
            set("modelo", "");
            set("modelo_id", "");
            set("versao", "");
          }}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.ano_fab && <p className="mt-1 text-xs text-destructive">{errors.ano_fab}</p>}
        </div>

        <div>
          <Label>Ano do modelo</Label>
          <Select value={data.ano_mod} onValueChange={(v) => {
            set("ano_mod", v);
            set("modelo", "");
            set("modelo_id", "");
            set("versao", "");
          }}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.ano_mod && <p className="mt-1 text-xs text-destructive">{errors.ano_mod}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label>Modelo</Label>
          <SearchableSelect
            value={data.modelo_id || ""}
            options={modelSearchOptions}
            placeholder={
              !data.marca_id
                ? "Selecione a marca primeiro"
                : !data.ano_fab || !data.ano_mod
                  ? "Selecione os anos para buscar modelos"
                  : modelsLoading
                    ? "Carregando modelos..."
                    : modelSearchOptions.length === 0
                      ? "Nenhum modelo encontrado para esse ano"
                      : "Selecione o modelo"
            }
            searchPlaceholder="Buscar modelo"
            emptyLabel="Nenhum modelo encontrado para a combinação informada."
            onChange={(selectedValue) => {
              const selectedOption = modelOptions.find((m) => String(m.id) === selectedValue);
              if (!selectedOption) return;
              const modelName = String(selectedOption.value ?? selectedOption.name ?? "");
              const fipeCode =
                selectedOption.data_fipe && typeof selectedOption.data_fipe === "object" && "fipe_code" in selectedOption.data_fipe
                  ? String((selectedOption.data_fipe as Record<string, unknown>).fipe_code ?? "")
                  : "";

              set("modelo", modelName);
              set("modelo_id", selectedValue);
              set("versao", fipeCode);
            }}
            disabled={!canLoadModels || modelsLoading || modelSearchOptions.length === 0}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            A lista considera a marca e o ano do modelo informados.
          </p>
          {errors.modelo && <p className="mt-1 text-xs text-destructive">{errors.modelo}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="placa-manual">Placa <span className="text-xs font-normal text-muted-foreground">(opcional)</span></Label>
          <Input
            id="placa-manual"
            placeholder="ABC-1D23"
            value={data.placa}
            onChange={(e) => set("placa", formatPlaca(e.target.value))}
            className="mt-1.5 h-11 uppercase tracking-wider"
            maxLength={8}
          />
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