import { Car, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPlaca, isValidPlaca } from "@/lib/masks";

export type VehicleData = { placa: string; zeroKm: boolean };

export function StepVehicle({
  initial,
  onNext,
}: {
  initial: VehicleData;
  onNext: (data: VehicleData) => void;
}) {
  const [placa, setPlaca] = useState(initial.placa);
  const [zeroKm, setZeroKm] = useState(initial.zeroKm);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zeroKm && !isValidPlaca(placa)) {
      setError("Informe uma placa válida (ex: ABC-1D23).");
      return;
    }
    setError(null);
    onNext({ placa, zeroKm });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <Car className="h-4 w-4" />
        <span>Etapa 1 de 2 · Veículo</span>
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
      </div>

      <label className="flex items-center justify-between rounded-xl border bg-secondary/40 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-cta" />
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

      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cta text-base font-semibold text-cta-foreground shadow-sm transition hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2"
      >
        Continuar
        <ChevronRight className="h-4 w-4" />
      </button>

      <p className="text-center text-xs text-muted-foreground">
        🔒 Seus dados são protegidos e não compartilhados.
      </p>
    </form>
  );
}
