import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK = "5511999999999";

/**
 * Retorna o telefone de contato global (configurável no painel admin).
 * Fallback hardcoded se a consulta falhar ou a chave não existir.
 */
export function useContatoTelefone(): string {
  const { data } = useQuery({
    queryKey: ["config", "telefone_contato"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("valor")
        .eq("chave", "telefone_contato")
        .maybeSingle();
      if (error) return FALLBACK;
      return data?.valor ?? FALLBACK;
    },
    staleTime: 5 * 60 * 1000,
  });
  return data ?? FALLBACK;
}
