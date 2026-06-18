import { ChevronLeft, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhone, isValidEmail, isValidPhone } from "@/lib/masks";

export type ContactData = { name: string; email: string; phone: string };

export function StepContact({
  initial,
  onBack,
  onSubmit,
}: {
  initial: ContactData;
  onBack: () => void;
  onSubmit: (data: ContactData) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Informe seu nome.";
    if (!isValidEmail(email)) next.email = "E-mail inválido.";
    if (!isValidPhone(phone)) next.phone = "Telefone inválido.";
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit({ name: name.trim(), email, phone });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <User className="h-4 w-4" />
        <span>Etapa 2 de 2 · Seus dados</span>
      </div>

      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 h-12"
          placeholder="Como você se chama?"
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> E-mail
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-12"
          placeholder="voce@email.com"
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone" className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" /> WhatsApp
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          className="mt-1.5 h-12"
          placeholder="(11) 99999-9999"
          maxLength={16}
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="submit"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-cta text-base font-semibold text-cta-foreground shadow-sm transition hover:bg-cta-hover"
        >
          Cotar Agora
        </button>
      </div>
    </form>
  );
}
