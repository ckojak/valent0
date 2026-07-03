import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { insertLead } from "@/lib/leads";

const TIPOS = [
  { value: "auto", label: "Seguro Auto" },
  { value: "residencial", label: "Seguro Residencial" },
  { value: "empresarial", label: "Seguro Empresarial" },
  { value: "vida", label: "Seguro de Vida" },
  { value: "condominio", label: "Seguro Condomínio" },
];

function maskWhats(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function QuickQuote() {
  const [tipo, setTipo] = useState("");
  const [wa, setWa] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipo || wa.replace(/\D/g, "").length < 10) {
      toast.error("Selecione o tipo de seguro e informe seu WhatsApp.");
      return;
    }
    setLoading(true);
    try {
      await insertLead({
        nome: "Lead rápido — home",
        telefone: wa.replace(/\D/g, ""),
        tipo_seguro: tipo,
        dados: { fonte: "form_home_dark_bar" },
      });
      toast.success("Recebemos seu contato! Vamos te chamar no WhatsApp.");
      setTipo("");
      setWa("");
      if (tipo === "auto") navigate({ to: "/cotacao/auto" });
    } catch {
      toast.error("Não foi possível enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contato" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-navy p-6 text-navy-foreground shadow-2xl sm:p-10">
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
          <div>
            <h3 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              Cotação rápida e sem <span className="text-brand">compromisso</span>
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Responda em poucos passos e receba as melhores opções para suas necessidades.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="contents">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/70">
                Qual seguro você precisa?
              </label>
              <div className="relative">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white px-4 pr-10 text-sm font-medium text-foreground outline-none focus:border-brand"
                >
                  <option value="">Selecione o tipo de seguro</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/70">
                Seu WhatsApp
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={wa}
                onChange={(e) => setWa(maskWhats(e.target.value))}
                placeholder="(11) 99999-9999"
                className="h-12 w-full rounded-xl border border-white/10 bg-white px-4 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-brand"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold uppercase tracking-wide text-brand-foreground shadow-lg transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Receber cotação"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="mt-5 flex items-center gap-2 text-xs text-white/60">
          <Lock className="h-3.5 w-3.5" />
          Seus dados estão seguros. Não compartilhamos suas informações.
        </p>
      </div>
    </section>
  );
}
