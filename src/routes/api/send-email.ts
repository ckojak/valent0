import { createFileRoute } from "@tanstack/react-router";
import { buildInsuranceEmailHtml } from "@/lib/email-form";

function normalizePayload(payload: Record<string, unknown>) {
  const rawName = String(payload?.client_name ?? payload?.nome ?? "Lead");
  const rawEmail = String(payload?.client_email ?? payload?.email ?? "");
  const rawType = String(payload?.form_type ?? payload?.tipo_seguro ?? "generic");
  const rawTitle = String(payload?.form_title ?? payload?.title ?? "Cotação");
  const rawData = payload?.form_data && typeof payload.form_data === "object"
    ? payload.form_data
    : payload?.dados && typeof payload.dados === "object"
      ? payload.dados
      : {};

  return {
    clientName: rawName,
    clientEmail: rawEmail,
    formType: rawType,
    formTitle: rawTitle,
    formData: rawData as Record<string, string | number | boolean | null | undefined>,
  };
}

const resendApiKey = () => (globalThis as Record<string, unknown>).process && typeof (globalThis as Record<string, unknown>).process === "object"
  ? String(((globalThis as Record<string, unknown>).process as Record<string, unknown>).env?.RESEND_API_KEY ?? "")
  : "";

const TEST_RECIPIENT_EMAIL = "cjr.conde@gmail.com";
const TEST_FROM_EMAIL = "contato@valentseguros.com.br";

const getEnv = (keys: string[]) => {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };

  const env = globalWithProcess.process?.env ?? {};
  return keys.map((key) => env[key]).find((value) => Boolean(value)) ?? "";
};

const recipientEmail = () => getEnv(["EMAIL_TO", "RECIPIENT_EMAIL"]) || TEST_RECIPIENT_EMAIL;
const senderEmail = () => getEnv(["RESEND_FROM_EMAIL", "EMAIL_FROM"]) || TEST_FROM_EMAIL;

export const Route = createFileRoute("/api/send-email")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const payload = (await request.json()) as Record<string, unknown>;
          const { clientName, clientEmail, formType, formTitle, formData } = normalizePayload(payload);
          const submittedAt = new Date().toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          });

          const html = buildInsuranceEmailHtml({
            formTitle: String(formTitle || "Cotação"),
            formType: String(formType || "generic"),
            clientName: String(clientName || "Lead"),
            clientEmail: String(clientEmail || ""),
            submittedAt,
            formData,
            formLabels: {},
          });

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `Valent Seguros <${senderEmail()}>`,
              to: recipientEmail(),
              subject: `Nova cotação - ${String(formType || "Seguro")}`,
              text: `Nova solicitação de cotação\n\nNome: ${clientName}\nE-mail: ${clientEmail || "Não informado"}\nTipo de seguro: ${formType}\n\nDados: ${JSON.stringify(formData, null, 2)}`,
              html,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({ error: errText || "Erro ao enviar e-mail" }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro interno";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
