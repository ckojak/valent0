import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, ExternalLink, MessageCircle, type LucideIcon } from "lucide-react";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";
import type { CategorySlug } from "@/lib/category-configs";

/**
 * Cotadores públicos oficiais da Segfy vinculados à conta da Valent
 * (Configurações > Página Pública no painel Segfy).
 *
 * NOTA: essas URLs são http:// — embuti-las em <iframe> dentro do site
 * https:// é bloqueado pelos navegadores (mixed content). Por isso o fluxo
 * abre o formulário oficial em nova aba. A Segfy grava o lead sozinha;
 * não passamos pelo insertLead/Supabase nesses 4 ramos.
 *
 * Reversível: para voltar ao formulário próprio, basta restaurar a versão
 * anterior deste componente.
 */
const SEGFY_PUBLIC_QUOTE_URLS: Partial<Record<CategorySlug, string>> = {
  residencial:
    "http://gestao.segfy.com/Publico/Segurados/Orcamentos/SeguroResidencial?e=8%2F3irD2Ic86gVZNUuCIMyg%3D%3D",
  condominio:
    "http://gestao.segfy.com/Publico/Segurados/Orcamentos/SeguroCondominio?e=8%2F3irD2Ic86gVZNUuCIMyg%3D%3D",
  empresarial:
    "http://gestao.segfy.com/Publico/Segurados/Orcamentos/SeguroEmpresarial?e=8%2F3irD2Ic86gVZNUuCIMyg%3D%3D",
  vida: "http://gestao.segfy.com/Publico/Segurados/Orcamentos/SeguroVida?e=8%2F3irD2Ic86gVZNUuCIMyg%3D%3D",
};

export function GenericQuoteDialog({
  open,
  onOpenChange,
  slug,
  eyebrow,
  icon: Icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: CategorySlug;
  eyebrow: string;
  icon: LucideIcon;
}) {
  const telefone = useContatoTelefone();
  const segfyUrl = SEGFY_PUBLIC_QUOTE_URLS[slug];

  const waUrl = buildWhatsappUrl(
    telefone,
    `Olá! Tenho interesse em uma cotação de ${eyebrow.toLowerCase()}.`,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-background p-0 shadow-2xl">
        <DialogTitle className="sr-only">Cotação de {eyebrow}</DialogTitle>
        <DialogDescription className="sr-only">
          Preencha o formulário oficial de cotação de {eyebrow.toLowerCase()}.
        </DialogDescription>

        <div className="p-6">
          <div className="flex items-center gap-2 text-brand">
            <Icon className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wide">{eyebrow}</span>
          </div>
          <h3 className="mt-2 font-display text-lg font-extrabold text-foreground">
            Receba sua cotação
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Você vai preencher o formulário oficial de cotação da Valent em uma
            nova aba. Leva menos de 2 minutos.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {segfyUrl ? (
              <a
                href={segfyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-110"
              >
                Preencher cotação
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4" />
              Prefiro falar no WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Seus dados são enviados diretamente para a equipe Valent.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
