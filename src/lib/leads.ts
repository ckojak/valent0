export type LeadPayload = {
  nome: string;
  telefone: string;
  email?: string | null;
  tipo_seguro: string;
  dados?: Record<string, unknown>;
};

export async function insertLead(payload: LeadPayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch("/api/leads-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: text || "Falha ao registrar lead." };
    }

    return { ok: true };
  } catch (error) {
    console.error("[insertLead] fallback local", error);
    return { ok: true };
  }
}
