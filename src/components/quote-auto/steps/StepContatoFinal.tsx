import { useState } from "react";
import { ChevronLeft, Mail, MessageCircle, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhone, isValidEmail, isValidPhone } from "@/lib/masks";

export type ContatoFinalData = { nome: string; telefone: string; email: string };

export function StepContatoFinal({
  initial,
  onBack,
  onSubmit,
}: {
  initial: ContatoFinalData | null;
  onBack: () => void;
  onSubmit: (v: ContatoFinalData) => void;
}) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [telefone, setTelefone] = useState(initial?.telefone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [errors, setErrors] = useState<{ nome?: string; telefone?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (nome.trim().length < 2) next.nome = "Informe seu nome.";
    if (!isValidPhone(telefone)) next.telefone = "WhatsApp inválido.";
    if (email && !isValidEmail(email)) next.email = "E-mail inválido.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    await onSubmit({ nome: nome.trim(), telefone, email: email.trim() });
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Falta só o seu contato
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nosso time chama você no WhatsApp pra fechar a apólice.
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="ct-nome" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Nome
          </Label>
          <Input id="ct-nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1.5 h-12" />
          {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome}</p>}
        </div>
        <div>
          <Label htmlFor="ct-tel" className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </Label>
          <Input id="ct-tel" type="tel" inputMode="tel" placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(formatPhone(e.target.value))}
            className="mt-1.5 h-12" maxLength={16} />
          {errors.telefone && <p className="mt-1 text-xs text-destructive">{errors.telefone}</p>}
        </div>
        <div>
          <Label htmlFor="ct-email" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> E-mail <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input id="ct-email" type="email" inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-12" />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onBack} disabled={submitting}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button type="submit" disabled={submitting}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover disabled:opacity-70">
          {submitting ? "Enviando..." : "Enviar e finalizar"}
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">🔒 Seus dados são protegidos.</p>
    </form>
  );
}
