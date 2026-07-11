import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquareText } from "lucide-react";

function maskWhats(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function StepWhatsapp({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (telefone: string) => void;
}) {
  const [wa, setWa] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wa.replace(/\D/g, "").length < 10) {
      setError("Digite um WhatsApp válido com DDD.");
      return;
    }
    onNext(wa.replace(/\D/g, ""));
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <MessageSquareText className="h-4 w-4" />
        Quase lá
      </div>
      <div>
        <h2 className="font-display text-lg font-extrabold text-foreground">
          Deixe seu WhatsApp
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          É só pra garantir que um especialista te ache caso você precise de ajuda durante a cotação.
        </p>
      </div>

      <input
        value={wa}
        onChange={(e) => { setWa(maskWhats(e.target.value)); setError(null); }}
        placeholder="(11) 99999-9999"
        inputMode="numeric"
        autoFocus
        className="h-12 rounded-xl border px-4 text-base outline-none focus:border-brand"
      />
      {error && <p className="-mt-3 text-xs text-destructive">{error}</p>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button type="submit"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover">
          Ver minha cotação real <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}