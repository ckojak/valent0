import type { SegfyOption, SegfyQuoteInput } from "./types";

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function segfyApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await parseJsonSafe(res);
  if (!res.ok) {
    const message =
      (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : null) ?? `Falha na API Segfy (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}

async function segfyPost<T>(path: string, body?: Record<string, unknown>) {
  return segfyApi<T>(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

function withData(data: Record<string, unknown>) {
  return { data };
}

export async function segfyListBrands(params: {
  vehicleType: "car" | "motorcycle" | "truck";
}) {
  return segfyPost<{ items: SegfyOption[] }>("/api/segfy/vehicle/brand-list", withData({
    vehicle_type: params.vehicleType,
  }));
}

export async function segfyListModels(params: {
  vehicleType: "car" | "motorcycle" | "truck";
  brandId: string;
  brand?: string;
  model?: string;
  year?: string;
}) {
  return segfyPost<{ items: SegfyOption[] }>("/api/segfy/vehicle/model-list", withData({
    vehicle_type: params.vehicleType,
    model_year: Number(params.year || 0),
    brand_id: params.brandId,
    brand: params.brand || "",
    model: params.model || "",
  }));
}

export async function segfyListProfessions() {
  return segfyPost<{ items: SegfyOption[] }>("/api/segfy/vehicle/profession-list", withData({}));
}

export async function segfyListRenewalCompanies() {
  return segfyPost<{ items: SegfyOption[] }>("/api/segfy/vehicle/renewal-list", withData({}));
}

export async function segfyListCompanies() {
  return segfyPost<{ items: SegfyOption[] }>("/api/segfy/vehicle/company-list", withData({}));
}

export async function segfyDecodePlate(plate: string) {
  return segfyPost<{ payload: unknown }>("/api/segfy/vehicle/decode-plate", withData({
    plate: plate.replace(/\W/g, ""),
  }));
}

export async function segfyLookupZipCode(zipCode: string) {
  return segfyPost<{ payload: unknown }>("/api/segfy/vehicle/zip-code", withData({
    zip_code: zipCode.replace(/\D/g, ""),
  }));
}

export async function segfyLookupInsured(cpf: string) {
  return segfyPost<{ payload: unknown }>("/api/segfy/vehicle/insured", withData({
    document: cpf.replace(/\D/g, ""),
  }));
}

export async function segfyCalculate(payload: SegfyQuoteInput) {
  return segfyApi<{ accepted: boolean; payload: unknown }>("/api/segfy/vehicle/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function segfySaveCustomer(payload: SegfyQuoteInput) {
  return segfyApi<{ saved: boolean; payload: unknown }>("/api/segfy/vehicle/save-customer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function segfyShowQuotation(identifier: string) {
  return segfyPost<{ payload: unknown }>("/api/segfy/vehicle/show-quotation", withData({
    id: identifier,
  }));
}

export async function segfyShowResults(identifier: string) {
  return segfyPost<{ payload: unknown }>("/api/segfy/vehicle/show-results", withData({
    id: identifier,
  }));
}
