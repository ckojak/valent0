import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Circle, XCircle, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Lead = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  tipo_seguro: string;
  dados: Record<string, unknown>;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ["todos", "novo", "contatado", "ganho", "perdido"] as const;
const NEXT_STATUSES = ["novo", "contatado", "ganho", "perdido"];

export function LeadsTable() {
  const [filter, setFilter] = useState<(typeof STATUS_OPTIONS)[number]>("todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  const filtered = (leads ?? []).filter((l) => filter === "todos" || l.status === filter);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return toast.error("Erro ao atualizar status.");
    toast.success("Status atualizado.");
    queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground">Leads recebidos</h2>
          <p className="text-xs text-muted-foreground">Total: {leads?.length ?? 0}</p>
        </div>
        <div className="min-w-[160px]">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum lead encontrado.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((lead) => (
          <div key={lead.id} className="rounded-xl border bg-background p-3">
            <button
              type="button"
              onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold text-foreground">{lead.nome}</span>
                  <StatusBadge status={lead.status} />
                  <span className="rounded bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                    {lead.tipo_seguro}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{lead.telefone}</span>
                  {lead.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                  <span>{new Date(lead.created_at).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </button>
            {expanded === lead.id && (
              <div className="mt-3 border-t pt-3">
                <pre className="mb-3 max-h-48 overflow-auto rounded-lg bg-secondary/50 p-3 text-[11px]">
                  {JSON.stringify(lead.dados, null, 2)}
                </pre>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateStatus(lead.id, s)}
                      disabled={s === lead.status}
                      className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition ${
                        s === lead.status
                          ? "border-brand bg-brand text-brand-foreground"
                          : "bg-background text-foreground hover:bg-accent"
                      } disabled:cursor-default`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
    novo: { label: "novo", icon: Circle, cls: "bg-brand-soft text-brand" },
    contatado: { label: "contatado", icon: Circle, cls: "bg-blue-100 text-blue-700" },
    ganho: { label: "ganho", icon: CheckCircle2, cls: "bg-green-100 text-green-700" },
    perdido: { label: "perdido", icon: XCircle, cls: "bg-red-100 text-red-700" },
  };
  const cfg = map[status] ?? { label: status, icon: Circle, cls: "bg-secondary text-muted-foreground" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
