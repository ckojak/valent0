
## Landing Page: Corretora de Seguros

A mobile-first, conversion-focused landing page for an auto insurance brokerage, inspired by Minuto Seguros, with an interactive quote wizard and simulated results.

### Design system
- Palette (added as tokens in `src/styles.css`):
  - White `#FFFFFF` (background/surfaces)
  - Deep Blue `#0A2A66` (primary, headings, trust)
  - Vibrant Green `#16C172` (CTA, accents)
  - Supporting neutrals (slate-50/100, slate-600) for body text and borders
- Typography: Inter/Manrope pairing via `<link>` in `__root.tsx` + `@theme` font tokens — clean, trustworthy.
- Rounded-2xl cards, soft shadows, generous spacing. Mobile-first; hero stacks form below headline on small screens, side-by-side on `md+`.

### Page structure (single route: `/`)
Sections rendered top-to-bottom on `src/routes/index.tsx`:
1. **Header / Nav** — logo (text mark "SeguroJá" placeholder), minimal links, phone CTA.
2. **Hero** — headline "Cote online, compare e economize no seu seguro", subhead, trust badges (SSL, +500k clientes, parceiros), and the wizard card.
3. **Trust strip** — row of insurer name placeholders (Porto Seguro, Bradesco, Tokio Marine, Allianz, HDI, SulAmérica).
4. **How it works** — 3 steps with Lucide icons (Search, Scale, ShieldCheck).
5. **Benefits** — 4-card grid (best price, 100% online, especialistas, suporte).
6. **FAQ** — accordion (shadcn).
7. **Footer** — minimal, with CNPJ/Susep placeholder lines for credibility.

### Multi-step quote wizard (core interaction)
Single state machine inside one card component, no route changes — modal-like progression.

States: `step1` → `step2` → `loading` → `results` → (toast fires on entering results).

- **Step 1 — Veículo**
  - Input `Placa do veículo` (auto-uppercase, formatted ABC-1D23 / ABC-1234)
  - Toggle (shadcn Switch) `Zero KM` — disables placa input when on
  - Button "Continuar" (green)
- **Step 2 — Seus dados**
  - Name, Email, Phone/WhatsApp (masked `(11) 99999-9999`)
  - Back button + "Cotar Agora" (green primary)
  - Lightweight validation (required + email regex + phone length)
- **Loading**
  - Centered spinner + rotating messages ("Consultando seguradoras...", "Comparando preços...", "Quase lá..."), ~2.2s simulated.
- **Results**
  - Heading "Encontramos 4 ofertas para você"
  - 4 quote cards (Porto Seguro, Bradesco, Tokio Marine, Allianz):
    - Insurer logo placeholder (initials in colored circle)
    - Coverage summary line
    - Total price (R$) + "12x sem juros de R$ XX,XX"
    - "Contratar" button (green) + "Ver detalhes" (ghost)
    - "Mais escolhido" badge on the best-price card
  - On mount: `toast.success("Cotação enviada para o seu e-mail!")` via sonner (already wired in modern stack).
  - "Nova cotação" link resets wizard to step 1.

### File layout (modular)
- `src/routes/index.tsx` — composes sections, sets SEO head().
- `src/components/landing/Header.tsx`
- `src/components/landing/Hero.tsx` — headline + `<QuoteWizard />`
- `src/components/landing/TrustStrip.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/Benefits.tsx`
- `src/components/landing/Faq.tsx`
- `src/components/landing/Footer.tsx`
- `src/components/quote/QuoteWizard.tsx` — state machine, renders step components
- `src/components/quote/StepVehicle.tsx`
- `src/components/quote/StepContact.tsx`
- `src/components/quote/StepLoading.tsx`
- `src/components/quote/StepResults.tsx`
- `src/components/quote/QuoteCard.tsx`
- `src/components/quote/InsurerLogo.tsx` — colored-initial placeholder
- `src/lib/quote-data.ts` — mock insurers + price generator
- `src/lib/masks.ts` — placa/phone formatters

### Technical details
- Tailwind v4 tokens added to `src/styles.css` under `@theme inline` (e.g. `--color-brand`, `--color-brand-cta`) mapped to `:root` oklch values. No hardcoded color utilities in components.
- Fonts loaded via `<link>` in `src/routes/__root.tsx` head.
- Toast: import `toast` from `sonner`; `<Toaster />` is already rendered in the modern stack root — verify and add if missing.
- Icons: `lucide-react` (Car, ShieldCheck, Search, Scale, Star, Mail, Phone, Loader2, Check, ChevronRight, ChevronLeft).
- No backend, no Lovable Cloud — all interactions are local state + setTimeout simulation, per the brief.
- SEO: update `head()` in `index.tsx` with PT-BR title "Seguro Auto Online — Cote, Compare e Economize | SeguroJá", meta description (<160 chars), og tags, single H1 in Hero.
- Fully responsive: mobile-first; hero `grid-cols-1 lg:grid-cols-2`; wizard card full-width on mobile, fixed max-width on desktop; touch-friendly tap targets (min 44px); inputs use `inputMode` for numeric fields.

### Out of scope
- No real API calls or email sending (simulated only).
- No persistence, auth, or admin views.
- No dark mode.
