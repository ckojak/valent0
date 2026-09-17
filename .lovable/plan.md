# Plano: ajustes no wizard Auto e cotações personalizadas

## Objetivo e limites

Implementar somente as sete alterações solicitadas, preservando o fluxo atual de envio, cálculo e resultados da Segfy. Não alterar `StepCotacaoReal.tsx`, autenticação, rotas, layout global ou os enums já validados de `questionnaire` — especialmente `residence_garage`, `job_garage` e `study_garage`.

## Estado atual confirmado

- `StepCondutor.tsx` reúne segurado e condutor em um único conjunto de dados; `customer` e `main_driver` recebem hoje os mesmos nome, documento, nascimento e sexo em `http.server.ts`.
- O telefone principal só é coletado posteriormente em `StepWhatsapp`; o passo do segurado ainda não tem celular próprio.
- Para não-renovação, `QuoteAutoWizard.tsx` atualmente salta de situação diretamente para veículo; o passo do segurado/condutor só é alcançado após `seguro_atual` no caminho de renovação. O encadeamento será corrigido para que todos preencham os dados pessoais, mantendo `seguro_atual` exclusivo de renovação.
- `StepAvaliacaoRisco.tsx` possui somente o questionário de Carro/Moto. O payload já contém `questionnaire_truck: {}` vazio.
- A busca por placa preenche os dados e avança imediatamente, sem etapa de confirmação visual.
- A busca manual envia `vehicle_type`, marca/ID e ano para o mesmo endpoint nos três tipos. A causa completa da lista vazia em Moto/Caminhão ainda precisa ser confirmada com a resposta real; há um fallback local de marcas exclusivamente de carros que pode produzir IDs inválidos quando a consulta de marcas falha.
- `prioridade` é coletada, mas não é lida por `toCalculatePayload`; `selected_coverage` continua com um placeholder fixo. O bundle oficial mostra que coberturas predefinidas são registros reais consultados em `/api/template/version/1.0/index`, com identificador e objeto `coverage_vehicle` próprios.
- Consórcio já coleta nome, e-mail, CPF e nascimento, mas não exibe telefone.
- Equipamentos exibe o formulário completo de bike para todas as categorias.

## Implementação por arquivo

### `src/components/quote-auto/steps/StepCondutor.tsx`

- Manter CPF/CNPJ e CEP de pernoite no início.
- Separar visualmente o restante em dois blocos sem cartões aninhados:
  - **Segurado:** nome/razão social, nascimento, sexo, nome social, e-mail e celular.
  - **Condutor:** relação, estado civil e profissão.
- Aceitar CPF ou CNPJ no documento do segurado, com máscara e validação correspondentes.
- Quando a relação for **Próprio**, reutilizar os dados do segurado no condutor e não exibir campos duplicados.
- Quando for outra relação, abrir os dados pessoais necessários do condutor principal — documento, nome, nascimento e sexo — além de estado civil e profissão, para preencher `main_driver` sem reaproveitar indevidamente o segurado.
- Manter a busca existente do segurado por documento e da localidade por CEP; adequar a busca automática para não sobrescrever dados separados do condutor.

### `src/components/quote-auto/QuoteAutoWizard.tsx`

- Expandir o estado inicial para os campos separados de segurado/condutor e celular.
- Encaminhar todas as quatro situações pelo passo de dados pessoais; somente `renovar` continuará passando antes por `StepSeguroAtual`.
- Preservar os salvamentos parciais e o objeto final, incluindo os novos dados de forma aditiva.
- Pré-preencher/sincronizar o passo de WhatsApp com o celular do segurado, sem remover a confirmação de contato já existente.
- Passar `veiculo.tipo` para a avaliação de risco, para que os campos de caminhão sejam exibidos somente quando necessário.
- Incluir os dados separados e os dados de caminhão no registro do lead e no resumo somente onde forem relevantes.

### `src/lib/segfy/types.ts`

- Ampliar `SegfyQuoteInput` de forma aditiva com dados distintos de segurado e condutor principal.
- Acrescentar a estrutura tipada de `questionnaire_truck` com os onze campos oficiais.
- Manter intactos os tipos e valores atuais de `avaliacao_risco` para Carro/Moto.
- Acrescentar o identificador/descrição da cobertura predefinida resolvida, sem remover os quatro booleanos de coberturas adicionais existentes.

### `src/lib/masks.ts`

- Reutilizar as máscaras atuais e adicionar suporte isolado a CPF/CNPJ somente se ainda não houver utilitário compatível, mantendo as validações existentes de CPF, CEP, data, e-mail e telefone.

### `src/components/quote-auto/steps/StepAvaliacaoRisco.tsx`

- Receber o tipo do veículo.
- Para `car` e `motorcycle`, preservar exatamente o formulário e os valores atuais.
- Para `truck`, renderizar os onze campos solicitados e armazenar diretamente os enums oficiais identificados no bundle da Segfy:
  - `outside_service_garage`, `overnight_region`, `circulation_period`, `circulation_area`, `bodywork_type`, `bodywork_value`, `cargo_insurance`, `main_load`, `monthly_km`, `outsourcing_service` e `risk_management`.
- Aplicar validação obrigatória e entrada monetária/numérica adequada para valor da carroceria e quilometragem.
- Não reutilizar os enums de garagem de Carro/Moto nos campos de caminhão.

### `src/lib/segfy/http.server.ts`

- Preservar sem alteração o bloco `renewal`, o fluxo de token/requisição, `resolveInsurers` e os mapeamentos atuais de `questionnaire`.
- Em `customer`, mapear documento, nome/razão social, nascimento, sexo, nome social, e-mail e celular do segurado.
- Em `main_driver`, reutilizar os dados do segurado apenas quando `relationship === "himself"`; nas demais relações, enviar os dados separados do condutor.
- Para caminhão, enviar os onze campos em `questionnaire_truck` com os enums oficiais; para Carro/Moto, manter `questionnaire_truck` vazio e o `questionnaire` atual sem mudanças.
- Resolver as quatro coberturas predefinidas pelo endpoint oficial de templates, usando o ID e o conteúdo `coverage_vehicle` retornados pela conta, em vez de inventar IDs ou enums. Aplicar ao payload o perfil correspondente a `prioridade`, preservando os complementos escolhidos em `StepCoberturas` conforme compatibilidade do objeto retornado.
- Se algum dos quatro nomes não existir ou vier ambíguo na conta, registrar erro claro no servidor e impedir envio com perfil incorreto, sem fallback silencioso para outra cobertura.

### `src/lib/segfy/client.ts`

- Manter as funções atuais e corrigir a busca manual somente após comparar as requisições/respostas reais de Carro, Moto e Caminhão.
- Se necessário para a cobertura, adicionar uma chamada interna para listar templates predefinidos; os IDs não serão fixados no código.

### `src/components/quote-auto/steps/StepVeiculo.tsx`

- Alterar o fluxo por placa para: buscar → preencher → mostrar marca, modelo, fabricante e anos retornados → solicitar confirmação → avançar.
- Guardar `fabricante` de forma aditiva quando vier na resposta; se a resposta não trouxer esse atributo, exibir a marca como informação disponível sem fabricar um valor diferente.
- Mover o link de preenchimento manual para junto da explicação da busca automática.
- Diagnosticar a consulta manual comparando o corpo enviado e o `raw` retornado para os três `vehicle_type`; corrigir o ponto factual encontrado (ID de marca, parâmetro de ano ou normalização da resposta).
- Remover o uso do fallback de marcas de carro para Moto/Caminhão; se a lista oficial estiver indisponível, mostrar erro acionável em vez de consultar modelos com um ID incompatível.
- Garantir que mudanças de tipo, marca ou qualquer um dos anos limpem opções antigas e disparem nova consulta válida.

### `src/components/quote-auto/steps/StepPrioridade.tsx`

- Manter as quatro escolhas e seus rótulos atuais.
- Associar cada escolha à descrição exata da cobertura predefinida correspondente, deixando explícito que a seleção altera a cotação, não apenas a ordenação visual.

### `src/components/quote-auto/steps/StepCoberturas.tsx`

- Preservar os quatro controles adicionais existentes.
- Exibir o perfil predefinido escolhido como base da cotação e tratar os controles como complementos, sem criar uma quinta opção ou alterar a navegação.

### `src/components/quote-auto/steps/StepResumo.tsx`

- Mostrar segurado e condutor separadamente quando forem pessoas diferentes.
- Manter o resumo compacto quando a relação for “Próprio”.
- Exibir a cobertura predefinida selecionada e, para caminhão, resumir os dados adicionais essenciais.

### `src/components/quote-personalizada/PersonalizedQuote.tsx`

- Em Consórcio, adicionar o campo obrigatório **Telefone**, com a máscara já usada no arquivo, junto a Nome, E-mail, CPF e nascimento; ele continuará alimentando o `telefone` já existente no envio.
- Em Equipamentos, manter os dados do segurado comuns.
- Exibir os campos de bicicleta somente para `Bike/Scooter Elétrica`.
- Para Agrícola, Construção civil, Energia Solar e Outros, substituir o bloco específico de bike por: descrição do equipamento, valor estimado, ano/fabricação quando aplicável, local de uso e observações.
- Limpar ou filtrar campos específicos ao trocar o tipo de equipamento, evitando enviar dados antigos de bike em uma cotação genérica e vice-versa.
- Manter o endpoint e o formato geral do envio de e-mail existentes.

## Validação antes de concluir

1. Rodar verificação de tipos e build completo.
2. Testar o wizard em Carro, Moto e Caminhão, cobrindo placa e preenchimento manual.
3. Validar relação “Próprio” e uma relação diferente, conferindo `customer` e `main_driver` no corpo enviado.
4. Conferir que Carro/Moto mantêm exatamente o `questionnaire` atual e que somente Caminhão envia `questionnaire_truck` preenchido.
5. Executar as quatro prioridades e confirmar que cada uma gera `selected_coverage`/cobertura diferentes com IDs reais da conta.
6. Testar Consórcio e todos os tipos de Equipamentos, verificando campos visíveis e o conteúdo enviado.
7. Conferir erros de execução e a apresentação em telas pequenas e grandes.

## Premissas técnicas

- “Dados do condutor separados” significa coletar, quando não for “Próprio”, os campos pessoais exigidos por `main_driver` (documento, nome, nascimento e sexo), além dos três campos listados no bloco Condutor.
- Os IDs das coberturas predefinidas são dados da conta Segfy e serão resolvidos pela API oficial por descrição; não serão deduzidos nem codificados manualmente.
- A correção de Moto/Caminhão será baseada na resposta real do endpoint já disponível, não em troca especulativa de enums.
