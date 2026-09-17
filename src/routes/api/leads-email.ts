import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/leads-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await request.json();
          const nome = String(payload?.nome ?? "Lead");
          const telefone = String(payload?.telefone ?? "");
          const email = String(payload?.email ?? "");
          const tipoSeguro = String(payload?.tipo_seguro ?? "");
          const dados = payload?.dados && typeof payload.dados === "object" ? payload.dados : {};

          const body = {
            to: "contato@valentseguros.com.br",
            subject: `Nova cotação - ${tipoSeguro}`,
            text: `Nova solicitação de cotação\n\nNome: ${nome}\nTelefone: ${telefone}\nE-mail: ${email || "Não informado"}\nTipo de seguro: ${tipoSeguro}\n\nDados: ${JSON.stringify(dados, null, 2)}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                <h2 style="margin-bottom: 12px; color: #111827;">Nova solicitação de cotação</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>Telefone:</strong> ${telefone}</p>
                <p><strong>E-mail:</strong> ${email || "Não informado"}</p>
                <p><strong>Tipo de seguro:</strong> ${tipoSeguro}</p>
                <pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(dados, null, 2)}</pre>
              </div>
            `,
          };

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ""}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Valent Seguros <no-reply@valentseguros.com.br>",
              ...body,
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
