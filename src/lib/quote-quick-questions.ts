import type { CategorySlug } from "@/lib/category-configs";

export type QuickQuestion = {
  key: string;
  label: string;
  options: string[];
};

export const QUICK_QUESTIONS: Partial<Record<CategorySlug, QuickQuestion[]>> = {
  residencial: [
    {
      key: "tipo_imovel",
      label: "Tipo de imóvel",
      options: ["Casa", "Apartamento", "Casa de temporada"],
    },
    {
      key: "situacao_imovel",
      label: "Você é",
      options: ["Proprietário", "Inquilino"],
    },
  ],
  empresarial: [
    {
      key: "segmento",
      label: "Segmento do negócio",
      options: ["Comércio/Varejo", "Indústria", "Serviços", "Alimentação", "Outro"],
    },
    {
      key: "porte",
      label: "Porte da empresa",
      options: ["MEI/Autônomo", "Pequena empresa", "Média empresa"],
    },
  ],
  vida: [
    {
      key: "perfil",
      label: "Seu perfil",
      options: ["Tenho filhos dependentes", "Sou autônomo", "Casal sem filhos", "Aposentado"],
    },
    {
      key: "ja_tem_seguro",
      label: "Já tem seguro de vida hoje?",
      options: ["Sim", "Não"],
    },
  ],
  condominio: [
    {
      key: "papel",
      label: "Você é",
      options: ["Síndico morador", "Síndico profissional", "Administradora"],
    },
    {
      key: "unidades",
      label: "Número de unidades",
      options: ["Até 20", "20 a 50", "Mais de 50"],
    },
  ],
};