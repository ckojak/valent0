ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS protocolo text,
  ADD COLUMN IF NOT EXISTS pagamento_status text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS pagamento_ref text;

CREATE UNIQUE INDEX IF NOT EXISTS leads_protocolo_key ON public.leads (protocolo) WHERE protocolo IS NOT NULL;