import { createServerFn } from "@tanstack/react-start";

/**
 * Ponto único de integração com o gateway de pagamento da Segfy.
 *
 * Enquanto SEGFY_API_URL / SEGFY_API_KEY não estiverem configurados,
 * devolve { status: "nao_configurado" } e o front mostra o fallback
 * "falar com especialista". Quando as credenciais chegarem, basta
 * cadastrá-las e a chamada real abaixo passa a valer.
 */
export type CheckoutResult =
  | { status: "nao_configurado" }
  | { status: "ok"; checkoutUrl: string; ref: string }
  | { status: "erro"; mensagem: string };

export const criarCheckoutSegfy = createServerFn({ method: "POST" })
  .inputValidator((data: { protocolo: string; seguradora?: string; valor?: number }) => data)
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const apiUrl = process.env["SEGFY_API_URL"];
    const apiKey = process.env["SEGFY_API_KEY"];
    if (!apiUrl || !apiKey) return { status: "nao_configurado" };

    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          reference: data.protocolo,
          insurer: data.seguradora ?? null,
          amount: data.valor ?? null,
        }),
      });
      if (!res.ok) return { status: "erro", mensagem: "Não foi possível iniciar o pagamento." };
      const json = (await res.json()) as { checkout_url?: string; id?: string };
      if (!json.checkout_url) return { status: "erro", mensagem: "Resposta inválida do gateway." };
      return { status: "ok", checkoutUrl: json.checkout_url, ref: json.id ?? data.protocolo };
    } catch {
      return { status: "erro", mensagem: "Serviço de pagamento indisponível." };
    }
  });
