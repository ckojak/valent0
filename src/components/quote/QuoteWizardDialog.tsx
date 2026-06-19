import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QuoteWizard } from "./QuoteWizard";

export function QuoteWizardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-background p-0 shadow-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">Cotação de Seguro Auto</DialogTitle>
        <DialogDescription className="sr-only">
          Preencha os dados do veículo e contato para receber as melhores ofertas.
        </DialogDescription>
        <div className="p-5 sm:p-6">
          <QuoteWizard
            key={open ? "open" : "closed"}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
