# SecureQuote Express

Build a modern, high-conversion landing page for an insurance brokerage (Corretora de Seguros). The visual style should be clean and trustworthy, inspired by 'Minuto Seguros', using a color palette of White, Deep Blue, and vibrant Green for call-to-actions. 

Core Features needed:

1. Hero Section: A strong headline ('Cote online, compare e economize no seu seguro') with a clean multi-step form card taking center stage.

2. Multi-Step Quoting Wizard (Interactive UI):

   - Step 1: Input field for 'Placa do veículo' and a toggle for 'Zero KM'.

   - Step 2: Basic user info (Name, Email, Phone/WhatsApp).

   - Action: When the user clicks 'Cotar Agora', show a loading state (simulating API fetch).

3. Results Page (Simulated): After the loading state, display a list of 3-4 simulated insurance quotes (e.g., Tokio Marine, Bradesco, Porto Seguro). Each card should show the insurer logo placeholder, total price, and installment options (e.g., '12x sem juros'). 

4. Automated Trigger Simulation: Add a subtle toast notification or UI message saying 'Cotação enviada para o seu e-mail!' to simulate the backend automation.

Tech Stack: Use React, Tailwind CSS, and Lucide React for icons. The design must be fully responsive (mobile-first), as users will access this mostly via smartphone. Keep the code modular.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3441cc93-b53a-412f-b303-4a52e5bb0497).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
