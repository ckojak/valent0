import {
  Bike,
  Briefcase,
  Building,
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
  Shield,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  id: string;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  /** Rota da página de categoria (quando existe). */
  href?: string;
  /** Quando true, item dispara o wizard modal simplificado (categorias sem página). */
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
      { id: "carro", label: "Carro", subtitle: "Cote agora em minutos", icon: Car, href: "/seguros/auto" },
      { id: "moto", label: "Moto", subtitle: "Cobertura completa", icon: Gauge, quote: true },
      { id: "bike", label: "Speed, Mountain Bike e Passeio", subtitle: "Bicicletas convencionais", icon: Bike, quote: true },
      { id: "scooter", label: "Scooter, Patinete e Bike Elétricos", subtitle: "Mobilidade urbana elétrica", icon: Zap, quote: true },
    ],
  },
  {
    id: "familia",
    title: "Para Você e sua família",
    icon: Users,
    items: [
      { id: "residencia", label: "Residência", subtitle: "Sua casa protegida", icon: Home, href: "/seguros/residencial" },
      { id: "vida", label: "Seguro de Vida", subtitle: "Proteção pra quem você ama", icon: HeartPulse, href: "/seguros/vida" },
      { id: "viagem", label: "Viagem", subtitle: "Nacional e internacional", icon: Plane, quote: true },
      { id: "celular", label: "Celular", subtitle: "Roubo, furto e quebra", icon: Smartphone, quote: true },
      { id: "saude", label: "Saúde", subtitle: "Planos individuais e família", icon: Stethoscope, quote: true },
    ],
  },
  {
    id: "empresa",
    title: "Para sua Empresa",
    icon: Briefcase,
    items: [
      { id: "empresarial", label: "Seguro Empresarial", subtitle: "Estoque, RC e lucros cessantes", icon: Shield, href: "/seguros/empresarial" },
      { id: "condominio", label: "Condomínio", subtitle: "Obrigatório por lei", icon: Building, href: "/seguros/condominio" },
      { id: "incendio", label: "Incêndio empresarial", subtitle: "Patrimônio e estoque", icon: Flame, quote: true },
      { id: "frota", label: "Frota de veículos", subtitle: "Gestão simplificada", icon: Truck, quote: true },
      { id: "caminhao", label: "Caminhão", subtitle: "Carga e cavalo mecânico", icon: Truck, quote: true },
    ],
  },
];
