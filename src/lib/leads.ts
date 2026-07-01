import { supabase } from "@/integrations/supabase/client";

export type LeadPayload = {
  nome: string;
  telefone: string;
  email?: string | null;
  tipo_seguro: string;
  dados?: Record<string, unknown>;
};

/**
 * Insere um lead na base. RLS permite insert público (anon).
 * Retorna { ok } para o UI decidir; nunca lança para não bloquear o fluxo do usuário.
 */
export async function insertLead(payload: LeadPayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("leads").insert({
      nome: payload.nome,
      telefone: payload.telefone,
      email: payload.email ?? null,
      tipo_seguro: payload.tipo_seguro,
      dados: (payload.dados ?? {}) as never,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "erro desconhecido" };
  }
}
