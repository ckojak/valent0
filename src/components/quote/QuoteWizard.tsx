import { useState } from "react";
import { StepVehicle, type VehicleData } from "./StepVehicle";
import { StepContact, type ContactData } from "./StepContact";
import { StepLoading } from "./StepLoading";
import { StepResults } from "./StepResults";
import { generateQuotes, type Quote } from "@/lib/quote-data";
import { insertLead } from "@/lib/leads";

type Stage = "vehicle" | "contact" | "loading" | "results";

export function QuoteWizard({ onCancel }: { onCancel?: () => void }) {
  const [stage, setStage] = useState<Stage>("vehicle");
  const [vehicle, setVehicle] = useState<VehicleData>({ placa: "", zeroKm: false, gnv: false });
  const [contact, setContact] = useState<ContactData>({ name: "", email: "", phone: "" });
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const handleSubmit = (data: ContactData) => {
    setContact(data);
    setStage("loading");
    // Fire-and-forget: falha não bloqueia o fluxo (usuário ainda vê resultados).
    void insertLead({
      nome: data.name,
      telefone: data.phone,
      email: data.email,
      tipo_seguro: "auto-simplificado",
      dados: { vehicle, source: "modal-wizard" },
    });
    setTimeout(() => {
      setQuotes(generateQuotes(vehicle.placa + data.email));
      setStage("results");
    }, 2200);
  };

  const reset = () => {
    setStage("vehicle");
    setVehicle({ placa: "", zeroKm: false, gnv: false });
    setContact({ name: "", email: "", phone: "" });
    setQuotes([]);
  };

  const totalSteps = 3;
  const currentStep =
    stage === "vehicle" ? 1
    : stage === "contact" ? 2
    : 3;

  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-brand-foreground text-[11px]">🚗</span>
        Seguro Auto
      </div>
      <ProgressDots total={totalSteps} current={currentStep} />
      <div className="mt-5">
        <div key={stage} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {stage === "vehicle" && (
            <StepVehicle
              initial={vehicle}
              onBack={() => onCancel?.()}
              onNext={(data) => {
                setVehicle(data);
                setStage("contact");
              }}
            />
          )}
          {stage === "contact" && (
            <StepContact
              initial={contact}
              onBack={() => setStage("vehicle")}
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
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i + 1 <= current ? "bg-brand" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}
