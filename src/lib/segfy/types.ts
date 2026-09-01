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
  };
  condutor: {
    nome: string;
    nascimento: string;
    cpf: string;
    cep: string;
    profissao: string;
    profissao_id?: string;
    estado_civil: string;
    uso: string;
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
