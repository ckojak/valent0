import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { digitsOnly } from "@/lib/wa";

export function ConfigForm() {
  const queryClient = useQueryClient();
  const [telefone, setTelefone] = useState("");
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "config", "telefone_contato"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("valor")
        .eq("chave", "telefone_contato")
        .maybeSingle();
      if (error) throw error;
      return data?.valor ?? "";
    },
  });

  useEffect(() => { if (data !== undefined) setTelefone(data); }, [data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = digitsOnly(telefone);
    if (clean.length < 12) return toast.error("Use DDI+DDD+número, ex.: 5511999999999.");
    setSaving(true);
    const { error } = await supabase
      .from("configuracoes")
      .upsert({ chave: "telefone_contato", valor: clean, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error("Erro ao salvar.");
    toast.success("Telefone atualizado. Os botões do site já usam o novo número.");
    queryClient.invalidateQueries({ queryKey: ["config", "telefone_contato"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "config", "telefone_contato"] });
  };

  return (
    <form onSubmit={save} className="max-w-lg rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="mb-1 font-display text-lg font-extrabold text-foreground">Configurações do site</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Esses valores aparecem em todos os botões e CTAs de contato do site.
      </p>
      <div>
        <Label htmlFor="telefone">Telefone / WhatsApp (com DDI+DDD, só números)</Label>
        <Input id="telefone" value={telefone} onChange={(e) => setTelefone(digitsOnly(e.target.value))}
          className="mt-1.5 h-11" placeholder="5511999999999" maxLength={15} />
        <p className="mt-1.5 text-[11px] text-muted-foreground">Ex.: 5511987654321</p>
      </div>
      <button type="submit" disabled={saving}
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:bg-cta-hover disabled:opacity-70">
        <Save className="h-4 w-4" />
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
