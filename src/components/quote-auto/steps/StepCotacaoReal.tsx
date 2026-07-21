import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

import {
  segfyCalculate,
  segfyListRenewalCompanies,
  segfySaveCustomer,
  segfyShowQuotation,
  segfyShowResults,
} from "@/lib/segfy/client";
import type { SegfyQuoteInput, SegfySocketMessage } from "@/lib/segfy/types";
import type { SegfyResult } from "@/lib/segfy/result-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const SOCKET_URL = import.meta.env.VITE_SEGFY_SOCKET_URL || "https://socket-io.segfy.com";

function normalizeMessage(message: unknown): SegfySocketMessage {
  if (!message || typeof message !== "object") {
    return { status: "STEP", message: String(message ?? "Evento recebido") };
  }

  const source = message as Record<string, unknown>;
  const action = typeof source.action === "string" ? source.action : undefined;
  const data = source.data && typeof source.data === "object" ? (source.data as Record<string, unknown>) : undefined;

  const companyRecord =
    data?.company && typeof data.company === "object" ? (data.company as Record<string, unknown>) : undefined;

  return {
    ...(source as SegfySocketMessage),
    status:
      typeof source.status === "string"
        ? source.status
        : action || "STEP",
    message:
      typeof source.message === "string"
        ? source.message
        : typeof data?.message === "string"
          ? data.message
          : "Evento recebido",
    company:
      typeof source.company === "string"
        ? source.company
        : typeof companyRecord?.name === "string"
          ? companyRecord.name
          : undefined,
    insurer:
      typeof source.insurer === "string"
        ? source.insurer
        : typeof companyRecord?.name === "string"
          ? companyRecord.name
          : undefined,
    percentage:
      typeof source.percentage === "number"
        ? source.percentage
        : typeof data?.percentage === "number"
          ? data.percentage
          : undefined,
    payload: data ?? source.payload,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function extractResults(payload: unknown): SegfyResult[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => extractResults(item));
  }
  if (typeof payload !== "object") return [];

  const source = asRecord(payload);
  if (source.company && typeof source.company === "object") {
    return [source as unknown as SegfyResult];
  }
  if (Array.isArray(source.results)) {
    return source.results.flatMap((item) => extractResults(item));
  }
  if (source.result && typeof source.result === "object") {
    return extractResults(source.result);
  }
  if (source.data) return extractResults(source.data);
  if (source.payload) return extractResults(source.payload);
  return [];
}

function extractQuotationId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const source = payload as Record<string, unknown>;
  const direct = source.quotation_id ?? source.quotationId ?? source.id ?? null;
  if (direct) return String(direct);
  if (source.data) return extractQuotationId(source.data);
  if (source.payload) return extractQuotationId(source.payload);
  return null;
}

function formatStatus(status?: string) {
  if (!status) return "EVENT";
  return String(status).toUpperCase();
}

function asNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = Number(value.replace(/[^\d.,-]/g, "").replace(".", "").replace(",", "."));
    return Number.isFinite(normalized) ? normalized : null;
  }
  return null;
}

function formatCurrency(value: unknown) {
  const parsed = asNumber(value);
  if (parsed == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsed);
}

function getResultPrice(result: SegfyResult) {
  return (
    asNumber(result.premium) ??
    asNumber(result.company_data?.vehicle_value) ??
    null
  );
}

function getResultFranchise(result: SegfyResult) {
  return asNumber(result.franchise);
}

function getCompanyName(result: SegfyResult) {
  return result.company?.full_name || result.company?.name || "Seguradora";
}

function getCompanyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SG";
}

function getStatusTone(status?: string) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "RESULT") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/20";
  if (normalized === "PDF") return "bg-sky-500/15 text-sky-700 border-sky-500/20";
  if (normalized === "STEP") return "bg-amber-500/15 text-amber-700 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
}

function getResultStatusLabel(result: SegfyResult) {
  const status = String(result.status || "").trim();
  if (!status) return "Em processamento";
  return status;
}

function getResultKey(result: SegfyResult, index: number) {
  return (
    result.result_id ||
    result.id ||
    [result.company?.name, result.company_reference, result.reference, result.product, String(index)].filter(Boolean).join("-")
  );
}

export function StepCotacaoReal({ input }: { input: SegfyQuoteInput }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<SegfySocketMessage[]>([]);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [resultCards, setResultCards] = useState<SegfyResult[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [noOffersYet, setNoOffersYet] = useState(false);

  const roomId = useMemo(() => input.callback, [input.callback]);

  const latestStep = useMemo(
    () => events.find((event) => formatStatus(event.status) === "STEP") ?? null,
    [events],
  );

  const progressValue = useMemo(() => {
    if (resultCards.length > 0) return 100;
    const fromStep = typeof latestStep?.percentage === "number" ? latestStep.percentage : null;
    if (polling && quotationId) return 82;
    if (quotationId) return Math.max(58, Math.min(74, (fromStep ?? 25) + 45));
    if (socketConnected && !loading) return Math.max(28, Math.min(46, (fromStep ?? 10) + 20));
    return loading ? 16 : 24;
  }, [latestStep?.percentage, resultCards.length, socketConnected, loading, polling, quotationId]);

  const headline = useMemo(() => {
    if (resultCards.length > 0) return "Encontramos opções para o seu perfil";
    if (noOffersYet) return "Ainda estamos aguardando retorno das seguradoras";
    if (latestStep?.message) return latestStep.message;
    if (polling) return "Estamos comparando as seguradoras";
    return "Buscando as melhores cotações para você";
  }, [latestStep?.message, resultCards.length, polling, noOffersYet]);

  const resultCount = resultCards.length;

  const mergeResults = (incoming: SegfyResult[]) => {
    if (incoming.length === 0) return;
    setResultCards((old) => {
      const merged = [...incoming, ...old];
      const unique = new Map<string, SegfyResult>();
      for (const [index, item] of merged.entries()) {
        const key = getResultKey(item, index);
        unique.set(key, item);
      }
      return Array.from(unique.values()).sort((a, b) => {
        const priceA = getResultPrice(a) ?? Number.MAX_SAFE_INTEGER;
        const priceB = getResultPrice(b) ?? Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      });
    });
  };

  useEffect(() => {
    let active = true;
    let socket: Socket | null = null;

    async function run() {
      setLoading(true);
      setError(null);
      setEvents([]);
      setNoOffersYet(false);

      try {
        socket = io(SOCKET_URL, {
          transports: ["websocket"],
          auth: { roomId },
        });

        socket.on("connect", () => {
          if (!active) return;
          setSocketConnected(true);
        });

        socket.on("disconnect", () => {
          if (!active) return;
          setSocketConnected(false);
        });

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout ao conectar websocket de cotação."));
          }, 10000);

          socket?.once("connect", () => {
            clearTimeout(timeout);
            resolve();
          });

          socket?.once("connect_error", () => {
            clearTimeout(timeout);
            reject(new Error("Falha ao conectar websocket de cotação."));
          });
        });

        if (!active) return;

        socket.on(roomId, (message: unknown) => {
          const normalized = normalizeMessage(message);
          console.info("[SegfySocket:event]", normalized);
          if (!active) return;
          setEvents((old) => [normalized, ...old].slice(0, 80));

          if (String(normalized.status || "").toUpperCase() === "RESULT") {
            mergeResults(extractResults(normalized));
          }

          const maybeQuotationId = extractQuotationId(normalized);
          if (maybeQuotationId) setQuotationId(maybeQuotationId);
        });

        if (input.situacao === "renovar") {
          const renewal = await segfyListRenewalCompanies();
          if (active) {
            setEvents((old) => [
              {
                status: "STEP",
                message: `Renovação: ${renewal.items.length} companhias disponíveis para reaproveitamento de apólice.`,
              },
              ...old,
            ]);
          }
        }

        await segfySaveCustomer(input).catch(() => {
          // save-customer é opcional para jornada de lead, não pode bloquear calculate.
          return null;
        });

        const calcRes = await segfyCalculate(input);
        if (!active) return;

        const maybeQuotationId = extractQuotationId(calcRes.payload);
        if (maybeQuotationId) setQuotationId(maybeQuotationId);
        toast.success("Cálculo enviado. Já estamos consultando as seguradoras.");
      } catch (e) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : "Não foi possível iniciar a cotação.";
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
      setSocketConnected(false);
      socket?.disconnect();
    };
  }, [input, roomId]);

  useEffect(() => {
    if (!quotationId || resultCards.length > 0) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      setPolling(true);
      try {
        const result = await segfyShowResults(quotationId);
        console.info("[SegfySocket:show-results]", result.payload);
        if (cancelled) return;
        const found = extractResults(result.payload);
        if (found.length > 0) {
          mergeResults(found);
          setEvents((old) => [
            {
              status: "RESULT",
              message: `Resultados consolidados consultados automaticamente (${found.length}).`,
              payload: result.payload,
            } as SegfySocketMessage,
            ...old,
          ]);
          return;
        }
      } catch {
        // fallback silencioso; o websocket continua sendo a fonte principal.
      } finally {
        if (!cancelled) setPolling(false);
      }

      if (attempts < 8 && !cancelled) {
        timeoutId = setTimeout(poll, 5000);
      } else if (!cancelled) {
        setNoOffersYet(true);
      }
    };

    timeoutId = setTimeout(poll, 6000);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [quotationId, resultCards.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <ShieldCheck className="h-4 w-4" />
        Cotação oficial em tempo real
      </div>

      <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,_rgba(18,101,92,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(245,248,247,0.98))] shadow-xl">
        <CardContent className="p-0">
          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/80">
                  Análise em andamento
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {headline}
                </h2>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
                {resultCount > 0 ? <CheckCircle2 className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {resultCount > 0
                ? "Estas sao as melhores opcoes encontradas ate agora para o perfil informado."
                : noOffersYet
                  ? "Seu pedido foi enviado com sucesso, mas ainda nao recebemos uma oferta final das seguradoras. A tela continua atualizando automaticamente."
                  : "Estamos comparando coberturas, assistencias e precos para trazer as melhores opcoes para voce."}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">Andamento da cotação</span>
                <span className="text-muted-foreground">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-2.5 bg-brand/10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {!error && resultCount === 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="border-dashed bg-background/80">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3.5 w-28 animate-pulse rounded-full bg-brand/10" />
                    <div className="mt-2 h-3 w-40 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2.5 animate-pulse rounded-full bg-muted" />
                  <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-muted" />
                  <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!error && noOffersYet && resultCount === 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-5 text-sm text-muted-foreground">
            A cotacao foi enviada corretamente, mas nenhuma seguradora retornou proposta final ate o momento. Se precisar validar tecnicamente, abra o console do navegador e veja os logs com prefixo [SegfySocket:].
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {resultCards.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {resultCards.map((result, index) => {
            const companyName = getCompanyName(result);
            const initials = getCompanyInitials(companyName);
            const price = getResultPrice(result);
            const franchise = getResultFranchise(result);

            return (
              <Card key={result.result_id || result.id || `${companyName}-${index}`} className="overflow-hidden border-border/70 shadow-md">
                <CardHeader className="border-b bg-muted/30 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-sm font-semibold text-brand-foreground shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="break-words text-lg leading-tight">{companyName}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{result.product || "Seguro auto"}</p>
                      </div>
                    </div>
                    <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {getResultStatusLabel(result)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-emerald-500/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        Prêmio estimado
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(price)}</p>
                    </div>
                    <div className="rounded-2xl bg-sky-500/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                        Franquia
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(franchise)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <div className="flex flex-col gap-1 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                      <span>Melhor parcela</span>
                      <span className="font-medium text-foreground">{result.best_installment || "Sob consulta"}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                      <span>Referência da companhia</span>
                      <span className="font-medium text-foreground">{result.company_reference || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                      <span>Tempo de processamento</span>
                      <span className="font-medium text-foreground">{result.time ? `${result.time}s` : "-"}</span>
                    </div>
                  </div>

                  {result.messages && (
                    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800">
                      {result.messages}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Link
        to="/"
        className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o início
      </Link>
    </div>
  );
}