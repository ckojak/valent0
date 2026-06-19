# VALENT Corretora — Plan

Full rebrand and restructure of the existing landing page. The page becomes a mobile-first "categorized menu" home, with the multi-step quote wizard reserved exclusively for the **Carro** entry inside a modal.

## 1. Design System (src/styles.css)

Replace the current Deep Blue + Green tokens with a **Vibrant Orange / Clean White** system. Remove every blue/green reference.

- `--brand: oklch(...)` ≈ `#F97316` (vibrant orange) — used for logo, accents, primary CTAs.
- `--brand-foreground: white`
- `--brand-soft: oklch(0.97 0.03 60)` — soft orange tint for chips, highlights, hover.
- `--cta` and `--cta-hover` are remapped to the orange family (no green).
- `--ring`, `--primary`, `--accent-foreground` all point to orange.
- Background stays clean white; foreground a near-black neutral; borders a warm light gray.
- Premium native-app feel: `--radius: 1rem`, soft shadow token `--shadow-card: 0 8px 24px -12px oklch(0.2 0.05 60 / 0.18)`.
- Keep Inter / Manrope fonts.

A search across the codebase will replace any lingering `text-brand`/`bg-brand` usages that visually rendered blue — tokens change in one place, classes stay.

## 2. Branding updates

- **Header (`Header.tsx`)**: Replace name with **"VALENT"** + tagline `Corretora & Consultoria de Seguros`. Logo placeholder: a rounded orange tile with a `Home` Lucide icon framed by two small `Hand`-style accents (placeholder for "orange hands holding a house"). Replace the phone CTA with a **WhatsApp** button (Lucide `MessageCircle` icon, label "WhatsApp", orange-tinted).
- **Footer**: "VALENT Corretora & Consultoria de Seguros".
- **`__root.tsx` / `index.tsx` SEO**: title + meta updated to VALENT.
- **Hero**: simplify to a single clean headline — *"Entendemos a importância de proteger o que você mais valoriza!"* — plus a short supporting line. Remove the inline wizard from the hero; the wizard now only opens from the Carro item.
- Remove the old "Mais rápido em direção ao seu destino" slogan.

## 3. Home view — Categorized Menu

New component: `src/components/landing/CategoryMenu.tsx` rendering **3 expandable card sections** built on the existing shadcn `Accordion` (each section open by default on desktop, collapsible on mobile for native-app feel).

Each section is a rounded card with soft shadow, generous padding, an orange section header (icon + title), and a vertical list of items. Each item row:

- Left: Lucide icon in a soft orange chip.
- Middle: item label (semibold) + tiny muted subtitle.
- Right: action icon — `ShoppingCart` for direct-quote items, `ChevronRight` for "fale com consultor" items.
- Tap target ≥ 56px, divider between rows, hover/active state in `--brand-soft`.

Sections and items (icons in parens):

**Para seu Veículo** (`Car` header)
- Speed, Mountain Bike e Passeio (`Bike`)
- Scooter, Patinete e Bike Elétricos (`Zap`)
- Moto (`Bike` rotated / `Gauge`) — using `Bike` is fine; alt: `CircleGauge`
- **Carro** (`Car`) — the only item that opens the wizard modal; right icon = `ShoppingCart`.

**Para Você e sua família** (`Users` header)
- Viagem (`Plane`)
- Celular (`Smartphone`)
- Residência (`Home`)
- Saúde (`HeartPulse`)

**Para sua Empresa** (`Briefcase` header)
- Incêndio empresarial (`Flame`)
- Frota de veículos (`Truck`)
- Caminhão (`Truck`)
- Saúde Empresarial (`Stethoscope`)

Non-Carro items: clicking shows a small toast *"Em breve — fale com um consultor pelo WhatsApp"* (no route changes, no wizard). This keeps the focus on the Carro engine as specified.

Data lives in `src/lib/menu-data.ts` so sections/items stay declarative.

## 4. Carro Quote Wizard — Modal

Wrap the existing `QuoteWizard` flow in a shadcn `Dialog` and trigger it **only** from the Carro row.

- New component: `src/components/quote/QuoteWizardDialog.tsx`. Props: `open`, `onOpenChange`. Renders the wizard inside a full-height sheet on mobile (`max-w-md`, rounded top, slide-in) and a centered dialog on desktop.
- Strip the "Seguro Auto / Vida / Acidentes" product step — Carro is implicit. Wizard stages become: `vehicle` → `contact` → `loading` → `results`. Progress dots updated to 3 steps.
- **Step 1 (Vehicle)** — keep current `StepVehicle` with: Placa input, Zero KM toggle, Kit Gás (GNV) toggle, FIPE success line *"Veículo localizado na base FIPE ✓"* shown when the plate is valid. Back button closes the modal.
- **Step 2 (Lead Capture)** — keep `StepContact` (Name, Email, Phone). Submit button label becomes **"Cotar Agora"**, vibrant orange.
- **Step 3 (Loading)** — `StepLoading` text changes to *"Consultando seguradoras via API..."*.
- **Step 4 (Results)** — `StepResults` shows 3 cards (Tokio Marine, Porto Seguro, Bradesco) — trim Allianz from `quote-data.ts` to land on 3. Each card: insurer logo placeholder, total price, *"12x sem juros"* installment, **Contratar** button (orange) + secondary "Ver detalhes". Toast on mount: *"Cotação enviada para o seu e-mail!"*.
- Closing the dialog resets the wizard state.

`QuoteWizard.tsx` is simplified accordingly (no product stage, no `StepProduct` import). `StepProduct.tsx` is deleted.

## 5. Section cleanup

The standalone `Hero`, `TrustStrip`, `HowItWorks`, `Benefits`, and `Faq` sections stay but adopt the orange palette automatically through tokens. The Hero loses the embedded wizard card — replaced by the new `CategoryMenu` directly under the headline, which is the user's requested architecture.

`index.tsx` order: Header → Hero (text only) → CategoryMenu → HowItWorks → Benefits → Faq → Footer.

## 6. Files

**Create**
- `src/components/landing/CategoryMenu.tsx`
- `src/components/quote/QuoteWizardDialog.tsx`
- `src/lib/menu-data.ts`

**Edit**
- `src/styles.css` — repaint tokens to orange.
- `src/components/landing/Header.tsx` — VALENT branding + WhatsApp CTA.
- `src/components/landing/Hero.tsx` — text-only hero, new headline.
- `src/components/landing/Footer.tsx` — VALENT name.
- `src/components/quote/QuoteWizard.tsx` — drop product stage, 3-step progress.
- `src/components/quote/StepContact.tsx` — submit label "Cotar Agora".
- `src/components/quote/StepLoading.tsx` — text "Consultando seguradoras via API...".
- `src/lib/quote-data.ts` — keep Tokio Marine, Porto Seguro, Bradesco only.
- `src/routes/index.tsx` — new layout, SEO for VALENT.
- `src/routes/__root.tsx` — title/meta updates.

**Delete**
- `src/components/quote/StepProduct.tsx`

## 7. Acceptance checks

- No blue or green visible anywhere; primary accent is orange.
- Home shows 3 categorized cards with all listed items and correct icons.
- Only the **Carro** row opens the wizard modal; other items show the "em breve" toast.
- Wizard runs vehicle → contact → loading → results with the exact copy specified, FIPE success line on valid plate, and email toast on results.
- Layout is mobile-first, looks like a native app at 428×784.
