import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, Lock, CheckCircle2, type LucideIcon } from "lucide-react";
import { insertLead } from "@/lib/leads";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";
import { QUICK_QUESTIONS } from "@/lib/quote-quick-questions";
import type { CategorySlug } from "@/lib/category-configs";

function maskWhats(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function GenericQuoteDialog({
  open,
  onOpenChange,
  slug,
  eyebrow,
  icon: Icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: CategorySlug;
  eyebrow: string;
  icon: LucideIcon;
}) {
  const [nome, setNome] = useState("");
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const telefone = useContatoTelefone();

  const perguntas = QUICK_QUESTIONS[slug] ?? [];

  const waUrl = buildWhatsappUrl(
    telefone,
    `Olá! Pedi uma cotação de ${eyebrow.toLowerCase()} pelo site e gostaria de falar com um especialista.`,
  );

  function reset() {
    setNome("");
    setWa("");
    setEmail("");
    setMensagem("");
    setRespostas({});
    setDone(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || wa.replace(/\D/g, "").length < 10) return;
    setLoading(true);
    const res = await insertLead({
      nome: nome.trim(),
      telefone: wa.replace(/\D/g, ""),
      email: email.trim() || null,
      tipo_seguro: slug,
      dados: { fonte: "modal_categoria", respostas, mensagem: mensagem.trim() || null },
    });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-background p-0 shadow-2xl">
        <DialogTitle className="sr-only">Cotação de {eyebrow}</DialogTitle>
        <DialogDescription className="sr-only">
          Preencha seus dados para receber uma cotação de {eyebrow.toLowerCase()}.
        </DialogDescription>

        {done ? (
          <div className="flex flex-col items-center gap-3 bg-navy p-8 text-center text-navy-foreground">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-foreground">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h3 className="font-display text-xl font-extrabold">Recebemos seu pedido!</h3>
            <p className="text-sm text-white/70">
              Um especialista Valent vai te chamar no WhatsApp em instantes.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.576_0.1_182.4)] px-6 text-sm font-bold text-white transition hover:brightness-110"
            >
              Falar no WhatsApp agora
            </a>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-2 text-brand">
              <Icon className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">{eyebrow}</span>
            </div>
            <h3 className="mt-2 font-display text-lg font-extrabold text-foreground">
              Receba sua cotação
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Responda rapidinho que um especialista te chama no WhatsApp.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              {perguntas.map((q) => (
                <div key={q.key}>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">{q.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const selected = respostas[q.key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setRespostas((r) => ({ ...r, [q.key]: selected ? "" : opt }))
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            selected
                              ? "border-brand bg-brand text-brand-foreground"
                              : "border-border bg-background text-foreground hover:border-brand/50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 border-t pt-4">
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="h-12 rounded-xl border px-4 text-sm outline-none focus:border-brand"
                />
                <input
                  value={wa}
                  onChange={(e) => setWa(maskWhats(e.target.value))}
                  placeholder="(11) 99999-9999"
                  inputMode="numeric"
                  required
                  className="h-12 rounded-xl border px-4 text-sm outline-none focus:border-brand"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="E-mail (opcional)"
                  className="h-12 rounded-xl border px-4 text-sm outline-none focus:border-brand"
                />
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Conte rapidamente o que você precisa (opcional)"
                  rows={2}
                  className="resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Receber minha cotação"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Seus dados estão seguros.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}