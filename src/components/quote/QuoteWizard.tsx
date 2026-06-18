import { useState } from "react";
import { StepVehicle, type VehicleData } from "./StepVehicle";
import { StepContact, type ContactData } from "./StepContact";
import { StepLoading } from "./StepLoading";
import { StepResults } from "./StepResults";
import { generateQuotes, type Quote } from "@/lib/quote-data";

type Stage = "vehicle" | "contact" | "loading" | "results";

export function QuoteWizard() {
  const [stage, setStage] = useState<Stage>("vehicle");
  const [vehicle, setVehicle] = useState<VehicleData>({ placa: "", zeroKm: false });
  const [contact, setContact] = useState<ContactData>({ name: "", email: "", phone: "" });
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const handleSubmit = (data: ContactData) => {
    setContact(data);
    setStage("loading");
    setTimeout(() => {
      setQuotes(generateQuotes(vehicle.placa + data.email));
      setStage("results");
    }, 2200);
  };

  const reset = () => {
    setStage("vehicle");
    setVehicle({ placa: "", zeroKm: false });
    setContact({ name: "", email: "", phone: "" });
    setQuotes([]);
  };

  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-cta/20 via-brand/10 to-transparent blur-2xl" />
      <div className="rounded-3xl border bg-card p-5 shadow-xl sm:p-7">
        <ProgressDots stage={stage} />
        <div className="mt-5">
          {stage === "vehicle" && (
            <StepVehicle
              initial={vehicle}
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

function ProgressDots({ stage }: { stage: Stage }) {
  const step = stage === "vehicle" ? 1 : stage === "contact" ? 2 : 3;
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            n <= step ? "bg-cta" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}
