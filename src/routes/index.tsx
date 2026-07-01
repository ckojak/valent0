import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { CategoryMenu } from "@/components/landing/CategoryMenu";
import { PromoBanner } from "@/components/landing/PromoBanner";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VALENT Corretora & Consultoria de Seguros — Proteja o que você mais valoriza" },
      {
        name: "description",
        content:
          "VALENT Corretora & Consultoria de Seguros. Cote online seguro de carro, moto, viagem, residência, saúde e empresa. Atendimento humano, 100% digital.",
      },
      { property: "og:title", content: "VALENT Corretora & Consultoria de Seguros" },
      {
        property: "og:description",
        content:
          "Entendemos a importância de proteger o que você mais valoriza. Cote agora online.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6">
        <Link to="/cotacao/auto" className="block rounded-xl bg-[#F97316] px-6 py-5 text-center text-lg font-extrabold text-white shadow-lg hover:bg-[#EA6A0C]">
          → Ir para Wizard Auto (/cotacao/auto)
        </Link>
        <Link to="/admin" className="block rounded-xl bg-[#F97316] px-6 py-5 text-center text-lg font-extrabold text-white shadow-lg hover:bg-[#EA6A0C]">
          → Ir para Painel Admin (/admin)
        </Link>
      </div>
      <main>
        <Hero />
        <PromoBanner />
        <CategoryMenu />
        <HowItWorks />
        <Benefits />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
