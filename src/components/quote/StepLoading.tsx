import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Consultando seguradoras parceiras...",
  "Comparando preços e coberturas...",
  "Quase lá, montando suas ofertas...",
];

export function StepLoading() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-cta/30" />
        <div className="relative grid h-16 w-16 place-items-center rounded-full bg-cta/10 text-cta">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
      <div>
        <p className="font-display text-lg font-bold text-brand">Buscando as melhores ofertas</p>
        <p className="mt-1 min-h-[1.25rem] text-sm text-muted-foreground transition-opacity">
          {MESSAGES[i]}
        </p>
      </div>
    </div>
  );
}
