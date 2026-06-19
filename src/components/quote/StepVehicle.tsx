import { Car, CheckCircle2, ChevronLeft, ChevronRight, Fuel, Sparkles } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPlaca, isValidPlaca } from "@/lib/masks";

export type VehicleData = { placa: string; zeroKm: boolean; gnv: boolean };

export function StepVehicle({
  initial,
  onBack,
  onNext,
}: {
  initial: VehicleData;
  onBack: () => void;
  onNext: (data: VehicleData) => void;
}) {
  const [placa, setPlaca] = useState(initial.placa);
  const [zeroKm, setZeroKm] = useState(initial.zeroKm);
  const [gnv, setGnv] = useState(initial.gnv);
  const [error, setError] = useState<string | null>(null);

  const fipeOk = !zeroKm && isValidPlaca(placa);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zeroKm && !isValidPlaca(placa)) {
      setError("Informe uma placa válida (ex: ABC-1D23).");
      return;
    }
    setError(null);
    onNext({ placa, zeroKm, gnv });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <Car className="h-4 w-4" />
        <span>Etapa 1 · Sobre o seu veículo</span>
      </div>

      <div>
        <Label htmlFor="placa" className="text-sm font-medium text-foreground">
          Placa do veículo
        </Label>
        <Input
          id="placa"
          inputMode="text"
          autoComplete="off"
          placeholder="ABC-1D23"
          value={placa}
          disabled={zeroKm}
          onChange={(e) => {
            setPlaca(formatPlaca(e.target.value));
            if (error) setError(null);
          }}
          className="mt-1.5 h-12 text-base uppercase tracking-wider"
          maxLength={8}
        />
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        {fipeOk && !error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-success animate-in fade-in slide-in-from-top-1 duration-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Veículo localizado na base FIPE ✓
          </p>
        )}
      </div>

      <label className="flex items-center justify-between rounded-xl border bg-secondary/40 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-brand" />
          É um carro Zero KM
        </span>
        <Switch
          checked={zeroKm}
          onCheckedChange={(v) => {
            setZeroKm(v);
            if (v) setError(null);
          }}
        />
      </label>

      <label className="flex items-center justify-between rounded-xl border bg-secondary/40 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Fuel className="h-4 w-4 text-brand" />
          Possui Kit Gás (GNV)?
        </span>
        <Switch checked={gnv} onCheckedChange={setGnv} />
      </label>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3"
        >
          <ChevronLeft className="h-4 w-4" />
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        🔒 Seus dados são protegidos e não compartilhados.
      </p>
    </form>
  );
}
