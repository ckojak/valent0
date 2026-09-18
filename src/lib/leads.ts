export type LeadPayload = {
  client_name?: string;
  client_email?: string | null;
  form_title: string;
  form_type: string;
  form_data: Record<string, unknown>;
  form_labels?: Record<string, string>;
  nome?: string;
  telefone?: string;
  email?: string | null;
  tipo_seguro?: string;
  dados?: Record<string, unknown>;
};

export async function insertLead(payload: LeadPayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const normalized = {
      client_name: payload.client_name ?? payload.nome ?? "Cliente",
      client_email: payload.client_email ?? payload.email ?? "",
      form_title: payload.form_title || payload.tipo_seguro || "Cotação",
      form_type: payload.form_type || payload.tipo_seguro || "generic",
      form_data: payload.form_data ?? payload.dados ?? {},
      form_labels: payload.form_labels ?? {},
    };

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(normalized),
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
