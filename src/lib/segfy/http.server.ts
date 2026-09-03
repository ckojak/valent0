import type { SegfyQuoteInput } from "./types";

declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  from(input: string, encoding: string): { toString(encoding: string): string };
};

type JsonRecord = Record<string, unknown>;

const DEFAULT_API_BASE = "https://api.automation.segfy.com";

let tokenCache: { token: string; expiresAt: number } | null = null;

class SegfyHttpError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function getSegfyConfig() {
  const clientId = process.env.SEGFY_CLIENT_ID?.trim();
  const secretId = process.env.SEGFY_SECRET_ID?.trim();
  const apiBase = (process.env.SEGFY_API_BASE_URL?.trim() || DEFAULT_API_BASE).replace(/\/$/, "");

  if (!clientId || !secretId) {
    throw new SegfyHttpError(
      "Credenciais Segfy ausentes no servidor. Configure SEGFY_CLIENT_ID e SEGFY_SECRET_ID.",
      500,
    );
  }
  return { clientId, secretId, apiBase };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as JsonRecord).messages;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && message.length > 0) return String(message[0]);
  return fallback;
}

function normalizeList(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
  if (!payload || typeof payload !== "object") return [];

  const root = payload as JsonRecord;
  const namedCollections = ["models", "brands", "companies", "professions", "renewal", "results"] as const;
  if (Array.isArray(root.data)) return root.data as Array<Record<string, unknown>>;
  if (Array.isArray(root.items)) return root.items as Array<Record<string, unknown>>;
  for (const key of namedCollections) {
    if (Array.isArray(root[key])) return root[key] as Array<Record<string, unknown>>;
  }
  if (root.data && typeof root.data === "object") {
    const nested = root.data as JsonRecord;
    if (Array.isArray(nested.items)) return nested.items as Array<Record<string, unknown>>;
    if (Array.isArray(nested.data)) return nested.data as Array<Record<string, unknown>>;
    for (const key of namedCollections) {
      if (Array.isArray(nested[key])) return nested[key] as Array<Record<string, unknown>>;
    }
  }
  return [];
}

function mapOption(item: Record<string, unknown>, index: number) {
  const dataFipe = item.data_fipe && typeof item.data_fipe === "object"
    ? (item.data_fipe as JsonRecord)
    : null;
  const idRaw =
    item.id ?? item.model_id ?? item.brand_id ?? item.code ?? item.fipe_id ?? item.value ?? `${index}`;
  const nameRaw =
    item.text ?? item.value ?? item.name ?? item.label ?? item.description ?? item.brand_name ?? item.model_name ?? String(idRaw);
  const codeRaw = item.code ?? item.fipe_code ?? dataFipe?.fipe_code ?? null;

  return {
    id: String(idRaw),
    name: String(nameRaw),
    code: codeRaw == null ? null : String(codeRaw),
    ...item,
  };
}

async function getBearerToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now() + 5000) {
    return tokenCache.token;
  }

  const { clientId, secretId, apiBase } = getSegfyConfig();
  const credentials = `${clientId}:${secretId}`;
  const basic =
    typeof btoa === "function"
      ? btoa(credentials)
      : Buffer.from(credentials, "utf-8").toString("base64");

  const res = await fetch(`${apiBase}/auths/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
    },
  });

  const payload = await parseJsonSafe(res);
  if (!res.ok) {
    throw new SegfyHttpError(resolveErrorMessage(payload, "Falha ao autenticar na Segfy."), res.status, payload);
  }

  const token =
    payload && typeof payload === "object" && "token" in payload ? String((payload as JsonRecord).token) : "";
  const expiresIn =
    payload && typeof payload === "object" && "expires_in" in payload
      ? Number((payload as JsonRecord).expires_in)
      : 3600;

  if (!token) {
    throw new SegfyHttpError("Resposta de autenticação Segfy sem token.", 500, payload);
  }

  tokenCache = {
    token,
    expiresAt: Date.now() + Math.max(30, expiresIn - 30) * 1000,
  };

  return token;
}

async function segfyRequest(path: string, init?: RequestInit, retryOn401 = true) {
  const { apiBase } = getSegfyConfig();
  const token = await getBearerToken();
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401 && retryOn401) {
    await getBearerToken(true);
    return segfyRequest(path, init, false);
  }

  const payload = await parseJsonSafe(res);
  if (!res.ok) {
    throw new SegfyHttpError(resolveErrorMessage(payload, `Falha Segfy em ${path}.`), res.status, payload);
  }

  return payload;
}

function mapMaritalStatus(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("casad") || normalized.includes("uni")) return "married";
  if (normalized.includes("divor")) return "divorced";
  if (normalized.includes("viuv")) return "widower";
  return "single";
}

function mapUtilizationType(value: string) {
  if (value === "Motorista de aplicativo") return "both";
  if (value === "Uso comercial (entregas)") return "job";
  if (value === "Trabalho / trajeto diário") return "job";
  return "personal";
}

// Relação do condutor principal com o segurado.
// Se a Segfy recusar algum destes valores, ajustamos o mapeamento.
function mapRelationship(value?: string) {
  switch (value) {
    case "Cônjuge":
      return "spouse";
    case "Filho(a)":
      return "child";
    case "Pai/Mãe":
      return "parent";
    case "Outro":
      return "other";
    default:
      return "himself";
  }
}


function normalizeInsurerEntry(item: unknown): { name: string; commission: number } | null {
  if (!item || typeof item !== "object") return null;

  const source = item as Record<string, unknown>;
  const nestedCompany = source.company && typeof source.company === "object"
    ? (source.company as Record<string, unknown>)
    : null;

  const rawName = nestedCompany?.name ?? source.name ?? source.id ?? source.slug ?? source.code ?? "";
  const rawCommission = nestedCompany?.commission ?? source.commission ?? 20;
  const name = String(rawName).trim().toLowerCase();

  if (!name) return null;

  return {
    name,
    commission: Number(rawCommission) || 20,
  };
}

async function resolveInsurers(input: SegfyQuoteInput): Promise<Array<{ name: string; commission: number }>> {
  if (input.insurers && input.insurers.length > 0) {
    return input.insurers
      .map(normalizeInsurerEntry)
      .filter((entry): entry is { name: string; commission: number } => Boolean(entry));
  }

  try {
    const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/company-list", {
      data: { vehicle_type: input.veiculo.tipo },
    });
    const items = normalizeList(payload).map(mapOption);
    if (items.length > 0) {
      return items.slice(0, 10).map((it) => {
        const raw = it as unknown as JsonRecord;
        const company = raw["company"];
        const companyName = String(
          (company && typeof company === "object" ? (company as JsonRecord).name : null)
          ?? raw["name"]
          ?? raw["id"]
          ?? raw["slug"]
          ?? raw["code"]
          ?? "ace",
        ).trim().toLowerCase();


        return {
          name: companyName || "ace",
          commission: 20,
        };
      });
    }
    console.warn("[SegfyProxy] company-list retornou vazio para", input.veiculo.tipo);
  } catch (err) {
    console.error(
      "[SegfyProxy] falha ao consultar company-list; seguindo sem insurers explícitos:",
      err instanceof Error ? err.message : err,
    );
  }

  if (input.situacao === "renovar") {
    try {
      const renewalPayload = await callVehicleEndpoint("/api/vehicle/version/1.0/renewal-list", {
        data: {},
      });
      const renewalItems = normalizeList(renewalPayload)
        .map(mapOption)
        .map((it) => String(it.name ?? it.id ?? "").trim().toLowerCase())
        .filter((name) => name.length > 0 && name !== "new" && name !== "ace");

      const uniqueNames = Array.from(new Set(renewalItems));
      if (uniqueNames.length > 0) {
        console.warn("[SegfyProxy] usando renewal-list como fallback de insurers", uniqueNames.length);
        return uniqueNames.map((name) => ({ name, commission: 20 }));
      }
    } catch {
      console.warn("[SegfyProxy] falha ao consultar renewal-list para fallback de insurers");
    }
  }

  return [{ name: "ace", commission: 20 }];
}

async function toCalculatePayload(input: SegfyQuoteInput): Promise<JsonRecord> {
  const today = new Date();
  const oneYear = new Date(today);
  oneYear.setFullYear(oneYear.getFullYear() + 1);

  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);
  const parseDateBRToIso = (value: string): string => {
    const parts = value.split("/");
    if (parts.length !== 3) return toIsoDate(today);
    const [dd, mm, yyyy] = parts;
    if (!dd || !mm || !yyyy) return toIsoDate(today);
    return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };

  const condutorCpf = input.condutor.cpf.replace(/\D/g, "");
  const condutorCep = input.condutor.cep.replace(/\D/g, "");

  const risco = input.avaliacao_risco;
  // Os steps já guardam os valores oficiais da Segfy; só usamos fallback quando vazio.
  const utilizationType =
    risco?.tipo_uso === "personal" || risco?.tipo_uso === "job" || risco?.tipo_uso === "both"
      ? risco.tipo_uso
      : mapUtilizationType(risco?.tipo_uso || input.condutor.uso);
  const residenceGarage = risco?.garagem_residencia || "no_garage";
  const jobGarage =
    risco?.garagem_trabalho === "sim" ? "yes" : risco?.garagem_trabalho === "nao" ? "no" : risco?.garagem_trabalho || "no";
  const studyGarage = risco?.garagem_estudo || "no";
  const otherDriver = risco?.menores_26 || "does_not_exist";
  const secondaryDriverAge = risco?.idade_condutor_adicional || " ";
  const residenceType = risco?.tipo_residencia || "house";
  const taxExemption = risco?.isencao_fiscal || "not_isent";
  const workDistance = String(Number(risco?.distancia_trabalho) >= 0 && risco?.distancia_trabalho ? Number(risco.distancia_trabalho) : 15);
  const monthlyKm = String(Number(risco?.km_mensal) > 0 ? Number(risco?.km_mensal) : 1000);

  const isRenewal = input.situacao === "renovar";
  const renewalInput =
    (input as unknown as { renewal?: Record<string, unknown> }).renewal ?? {};

  const priorPolicyEnd = input.vigencia_fim_apolice
    ? parseDateBRToIso(input.vigencia_fim_apolice)
    : String(renewalInput.prior_policy_end ?? "2099-12-31");
  const priorPolicy = String(
    input.numero_apolice_anterior || renewalInput.prior_policy || "NAO_INFORMADA",
  );
  const priorIc = String(input.ci_vigente || renewalInput.prior_ic || "");
  const bonusCurrent = String(input.bonus_atual || renewalInput.bonus_current || "0");
  const bonusLast = String(input.bonus_futuro || renewalInput.bonus_last || "0");

  const insurers = await resolveInsurers(input);

  const roomId = String(input.reference ?? input.callback ?? "").trim() || String(input.callback ?? "").trim();
  const calculateToken = process.env.SEGFY_CALCULATE_TOKEN?.trim() || input.token || "";
  const extensionGuid = process.env.SEGFY_EXTENSION_GUID?.trim() || "";
  if (!extensionGuid) {
    // Importante: isso não é garantia absoluta de falha, porque a Segfy pode continuar emitindo eventos
    // via websocket mesmo quando o extension_guid volta vazio na resposta do calculate.
    // O ponto crítico continua sendo: sem extensão, a automação/RPA não é disparada de forma consistente.
    console.warn(
      "[SegfyProxy] SEGFY_EXTENSION_GUID não configurado: a cotação pode ser aceita, mas a automação/RPA da Segfy pode não ser disparada.",
    );
  }

  return {
    config: {
      token: calculateToken,
      insurers,
      callback: roomId,
      reference: roomId,
      extension_guid: extensionGuid,
      extension_version: process.env.SEGFY_EXTENSION_VERSION?.trim() || "",
      connected_backup: process.env.SEGFY_CONNECTED_BACKUP?.trim() || "",
    },
    data: {
      quotation_id: roomId,
      quotation_date: toIsoDate(today),
      validity_start: toIsoDate(today),
      validity_end: toIsoDate(oneYear),
      zip_code: condutorCep,
      customization: {},
      advantages: {},
      renewal: {
        quotation_type: isRenewal ? "RENOVATION" : "NEW_QUOTATION",
        prior_policy_end: isRenewal ? priorPolicyEnd : "2099-12-31",
        prior_policy: isRenewal ? priorPolicy : "0",
        claim_amount: String(renewalInput.claim_amount ?? "0"),
        insurer: isRenewal ? String(renewalInput.insurer ?? "ace") : "new",
        bonus_current: bonusCurrent,
        prior_ic: priorIc,
        bonus_last: bonusLast,
        item: String(renewalInput.item ?? "1"),
        origin_bonus: String(renewalInput.origin_bonus ?? "0"),
      },
      customer: {
        social_name: input.condutor.nome,
        document: condutorCpf,
        name: input.condutor.nome,
        birth_date: parseDateBRToIso(input.condutor.nascimento),
        email: input.email || input.condutor.email || "",
        cellphone: input.telefone,
        sex: input.sexo ?? "male",
      },
      main_driver: {
        document: condutorCpf,
        name: input.condutor.nome,
        birth_date: parseDateBRToIso(input.condutor.nascimento),
        sex: input.sexo ?? "male",
        marital_status: mapMaritalStatus(input.condutor.estado_civil),
        relationship: mapRelationship(input.condutor.relacao),
        profession: input.condutor.profissao_id || input.condutor.profissao,
      },
      vehicle: {
        vehicle_type: input.veiculo.tipo,
        plate: input.veiculo.placa,
        chassis: "",
        manufacture_year: Number(input.veiculo.ano_fab) || 0,
        model_year: Number(input.veiculo.ano_mod) || 0,
        brand: String(input.veiculo.marca || "").trim(),
        model: String(input.veiculo.modelo || "").trim(),
        fipe_code: String(input.veiculo.versao ?? "").trim() || "0000000",
        fipe_value: "0",
        circulation_zip_code: condutorCep,
        category_type: "particular",
        fuel_type: "flex",
        zero_km: Boolean(input.veiculo.zero_km),
        alienated: Boolean(input.veiculo.alienado),
        chassis_relabeled: Boolean(input.veiculo.chassi_remarcado),
        armored: Boolean(input.veiculo.blindado),
        gas_kit: Boolean(input.veiculo.kit_gas),
        anti_theft: Boolean(input.veiculo.antifurto),
        fipe_url: "",
      },
      questionnaire: {
        residence_garage: residenceGarage,
        job_garage: jobGarage,
        study_garage: studyGarage,
        utilization_type: utilizationType,
        other_driver: otherDriver,
        secondary_driver_age: secondaryDriverAge,
        monthly_km: monthlyKm,
        work_distance: workDistance,
        residence_type: residenceType,
        tax_exemption: taxExemption,
      },

      questionnaire_truck: {},
      coverage: {
        fipe_percentage: String(100),
        selected_coverage: { label: "Selecione", value: " " },
        description: "",
        coverage_type: "exclusive",
        franchise: "normal",
        assistance: input.coberturas.guincho_24h ? "assistance_200_km_referenced" : "no_assistance",
        glass: input.coberturas.vidros ? "glass_basic_referenced" : "no_glass",
        rental_car: input.coberturas.carro_reserva ? "rental_car_07_days_referenced" : "no_car",
        rental_car_profile: "",
        replacement_zero_km: "no_replacement",
        material_damage: String(input.coberturas.terceiros ? 100000 : 0),
        body_injuries: String(input.coberturas.terceiros ? 100000 : 0),
        moral_damage: String(input.coberturas.terceiros ? 50000 : 0),
        death_illness: String(input.coberturas.terceiros ? 10000 : 0),
        expense_extraordinary: 0,
        dmh: 0,
        maxpar_coverages: {
          bodywork_and_paint: false,
          wheel_tire_and_suspension: false,
        },
        lmi_residential: 0,
        defense_costs: 0,
        quick_repairs: false,
        body_shop_repair: false,
        exemption_franchise: false,
      },
      alive_extension: "false",
      brand_id: String(input.veiculo.marca_id || "").trim(),
      model_id: String(input.veiculo.modelo_id || input.veiculo.modelo || "").trim(),
    },
  };
}

function parseBodyAsJson<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

async function readBodyOrEmpty(request: Request): Promise<JsonRecord> {
  try {
    if (request.method === "GET" || request.method === "HEAD") return {};
    const body = await request.json();
    if (!body || typeof body !== "object") return {};
    return body as JsonRecord;
  } catch {
    return {};
  }
}

async function callVehicleEndpoint(path: string, payload: JsonRecord) {
  const configuredToken = process.env.SEGFY_CALCULATE_TOKEN?.trim() || "";
  const incomingConfig =
    payload.config && typeof payload.config === "object"
      ? (payload.config as JsonRecord)
      : {};

  const tokenFromBody =
    typeof incomingConfig.token === "string" && incomingConfig.token.trim()
      ? incomingConfig.token.trim()
      : typeof payload.token === "string" && payload.token.trim()
        ? payload.token.trim()
        : "";

  const finalToken = tokenFromBody || configuredToken;

  const { config: _ignoredConfig, token: _ignoredToken, ...rest } = payload;
  const incomingData =
    payload.data && typeof payload.data === "object"
      ? (payload.data as JsonRecord)
      : rest;

  const normalizedPayload: JsonRecord = {
    ...payload,
    config: {
      ...incomingConfig,
      ...(finalToken ? { token: finalToken } : {}),
    },
    data: incomingData,
  };

  return segfyRequest(path, {
    method: "POST",
    body: JSON.stringify(normalizedPayload),
  });
}

function badRequest(message: string) {
  return json({ error: message }, 400);
}

export async function handleSegfyApiRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/api/segfy/session/token" && request.method === "POST") {
      const token = await getBearerToken(true);
      return json({ ok: true, tokenPreview: `${token.slice(0, 12)}...` });
    }

    if (pathname === "/api/segfy/vehicle/brand-list" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/brand-list", body);
      const items = normalizeList(payload).map(mapOption);
      return json({ items, raw: payload });
    }

    if (pathname === "/api/segfy/vehicle/model-list" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/model-list", body);
      const items = normalizeList(payload).map(mapOption);
      return json({ items, raw: payload });
    }

    if (pathname === "/api/segfy/vehicle/profession-list" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/profession-list", body);
      const items = normalizeList(payload).map(mapOption);
      return json({ items, raw: payload });
    }

    if (pathname === "/api/segfy/vehicle/renewal-list" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/renewal-list", body);
      const items = normalizeList(payload).map(mapOption);
      return json({ items, raw: payload });
    }

    if (pathname === "/api/segfy/vehicle/company-list" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/company-list", body);
      const items = normalizeList(payload).map(mapOption);
      return json({ items, raw: payload });
    }

    if (pathname === "/api/segfy/vehicle/decode-plate" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/decode-plate", body);
      return json({ payload });
    }

    if (pathname === "/api/segfy/vehicle/zip-code" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/zip-code", body);
      return json({ payload });
    }

    if (pathname === "/api/segfy/vehicle/insured" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/insured", body);
      return json({ payload });
    }

    if (pathname === "/api/segfy/vehicle/calculate" && request.method === "POST") {
      const input = await parseBodyAsJson<SegfyQuoteInput>(request);
      const body = await toCalculatePayload(input);
      try {
        const payload = await segfyRequest("/api/vehicle/version/1.0/calculate", {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json(payload);
      } catch (error) {
        console.error("[SegfyProxy] /calculate request body:", JSON.stringify(body));
        console.error(
          "[SegfyProxy] /calculate error payload:",
          error instanceof SegfyHttpError ? JSON.stringify(error.payload) : JSON.stringify({ raw: String(error) }),
        );
        throw error;
      }
    }

    if (pathname === "/api/segfy/vehicle/save-customer" && request.method === "POST") {
      const input = await parseBodyAsJson<SegfyQuoteInput>(request);
      const body = await toCalculatePayload(input);
      try {
        const payload = await segfyRequest("/api/vehicle/version/1.0/save-customer", {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json({ saved: true, payload });
      } catch (error) {
        console.error("[SegfyProxy] /save-customer request body:", JSON.stringify(body));
        console.error(
          "[SegfyProxy] /save-customer error payload:",
          error instanceof SegfyHttpError ? JSON.stringify(error.payload) : JSON.stringify({ raw: String(error) }),
        );
        throw error;
      }
    }

    if (pathname === "/api/segfy/vehicle/show-quotation" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const innerData = body.data && typeof body.data === "object" ? (body.data as JsonRecord) : {};
      const id = String(body.id ?? body.guid ?? innerData.id ?? innerData.guid ?? "").trim();
      if (!id) return badRequest("Parâmetro id é obrigatório.");

      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/show-quotation", { id });
      return json({ payload });
    }

    if (pathname === "/api/segfy/vehicle/show-results" && request.method === "POST") {
      const body = await readBodyOrEmpty(request);
      const innerData = body.data && typeof body.data === "object" ? (body.data as JsonRecord) : {};
      const id = String(body.id ?? body.guid ?? innerData.id ?? innerData.guid ?? "").trim();
      if (!id) return badRequest("Parâmetro id é obrigatório.");

      const payload = await callVehicleEndpoint("/api/vehicle/version/1.0/show-results", { id });
      return json({ payload });
    }

    return json({ error: "Rota Segfy não encontrada." }, 404);
  } catch (error) {
    if (error instanceof SegfyHttpError) {
      return json(
        {
          error: error.message,
          details: error.payload ?? null,
        },
        error.status,
      );
    }
    console.error("[SegfyProxy] erro não tratado", error);
    return json({ error: "Falha inesperada na integração Segfy." }, 500);
  }
}
