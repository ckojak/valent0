import { RefreshCw, Mail } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { QuoteCard } from "./QuoteCard";
import type { Quote } from "@/lib/quote-data";

export function StepResults({
  quotes,
  email,
  onReset,
}: {
  quotes: Quote[];
  email: string;
  onReset: () => void;
}) {
  useEffect(() => {
    toast.success("Cotação enviada para o seu e-mail!", {
      description: email ? `Uma cópia foi para ${email}` : undefined,
      icon: <Mail className="h-4 w-4" />,
    });
  }, [email]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-cta">
          Pronto!
        </p>
        <h2 className="font-display text-xl font-extrabold text-brand sm:text-2xl">
          Encontramos {quotes.length} ofertas para você
        </h2>
        <p className="text-sm text-muted-foreground">
          Compare os preços abaixo. Você pode contratar 100% online.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {quotes.map((q, i) => (
          <QuoteCard key={q.insurer.id} quote={q} best={i === 0} />
        ))}
      </div>

      <button
        onClick={onReset}
        className="mt-2 inline-flex items-center justify-center gap-2 self-center rounded-xl px-4 py-2 text-sm font-medium text-brand transition hover:bg-accent"
      >
        <RefreshCw className="h-4 w-4" /> Fazer nova cotação
      </button>
    </div>
  );
}
