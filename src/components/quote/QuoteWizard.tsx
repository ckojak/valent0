import { useState } from "react";
import { StepProduct, type ProductType } from "./StepProduct";
import { StepVehicle, type VehicleData } from "./StepVehicle";
import { StepContact, type ContactData } from "./StepContact";
import { StepLoading } from "./StepLoading";
import { StepResults } from "./StepResults";
import { generateQuotes, type Quote } from "@/lib/quote-data";

type Stage = "product" | "vehicle" | "contact" | "loading" | "results";

const PRODUCT_LABEL: Record<ProductType, string> = {
  auto: "Seguro Auto",
  vida: "Seguro de Vida",
  acidentes: "Acidentes Pessoais",
};

export function QuoteWizard() {
  const [stage, setStage] = useState<Stage>("product");
  const [product, setProduct] = useState<ProductType>("auto");
  const [vehicle, setVehicle] = useState<VehicleData>({ placa: "", zeroKm: false, gnv: false });
  const [contact, setContact] = useState<ContactData>({ name: "", email: "", phone: "" });
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const handleSubmit = (data: ContactData) => {
    setContact(data);
    setStage("loading");
    setTimeout(() => {
      setQuotes(generateQuotes(product + vehicle.placa + data.email));
      setStage("results");
    }, 2200);
  };

  const reset = () => {
    setStage("product");
    setVehicle({ placa: "", zeroKm: false, gnv: false });
    setContact({ name: "", email: "", phone: "" });
    setQuotes([]);
  };

  const totalSteps = product === "auto" ? 3 : 2;
  const currentStep =
    stage === "product" ? 1
    : stage === "vehicle" ? 2
    : stage === "contact" ? (product === "auto" ? 3 : 2)
    : totalSteps;

  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-cta/20 via-brand/10 to-transparent blur-2xl" />
      <div className="rounded-3xl border bg-card p-5 shadow-xl sm:p-7">
        <ProgressDots total={totalSteps} current={currentStep} />
        {stage !== "product" && stage !== "loading" && stage !== "results" && (
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            <span className="text-brand">{PRODUCT_LABEL[product]}</span>
          </p>
        )}
        <div className="mt-5">
          <div key={stage} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {stage === "product" && (
              <StepProduct
                onSelect={(p) => {
                  setProduct(p);
                  setStage(p === "auto" ? "vehicle" : "contact");
                }}
              />
            )}
            {stage === "vehicle" && (
              <StepVehicle
                initial={vehicle}
                onBack={() => setStage("product")}
                onNext={(data) => {
                  setVehicle(data);
                  setStage("contact");
                }}
              />
            )}
            {stage === "contact" && (
              <StepContact
                initial={contact}
                onBack={() => setStage(product === "auto" ? "vehicle" : "product")}
                onSubmit={handleSubmit}
              />
            )}
            {stage === "loading" && <StepLoading />}
            {stage === "results" && (
              <StepResults quotes={quotes} email={contact.email} onReset={reset} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i + 1 <= current ? "bg-cta" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}
