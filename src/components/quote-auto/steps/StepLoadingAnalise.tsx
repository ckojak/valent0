import { Loader2 } from "lucide-react";

export function StepLoadingAnalise() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="relative">
        <div className="absolute inset-0 -m-4 animate-ping rounded-full bg-brand/20" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-lg">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl font-extrabold text-foreground">
          Estamos analisando as melhores ofertas
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Nosso sistema está comparando seguradoras. Isso leva só alguns segundos.
        </p>
      </div>
    </div>
  );
}
