# Protocolo Valent + preparação para pagamento Segfy

## O problema

O código feio (`702b492e-b15a-4674-...`) que aparece na tela é o "ID cotação" gerado dentro do iframe da plataforma parceira — não temos como renomeá-lo lá dentro. A solução é a Valent passar a ter o seu próprio **protocolo de atendimento**, gerado e exibido pelo nosso site, que é o número que o cliente guarda e cita no WhatsApp.

## O que será feito

### 1. Protocolo profissional da cotação

Formato: `VLT-CARLOS-742` (prefixo + primeiro nome em maiúsculas, sem acentos + 3 primeiros dígitos do CPF).

- Se não houver CPF, cai para 3 dígitos derivados do telefone.
- Gerado uma única vez por cotação e mantido durante todo o wizard.
- Salvo junto ao lead, para o admin localizar o cliente pelo protocolo.

Onde aparece:
- Barra superior do wizard, discreta, a partir do momento em que temos nome/CPF.
- Tela de resultado/cotação, em destaque, com botão "copiar".
- Tela de sucesso.
- Mensagem pré-preenchida do WhatsApp (`Protocolo: VLT-CARLOS-742`).
- Painel `/admin`: nova coluna Protocolo na lista de leads, com busca por protocolo.

### 2. Camada de pagamento pronta para a Segfy

Estrutura preparada, sem integração real ainda (encaixa a URL e a chave depois):

- Bloco "Contratar e pagar" na tela final da cotação, exibido após a escolha da opção — hoje mostra o estado "pagamento em breve / falar com especialista".
- Um ponto único de integração no servidor (`criarCheckoutSegfy`) que hoje devolve `{ status: "nao_configurado" }` e, quando as credenciais existirem, chamará o endpoint real.
- Endpoint público de retorno (webhook) já criado e assinado, para a Segfy confirmar pagamento e atualizar o status do lead.
- Nenhuma chave é inventada agora: quando você tiver a documentação, apenas cadastramos o segredo e ligamos.

### 3. Banco de dados

Nova migração:
- `leads.protocolo` (texto, único) — o protocolo mostrado ao cliente.
- `leads.pagamento_status` (texto, padrão `pendente`) e `leads.pagamento_ref` (texto) — para o retorno da Segfy.

## Detalhes técnicos

- `src/lib/protocolo.ts`: `gerarProtocolo({ nome, cpf, telefone })`, com normalização de acentos e fallback.
- Protocolo mantido em estado no `QuoteAutoWizard`, propagado por props para `StepResumo`, `StepCotacaoReal`, `StepWhatsapp` e `StepSucesso`.
- `insertLead` passa a aceitar e gravar `protocolo`.
- `src/lib/segfy.functions.ts`: `createServerFn` `criarCheckoutSegfy` lendo `process.env['SEGFY_API_URL']`/`SEGFY_API_KEY` dentro do handler; sem variáveis, retorna `nao_configurado`.
- `src/routes/api/public/segfy-webhook.ts`: valida assinatura HMAC antes de qualquer escrita; atualiza o lead via cliente admin importado dentro do handler.
- Migração inclui os `GRANT` necessários nas novas colunas (tabela já existente, apenas `ALTER TABLE`).

## Fora de escopo

- Cálculo real de seguro e substituição do iframe da plataforma parceira.
- Cobrança real (só entra quando a documentação da Segfy chegar).
