import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { PromocoesManager } from "@/components/admin/PromocoesManager";
import { ConfigForm } from "@/components/admin/ConfigForm";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Painel — VALENT" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin", "isAdmin"],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userRes.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando painel...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-xl font-extrabold text-foreground">Acesso negado</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua conta está autenticada, mas não tem o papel <strong>admin</strong>.
            Peça a um administrador existente para adicionar seu usuário à tabela{" "}
            <code className="rounded bg-secondary px-1">user_roles</code>.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex h-10 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-sm font-extrabold text-foreground">VALENT Admin</h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Painel de gestão</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleSignOut().catch(() => toast.error("Erro ao sair."));
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium text-foreground hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="promocoes">Promoções</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="leads"><LeadsTable /></TabsContent>
          <TabsContent value="promocoes"><PromocoesManager /></TabsContent>
          <TabsContent value="config"><ConfigForm /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
