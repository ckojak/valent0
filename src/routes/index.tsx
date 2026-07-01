import { createFileRoute } from "@tanstack/react-router";
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
