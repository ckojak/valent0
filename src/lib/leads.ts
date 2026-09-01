export type LeadPayload = {
  nome: string;
  telefone: string;
  email?: string | null;
  tipo_seguro: string;
  dados?: Record<string, unknown>;
};

/**
 * A persistência de leads foi desativada para não bloquear o fluxo da cotação Segfy.
 * Mantém a API compatível para o restante da aplicação sem disparar chamadas ao Supabase.
 */
export async function insertLead(_payload: LeadPayload): Promise<{ ok: boolean; error?: string }> {
  return { ok: true };
}
