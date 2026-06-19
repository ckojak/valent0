import { Loader2 } from "lucide-react";

export function StepLoading() {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
        <div className="relative grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
      <div>
        <p className="font-display text-lg font-bold text-foreground">Quase lá!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultando seguradoras via API...
        </p>
      </div>
    </div>
  );
}
