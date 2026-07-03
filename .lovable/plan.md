## Objetivo
Reformular o fluxo completo da VALENT alinhado aos 12 screens descritos, aplicando o design system (laranja #FF5722, azul marinho #0B1A30, verde WhatsApp #128C7E), atualizar contato para (21) 99762-5607, adicionar registro SUSEP 212126836 no rodapé, e polir home + wizard `/cotacao/auto` para bater com os mockups.

## Escopo

### 1. Design tokens (`src/styles.css`)
- Ajustar `--brand` para `#FF5722`, adicionar `--navy: #0B1A30`, `--wa-green: #128C7E`, `--surface-muted: #F5F7FA`.
- Garantir tokens semânticos (`bg-navy`, `text-wa`, etc.) via `@theme inline`.
- Bordas 8–12px e sombras suaves já existentes — revisar consistência.

### 2. Branding / contato global
- `Header`: telefone (21) 99762-5607 clicável (tel:) + botão WhatsApp verde.
- `Footer`: telefone atualizado, adicionar linha "SUSEP nº 212126836".
- `useContatoTelefone`: default seed = 5521997625607.
- Migration: `UPDATE configuracoes SET valor='5521997625607' WHERE chave='whatsapp_telefone'` (mantém edição pelo admin).

### 3. Home (`/`)
- Remover os 2 botões laranja provisórios que coloquei no topo (o cliente só queria pra debug; agora entra o layout real).
- Hero com headline "Proteção inteligente para o que realmente importa.", 4 value props em ícones (atendimento personalizado, top seguradoras, custo-benefício, acompanhamento passo a passo).
- CategoryMenu como grid de 5 cards (Automóvel destacado com borda laranja, Residencial, Empresarial, Vida, Condomínio) — cada card navega para `/seguros/{slug}` e "Automóvel" abre `/cotacao/auto`.
- CTA WhatsApp verde fixo/hero.

### 4. Wizard `/cotacao/auto` — polimento das 12 telas
Componentes já existem; ajustes visuais e de conteúdo:
- **Stepper** no topo (telas 2–8 e 11) com ícones lineares + estado ativo laranja.
- **Tela 1 (Home)** já cobre "Escolha do Seguro".
- **Tela 2 Situação**: grid 2x2, card ativo com borda laranja + ícone laranja, botão "Continuar" full-width laranja (hoje avança on-click; adicionar botão explícito).
- **Tela 3 Veículo**: layout 2 colunas com selects estilizados (Marca, Modelo, Ano fab, Ano mod, Versão, Placa opcional) + badge "Não se preocupe, seus dados estão seguros".
- **Tela 4 Condutor**: inputs Nome/Nasc/CPF/CEP + selects Estado civil / Principal condutor + segmentado horizontal "Uso do veículo" (Particular/Trabalho/Aplicativo) com ícone laranja no selecionado.
- **Tela 5 Prioridade**: 2x2 cards grandes + botão Continuar.
- **Tela 6 Coberturas**: toggles iOS-style (já ok) + par de botões Voltar/Continuar.
- **Tela 7 Resumo**: blocos bem definidos (Veículo / Condutor / Prioridade / Coberturas) + subtext "Ao enviar, nossos especialistas irão analisar…".
- **Tela 8 Loading**: radar circular pulsante com ícone de carro + 3 colunas ("Análise personalizada", "Melhores seguradoras", "Proteção ideal") + faixa bege com CTA WhatsApp verde.
- **Tela 9 Resultados**: layout com sidebar de filtros (Ordenar por, Tipo de cobertura, Franquia) + cards Porto/Azul/Allianz com preço e CTA laranja "Quero esta opção". Mock claramente comentado.
- **Tela 10 Comparativo**: matrix grid com checks verdes; footer Voltar + "Escolher opção" laranja.
- **Tela 11 Contato**: form Nome / WhatsApp mascarado / E-mail opcional + checkbox novidades + CTA "Receber minha cotação" + selo de segurança com cadeado.
- **Tela 12 Sucesso**: fundo `--navy`, círculo laranja com check, 3 colunas de value props com ícones lineares laranjas, CTA WhatsApp verde grande, footer "Valent Seguros - Corretora & Consultoria de Seguros". Inserir lead em `leads` (já existe) mantido.

### 5. Persistência de leads
- Já existe `insertLead`. Garantir que Tela 11 grava lead com todos os dados coletados (veículo, condutor, prioridade, coberturas, seguradora escolhida) antes de mostrar Tela 12.

## Fora de escopo
- Cálculo real de seguro / API multicálculo (mantém mock comentado).
- Novas tabelas no banco (apenas UPDATE em `configuracoes`).
- Refatorar Admin (`/admin`) — mantém como está.

## Entrega
Uma única leva de edits em paralelo (tokens + componentes + steps + home) + 1 migration curta para o telefone. Depois disso o preview deve refletir os 12 screens.
