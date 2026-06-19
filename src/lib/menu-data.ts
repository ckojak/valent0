import {
  Bike,
  Briefcase,
  Car,
  Flame,
  HeartPulse,
  Home,
  Plane,
  Smartphone,
  Stethoscope,
  Truck,
  Users,
  Zap,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export type MenuItemId =
  | "bike"
  | "scooter"
  | "moto"
  | "carro"
  | "viagem"
  | "celular"
  | "residencia"
  | "saude"
  | "incendio"
  | "frota"
  | "caminhao"
  | "saude-empresarial";

export type MenuItem = {
  id: MenuItemId;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  /** When true, item triggers the quote wizard. Otherwise shows "fale com consultor" toast. */
  quote?: boolean;
};

export type MenuSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    id: "veiculo",
    title: "Para seu Veículo",
    icon: Car,
    items: [
      { id: "bike", label: "Speed, Mountain Bike e Passeio", subtitle: "Bicicletas convencionais", icon: Bike },
      { id: "scooter", label: "Scooter, Patinete e Bike Elétricos", subtitle: "Mobilidade urbana elétrica", icon: Zap },
      { id: "moto", label: "Moto", subtitle: "Cobertura completa", icon: Gauge },
      { id: "carro", label: "Carro", subtitle: "Cote agora em 1 minuto", icon: Car, quote: true },
    ],
  },
  {
    id: "familia",
    title: "Para Você e sua família",
    icon: Users,
    items: [
      { id: "viagem", label: "Viagem", subtitle: "Nacional e internacional", icon: Plane },
      { id: "celular", label: "Celular", subtitle: "Roubo, furto e quebra", icon: Smartphone },
      { id: "residencia", label: "Residência", subtitle: "Sua casa protegida", icon: Home },
      { id: "saude", label: "Saúde", subtitle: "Planos individuais e família", icon: HeartPulse },
    ],
  },
  {
    id: "empresa",
    title: "Para sua Empresa",
    icon: Briefcase,
    items: [
      { id: "incendio", label: "Incêndio empresarial", subtitle: "Patrimônio e estoque", icon: Flame },
      { id: "frota", label: "Frota de veículos", subtitle: "Gestão simplificada", icon: Truck },
      { id: "caminhao", label: "Caminhão", subtitle: "Carga e cavalo mecânico", icon: Truck },
      { id: "saude-empresarial", label: "Saúde Empresarial", subtitle: "Para seus colaboradores", icon: Stethoscope },
    ],
  },
];
