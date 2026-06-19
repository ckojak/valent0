export type Insurer = {
  id: string;
  name: string;
  initials: string;
  color: string; // brand-ish hex used only inside the logo placeholder pill
  coverage: string;
};

export const INSURERS: Insurer[] = [
  {
    id: "tokio",
    name: "Tokio Marine",
    initials: "TM",
    color: "#003DA5",
    coverage: "Compreensiva + vidros e retrovisores sem franquia",
  },
  {
    id: "porto",
    name: "Porto Seguro",
    initials: "PS",
    color: "#0033A0",
    coverage: "Cobertura compreensiva + carro reserva 15 dias",
  },
  {
    id: "bradesco",
    name: "Bradesco Seguros",
    initials: "BR",
    color: "#CC092F",
    coverage: "Cobertura total + assistência 24h ilimitada",
  },
];

export type Quote = {
  insurer: Insurer;
  total: number;
  installment: number;
};

// Deterministic-ish mock based on seed string so results feel stable per submit
function seedFrom(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateQuotes(seedStr: string): Quote[] {
  const seed = seedFrom(seedStr || "default");
  return INSURERS.map((ins, i) => {
    const base = 1700 + ((seed >> (i * 3)) % 1400); // 1700–3100
    const total = Math.round(base);
    return {
      insurer: ins,
      total,
      installment: Math.round((total / 12) * 100) / 100,
    };
  }).sort((a, b) => a.total - b.total);
}
