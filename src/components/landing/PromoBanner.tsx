import { useQuery } from "@tanstack/react-query";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Promo = {
  id: string;
  titulo: string;
  descricao: string | null;
  imagem_url: string | null;
  link: string | null;
};

export function PromoBanner() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data } = useQuery({
    queryKey: ["promocoes-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promocoes")
        .select("id, titulo, descricao, imagem_url, link")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) return [] as Promo[];
      return (data ?? []) as Promo[];
    },
    staleTime: 60 * 1000,
  });

  const visible = (data ?? []).filter((p) => !dismissed.has(p.id));
  if (visible.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 pb-4 sm:px-6">
      <div className="flex flex-col gap-2">
        {visible.map((p) => {
          const inner = (
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-brand-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-bold text-foreground">{p.titulo}</span>
                {p.descricao && <span className="block truncate text-xs text-muted-foreground">{p.descricao}</span>}
              </div>
            </div>
          );
          return (
            <div key={p.id} className="relative rounded-2xl border bg-brand-soft/60 p-3 pr-10 shadow-[var(--shadow-card)]">
              {p.link ? (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="block">
                  {inner}
                </a>
              ) : (
                inner
              )}
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setDismissed((s) => new Set(s).add(p.id))}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
