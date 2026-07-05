import { Link } from "@tanstack/react-router";
import { Car, Home as HomeIcon, Building2, Heart, Building, ArrowRight, type LucideIcon } from "lucide-react";

type Cat = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
};

const CATS: Cat[] = [
  { icon: Car, title: "Seguro Auto", desc: "Proteção completa para seu carro, moto ou veículo especial.", href: "/cotacao/auto" },
  { icon: HomeIcon, title: "Seguro Residencial", desc: "Sua casa protegida contra imprevistos do dia a dia.", href: "/seguros/residencial" },
  { icon: Building2, title: "Seguro Empresarial", desc: "Segurança para sua empresa crescer com tranquilidade.", href: "/seguros/empresarial" },
  { icon: Heart, title: "Seguro de Vida", desc: "Proteção financeira para quem você mais ama.", href: "/seguros/vida" },
  { icon: Building, title: "Seguro Condomínio", desc: "Proteção completa para seu condomínio e seus condôminos.", href: "/seguros/condominio" },
];

export function CategoryMenu() {
  return (
    <section id="categorias" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Encontre o seguro <span className="text-brand">ideal</span> para você
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CATS.map(({ icon: Icon, title, desc, href }) => (
          <Link
            key={title}
            to={href}
            className="group flex min-h-[130px] flex-col rounded-2xl border bg-card p-4 shadow-[0_10px_30px_-18px_oklch(0.2_0.05_60/0.25)] transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_18px_40px_-18px_oklch(0.7_0.19_47/0.35)]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl text-brand">
              <Icon className="h-7 w-7" strokeWidth={1.8} />
            </span>
            <h3 className="mt-2 font-display text-base font-extrabold text-foreground">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            <span className="mt-auto flex items-center pt-2 text-brand">
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}