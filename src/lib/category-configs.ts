import {
  Car,
  Home as HomeIcon,
  Building2,
  HeartPulse,
  Building,
  type LucideIcon,
  ShieldCheck,
  Wallet,
  Users,
  Clock,
  Wrench,
  Sparkles,
  Flame,
  Droplet,
  Zap,
  Briefcase,
  Truck,
  Package,
  Baby,
  UserCheck,
  Handshake,
  DollarSign,
  MapPin,
  PawPrint,
  KeyRound,
} from "lucide-react";

export type CategorySlug = "auto" | "residencial" | "empresarial" | "vida" | "condominio";

export type Cobertura = {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
};

export type Persona = {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
};

export type FaqItem = { pergunta: string; resposta: string };

export type CategoryConfig = {
  slug: CategorySlug;
  icon: LucideIcon;
  eyebrow: string;
  titulo: string;
  destaque: string;
  subtitulo: string;
  heroBadges: string[];
  coberturas: Cobertura[];
  personas: Persona[];
  faq: FaqItem[];
  ctaTitulo: string;
  ctaSubtitulo: string;
  ctaLabel: string;
  /** Auto vai para /cotacao/auto. Demais abrem o wizard modal simplificado. */
  quoteHref?: string;
  metaTitle: string;
  metaDescription: string;
};

export const CATEGORY_CONFIGS: Record<CategorySlug, CategoryConfig> = {
  auto: {
    slug: "auto",
    icon: Car,
    eyebrow: "Seguro Auto",
    titulo: "Proteja seu carro com quem",
    destaque: "cuida de cada detalhe.",
    subtitulo:
      "Compare as melhores seguradoras do Brasil em poucos minutos, sem ligar pra ninguém e sem enrolação.",
    heroBadges: ["3 seguradoras comparadas", "Cotação em 2 minutos", "Sem custo pra você"],
    coberturas: [
      { icon: ShieldCheck, titulo: "Cobertura compreensiva", descricao: "Colisão, roubo, furto, incêndio e fenômenos da natureza. Seu carro protegido no que der." },
      { icon: Wallet, titulo: "Danos a terceiros", descricao: "Cobrimos materiais e corporais causados a outras pessoas em caso de acidente." },
      { icon: Sparkles, titulo: "Vidros, faróis e retrovisores", descricao: "Trinca ou quebra? Trocamos rápido, com franquia reduzida ou sem franquia." },
      { icon: Car, titulo: "Carro reserva", descricao: "Enquanto o seu está na oficina, você segue sua rotina sem parar." },
      { icon: Wrench, titulo: "Assistência 24h", descricao: "Guincho, chaveiro, troca de pneu, pane seca. É só ligar." },
      { icon: MapPin, titulo: "Rastreamento e localização", descricao: "Opcional em algumas seguradoras, com desconto expressivo no prêmio." },
    ],
    personas: [
      { icon: Users, titulo: "Motorista de app", descricao: "Uber, 99 e delivery. Coberturas específicas pra quem roda muito." },
      { icon: Baby, titulo: "Família com crianças", descricao: "Cadeirinha, carro reserva e assistência 24h pra rodar tranquilo." },
      { icon: KeyRound, titulo: "Comprou o primeiro carro", descricao: "Perfil sem histórico? A gente ajuda a encontrar seguradora que aceita." },
      { icon: Sparkles, titulo: "Zero KM ou seminovo", descricao: "Cobertura de valor de mercado ou valor determinado, você escolhe." },
    ],
    faq: [
      { pergunta: "Quanto tempo demora pra receber a apólice?", resposta: "Depois que você aceita a proposta, a apólice sai em até 48h úteis. Enquanto isso já tem cobertura provisória." },
      { pergunta: "Posso parcelar o seguro?", resposta: "Sim, todas as seguradoras que trabalhamos oferecem parcelamento em até 12x sem juros no cartão ou boleto." },
      { pergunta: "E se eu tiver sinistro?", resposta: "Você aciona direto pelo app da seguradora ou pelo nosso WhatsApp, e a gente acompanha o processo com você." },
      { pergunta: "Meu carro precisa ter rastreador?", resposta: "Não é obrigatório, mas em alguns perfis ele reduz muito o preço. A gente te avisa quando compensa." },
    ],
    ctaTitulo: "Pronto pra cotar?",
    ctaSubtitulo: "3 seguradoras comparadas de graça, em menos de 3 minutos.",
    ctaLabel: "Cotar seguro auto agora",
    quoteHref: "/cotacao/auto",
    metaTitle: "Seguro Auto — VALENT Corretora & Consultoria",
    metaDescription:
      "Compare seguros de carro em minutos com a VALENT. Porto, Azul, Allianz e outras. Cote online, sem custo.",
  },
  residencial: {
    slug: "residencial",
    icon: HomeIcon,
    eyebrow: "Seguro Residencial",
    titulo: "Sua casa protegida por",
    destaque: "muito menos do que você imagina.",
    subtitulo:
      "Incêndio, roubo, danos elétricos e até assistência pra encanador e chaveiro. Tudo em uma única apólice.",
    heroBadges: ["Cobertura 24h", "Assistências inclusas", "A partir de R$ 30/mês"],
    coberturas: [
      { icon: Flame, titulo: "Incêndio e explosão", descricao: "Cobertura total pra estrutura e conteúdo em caso de sinistro." },
      { icon: ShieldCheck, titulo: "Roubo e furto qualificado", descricao: "Ressarcimento dos bens levados, com vistoria simplificada." },
      { icon: Zap, titulo: "Danos elétricos", descricao: "Queima de eletrodomésticos por raio ou variação de tensão." },
      { icon: Droplet, titulo: "Vazamento e alagamento", descricao: "Cobertura pra danos causados por água em cômodos e móveis." },
      { icon: Wrench, titulo: "Assistência residencial 24h", descricao: "Chaveiro, encanador, eletricista e vidraceiro sem custo extra." },
      { icon: PawPrint, titulo: "Cobertura pet (opcional)", descricao: "Consultas emergenciais e vacinas pra seu cachorro ou gato." },
    ],
    personas: [
      { icon: HomeIcon, titulo: "Proprietário de imóvel", descricao: "Proteja o maior patrimônio da família." },
      { icon: KeyRound, titulo: "Alugou e quer se cobrir", descricao: "Seguro fiança e conteúdo próprio, sem depender do dono." },
      { icon: Users, titulo: "Casa em condomínio", descricao: "Cobertura complementar à taxa do condomínio." },
      { icon: MapPin, titulo: "Casa de praia ou campo", descricao: "Cobertura pra imóveis desocupados grande parte do ano." },
    ],
    faq: [
      { pergunta: "Preciso ter alarme ou grade?", resposta: "Não é obrigatório, mas em alguns bairros pode reduzir o valor da apólice." },
      { pergunta: "Cobre bicicleta e eletrônicos?", resposta: "Sim, com cobertura opcional e limites acordados na contratação." },
      { pergunta: "Vale pra imóvel financiado?", resposta: "Sim. Inclusive é comum ter uma cobertura complementar melhor que a do próprio financiamento." },
      { pergunta: "E se meu imóvel ficar vazio por meses?", resposta: "Tem cobertura específica pra casa de temporada. Basta avisar na cotação." },
    ],
    ctaTitulo: "Sua casa merece proteção completa",
    ctaSubtitulo: "Fale com um consultor agora e receba propostas sob medida.",
    ctaLabel: "Quero cotar residencial",
    metaTitle: "Seguro Residencial — VALENT Corretora & Consultoria",
    metaDescription:
      "Seguro residencial completo: incêndio, roubo, danos elétricos e assistência 24h. Cote com a VALENT.",
  },
  empresarial: {
    slug: "empresarial",
    icon: Briefcase,
    eyebrow: "Seguro Empresarial",
    titulo: "Seu negócio operando",
    destaque: "sem sustos.",
    subtitulo:
      "Estoque, equipamentos, responsabilidade civil e paralisação de atividades. Feito sob medida pro seu segmento.",
    heroBadges: ["Sob medida", "Consultoria dedicada", "Cotação personalizada"],
    coberturas: [
      { icon: Flame, titulo: "Incêndio empresarial", descricao: "Cobre estoque, máquinas e o próprio imóvel em caso de sinistro." },
      { icon: Package, titulo: "Estoque e mercadorias", descricao: "Ressarcimento pra perdas por roubo, quebra e sinistros diversos." },
      { icon: Zap, titulo: "Equipamentos eletrônicos", descricao: "Computadores, servidores, câmeras e maquinário protegidos." },
      { icon: Handshake, titulo: "Responsabilidade civil", descricao: "Cobre danos a clientes e terceiros dentro e fora do estabelecimento." },
      { icon: Clock, titulo: "Lucros cessantes", descricao: "Se o sinistro paralisa a operação, cobrimos o faturamento do período." },
      { icon: Truck, titulo: "Transporte de carga", descricao: "Opcional pra empresas que despacham mercadoria periodicamente." },
    ],
    personas: [
      { icon: Building2, titulo: "Comércio e varejo", descricao: "Lojas físicas, e-commerce e prestadores de serviço." },
      { icon: Wrench, titulo: "Indústria e oficinas", descricao: "Cobertura pra maquinário e responsabilidade civil ampla." },
      { icon: Package, titulo: "Restaurantes e food service", descricao: "Estoque, cozinha, equipamentos e responsabilidade civil." },
      { icon: Truck, titulo: "Frotas e logística", descricao: "Gestão de veículos, carga e assistência integrada." },
    ],
    faq: [
      { pergunta: "Qual porte de empresa vocês atendem?", resposta: "Do MEI ao médio porte. Empresas maiores passam por análise personalizada." },
      { pergunta: "Tem cobertura pra ataque cibernético?", resposta: "Sim, opcional. Fica combinada durante a cotação com base no risco do negócio." },
      { pergunta: "Vocês emitem apólices pra licitação?", resposta: "Sim, com seguro garantia e responsabilidade civil profissional." },
    ],
    ctaTitulo: "Fale com um consultor de negócios",
    ctaSubtitulo: "Cotação empresarial é personalizada. A gente monta a proposta com você.",
    ctaLabel: "Quero cotar empresarial",
    metaTitle: "Seguro Empresarial — VALENT Corretora & Consultoria",
    metaDescription:
      "Seguro empresarial sob medida: incêndio, estoque, RC e lucros cessantes. Consultoria VALENT.",
  },
  vida: {
    slug: "vida",
    icon: HeartPulse,
    eyebrow: "Seguro de Vida",
    titulo: "Tranquilidade financeira pra",
    destaque: "quem você ama.",
    subtitulo:
      "Cobertura por morte, invalidez, doenças graves e assistência funeral. Simples, acessível e sem burocracia.",
    heroBadges: ["Sem exame médico em muitos casos", "Cobertura 24h", "Renovação garantida"],
    coberturas: [
      { icon: HeartPulse, titulo: "Morte por qualquer causa", descricao: "Indenização integral pra beneficiários indicados." },
      { icon: UserCheck, titulo: "Invalidez total ou parcial", descricao: "Cobertura em caso de acidente que impeça o trabalho." },
      { icon: ShieldCheck, titulo: "Doenças graves", descricao: "Adiantamento em caso de câncer, AVC, infarto e outras condições." },
      { icon: DollarSign, titulo: "Renda mensal opcional", descricao: "Pensão temporária pra família em caso de sinistro." },
      { icon: Handshake, titulo: "Assistência funeral", descricao: "Inclusa em quase todos os planos, com cobertura nacional." },
      { icon: Users, titulo: "Cobertura familiar", descricao: "Estenda a proteção a cônjuge e filhos com poucos reais a mais." },
    ],
    personas: [
      { icon: Users, titulo: "Pais e mães de família", descricao: "Garantia de renda pros filhos em qualquer cenário." },
      { icon: Briefcase, titulo: "Autônomos e empreendedores", descricao: "Sem carteira assinada, o seguro faz o papel do INSS." },
      { icon: HeartPulse, titulo: "Casais sem filhos", descricao: "Proteção mútua pra manter o padrão de vida do parceiro." },
      { icon: UserCheck, titulo: "Aposentados ativos", descricao: "Cobertura contra doenças graves e assistência ampla." },
    ],
    faq: [
      { pergunta: "Preciso fazer exame médico?", resposta: "Depende do valor de cobertura. Até certos limites é só um questionário rápido." },
      { pergunta: "O prêmio aumenta com a idade?", resposta: "Sim, geralmente a cada faixa etária. Contratar cedo trava condições melhores." },
      { pergunta: "Posso mudar os beneficiários?", resposta: "A qualquer momento, sem custo, direto com a seguradora." },
    ],
    ctaTitulo: "Proteja quem depende de você",
    ctaSubtitulo: "Cotamos gratuitamente as principais seguradoras do país.",
    ctaLabel: "Quero cotar seguro de vida",
    metaTitle: "Seguro de Vida — VALENT Corretora & Consultoria",
    metaDescription:
      "Seguro de vida com cobertura por morte, invalidez, doenças graves e assistência funeral. Cote com a VALENT.",
  },
  condominio: {
    slug: "condominio",
    icon: Building,
    eyebrow: "Seguro Condomínio",
    titulo: "Segurança e conformidade",
    destaque: "pro seu condomínio.",
    subtitulo:
      "Seguro obrigatório por lei, com coberturas amplas pra áreas comuns, funcionários e responsabilidade civil.",
    heroBadges: ["Cobertura obrigatória por lei", "RC condomínio inclusa", "Assistência 24h"],
    coberturas: [
      { icon: Flame, titulo: "Incêndio e explosão", descricao: "Cobertura obrigatória, exigida pela legislação condominial." },
      { icon: Zap, titulo: "Danos elétricos", descricao: "Pra elevadores, portões automáticos, bombas e sistema de segurança." },
      { icon: Handshake, titulo: "RC condomínio", descricao: "Cobre danos a moradores, visitantes e prestadores em áreas comuns." },
      { icon: UserCheck, titulo: "RC funcionários", descricao: "Cobertura pra acidentes de trabalho com porteiros, zeladores e faxineiros." },
      { icon: Wrench, titulo: "Assistência 24h", descricao: "Encanador, eletricista, chaveiro e desentupidora sem custo extra." },
      { icon: ShieldCheck, titulo: "Roubo e furto", descricao: "Cobertura pra bens comuns do condomínio (portaria, salão, academia)." },
    ],
    personas: [
      { icon: Building, titulo: "Síndico profissional", descricao: "Toda a documentação e conformidade em ordem, sem dor de cabeça." },
      { icon: Users, titulo: "Síndico morador", descricao: "Consultoria pra escolher a apólice certa sem depender de administradora." },
      { icon: Briefcase, titulo: "Administradora", descricao: "Cotação centralizada pra vários condomínios da sua carteira." },
      { icon: HomeIcon, titulo: "Prédio novo em entrega", descricao: "Contratação alinhada com a entrega das chaves." },
    ],
    faq: [
      { pergunta: "O seguro de condomínio é mesmo obrigatório?", resposta: "Sim, previsto no Código Civil e na convenção condominial. É responsabilidade do síndico." },
      { pergunta: "Cobre a unidade dentro do apartamento?", resposta: "Não. Áreas privativas são cobertas pelo seguro residencial de cada morador." },
      { pergunta: "Como funciona o sinistro?", resposta: "O síndico aciona a seguradora ou nosso WhatsApp; enviamos vistoria e acompanhamos o processo." },
    ],
    ctaTitulo: "Cotamos seu condomínio",
    ctaSubtitulo: "Consultoria dedicada pra síndico ou administradora.",
    ctaLabel: "Quero cotar condomínio",
    metaTitle: "Seguro Condomínio — VALENT Corretora & Consultoria",
    metaDescription:
      "Seguro condomínio obrigatório com RC, incêndio, danos elétricos e assistência 24h. Cote com a VALENT.",
  },
};

export function isCategorySlug(v: string): v is CategorySlug {
  return v in CATEGORY_CONFIGS;
}
