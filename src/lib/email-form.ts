export type FormValue = string | number | boolean | null | undefined | Array<string | number | boolean>;
export type FormLabels = Record<string, string>;
export type InsuranceFormType = "auto" | "vida" | "empresarial" | "generic" | string;

export const BRAND = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  primary: "#C2410C",
  primarySoft: "#FFF7ED",
  primaryDark: "#9A3A0B",
  text: "#0F172A",
  subtle: "#475569",
  border: "#E2E8F0",
  muted: "#F8FAFC",
  accent: "#1D4ED8",
  success: "#15803D",
  successSoft: "#ECFDF5",
};

export function humanizeLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatFormValue(value: FormValue): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatFormValue(item)).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function flattenFormData(data: Record<string, unknown>, prefix = ""): Record<string, FormValue> {
  const result: Record<string, FormValue> = {};

  for (const [key, value] of Object.entries(data)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenFormData(value as Record<string, unknown>, nextKey));
      continue;
    }

    if (Array.isArray(value)) {
      result[nextKey] = value.map((item) => {
        if (item && typeof item === "object") {
          return JSON.stringify(item);
        }
        return formatFormValue(item as FormValue);
      });
      continue;
    }

    result[nextKey] = value as FormValue;
  }

  return result;
}

function renderSectionCard(title: string, rowsHtml: string): string {
  return `
    <div style="margin:0 0 18px 0;">
      <div style="margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:20px;font-weight:700;color:${BRAND.text};padding:0 2px;">${escapeHtml(title)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${BRAND.border};border-radius:12px;background:${BRAND.muted};overflow:hidden;">
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function renderKeyValueRow(label: string, value: FormValue): string {
  return `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid ${BRAND.border};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.subtle};font-weight:700;vertical-align:top;width:38%;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 14px;border-bottom:1px solid ${BRAND.border};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;color:${BRAND.text};font-weight:600;vertical-align:top;">
        ${escapeHtml(formatFormValue(value) || "—")}
      </td>
    </tr>
  `;
}

export function buildFormDetailsTable(rawFields: Record<string, FormValue>, labels: FormLabels = {}, options?: { title?: string; includeEmpty?: boolean }): string {
  const { title = "Detalhes do formulário", includeEmpty = false } = options ?? {};

  const rows = Object.entries(rawFields)
    .filter(([_, value]) => {
      if (value === null || value === undefined || value === "") {
        return includeEmpty;
      }
      return true;
    })
    .map(([key, value]) => {
      const label = labels[key] ?? humanizeLabel(key);
      return renderKeyValueRow(label, value);
    })
    .join("");

  if (!rows) {
    return `
      <div style="padding:18px 16px;border:1px solid ${BRAND.border};border-radius:12px;background:${BRAND.muted};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.subtle};font-size:13px;line-height:20px;">
        Nenhum dado preenchido.
      </div>
    `;
  }

  return renderSectionCard(title, rows);
}

export function renderAutoContent(formData: Record<string, FormValue>): string {
  const flattened = flattenFormData(formData as Record<string, unknown>);
  const nestedVeiculo = (formData.veiculo && typeof formData.veiculo === "object" ? formData.veiculo : {}) as Record<string, FormValue>;
  const nestedSegurado = (formData.segurado && typeof formData.segurado === "object" ? formData.segurado : {}) as Record<string, FormValue>;
  const nestedCondutor = (formData.condutor && typeof formData.condutor === "object" ? formData.condutor : {}) as Record<string, FormValue>;
  const nestedCoberturas = (formData.coberturas && typeof formData.coberturas === "object" ? formData.coberturas : {}) as Record<string, FormValue>;

  const autoFields = {
    placa: flattened.placa ?? flattened["veiculo.placa"] ?? nestedVeiculo.placa ?? "",
    marca: flattened.marca ?? flattened["veiculo.marca"] ?? nestedVeiculo.marca ?? "",
    modelo: flattened.modelo ?? flattened["veiculo.modelo"] ?? nestedVeiculo.modelo ?? "",
    ano: flattened.ano ?? flattened["veiculo.ano_mod"] ?? flattened["veiculo.ano_fab"] ?? nestedVeiculo.ano_mod ?? nestedVeiculo.ano_fab ?? "",
    zero_km: flattened.zero_km ?? flattened["veiculo.zero_km"] ?? nestedVeiculo.zero_km ?? "",
    nome_condutor: flattened.nome_condutor ?? flattened.nome ?? flattened["condutor.nome"] ?? nestedCondutor.nome ?? nestedSegurado.nome ?? "",
    cpf_condutor: flattened.cpf_condutor ?? flattened.cpf ?? flattened["condutor.cpf"] ?? nestedCondutor.cpf ?? nestedSegurado.documento ?? "",
    telefone_condutor: flattened.telefone_condutor ?? flattened.telefone ?? flattened["condutor.celular"] ?? flattened["segurado.celular"] ?? nestedCondutor.celular ?? nestedSegurado.celular ?? "",
    situacao: flattened.situacao ?? "",
    prioridade: flattened.prioridade ?? "",
    cobertura: flattened.coberturas ?? flattened["coberturas.carro_reserva"] ?? nestedCoberturas.carro_reserva ?? "",
  };

  const veiculoRows = [
    renderKeyValueRow("Placa", autoFields.placa),
    renderKeyValueRow("Marca", autoFields.marca),
    renderKeyValueRow("Modelo", autoFields.modelo),
    renderKeyValueRow("Ano", autoFields.ano),
    renderKeyValueRow("Zero KM", autoFields.zero_km),
    renderKeyValueRow("Situação", autoFields.situacao),
  ].join("");

  const condutorRows = [
    renderKeyValueRow("Nome", autoFields.nome_condutor),
    renderKeyValueRow("CPF", autoFields.cpf_condutor),
    renderKeyValueRow("Telefone", autoFields.telefone_condutor),
    renderKeyValueRow("Prioridade", autoFields.prioridade),
    renderKeyValueRow("Coberturas", autoFields.cobertura),
  ].join("");

  return `${renderSectionCard("Veículo", veiculoRows)}${renderSectionCard("Condutor principal", condutorRows)}`;
}

export function renderVidaContent(formData: Record<string, FormValue>): string {
  const seguradoRows = [
    renderKeyValueRow("Nome", formData.nome ?? ""),
    renderKeyValueRow("CPF", formData.cpf ?? ""),
    renderKeyValueRow("Idade", formData.idade ?? ""),
    renderKeyValueRow("Dependentes", formData.dependentes ?? ""),
    renderKeyValueRow("Profissão", formData.profissao ?? ""),
  ].join("");

  const coberturasRows = [
    renderKeyValueRow("Cobertura principal", formData.cobertura_principal ?? ""),
    renderKeyValueRow("Capital segurado", formData.capital_seguro ?? ""),
    renderKeyValueRow("Plano desejado", formData.plano ?? formData.plano_desejado ?? ""),
  ].join("");

  return `${renderSectionCard("Segurado", seguradoRows)}${renderSectionCard("Coberturas", coberturasRows)}`;
}

export function renderEmpresarialContent(formData: Record<string, FormValue>): string {
  const rows = [
    renderKeyValueRow("CNPJ", formData.cnpj ?? ""),
    renderKeyValueRow("Razão Social", formData.razao_social ?? ""),
    renderKeyValueRow("Nome do Responsável", formData.responsavel ?? ""),
    renderKeyValueRow("Ramo de Atuação", formData.ramo_atividade ?? ""),
    renderKeyValueRow("Funcionários", formData.funcionarios ?? ""),
    renderKeyValueRow("Faturamento Estimado", formData.faturamento_estimado ?? ""),
  ].join("");

  return renderSectionCard("Dados da empresa", rows);
}

export function renderGenericContent(formData: Record<string, FormValue>, labels: FormLabels = {}): string {
  return buildFormDetailsTable(formData, labels, { title: "Dados do formulário", includeEmpty: false });
}

export function renderConditionalContent(formType: InsuranceFormType, formData: Record<string, FormValue>, labels: FormLabels = {}): string {
  const normalizedType = String(formType ?? "generic").toLowerCase();

  switch (normalizedType) {
    case "auto":
      return renderAutoContent(formData);
    case "vida":
      return renderVidaContent(formData);
    case "empresarial":
      return renderEmpresarialContent(formData);
    default:
      return renderGenericContent(formData, labels);
  }
}

export function buildInsuranceEmailHtml({
  formTitle,
  formType,
  clientName,
  clientEmail,
  submittedAt,
  formData,
  formLabels = {},
}: {
  formTitle: string;
  formType: InsuranceFormType;
  clientName: string;
  clientEmail?: string;
  submittedAt: string;
  formData: Record<string, FormValue>;
  formLabels?: FormLabels;
}) {
  const formContent = renderConditionalContent(formType, formData, formLabels);
  const normalizedFormType = escapeHtml(String(formType || "generic"));
  const logoUrl = "https://www.valentseguros.com.br/valent-logo.svg";
  const template = `
    <div style="margin:0;padding:0;background:${BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.background};padding:32px 16px;">
        <tr>
          <td align="center">
            <div style="max-width:620px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden;box-shadow:0 10px 28px rgba(15,23,42,0.06);">
              <div style="background:linear-gradient(135deg, ${BRAND.primary} 0%, #EA580C 100%);padding:22px 28px 20px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" valign="middle">
                      <img src="${logoUrl}" alt="Valent Seguros" width="176" height="48" style="display:block;max-width:176px;height:auto;border:0;outline:none;text-decoration:none;" />
                    </td>
                    <td align="right" valign="middle" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fff;opacity:0.9;">
                      Agência digital
                    </td>
                  </tr>
                </table>
              </div>

              <div style="padding:26px 28px 8px 28px;background:${BRAND.card};">
                <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:${BRAND.primarySoft};border:1px solid rgba(194,65,12,0.18);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.primary};">
                  Nova cotação recebida
                </div>
                <h1 style="margin:14px 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:30px;line-height:1.25;font-weight:800;color:${BRAND.text};">
                  {{form_title}}
                </h1>
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.subtle};font-weight:600;">
                  {{submitted_at}}
                </div>
              </div>

              <div style="padding:10px 28px 12px 28px;background:${BRAND.card};">
                {{{form_content}}}
              </div>

              <div style="padding:18px 28px 24px 28px;background:${BRAND.muted};border-top:1px solid ${BRAND.border};">
                <div style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:20px;color:${BRAND.subtle};font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                  Dados do cliente
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.subtle};font-weight:700;width:38%;">Cliente</td>
                    <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.text};font-weight:600;">${escapeHtml(clientName || "Não informado")}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.subtle};font-weight:700;width:38%;">E-mail</td>
                    <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.text};font-weight:600;">${escapeHtml(clientEmail || "Não informado")}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.subtle};font-weight:700;width:38%;">Tipo</td>
                    <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.text};font-weight:600;">${normalizedFormType}</td>
                  </tr>
                </table>
              </div>

              <div style="padding:18px 28px 28px 28px;background:#0F172A;color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:20px;">
                <div style="margin:0 0 4px 0;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Valent Seguros</div>
                <div style="opacity:0.82;">Atenção: este é um e-mail automático gerado pela plataforma de cotação.</div>
                <div style="margin-top:8px;opacity:0.82;">Privacidade · Termos · Atendimento</div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return template
    .replace(/{{form_title}}/g, escapeHtml(String(formTitle || "Cotação")))
    .replace(/{{{form_content}}}/g, formContent)
    .replace(/{{submitted_at}}/g, escapeHtml(String(submittedAt || "")));
}
