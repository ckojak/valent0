import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const SOCKET_URL = import.meta.env.VITE_SEGFY_SOCKET_URL || "https://socket-io.segfy.com";

function unwrapSocketEnvelope(value: unknown): unknown {
  if (Array.isArray(value)) {
    for (let i = value.length - 1; i >= 0; i -= 1) {
      const item = value[i];
      if (item && typeof item === "object") return unwrapSocketEnvelope(item);
      if (typeof item === "string" && item.length > 0 && item !== "42") {
        continue;
      }
    }
    return value[value.length - 1];
  }
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    if (source.data && typeof source.data === "object") {
      return source.data;
    }
    if (source.payload && typeof source.payload === "object") {
      return source.payload;
    }
  }
  return value;
}

function normalizeMessage(message: unknown): SegfySocketMessage {
  const extracted = unwrapSocketEnvelope(message);
  if (!extracted || typeof extracted !== "object") {
    return { status: "STEP", message: String(message ?? "Evento recebido") };
  }

  const source = extracted as Record<string, unknown>;
  const action = typeof source.action === "string" ? source.action : undefined;
  const data = source.data && typeof source.data === "object" ? (source.data as Record<string, unknown>) : undefined;
  const payload = data ?? source.payload;

  const companyRecord =
    source.company && typeof source.company === "object"
      ? (source.company as Record<string, unknown>)
      : data?.company && typeof data.company === "object"
        ? (data.company as Record<string, unknown>)
        : undefined;

  return {
    ...(source as SegfySocketMessage),
    status:
      typeof source.status === "string"
        ? source.status
        : typeof source.action === "string"
          ? source.action
          : "STEP",
    message:
      typeof source.message === "string"
        ? source.message
        : typeof data?.message === "string"
          ? data.message
          : typeof source.message === "string"
            ? source.message
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
    payload,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function isRealQuotationResult(value: unknown): value is SegfyResult {
  if (!value || typeof value !== "object") return false;

  const source = asRecord(value);
  const company = source.company && typeof source.company === "object" ? asRecord(source.company) : null;
  const hasCompanyName = !!(company?.name || company?.full_name);
  const status = String(source.status ?? "").toLowerCase();

  const premiumValue = typeof source.premium === "number"
    ? source.premium
    : typeof source.premium === "string"
      ? Number(source.premium.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."))
      : null;

  const companyVehicleValue = source.company_data && typeof source.company_data === "object"
    ? (asRecord(source.company_data).vehicle_value ?? (source.company_data as Record<string, unknown>).value)
    : null;

  const hasPrice =
    (typeof premiumValue === "number" && Number.isFinite(premiumValue) && premiumValue > 0) ||
    (typeof companyVehicleValue === "number" && companyVehicleValue > 0) ||
    (typeof companyVehicleValue === "string" && Number(companyVehicleValue.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")) > 0);

  const hasProduct = typeof source.product === "string" && source.product.trim().length > 0;

  if (!hasCompanyName) return false;
  if (["exception", "error", "processing", "pending", "login_invalid"].includes(status)) return false;
  if (["ok", "additional_product"].includes(status)) return true;
  return hasPrice || (hasProduct && status !== "exception");
}

function extractResults(payload: unknown): SegfyResult[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => extractResults(item));
  }
  if (typeof payload !== "object") return [];

  const source = asRecord(payload);
  if (isRealQuotationResult(source)) {
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
  if (Array.isArray(source["0"])) return extractResults(source["0"]);
  return [];
}

function extractQuotationId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const source = payload as Record<string, unknown>;
  const direct =
    source.quotation_id ??
    source.quotationId ??
    source.quotation ??
    source.parent_id ??
    source.guid ??
    source.reference ??
    source.id ??
    null;

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

function getInsurerLogoUrl(name: string): string | null {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  const aliases: Record<string, string> = {
    liberty: "https://bundles.segfy.com/assets/liberty_nj.svg",
    aliro: "https://bundles.segfy.com/assets/aliro_nj.svg",
    hdi: "https://bundles.segfy.com/assets/hdi_nj.svg",
    porto: "https://bundles.segfy.com/assets/porto_nj.svg",
    azul: "https://bundles.segfy.com/assets/azul_nj.svg",
    itau: "https://bundles.segfy.com/assets/itau_nj.svg",
    mitsui: "https://bundles.segfy.com/assets/mitsui_nj.svg",
    bllu: "https://bundles.segfy.com/assets/bllu_nj.svg",
    suhai: "https://bundles.segfy.com/assets/suhai_nj.svg",
    pier: "https://bundles.segfy.com/assets/pier_nj.svg",
    tokio: "https://bundles.segfy.com/assets/tokio_nj.svg",
    allianz: "https://bundles.segfy.com/assets/allianz_nj.svg",
    bradesco: "https://bundles.segfy.com/assets/bradesco_nj.svg",
  };

  if (aliases[normalized]) return aliases[normalized];

  const matches = Object.entries(aliases).find(([key]) => normalized.includes(key));
  return matches?.[1] ?? null;
}

function sanitizeUiMessage(value: unknown): string {
  const text = stripHtml(value).replace(/\s+/g, " ").trim();
  if (!text) return "";

  const cleaned = text
    .replace(/\[SegfySocket:\]/gi, "")
    .replace(/(login\s+no\s+sistema|login\s+no\s+painel|credencial|senha|senha do sistema|credenciais do sistema)/gi, "")
    .replace(/(a\s+cotacao\s+foi\s+enviada\s+corretamente|a\s+cotação\s+foi\s+enviada\s+corretamente)/gi, "")
    .replace(/(se\s+precisar\s+validar\s+tecnicamente|abra\s+o\s+console\s+do\s+navegador|veja\s+os\s+logs\s+com\s+prefixo)/gi, "")
    .replace(/(\.|:|;|,)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Calculando...";
  if (/calculando|processando|aguardando|buscando/i.test(cleaned)) return "Calculando...";
  return cleaned;
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
  if (!status) return "";

  const normalized = status.toLowerCase();
  const isTechnicalStatus =
    normalized === "restriction" ||
    normalized === "failure" ||
    normalized === "pre_insurer_validation" ||
    normalized === "result" ||
    normalized.includes("pre_insurer_validation") ||
    normalized.includes("failure") ||
    normalized.includes("restriction") ||
    normalized.includes("error") ||
    normalized.includes("exception");

  if (isTechnicalStatus) return "";
  if (normalized === "login_invalid") return "Credencial pendente";
  if (normalized === "ok" || normalized === "additional_product") return "";

  return status;
}

function isLoginInvalid(result: SegfyResult) {
  return String(result.status || "").toLowerCase() === "login_invalid";
}

function getFipeCoveragePercent(result: SegfyResult): number | null {
  const raw = result.company_coverages?.fipe_percentage;
  if (raw == null || raw === "") return null;

  const text = String(raw).replace(/%/g, "").trim();
  const numeric = Number(text.replace(",", "."));
  if (Number.isFinite(numeric)) {
    return Math.min(Math.max(numeric, 0), 100);
  }

  const match = String(raw).match(/(\d{1,3})(?:[.,](\d+))?/);
  if (match) {
    const integer = Number(match[1] || 0);
    const decimals = match[2] ? Number(`0.${match[2]}`) : 0;
    return Math.min(Math.max(integer + decimals, 0), 100);
  }

  return null;
}

function formatCoverageValue(value: unknown) {
  if (value == null || value === "" || value === "undefined") return "Não contratado";

  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const text = String(value).trim();
  if (!text) return "Não contratado";

  const normalized = text.toLowerCase();
  if (normalized.includes("nao contratado") || normalized.includes("não contratado") || normalized.includes("no_cover") || normalized.includes("not_covered")) {
    return "Não contratado";
  }

  if (normalized.includes("assistencia") || normalized.includes("assistência") || normalized.includes("- 200 km") || normalized.includes("24h")) {
    return text.replace(/\s+/g, " ").trim();
  }

  const numeric = asNumber(text);
  if (numeric != null) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(numeric);
  }

  return text.replace(/\s+/g, " ").trim();
}

function getCoverageRows(result: SegfyResult) {
  const coverages = result.company_coverages ?? {};
  const rows: Array<{ key: string; label: string; value: unknown; pretty: string; ok: boolean }> = [];

  const coverageType = String(coverages.coverage_type ?? result.product ?? "").trim();
  if (coverageType) {
    rows.push({
      key: "coverage_type",
      label: "Cobertura",
      value: coverageType,
      pretty: coverageType,
      ok: true,
    });
  }

  const fipePercent = getFipeCoveragePercent(result);
  if (typeof fipePercent === "number") {
    rows.push({
      key: "fipe_percentage",
      label: "FIPE",
      value: fipePercent,
      pretty: `${Math.round(fipePercent)}% da FIPE`,
      ok: true,
    });
  }

  const material = coverages.material_damage;
  if (material != null && material !== "" && String(material).trim() !== "0") {
    rows.push({ key: "material_damage", label: "DM", value: material, pretty: formatCoverageValue(material), ok: true });
  }

  const bodyInjuries = coverages.body_injuries;
  if (bodyInjuries != null && bodyInjuries !== "" && String(bodyInjuries).trim() !== "0") {
    rows.push({ key: "body_injuries", label: "DC", value: bodyInjuries, pretty: formatCoverageValue(bodyInjuries), ok: true });
  }

  const moralDamage = coverages.moral_damage;
  if (moralDamage != null && moralDamage !== "" && String(moralDamage).trim() !== "0") {
    rows.push({ key: "moral_damage", label: "DMO", value: moralDamage, pretty: formatCoverageValue(moralDamage), ok: true });
  }

  const death = coverages.death;
  if (death != null && death !== "" && String(death).trim() !== "0") {
    rows.push({ key: "death", label: "APP Morte/Inválida", value: death, pretty: formatCoverageValue(death), ok: true });
  }

  const assistance = String(coverages.assistence ?? "").trim();
  if (assistance && !assistance.toLowerCase().includes("no_") && !assistance.toLowerCase().includes("não contratado") && !assistance.toLowerCase().includes("nao contratado")) {
    rows.push({ key: "assistence", label: "Assistência 24h", value: assistance, pretty: assistance.replace(/\s+/g, " ").trim(), ok: true });
  }

  return rows;
}

function getPdfUrl(result: SegfyResult): string | null {
  try {
    const seen = new Set<object>();

    const walk = (value: unknown): string | null => {
      if (!value) return null;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (/^https?:\/\//i.test(trimmed) && /\.pdf(?:\?.*)?$/i.test(trimmed)) return trimmed;
        return null;
      }

      if (typeof value !== "object") return null;
      const entry = value as Record<string, unknown>;
      if (seen.has(entry)) return null;
      seen.add(entry);

      for (const key of ["pdf", "url", "link", "download_url", "attachment", "payment_link"]) {
        if (typeof entry[key] === "string" && entry[key].trim().length > 0) {
          const candidate = String(entry[key]).trim();
          if (/^https?:\/\//i.test(candidate)) return candidate;
        }
      }

      for (const nested of Object.values(entry)) {
        const found = walk(nested);
        if (found) return found;
      }

      return null;
    };

    return walk(result);
  } catch {
    return null;
  }
}

function getInstallmentRows(result: SegfyResult) {
  const rows: Array<{ label: string; value: string; plan: string }> = [];

  const installmentsRecord = asRecord(result.installments);
  for (const [planName, rawPlan] of Object.entries(installmentsRecord)) {
    if (!rawPlan || typeof rawPlan !== "object") continue;
    const planValues = asRecord(rawPlan);
    const entries = Object.entries(planValues)
      .map(([label, rawValue]) => {
        const countMatch = String(label).match(/(\d+)/);
        const count = countMatch ? Number(countMatch[1]) : null;
        const value = asNumber(rawValue);
        if (count == null || value == null) return null;
        return {
          count,
          label: `${count}x de`,
          value: formatCurrency(value),
        };
      })
      .filter((entry): entry is { count: number; label: string; value: string } => !!entry)
      .sort((a, b) => a.count - b.count);

    if (entries.length > 0) {
      rows.push(...entries.map((entry) => ({
        label: entry.label,
        value: entry.value,
        plan: planName,
      })));
      return rows;
    }
  }

  const rawPlans = result.installments_budget ?? [];
  for (const item of rawPlans) {
    const planName = String(item?.name ?? "Pagamento");
    const counts = Array.isArray(item?.number_with_interests) ? item.number_with_interests : [];
    const values = Array.isArray(item?.values) ? item.values : [];

    for (let index = 0; index < counts.length; index += 1) {
      const count = Number(counts[index]);
      const value = asNumber(values[index]);
      if (!Number.isFinite(count)) continue;
      rows.push({
        label: `${count}x de`,
        value: value == null ? "Sob consulta" : formatCurrency(value),
        plan: planName,
      });
    }
    if (rows.length > 0) return rows;
  }

  if (result.best_installment) {
    const bestInstallment = String(result.best_installment).trim();
    const match = bestInstallment.match(/(\d+)\s*vez(?:es)?\s*de\s*([\d.,R$\s]+)/i);
    if (match) {
      rows.push({
        label: `${Number(match[1])}x de`,
        value: formatCurrency(match[2]),
        plan: "Pagamento",
      });
    }
  }

  return rows;
}

function getInstallmentSummary(result: SegfyResult) {
  const rows = getInstallmentRows(result);
  if (rows.length === 0) {
    return result.best_installment ? String(result.best_installment).trim() : "";
  }

  const first = rows[0];
  return `${first.label} ${first.value}${first.plan ? ` • ${first.plan}` : ""}`;
}

function hasMeaningfulResult(result: SegfyResult): boolean {
  const price = getResultPrice(result);
  const status = String(result.status || "").trim().toLowerCase();
  const product = normalizePlainText(result.product || "");
  const companyName = getCompanyName(result);

  if (status === "restriction") return false;
  if (status === "failure") return false;
  if (status === "pre_insurer_validation") return false;
  if (status === "ok") return true;
  if (status === "additional_product") return true;
  if (status === "login_invalid") return true;
  if (!companyName || companyName === "Seguradora") {
    return Boolean(product || price != null || status === "result");
  }
  return true;
}

function stripHtml(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>|<p>/gi, " ")
    .replace(/<li>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePlainText(value: unknown): string {
  const text = stripHtml(value);
  if (!text) return "";

  const cleaned = text
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*[,;]\s*/g, ", ")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s*\+\s*/g, " + ")
    .replace(/\s*\*\s*/g, " * ")
    .replace(/\b(cobertura|coberturas)\s+/gi, "")
    .replace(/\bnao\b|\bnão\b/gi, "não")
    .replace(/\bnao comercializada pela cia\b/gi, "")
    .replace(/\bnao comercializada\b/gi, "")
    .replace(/\bnao disponivel\b/gi, "")
    .replace(/\bnao disponivel pela cia\b/gi, "")
    .replace(/\badditional[_ -]?product\b/gi, "")
    .replace(/\brestriction\b/gi, "")
    .replace(/\bOK\b/gi, "")
    .replace(/\bok\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned === "" ? "" : cleaned;
}

function isCoverageNoise(value: string): boolean {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return (
    normalized === "ok" ||
    normalized === "restriction" ||
    normalized === "failure" ||
    normalized === "pre_insurer_validation" ||
    normalized === "additional_product" ||
    normalized.includes("restriction") ||
    normalized.includes("pre_insurer_validation") ||
    normalized.includes("additional_product") ||
    normalized.includes("failure") ||
    normalized.includes("nao comercializada") ||
    normalized.includes("não comercializada") ||
    normalized.includes("nao disponivel") ||
    normalized.includes("não disponível") ||
    normalized.includes("recurso adicional") ||
    normalized.includes("flag") ||
    normalized.includes("comercializada pela cia") ||
    normalized.includes("insurer") ||
    normalized.includes("para que possamos realizar a cotação") ||
    normalized.includes("atualize a sua extensão") ||
    normalized.includes("versão atual") ||
    normalized.includes("chrome://extensions") ||
    normalized.includes("edge://extensions") ||
    normalized.includes("remover do navegador") ||
    normalized.includes("usar no chrome") ||
    normalized.includes("agradecemos sua colaboração") ||
    normalized.includes("atualização do cliente") ||
    normalized.includes("não foi possível retornar a cotação para o perfil") ||
    normalized.includes("nao foi possivel retornar a cotacao para o perfil") ||
    normalized.includes("a seguradora informada na renovação é inválida") ||
    normalized.includes("a seguradora informada na renovacao e invalida") ||
    normalized.includes("seguradora informada na renovação") ||
    normalized.includes("seguradora informada na renovacao") ||
    normalized.includes("cotação para o perfil") ||
    normalized.includes("cotacao para o perfil")
  );
}

function humanizeCoverageLabel(label: string): string {
  const text = normalizePlainText(label);
  if (!text) return "";

  const cleaned = text
    .replace(/\b(terceiros|rcf)\b/gi, "RCF")
    .replace(/\b(assistencia|assistência)\b/gi, "Assistência")
    .replace(/\b(vidros|vidro)\b/gi, "Vidros")
    .replace(/\b(roubo|furto)\b/gi, "Roubo/Furto")
    .replace(/\b(incendio|incêndio)\b/gi, "Incêndio")
    .replace(/\b(automovel|veículo|veiculo)\b/gi, "Veículo")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 80 ? cleaned.slice(0, 80).trim() + "..." : cleaned;
}

function getCoverageHighlights(result: SegfyResult): string[] {
  const items = new Set<string>();

  const explicitLabels = [
    result.company_coverages?.assistence,
    result.company_coverages?.assistence_type,
    result.company_coverages?.glasses,
    result.company_coverages?.rental_car,
    result.company_coverages?.coverage_type,
    result.company_coverages?.franchise_type,
    result.product,
  ];

  explicitLabels.forEach((candidate) => {
    const text = normalizePlainText(candidate);
    if (!text || isCoverageNoise(text)) return;

    const parts = text
      .split(/[|/]/)
      .map((part) => humanizeCoverageLabel(part))
      .filter(Boolean)
      .filter((part) => !part.toLowerCase().includes("additional_product"))
      .filter((part) => !part.toLowerCase().includes("ok"))
      .filter((part) => !part.toLowerCase().includes("cotacao"))
      .filter((part) => !part.toLowerCase().includes("seguro"));

    parts.forEach((part) => items.add(part));
  });

  const fallback = [
    "Roubo/Furto",
    "Assistência 24h",
    "Carro reserva",
  ];

  fallback.forEach((item) => items.add(item));

  return Array.from(items).filter((item) => !isCoverageNoise(item)).slice(0, 3);
}

function getOfferSummary(result: SegfyResult): string {
  const productText = normalizePlainText(result.product);
  if (productText && !isCoverageNoise(productText)) {
    return humanizeCoverageLabel(productText);
  }

  const coverageHighlights = getCoverageHighlights(result);
  return coverageHighlights[0] || "Cobertura principal";
}

function getResultKey(result: SegfyResult, index: number) {
  const companyName = getCompanyName(result);
  const premium = getResultPrice(result) ?? 0;
  const franchise = getResultFranchise(result) ?? 0;
  const product = normalizePlainText(result.product || "") || "sem-produto";
  const reference = result.reference || result.company_reference || result.quotation || "sem-referencia";
  const id = result.result_id || result.id || "";

  const baseKey = [id, companyName, reference, product, String(premium), String(franchise)].filter(Boolean).join("|");
  return baseKey || `result-${index}`;
}

export function StepCotacaoReal({ input }: { input: SegfyQuoteInput }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<SegfySocketMessage[]>([]);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [resultCards, setResultCards] = useState<SegfyResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SegfyResult | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [noOffersYet, setNoOffersYet] = useState(false);
  const [extensionConfigured, setExtensionConfigured] = useState(true);

  // Guarda contra o double-invoke de efeitos do React 18 StrictMode em dev,
  // que disparava segfyCalculate duas vezes para o mesmo callback/reference
  // e deixava a cotação travada em "Iniciando cotação..." no backend da Segfy.
  const startedForRoomRef = useRef<string | null>(null);
  const quotationIdRef = useRef<string | null>(null);
  const resultCardsRef = useRef<SegfyResult[]>([]);
  const socketRoomsRef = useRef<Set<string>>(new Set());

  const roomId = useMemo(
    () => String(input.reference ?? input.callback ?? "").trim() || String(input.callback ?? "").trim(),
    [input.callback, input.reference],
  );

  useEffect(() => {
    resultCardsRef.current = resultCards;
  }, [resultCards]);

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
    if (noOffersYet) return "Calculando...";
    if (latestStep?.message) return sanitizeUiMessage(latestStep.message) || "Calculando...";
    if (polling) return "Calculando...";
    return "Calculando...";
  }, [latestStep?.message, resultCards.length, polling, noOffersYet]);

  const resultCount = resultCards.length;

  const mergeResults = (incoming: SegfyResult[]) => {
    if (incoming.length === 0) return;
    setResultCards((old) => {
      const merged = [...incoming, ...old].filter(hasMeaningfulResult);
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

  const bindSocketRoom = (socket: Socket, roomName: string | null) => {
    if (!roomName || socketRoomsRef.current.has(roomName)) return;

    socketRoomsRef.current.add(roomName);
    socket.on(roomName, (message: unknown) => {
      const normalized = normalizeMessage(message);
      console.info("[SegfySocket:event]", { room: roomName, normalized });

      const incomingResults = extractResults(
        normalized.result ?? normalized.results ?? normalized.payload,
      );
      if (incomingResults.length > 0) {
        mergeResults(incomingResults);
        setNoOffersYet(false);
      }

      const maybeQuotationId = extractQuotationId(normalized);
      if (maybeQuotationId) {
        setQuotationId(maybeQuotationId);
        quotationIdRef.current = maybeQuotationId;
      }

      setEvents((old) => [normalized, ...old].slice(0, 80));
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
      setExtensionConfigured(true);

      try {
        socket = io(SOCKET_URL, {
          transports: ["websocket"],
          upgrade: true,
          rememberUpgrade: true,
          reconnection: true,
          reconnectionAttempts: 20,
          reconnectionDelay: 1200,
          timeout: 20000,
          auth: { roomId },
        });

        socket.on("connect_error", (err) => {
          console.error("[SegfySocket:connect_error]", {
            message: err?.message,
            description: (err as Error & { description?: unknown })?.description,
            context: (err as Error & { context?: unknown })?.context,
          });
        });

        socket.on("reconnect_attempt", (attempt) => {
          console.info("[SegfySocket:reconnect_attempt]", { attempt, roomId });
        });

        socket.on("reconnect", (attempt) => {
          console.info("[SegfySocket:reconnect]", { attempt, roomId });
        });

        socket.on("connect", () => {
          if (!active) return;
          console.info("[SegfySocket:connect]", { roomId, socketId: socket?.id });
          setSocketConnected(true);
        });

        socket.on("disconnect", () => {
          if (!active) return;
          console.warn("[SegfySocket:disconnect]", { roomId });
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

        // Evita reenviar o cálculo caso este efeito seja remontado (StrictMode)
        // para a mesma sala: reutiliza a quotação já iniciada anteriormente.
        if (startedForRoomRef.current === roomId) {
          if (quotationIdRef.current) setQuotationId(quotationIdRef.current);
          return;
        }
        startedForRoomRef.current = roomId;

        bindSocketRoom(socket, roomId);

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

        await segfySaveCustomer(input).catch((err: unknown) => {
          // save-customer é opcional para jornada de lead, não pode bloquear calculate.
          const message = err instanceof Error ? err.message : String(err);
          console.error("[SegfySaveCustomer:error] (cotacao)", message);
          toast.warning(
            "Não conseguimos confirmar o registro no painel, mas sua cotação continua normalmente.",
          );
          return null;
        });

        const calcRes = await segfyCalculate(input);
        if (!active) return;

        const hasExplicitExtensionFlag =
          calcRes.meta && typeof calcRes.meta === "object" && "extensionConfigured" in calcRes.meta
            ? calcRes.meta.extensionConfigured === false
            : false;

        if (hasExplicitExtensionFlag) {
          setExtensionConfigured(false);
        } else {
          console.info("[SegfySocket:calculate] retorno recebido; extension_guid pode estar vazio e o websocket continuar ativo.", {
            extensionGuid: calcRes.config && typeof calcRes.config === "object"
              ? (calcRes.config as Record<string, unknown>).extension_guid ?? null
              : null,
          });
        }

        const normalizedCalcPayload =
          calcRes && typeof calcRes === "object" && "payload" in calcRes && calcRes.payload
            ? calcRes.payload
            : calcRes;
        const maybeQuotationId = extractQuotationId(normalizedCalcPayload);
        if (maybeQuotationId) {
          setQuotationId(maybeQuotationId);
          quotationIdRef.current = maybeQuotationId;
        }
        toast.success("Cálculo enviado. Já estamos consultando as seguradoras.");
      } catch (e) {
        if (!active) return;
        startedForRoomRef.current = null;
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
    if (!quotationId) return;

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
        console.info("cancelled", cancelled, "attempts", attempts, "quotationId", quotationId);
        if (cancelled) return;
        const found = extractResults(result.payload);
        console.info("found", found);
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
          setNoOffersYet(false);
        }
      } catch {
        console.warn("[SegfySocket:show-results] falha ao consultar resultados via API REST");
        // fallback silencioso; o websocket continua sendo a fonte principal.
      } finally {
        if (!cancelled) setPolling(false);
      }

      if (attempts >= 20 && !cancelled) {
        if (resultCardsRef.current.length === 0) {
          setNoOffersYet(true);
        }
        return;
      }

      if (!cancelled) {
        timeoutId = setTimeout(poll, 8000);
      }
    };

    timeoutId = setTimeout(poll, 6000);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [quotationId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <ShieldCheck className="h-4 w-4" />
        Cotação oficial em tempo real
      </div>

      <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,_rgba(18,101,92,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(245,248,247,0.98))] shadow-xl">
        <CardContent className="p-0">
          <div className="p-5 sm:p-6">
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
                  ? ""
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

      {!error && !noOffersYet && resultCount === 0 && !quotationId && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
            {extensionConfigured ? "Calculando..." : "Calculando..."}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {resultCards.length > 0 && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resultCards.map((result, index) => {
            const companyName = getCompanyName(result);
            const insurerName = String(result.company?.name || result.company?.full_name || companyName || "");
            const initials = getCompanyInitials(companyName);
            const logoUrl = getInsurerLogoUrl(companyName) || getInsurerLogoUrl(insurerName) || null;
            const price = getResultPrice(result);
            const franchise = getResultFranchise(result);
            const loginInvalid = isLoginInvalid(result);
            const summary = getOfferSummary(result);
            const highlights = getCoverageHighlights(result);
            const statusLabel = getResultStatusLabel(result);
            const fipeCoveragePercent = getFipeCoveragePercent(result);
            const installmentRows = getInstallmentRows(result);
            const coverageRows = getCoverageRows(result).map((row) => ({
              ...row,
              ok: row.key !== "death" || Number(String(row.value).replace(/\D/g, "")) > 0,
            }));
            const pdfUrl = getPdfUrl(result);

            const messageText = stripHtml(result.messages || "");
            const sanitizedMessage = normalizePlainText(messageText);
            const shouldDisplayMessage = sanitizedMessage && !isCoverageNoise(sanitizedMessage) && !sanitizedMessage.toLowerCase().includes("chrome://") && !sanitizedMessage.toLowerCase().includes("edge://");

            return (
              <Card
                key={result.result_id || result.id || `${companyName}-${index}`}
                className="flex h-full flex-col overflow-hidden border-0 bg-gradient-to-br from-white via-slate-50 to-brand/5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
              >
                <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-brand/9 via-white to-emerald-500/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-teal-600 text-sm font-bold text-white shadow-sm">
                        {logoUrl ? (
                          <>
                            <img
                              src={logoUrl}
                              alt={companyName}
                              className="h-full w-full object-contain bg-white p-1.5"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(event) => {
                                const target = event.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                                const fallback = target.parentElement?.querySelector("[data-fallback]") as HTMLElement | null;
                                if (fallback) fallback.style.display = "grid";
                              }}
                            />
                            <span
                              data-fallback
                              className="hidden h-full w-full place-items-center bg-gradient-to-br from-brand to-teal-600 text-xs font-bold text-white"
                            >
                              {initials}
                            </span>
                          </>
                        ) : (
                          <span className="grid h-full w-full place-items-center bg-gradient-to-br from-brand to-teal-600 text-xs font-bold text-white">
                            {initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="break-words text-lg font-black leading-tight tracking-tight text-slate-900">
                          {companyName}
                        </CardTitle>
                      </div>
                    </div>
                    {statusLabel && (
                      <span className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(result.status)}`}>
                        {statusLabel}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="flex items-end justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Prêmio anual</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tight text-brand">{formatCurrency(price)}</span>
                        <span className="text-xs font-medium text-slate-500">/ano</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-brand/20 bg-brand/10 px-3 py-2 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">Franquia</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(franchise)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Cobertura</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        {fipeCoveragePercent != null ? `${Math.round(fipeCoveragePercent)}% da FIPE` : summary || "Cobertura principal"}
                      </span>
                    </div>

                    {coverageRows.map((row) => (
                      <div key={row.key} className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2 first:border-t-0 first:pt-0">
                        <div className="flex items-center gap-2">
                          <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                            <Check className="h-3 w-3" />
                          </span>
                          <span className="text-sm font-medium text-slate-700">{row.label}</span>
                        </div>
                        <span className="text-right text-sm font-medium text-slate-800">
                          {row.pretty}
                        </span>
                      </div>
                    ))}
                  </div>

                  {highlights.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {highlights.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-brand/15 bg-brand/5 px-2.5 py-1 text-[11px] font-semibold text-brand"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                      Ver detalhes
                    </Button>
                    {pdfUrl && (
                      <Button variant="secondary" size="sm" asChild>
                        <a href={pdfUrl} target="_blank" rel="noreferrer">
                          PDF
                        </a>
                      </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto rounded-3xl border-0 bg-background p-0 shadow-2xl sm:rounded-3xl">
          {selectedResult && (() => {
            try {
              const modalPdfUrl = getPdfUrl(selectedResult);
              const modalMessageText = stripHtml(selectedResult.messages || "");
              const modalSanitizedMessage = normalizePlainText(modalMessageText);
              const modalLoginInvalid = isLoginInvalid(selectedResult);
              const modalShouldDisplayMessage =
                modalSanitizedMessage &&
                !isCoverageNoise(modalSanitizedMessage) &&
                !modalSanitizedMessage.toLowerCase().includes("chrome://") &&
                !modalSanitizedMessage.toLowerCase().includes("edge://");

              return (
                <>
                  <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-teal-600 text-sm font-bold text-white">
                          {getCompanyInitials(getCompanyName(selectedResult))}
                        </div>
                        <div>
                          <DialogTitle className="text-2xl font-bold text-slate-900">
                            {getCompanyName(selectedResult)}
                          </DialogTitle>
                          <DialogDescription className="mt-1 text-sm text-slate-500">
                            Detalhes da cotação
                          </DialogDescription>
                        </div>
                      </div>
                      {modalPdfUrl && (
                        <a
                          href={modalPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-brand/20 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/15"
                        >
                          Baixar PDF
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5 px-5 py-5 sm:px-6">
                    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">ID Cotação</p>
                        <p className="mt-2 text-base font-bold text-slate-900">{selectedResult.result_id || selectedResult.id || selectedResult.quotation || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Veículo</p>
                        <p className="mt-2 text-base font-bold text-slate-900">{selectedResult.insured_object?.vehicle || "Veículo"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Produto</p>
                        <p className="mt-2 text-base font-bold text-slate-900">{normalizePlainText(selectedResult.product) || "Produto"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Prêmio</p>
                        <p className="mt-2 text-base font-bold text-brand">{formatCurrency(getResultPrice(selectedResult))}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Coberturas</h3>
                      <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-2">
                        {getCoverageRows(selectedResult).map((row) => (
                          <div key={row.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2">
                            <span className="text-sm font-semibold text-slate-700">{row.label}</span>
                            <span className="text-sm font-bold text-slate-900">{row.pretty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Pagamentos</h3>
                      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {getInstallmentRows(selectedResult).map((entry, index) => (
                          <div key={`${entry.plan}-${entry.label}-${index}`} className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 last:border-b-0">
                            <span className="text-sm font-medium text-slate-600">{entry.label}</span>
                            <span className="text-sm font-bold text-slate-900">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {modalShouldDisplayMessage && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Mensagens da seguradora</h3>
                        <div className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-800">
                          {modalLoginInvalid ? "Esta seguradora exige login/senha configurados no painel da Segfy para retornar proposta. " : ""}
                          {modalSanitizedMessage}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            } catch (error) {
              console.error("[SegfyResultModal:error]", error);
              return (
                <div className="p-6 text-sm text-slate-600">
                  Não foi possível carregar os detalhes desta cotação. Tente novamente.
                </div>
              );
            }
          })()}
        </DialogContent>
      </Dialog>

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