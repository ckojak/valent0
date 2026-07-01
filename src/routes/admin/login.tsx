import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Lock, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/admin/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Painel Administrativo — VALENT" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/admin/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Se já estiver logado, manda direto pro admin.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: search.redirect || "/admin", replace: true });
    });
  }, [navigate, search.redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Credenciais inválidas.", { description: error.message });
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: search.redirect || "/admin", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-soft px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand text-brand-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-foreground">Painel VALENT</h1>
          <p className="mt-1 text-xs text-muted-foreground">Acesso restrito à equipe.</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> E-mail
            </Label>
            <Input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Senha
            </Label>
            <Input id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-brand-foreground shadow-sm transition hover:bg-cta-hover disabled:opacity-70">
            <LogIn className="h-4 w-4" />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
          Sem cadastro público. Novos administradores são criados manualmente<br />no painel Lovable Cloud (More → Cloud → Users) e devem receber o papel <code className="rounded bg-secondary px-1">admin</code> na tabela <code className="rounded bg-secondary px-1">user_roles</code>.
        </p>
      </div>
    </div>
  );
}
