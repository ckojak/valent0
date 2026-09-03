import type { SegfyResult } from "./result-types";

export type VehicleKind = "car" | "motorcycle" | "truck";

export type SegfyOption = {
  id: string;
  name: string;
  code?: string | null;
  [key: string]: unknown;
};

export type SegfyApiResponse<T> = {
  status?: string;
  messages?: string | string[];
  data?: T;
  [key: string]: unknown;
};

export type SegfyQuoteInput = {
  token?: string;
  callback: string;
  reference?: string;
  insurers?: Array<{ name: string; commission: number }>;
  telefone: string;
  email?: string;
  sexo?: "male" | "female";
  situacao: string | null;
  prioridade: string | null;
  // Campos aditivos do mini-passo "seguro atual" (somente renovar).
  seguradora_atual?: string;
  numero_apolice_anterior?: string;
  teve_sinistro?: boolean | null;
  bonus_atual?: string;
  bonus_futuro?: string;
  vigencia_fim_apolice?: string;
  ci_vigente?: string;
  // Passo aditivo "Avaliação de Risco" (obrigatório para todos).
  avaliacao_risco?: {
    garagem_residencia: "" | "yes_with_electronic_gate" | "yes_without_electronic_gate" | "no_garage" | "not_kept_in_garage";
    garagem_trabalho: string;
    garagem_estudo?: string;
    tipo_uso: string;
    menores_26?: string;
    idade_condutor_adicional?: string;
    km_mensal: string;
    distancia_trabalho?: string;
    tipo_residencia?: string;
    isencao_fiscal?: string;
  };
  coberturas: {
    carro_reserva: boolean;
    vidros: boolean;
    terceiros: boolean;
    guincho_24h: boolean;
  };
  veiculo: {
    tipo: VehicleKind;
    marca: string;
    marca_id?: string;
    modelo: string;
    modelo_id?: string;
    ano_fab: string;
    ano_mod: string;
    versao: string;
    placa: string;
    zero_km?: boolean;
    alienado?: boolean;
    kit_gas?: boolean;
    blindado?: boolean;
    chassi_remarcado?: boolean;
    antifurto?: boolean;
  };
  condutor: {
    nome: string;
    nome_social?: string;
    nascimento: string;
    cpf: string;
    cep: string;
    profissao: string;
    profissao_id?: string;
    estado_civil: string;
    uso: string;
    sexo?: "male" | "female" | "";
    email?: string;
    relacao?: string;
  };
};


export type SegfySocketMessage = {
  status?: "STEP" | "PDF" | "RESULT" | string;
  insurer?: string;
  company?: string;
  message?: string;
  quotation_id?: string;
  result?: SegfyResult | SegfyResult[];
  results?: SegfyResult[];
  pdf?: string;
  error?: string;
  [key: string]: unknown;
};
