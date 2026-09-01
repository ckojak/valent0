import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Retorno de pagamento da Segfy.
 * Assinatura HMAC-SHA256 do corpo cru no header x-segfy-signature.
 */
export const Route = createFileRoute("/api/public/segfy-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["SEGFY_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const body = await request.text();
        const signature = request.headers.get("x-segfy-signature") ?? "";
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: { reference?: string; status?: string; id?: string };
        try {
          payload = JSON.parse(body) as typeof payload;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (!payload.reference) return new Response("Missing reference", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("leads")
          .update({
            pagamento_status: payload.status ?? "pago",
            pagamento_ref: payload.id ?? null,
          })
          .eq("protocolo", payload.reference);
        if (error) return new Response("Update failed", { status: 500 });

        return new Response("ok");
      },
    },
  },
});
