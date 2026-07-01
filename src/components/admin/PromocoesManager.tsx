import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type Promocao = {
  id: string;
  titulo: string;
  descricao: string | null;
  imagem_url: string | null;
  link: string | null;
  valido_ate: string | null;
  ativo: boolean;
  created_at: string;
};

type Draft = Omit<Promocao, "id" | "created_at">;

const emptyDraft: Draft = {
  titulo: "",
  descricao: "",
  imagem_url: "",
  link: "",
  valido_ate: null,
  ativo: true,
};

export function PromocoesManager() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const { data: promos, isLoading } = useQuery({
    queryKey: ["admin", "promocoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promocoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Promocao[];
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.titulo.trim()) return toast.error("Título obrigatório.");
    setSaving(true);
    const { error } = await supabase.from("promocoes").insert({
      titulo: draft.titulo,
      descricao: draft.descricao || null,
      imagem_url: draft.imagem_url || null,
      link: draft.link || null,
      valido_ate: draft.valido_ate,
      ativo: draft.ativo,
    });
    setSaving(false);
    if (error) return toast.error("Erro ao salvar.");
    toast.success("Promoção criada.");
    setDraft(emptyDraft);
    queryClient.invalidateQueries({ queryKey: ["admin", "promocoes"] });
    queryClient.invalidateQueries({ queryKey: ["promocoes-ativas"] });
  };

  const toggleAtivo = async (p: Promocao) => {
    const { error } = await supabase.from("promocoes").update({ ativo: !p.ativo }).eq("id", p.id);
    if (error) return toast.error("Erro ao alterar.");
    queryClient.invalidateQueries({ queryKey: ["admin", "promocoes"] });
    queryClient.invalidateQueries({ queryKey: ["promocoes-ativas"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta promoção?")) return;
    const { error } = await supabase.from("promocoes").delete().eq("id", id);
    if (error) return toast.error("Erro ao excluir.");
    toast.success("Excluída.");
    queryClient.invalidateQueries({ queryKey: ["admin", "promocoes"] });
    queryClient.invalidateQueries({ queryKey: ["promocoes-ativas"] });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <form onSubmit={create} className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="mb-3 font-display text-lg font-extrabold text-foreground">Nova promoção</h2>
        <div className="flex flex-col gap-3">
          <div>
            <Label>Título *</Label>
            <Input value={draft.titulo} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} className="mt-1.5 h-10" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={draft.descricao ?? ""} onChange={(e) => setDraft({ ...draft, descricao: e.target.value })} className="mt-1.5 min-h-[70px]" />
          </div>
          <div>
            <Label>URL da imagem</Label>
            <Input value={draft.imagem_url ?? ""} onChange={(e) => setDraft({ ...draft, imagem_url: e.target.value })} className="mt-1.5 h-10" placeholder="https://..." />
          </div>
          <div>
            <Label>Link (opcional)</Label>
            <Input value={draft.link ?? ""} onChange={(e) => setDraft({ ...draft, link: e.target.value })} className="mt-1.5 h-10" placeholder="https://..." />
          </div>
          <div>
            <Label>Válido até</Label>
            <Input type="date" value={draft.valido_ate ?? ""} onChange={(e) => setDraft({ ...draft, valido_ate: e.target.value || null })} className="mt-1.5 h-10" />
          </div>
          <label className="flex items-center justify-between rounded-lg border bg-secondary/40 px-3 py-2">
            <span className="text-sm font-medium">Ativa</span>
            <Switch checked={draft.ativo} onCheckedChange={(v) => setDraft({ ...draft, ativo: v })} />
          </label>
          <button type="submit" disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition hover:bg-cta-hover disabled:opacity-70">
            <Plus className="h-4 w-4" />
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="mb-3 font-display text-lg font-extrabold text-foreground">Promoções cadastradas</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && (promos?.length ?? 0) === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhuma promoção ainda.
          </div>
        )}
        <div className="flex flex-col gap-2">
          {(promos ?? []).map((p) => (
            <div key={p.id} className="flex gap-3 rounded-xl border bg-background p-3">
              {p.imagem_url && (
                <img src={p.imagem_url} alt={p.titulo} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold text-foreground">{p.titulo}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${p.ativo ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                    {p.ativo ? "ativa" : "inativa"}
                  </span>
                  {p.valido_ate && <span className="text-[11px] text-muted-foreground">até {new Date(p.valido_ate).toLocaleDateString("pt-BR")}</span>}
                </div>
                {p.descricao && <p className="mt-1 text-xs text-muted-foreground">{p.descricao}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button onClick={() => toggleAtivo(p)}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border bg-background px-2 text-[11px] font-medium hover:bg-accent">
                  <Save className="h-3 w-3" />
                  {p.ativo ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => remove(p.id)}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-destructive/30 bg-background px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
