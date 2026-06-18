import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seguro Auto Online — Cote, Compare e Economize | Washington Seguros" },
      {
        name: "description",
        content:
          "Cote seu seguro auto online em 1 minuto e compare propostas das maiores seguradoras. 100% digital, sem ligações.",
      },
      { property: "og:title", content: "Washington Seguros — Cote, compare e economize no seu seguro" },
      {
        property: "og:description",
        content:
          "Cotação online de seguro auto em minutos. Compare Porto Seguro, Bradesco, Tokio Marine, Allianz e mais.",
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
        <TrustStrip />
        <HowItWorks />
        <Benefits />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
