import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, HeartPulse, Smartphone, Plane, Shield, Wrench, BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import portoLogo from "@/assets/porto-logo.svg";
import pierLogo from "@/assets/logo_pier-digital.png";
import sulamericaLogo from "@/assets/logo-sulamerica-color.png";

const SAFE_EMAIL = "contato@valentseguros.com.br";

type PersonalType = "saude" | "dental" | "celular" | "equipamentos" | "viagem" | "consorcio" | "personalizado";

type FormState = {
  nome: string;
  nomeSocial?: string;
  telefone: string;
  telefoneResidencial?: string;
  celular?: string;
  email: string;
  cpf: string;
  nascimento: string;
  sexo?: string;
  estadoCivil?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo?: string;
  outroEquipamento?: string;
  valor?: string;
  observacoes?: string;
  idade?: string;
  plano?: string;
  tipoPlano?: string;
  quantasPessoas?: string;
  ddd?: string;
  tipoPessoa?: string;
  fabricante?: string;
  modeloBike?: string;
  anoFabricacao?: string;
  numeroSerie?: string;
  eletrica?: string;
  materialQuadro?: string;
  sinistros?: string;
  notaFiscal?: string;
  valorMercado?: string;
  competicoes?: string;
  coberturaBasica?: string;
  responsabilidadeCivil?: string;
  rouboCelular?: string;
  territorioInternacional?: string;
  campanha?: string;
  tipoSeguro?: string;
  inicioVigencia?: string;
  telefoneComercial?: string;
};

const TIPOS: Array<{ value: PersonalType; label: string; icon: typeof HeartPulse; description: string }> = [
  { value: "saude", label: "Seguro Saúde", icon: HeartPulse, description: "Planos individuais e familiares" },
  { value: "dental", label: "Dental", icon: HeartPulse, description: "Odontologia e planos complementares" },
  { value: "celular", label: "Seguro Celular/Notebook/Câmeras", icon: Smartphone, description: "Proteção para eletrônicos" },
  { value: "equipamentos", label: "Seguro Equipamentos", icon: Wrench, description: "Agro, construção e solar" },
  { value: "viagem", label: "Seguro Viagem", icon: Plane, description: "Cobertura nacional e internacional" },
  { value: "consorcio", label: "Consórcios", icon: BriefcaseBusiness, description: "Automóvel, imóvel e outros" },
];

const EXTERNAL_LINKS: Record<"dental" | "celular" | "viagem", Array<{ name: string; href: string; image: string; alt: string }>> = {
  dental: [{ name: "Sulamérica", href: "https://sulamericaodonto.com.br/?corretora=valentseguros", image: sulamericaLogo, alt: "Sulamérica Dental" }],
  celular: [
    { name: "Porto Seguro", href: "http://www.porto.vc/SEGUROCELULAR_BQKL5J_e91a3aca7bd0446da6ab274f946ea415", image: portoLogo, alt: "Porto Seguro" },
    { name: "Pier", href: "https://link.pier.digital/p/4b062078f4", image: pierLogo, alt: "Pier" },
  ],
  viagem: [
    { name: "Sulamérica", href: "https://portal.sulamericaseguros.com.br/seguroviagem/?idLink=CUEQNAB", image: sulamericaLogo, alt: "Sulamérica Viagem" },
    { name: "Porto Seguro", href: "http://www.porto.vc/VIAGEM_XJGZYJ_8710b38abd05428c986d33e54aa1c48d", image: portoLogo, alt: "Porto Seguro Viagem" },
  ],
};

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function PersonalizedQuote({ tipoInicial }: { tipoInicial: PersonalType }) {
  const [tipo, setTipo] = useState<PersonalType>(tipoInicial);
  const [form, setForm] = useState<FormState>({
    nome: "",
    nomeSocial: "",
    telefone: "",
    telefoneResidencial: "",
    celular: "",
    email: "",
    cpf: "",
    nascimento: "",
    sexo: "",
    estadoCivil: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    tipo: "",
    outroEquipamento: "",
    valor: "",
    observacoes: "",
    idade: "",
    plano: "",
    tipoPlano: "",
    quantasPessoas: "",
    ddd: "",
    tipoPessoa: "",
    fabricante: "",
    modeloBike: "",
    anoFabricacao: "",
    numeroSerie: "",
    eletrica: "",
    materialQuadro: "",
    sinistros: "",
    notaFiscal: "",
    valorMercado: "",
    competicoes: "",
    coberturaBasica: "",
    responsabilidadeCivil: "",
    rouboCelular: "",
    territorioInternacional: "",
    campanha: "",
    tipoSeguro: "",
    inicioVigencia: "",
    telefoneComercial: "",
  });
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const config = useMemo(() => {
    const base = TIPOS.find((item) => item.value === tipo) ?? TIPOS[0];
    const isConsorcio = tipo === "consorcio";

    return {
      title: tipo === "dental" ? "Seguro Dental" : base.label,
      icon: base.icon,
      subtitle: isConsorcio ? "Selecione o tipo e informe os dados para receber a cotação" : "Preencha os dados e nossa equipe entrará em contato",
      showHealthDetails: tipo === "saude",
      showExternalLinks: tipo === "dental" || tipo === "celular" || tipo === "viagem",
      showDeviceLogos: false,
      showEquipmentType: tipo === "equipamentos",
      showTravelLink: false,
      showConsortium: tipo === "consorcio",
      showForm: tipo === "saude" || tipo === "equipamentos" || tipo === "consorcio",
    };
  }, [tipo]);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTipoSelect(value: PersonalType) {
    setTipo(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const phoneDigits = form.telefone.replace(/\D/g, "");
      const payload = {
        nome: form.nome,
        telefone: phoneDigits,
        email: form.email,
        tipo_seguro: tipo,
        dados: {
          ...form,
          telefone: form.telefone,
          cpf: form.cpf,
          nascimento: form.nascimento,
          origem: "cotacao_personalizada",
          ddd: form.ddd || (phoneDigits.length >= 10 ? phoneDigits.slice(0, 2) : ""),
        },
      };

      const response = await fetch("/api/leads-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar dados.");
      }

      setComplete(true);
      toast.success("Agradecemos o contato, em breve um consultor retornará com sua cotação.");
    } catch {
      toast.error("Não foi possível enviar os dados agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (complete) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-foreground">Dados enviados com sucesso</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Agradecemos o contato, em breve um consultor retornará com sua cotação.
        </p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold uppercase text-brand-foreground">
          Voltar para o site
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {TIPOS.map(({ value, label, icon: Icon }) => {
          const active = value === tipo;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleTipoSelect(value)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                active ? "border-brand bg-brand-soft text-brand" : "border-border bg-background text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <config.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand">Cotação personalizada</p>
              <h1 className="font-display text-2xl font-extrabold text-foreground">{config.title}</h1>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            Voltar para o site
          </Link>
        </div>

        {config.showExternalLinks && (
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            {EXTERNAL_LINKS[tipo === "dental" ? "dental" : tipo === "celular" ? "celular" : "viagem"].map(({ name, href, image, alt }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-28 items-center justify-center rounded-2xl border border-border bg-muted/30 p-4 transition hover:-translate-y-1 hover:border-brand hover:bg-brand-soft/30"
                aria-label={name}
              >
                <img src={image} alt={alt} className="max-h-12 max-w-[180px] object-contain" />
              </a>
            ))}
          </div>
        )}

        {config.showForm && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nome</label>
                <input required value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none ring-0 transition focus:border-brand" />
              </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail</label>
              <input type="email" required value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
            </div>

            {config.showHealthDetails && (
              <>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-center text-lg font-semibold text-foreground">Para quantas pessoas seria o plano?*</label>
                  <p className="mb-3 text-center text-sm text-muted-foreground">É só digitar um número, exemplo: 1, 2, 3....</p>
                  <input
                    type="number"
                    min={1}
                    value={form.quantasPessoas ?? ""}
                    onChange={(e) => handleChange("quantasPessoas", e.target.value)}
                    placeholder="Digite o número de pessoas"
                    className="h-12 w-full rounded-xl border border-[#e5c983] bg-background px-3 text-base outline-none transition focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-3 block text-center text-lg font-semibold text-foreground">Selecione o tipo do plano*</label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {['Pessoa Física', 'Empresarial (inclusive MEI)'].map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border bg-background px-4 py-3 text-base font-medium text-foreground transition ${
                          form.tipoPlano === option ? 'border-brand bg-brand-soft text-brand' : 'border-border hover:border-brand/70'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoPlanoSaude"
                          value={option}
                          checked={form.tipoPlano === option}
                          onChange={(e) => handleChange("tipoPlano", e.target.value)}
                          className="sr-only"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-center text-lg font-semibold text-foreground">Qual o seu nome?*</label>
                  <p className="mb-2 text-center text-sm text-muted-foreground">Agora é só informar seu nome!</p>
                  <input
                    value={form.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Digite seu nome"
                    className="h-12 w-full rounded-xl border border-[#d2d1cf] bg-background px-3 text-base outline-none transition focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-center text-lg font-semibold text-foreground">Telefone*</label>
                  <p className="mb-3 text-center text-sm text-muted-foreground">Informe o seu telefone. Se a nossa equipe tiver alguma dúvida, entrará em contato com você para esclarecer e enviar os valores.</p>
                  <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                    <input
                      value={form.ddd ?? ""}
                      onChange={(e) => handleChange("ddd", e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="Seu DDD"
                      className="h-12 rounded-xl border border-[#d2d1cf] bg-background px-3 text-base outline-none transition focus:border-brand"
                    />
                    <input
                      value={form.telefone}
                      onChange={(e) => handleChange("telefone", maskPhone(e.target.value))}
                      placeholder="Telefone"
                      className="h-12 rounded-xl border border-[#d2d1cf] bg-background px-3 text-base outline-none transition focus:border-brand"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-center text-lg font-semibold text-foreground">Agora Falta Pouco! - Digite seu E-mail*</label>
                  <p className="mb-2 text-center text-sm text-muted-foreground">É só deixar o seu e-mail para podermos enviar todas as informações para você!</p>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@email.com"
                    className="h-12 w-full rounded-xl border border-[#d2d1cf] bg-background px-3 text-base outline-none transition focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Plano desejado</label>
                  <select value={form.plano ?? ""} onChange={(e) => handleChange("plano", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                    <option value="">Selecione</option>
                    <option value="individual">Individual</option>
                    <option value="familia">Família</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>
              </>
            )}

            {config.showDeviceLogos && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de aparelho</label>
                <select value={form.tipo ?? ""} onChange={(e) => handleChange("tipo", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                  <option value="">Selecione</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Notebook">Notebook</option>
                  <option value="Câmera">Câmera</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </div>
            )}

            {config.showEquipmentType && (
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de seguro do equipamento</label>
                  <select value={form.tipo ?? ""} onChange={(e) => handleChange("tipo", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                    <option value="">Selecione</option>
                    <option value="Agrícola">Agrícola</option>
                    <option value="Construção civil">Construção civil</option>
                    <option value="Energia Solar">Energia Solar</option>
                    <option value="Bike/Scooter Elétrica">Bike/Scooter Elétrica</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                {form.tipo === "Outros" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Descreva o tipo de equipamento</label>
                    <input
                      value={form.outroEquipamento ?? ""}
                      onChange={(e) => handleChange("outroEquipamento", e.target.value)}
                      placeholder="Ex: Maquinário, ferramenta, etc."
                      className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand"
                    />
                  </div>
                )}

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="mb-4 text-lg font-semibold text-foreground">Olá! Queremos te conhecer!</p>
                  <p className="mb-5 text-sm text-muted-foreground">Preencha os campos abaixo com os dados de quem será o segurado.</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Nome do segurado</label>
                      <input value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Se desejar, informe seu nome social</label>
                      <input value={form.nomeSocial ?? ""} onChange={(e) => handleChange("nomeSocial", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Telefone residencial</label>
                      <input value={form.telefoneResidencial ?? ""} onChange={(e) => handleChange("telefoneResidencial", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Celular</label>
                      <input value={form.celular ?? ""} onChange={(e) => handleChange("celular", maskPhone(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail do segurado</label>
                      <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de pessoa do segurado</label>
                      <div className="flex flex-wrap gap-4 pt-2">
                        {['Física', 'Jurídica'].map((item) => (
                          <label key={item} className="inline-flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="radio"
                              name="tipoPessoa"
                              checked={form.tipoPessoa === item}
                              onChange={() => handleChange("tipoPessoa", item)}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">CPF</label>
                      <input value={form.cpf} onChange={(e) => handleChange("cpf", maskCpf(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Sexo</label>
                      <select value={form.sexo ?? ""} onChange={(e) => handleChange("sexo", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Data de nascimento do segurado</label>
                      <input value={form.nascimento} onChange={(e) => handleChange("nascimento", formatDate(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Estado civil</label>
                      <select value={form.estadoCivil ?? ""} onChange={(e) => handleChange("estadoCivil", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)/Separado(a)/Desquitado(a)">Divorciado(a)/Separado(a)/Desquitado(a)</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">CEP</label>
                      <input value={form.cep ?? ""} onChange={(e) => handleChange("cep", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Endereço</label>
                      <input value={form.endereco ?? ""} onChange={(e) => handleChange("endereco", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Número</label>
                      <input value={form.numero ?? ""} onChange={(e) => handleChange("numero", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Complemento</label>
                      <input value={form.complemento ?? ""} onChange={(e) => handleChange("complemento", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Bairro</label>
                      <input value={form.bairro ?? ""} onChange={(e) => handleChange("bairro", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Cidade</label>
                      <input value={form.cidade ?? ""} onChange={(e) => handleChange("cidade", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Estado</label>
                      <input value={form.estado ?? ""} onChange={(e) => handleChange("estado", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="mb-4 text-lg font-semibold text-foreground">Fale um pouco do seguro que será contratado!</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Fabricante</label>
                      <select value={form.fabricante ?? ""} onChange={(e) => handleChange("fabricante", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Caloi">Caloi</option>
                        <option value="Cannondale">Cannondale</option>
                        <option value="Oggi">Oggi</option>
                        <option value="Scott">Scott</option>
                        <option value="Specialized">Specialized</option>
                        <option value="Trek">Trek</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Qual o modelo da bike?</label>
                      <input value={form.modeloBike ?? ""} onChange={(e) => handleChange("modeloBike", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Ano de fabricação</label>
                      <select value={form.anoFabricacao ?? ""} onChange={(e) => handleChange("anoFabricacao", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        {Array.from({ length: 11 }, (_, idx) => 2013 + idx).map((year) => (
                          <option key={year} value={String(year)}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Número de série</label>
                      <input value={form.numeroSerie ?? ""} onChange={(e) => handleChange("numeroSerie", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">É elétrica?</label>
                      <select value={form.eletrica ?? ""} onChange={(e) => handleChange("eletrica", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não, é comum / tradicional">Não, é comum / tradicional</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">O quadro da bike é composto por:</label>
                      <select value={form.materialQuadro ?? ""} onChange={(e) => handleChange("materialQuadro", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Aço">Aço</option>
                        <option value="Alumínio">Alumínio</option>
                        <option value="Carbono">Carbono</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Quantidade de sinistros da apólice anterior</label>
                      <input value={form.sinistros ?? ""} onChange={(e) => handleChange("sinistros", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Possui a nota fiscal?</label>
                      <select value={form.notaFiscal ?? ""} onChange={(e) => handleChange("notaFiscal", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Quanto o mercado paga por sua bike?</label>
                      <input value={form.valorMercado ?? ""} onChange={(e) => handleChange("valorMercado", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">É utilizada em competições?</label>
                      <select value={form.competicoes ?? ""} onChange={(e) => handleChange("competicoes", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Cobertura básica</label>
                      <select value={form.coberturaBasica ?? ""} onChange={(e) => handleChange("coberturaBasica", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Danos à bike">Danos à bike</option>
                        <option value="Roubo / Furto qualificado">Roubo / Furto qualificado</option>
                        <option value="Danos à bike + Roubo / Furto qualificado">Danos à bike + Roubo / Furto qualificado</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Cobertura de Responsabilidade Civil</label>
                      <select value={form.responsabilidadeCivil ?? ""} onChange={(e) => handleChange("responsabilidadeCivil", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="100%">100%</option>
                        <option value="200%">200%</option>
                        <option value="300%">300%</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Cobertura para roubo de celular / smartwatch</label>
                      <select value={form.rouboCelular ?? ""} onChange={(e) => handleChange("rouboCelular", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Não contratada">Não contratada</option>
                        <option value="5%">5%</option>
                        <option value="10%">10%</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Deseja estender a cobertura para território internacional?</label>
                      <select value={form.territorioInternacional ?? ""} onChange={(e) => handleChange("territorioInternacional", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Não contratada">Não contratada</option>
                        <option value="Apenas para América do Sul e América Central">Apenas para América do Sul e América Central</option>
                        <option value="Apenas para América do Norte e Europa">Apenas para América do Norte e Europa</option>
                        <option value="Apenas para África, Ásia, Oceania e Antártida">Apenas para África, Ásia, Oceania e Antártida</option>
                        <option value="Sim, para todos os continentes">Sim, para todos os continentes</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Campanha</label>
                      <input value={form.campanha ?? ""} onChange={(e) => handleChange("campanha", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de seguro</label>
                      <select value={form.tipoSeguro ?? ""} onChange={(e) => handleChange("tipoSeguro", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                        <option value="">Selecione</option>
                        <option value="Seguro novo">Seguro novo</option>
                        <option value="Renovação da própria corretora">Renovação da própria corretora</option>
                        <option value="Renovação de outra corretora">Renovação de outra corretora</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Início de vigência</label>
                      <input value={form.inicioVigencia ?? ""} onChange={(e) => handleChange("inicioVigencia", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Telefone Comercial</label>
                      <input value={form.telefoneComercial ?? ""} onChange={(e) => handleChange("telefoneComercial", maskPhone(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Observações (Impressas no orçamento)</label>
                      <textarea rows={4} value={form.observacoes ?? ""} onChange={(e) => handleChange("observacoes", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 outline-none transition focus:border-brand" placeholder="Descreva observações para o orçamento..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {config.showConsortium && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Tipo de consórcio</label>
                  <select value={form.tipo ?? ""} onChange={(e) => handleChange("tipo", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                    <option value="">Selecione</option>
                    <option value="Automóvel">Automóvel</option>
                    <option value="Caminhão">Caminhão</option>
                    <option value="Motocicleta">Motocicleta</option>
                    <option value="Imóvel">Imóvel</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Valor do consórcio</label>
                  <select value={form.valor ?? ""} onChange={(e) => handleChange("valor", e.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand">
                    <option value="">Selecione</option>
                    <option value="R$ 50.000,00">R$ 50.000,00</option>
                    <option value="R$ 100.000,00">R$ 100.000,00</option>
                    <option value="R$ 200.000,00">R$ 200.000,00</option>
                    <option value="R$ 500.000,00">R$ 500.000,00</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {form.valor === "Outro" && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Informe o valor do consórcio</label>
                    <input
                      value={form.valor === "Outro" ? "" : form.valor ?? ""}
                      onChange={(e) => handleChange("valor", e.target.value)}
                      placeholder="Ex: R$ 150.000,00"
                      className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand"
                    />
                  </div>
                )}
              </>
            )}

            {!config.showConsortium && !config.showEquipmentType && !config.showHealthDetails && !config.showDeviceLogos && !config.showTravelLink && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">CPF</label>
                <input value={form.cpf} onChange={(e) => handleChange("cpf", maskCpf(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
              </div>
            )}

            {config.showConsortium && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">CPF</label>
                <input value={form.cpf} onChange={(e) => handleChange("cpf", maskCpf(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
              </div>
            )}

            {config.showConsortium && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Data de Nascimento</label>
                <input value={form.nascimento} onChange={(e) => handleChange("nascimento", formatDate(e.target.value))} className="h-11 w-full rounded-xl border bg-background px-3 outline-none transition focus:border-brand" />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Observações</label>
              <textarea rows={4} value={form.observacoes ?? ""} onChange={(e) => handleChange("observacoes", e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 outline-none transition focus:border-brand" placeholder="Descreva sua necessidade ou preferências..." />
            </div>
          </div>

            <div className="flex items-center justify-between gap-4 border-t pt-4">
              <div className="text-xs text-muted-foreground">E-mail da corretora: {SAFE_EMAIL}</div>
              <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold uppercase text-brand-foreground disabled:opacity-60">
                {loading ? "Enviando..." : "Solicitar cotação"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
