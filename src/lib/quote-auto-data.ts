// MOCK: dados de veículos e cotações. Substituir por API real de FIPE / multicálculo
// quando o backend Python estiver disponível.

export type Situacao = "comprei" | "vou_comprar" | "renovar" | "pesquisando";
export type Prioridade = "menor_preco" | "melhor_cobertura" | "mais_assistencia" | "equilibrio";

export const SITUACAO_LABEL: Record<Situacao, string> = {
  comprei: "Comprei recentemente",
  vou_comprar: "Vou comprar em breve",
  renovar: "Vou renovar meu seguro",
  pesquisando: "Só estou pesquisando",
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  menor_preco: "Menor preço",
  melhor_cobertura: "Melhor cobertura",
  mais_assistencia: "Mais assistência 24h",
  equilibrio: "Equilíbrio entre preço e cobertura",
};

// Lista curta apenas para UI. Placeholder — será substituída por FIPE real.
export const MARCAS = [
  "Volkswagen",
  "Chevrolet",
  "Fiat",
  "Ford",
  "Toyota",
  "Honda",
  "Hyundai",
  "Renault",
  "Jeep",
  "Nissan",
] as const;

export const MODELOS_POR_MARCA: Record<string, string[]> = {
  Volkswagen: ["Gol", "Polo", "T-Cross", "Nivus", "Virtus"],
  Chevrolet: ["Onix", "Onix Plus", "Tracker", "Spin", "Cruze"],
  Fiat: ["Argo", "Cronos", "Mobi", "Strada", "Toro"],
  Ford: ["Ka", "EcoSport", "Ranger", "Territory"],
  Toyota: ["Corolla", "Corolla Cross", "Hilux", "Yaris"],
  Honda: ["Civic", "City", "Fit", "HR-V", "WR-V"],
  Hyundai: ["HB20", "HB20S", "Creta", "Tucson"],
  Renault: ["Kwid", "Sandero", "Duster", "Kardian"],
  Jeep: ["Renegade", "Compass", "Commander"],
  Nissan: ["Versa", "Kicks", "Frontier"],
};

export const VERSOES = [
  "1.0 Flex",
  "1.0 Turbo",
  "1.4 Flex",
  "1.6 Automático",
  "2.0 Turbo",
  "Comfortline",
  "Highline",
  "Sport",
  "LT",
  "LTZ",
];

export const ESTADO_CIVIL = [
  "Solteiro(a)",
  "Casado(a)",
  "União estável",
  "Divorciado(a)",
  "Viúvo(a)",
];

export const USO_VEICULO = [
  "Uso particular",
  "Trabalho / trajeto diário",
  "Motorista de aplicativo",
  "Uso comercial (entregas)",
];

// -----------------------------------------------------------------------------
// Cotações mockadas.
// MOCK: substituir por API real de multicálculo quando disponível.
// -----------------------------------------------------------------------------

export type QuoteAuto = {
  id: string;
  seguradora: string;
  iniciais: string;
  cor: string;
  premio_total: number;
  parcelas: number;
  franquia: number;
  destaque: string;
  coberturas: {
    casco: boolean;
    terceiros_materiais: number;
    terceiros_corporais: number;
    vidros: boolean;
    carro_reserva_dias: number;
    guincho_km: number;
    assistencia_24h: boolean;
  };
};

function seed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateAutoQuotes(seedStr: string): QuoteAuto[] {
  const s = seed(seedStr || "default");
  const base = [
    {
      id: "porto",
      seguradora: "Porto Seguro",
      iniciais: "PS",
      cor: "#0033A0",
      destaque: "Melhor custo-benefício",
    },
    {
      id: "azul",
      seguradora: "Azul Seguros",
      iniciais: "AZ",
      cor: "#009FE3",
      destaque: "Rede oficinas ampla",
    },
    {
      id: "allianz",
      seguradora: "Allianz",
      iniciais: "AL",
      cor: "#003781",
      destaque: "Cobertura premium",
    },
  ];
  return base
    .map((b, i) => {
      const premio = 1800 + ((s >> (i * 4)) % 1600); // 1800–3400
      return {
        ...b,
        premio_total: Math.round(premio),
        parcelas: 12,
        franquia: 2400 + ((s >> (i * 5)) % 1600),
        coberturas: {
          casco: true,
          terceiros_materiais: 50000 + i * 20000,
          terceiros_corporais: 50000 + i * 30000,
          vidros: i !== 1,
          carro_reserva_dias: [15, 7, 30][i],
          guincho_km: [200, 400, 1000][i],
          assistencia_24h: true,
        },
      };
    })
    .sort((a, b) => a.premio_total - b.premio_total);
}
