
# Especificação + Checklist (para auditoria com Claude Code)
**Projeto:** E‑commerce de **Quadrinhos (HQs)** — _adaptação do documento de requisitos do professor (base: Livros, LES 2º/2025)._  
**Como usar:** peça ao Claude Code para **ler este arquivo** e gerar uma **matriz de rastreabilidade** (RF/RNF/RN → arquivos/rotas/telas/testes), além de um **relatório de lacunas** com planos de implementação.

> **Observação sobre adaptação:** Sempre que este arquivo mencionar “Livro”, **leia como “Quadrinho (HQ)”**. Os IDs (RF/RNF/RN) **permanecem iguais** para manter a rastreabilidade exigida pelo professor.  
> Mapeamentos práticos:
> - **Autor(es)** → Roteirista e/ou Ilustrador (você pode manter um campo `autores` ou separar `roteirista`/`desenhista`).  
> - **ISBN** → Use **ISBN** (TPB/encadernados/graphic novels geralmente têm) ou **ISSN** para edições seriadas. Armazene ambos se necessário.  
> - **Categoria** mantém o mesmo significado (ex.: super‑herói, mangá, infantil, indie).  
> - Todos os fluxos de **estoque, carrinho, compra, entrega e troca** são equivalentes.

---

## 1) O que o Claude deve produzir ao ler este arquivo
1. **Matriz de rastreabilidade** listando cada **RF/RNF/RN** →
   - **Back-end:** entidades, migrations, repositórios/ORM, services/use‑cases, controllers/rotas, DTOs/validações.  
   - **Front-end (client):** páginas, componentes, formulários, estados, chamadas ao back-end.  
   - **Testes:** unitários e/ou de integração (mín. happy path + 1 cenário de erro por requisito crítico).  
2. **Relatório de lacunas** com status por requisito: _Implementado_ / _Parcial_ / _Faltando_, com **evidências** (trechos de código/paths) e **próximos passos** (tarefas objetivas).  
3. **Backlog de issues** priorizado (alta → baixa), incluindo _estimativa grossa_, dependências e critério de aceite.  
4. **Sugestões de arquitetura** (ex.: camadas, nomes de pastas, contratos de API) quando detectar inconsistências.

---

## 2) Estrutura esperada no seu repositório
> A estrutura atual na sua screenshot mostra: `client/`, `server/`, `.claude/`, `README.md`, `package.json`, `yarn.lock`, etc.  
> Os itens abaixo são **sugestões mínimas** para o Claude conferir dentro de `server/` e `client/`.

### 2.1 Back-end (server/)
- `src/domain/` → entidades: `Quadrinho`, `Categoria`, `Autor` (ou `Roteirista`/`Ilustrador`), `Cliente`, `Endereco`, `CartaoCredito`, `Compra`, `ItemCompra`, `Cupom`, `Troca`, `Estoque`, `GrupoPrecificacao`, `Notificacao`.
- `src/infra/` → ORM/migrations, repositórios, serviços externos (pagamento, CEP, frete).
- `src/app/` → casos de uso e controllers/rotas REST (ex.: `/api/quadrinhos`, `/api/clientes`, `/api/carrinho`, `/api/compras`, `/api/trocas`, `/api/estoque`, `/api/analise`).
- `tests/` → unitários + integração (ex.: compra aprovada/reprovada, troca autorizada, bloqueio de itens no carrinho).

### 2.2 Front-end (client/)
- Páginas: **Catálogo**, **Detalhe do quadrinho**, **Carrinho**, **Checkout** (endereço + pagamento + cupons), **Meus Pedidos** (troca), **Login/Registro**, **Admin** (envio/entrega/trocas).
- Componentes de formulário com validação forte de senha e cartões.
- Telas de **Análise** com **gráfico de linhas** (histórico de vendas por período).
- Integração de **recomendações (IA generativa)** em catálogo/detalhe/busca (chat opcional).

---

## 3) Requisitos do professor (adaptados para HQs)
> **Importante:** IDs mantidos. Troque “Livro” por “Quadrinho” no seu código/UI quando fizer sentido.  
> Este resumo é o _núcleo_ que o Claude deve usar para auditar seu projeto; onde for necessário, ele deve gerar critérios de aceite e casos de teste.

### 3.1 Requisitos Funcionais (RF)
**Cadastro de Livros → Cadastro de Quadrinhos**
- **RF0011 — Cadastrar quadrinho**: cadastro único de quadrinhos.
- **RF0012 — Inativar cadastro**: permitir inativação.
- **RF0013 — Inativação automática**: inativar HQs sem estoque e sem vendas abaixo de parâmetro de preço.
- **RF0014 — Alterar cadastro**: permitir edição de dados.
- **RF0015 — Consultar por filtros**: busca por qualquer campo identificador (combinado/isolado).
- **RF0016 — Ativar cadastro**: reativar cadastro.

**Cadastro de Clientes**
- **RF0021 — Cadastrar cliente**; **RF0022 — Alterar**; **RF0023 — Inativar**; **RF0024 — Consulta com filtros**.  
- **RF0025 — Consultar transações do cliente**.  
- **RF0026 — Vários endereços de entrega** com rótulo.  
- **RF0027 — Vários cartões, com um preferencial**.  
- **RF0028 — Alteração apenas de senha**.

**Gerenciar Vendas Eletrônicas**
- **RF0031 — Carrinho** (add/alterar/excluir/visualizar itens).  
- **RF0032 — Quantidade dos itens** (ao adicionar e ao editar).  
- **RF0033 — Realizar compra** a partir do carrinho.  
- **RF0034 — Calcular frete** por itens + endereço.  
- **RF0035 — Selecionar endereço** (existente ou novo, com opção de salvar).  
- **RF0036 — Forma de pagamento** (múltiplos cartões, cupons troca/promo; combinar pagamentos).  
- **RF0037 — Finalizar compra** → status **EM PROCESSAMENTO**.  
- **RF0038 — Despachar** (admin) → **EM TRÂNSITO**.  
- **RF0039 — Confirmar entrega** (admin) → **ENTREGUE**.  
- **RF0040–RF0044 — Trocas**: solicitar; autorizar (admin); visualizar; confirmar recebimento; **gerar cupom de troca** após recebimento.

**Controle de Estoque**
- **RF0051 — Entrada em estoque** (vincular ao quadrinho + quantidade).  
- **RF0052 — Calcular valor de venda** (custo + % grupo de precificação).  
- **RF0053 — Baixa em estoque** por venda.  
- **RF0054 — Reentrada por troca**.

**Análise**
- **RF0055 — Histórico de vendas por período**, comparando produtos/categorias.

### 3.2 Requisitos Não Funcionais (RNF)
- **RNF0011 — 1s** resposta para consultas.  
- **RNF0012 — Log de transação** para inserção/alteração (data/hora/usuário + dados alterados).  
- **RNF0021 — Código único do quadrinho**.  
- **RNF0013 — Script de carga de domínios** (grupo de precificação, autor/roteirista, editora, fornecedor, etc.).  
- **RNF0031–RNF0033 — Senha forte, confirmação e criptografia**.  
- **RF0034 (nota no RNF)** — Alteração apenas de endereços sem mexer nos demais dados.  
- **RNF0035 — Código único do cliente**.  
- **RNF0042 — Apresentar itens retirados do carrinho** (expirados pelo prazo configurado).  
- **RNF0043 — Gráfico de linhas** no histórico de vendas.  
- **RNF0044 — Recomendações com IA generativa** (chatbot/busca; personalização por histórico/feedback).

### 3.3 Regras de Negócio (RN)
**Cadastro de Quadrinhos**
- **RN0011 — Dados obrigatórios**: autor(es)/roteirista/ilustrador, categoria, ano, título, editora, edição/volume, **ISBN/ISSN**, nº páginas, sinopse, dimensões (A/L/Peso/Prof.), grupo de precificação, código de barras.  
- **RN0012 — Múltiplas categorias** por quadrinho.  
- **RN0013–RN0014 — Valor de venda** segue grupo de precificação; alterar abaixo da margem exige autorização de **gerente de vendas**.  
- **RN0015–RN0017 — Motivos** para (in)ativação.

**Cadastro de Clientes**
- **RN0021–RN0022 — Endereço de cobrança/entrega obrigatórios**.  
- **RN0023 — Composição dos endereços** (tipo res., logradouro, nº, bairro, CEP, cidade, estado, país; obs. opcional).  
- **RN0024–RN0025 — Cartões** (campos mínimos; bandeiras permitidas).  
- **RN0026 — Dados obrigatórios do cliente** (gênero, nome, nascimento, CPF, telefones, e‑mail, senha, endereço residencial).  
- **RN0027 — Ranking de cliente**.  
- **RN0028 — Dar baixa só em venda aprovada** (status não “EM PROCESSAMENTO”).

**Vendas Eletrônicas**
- **RN0031–RN0032 — Validar estoque** ao adicionar ao carrinho e na finalização (notificar/atualizar/remover).  
- **RN0033–RN0036 — Pagamento com cupons/cartões** (apenas 1 cupom promocional; múltiplos cartões ≥ R$10, exceto quando há cupons; gerar cupom de troco quando exceder).  
- **RN0037–RN0040 — Validar forma de pagamento e alterar status** (APROVADA/REPROVADA/EM TRANSPORTE/ENTREGUE).  
- **RN0041–RN0044 — Trocas** (gerar pedido EM TROCA; recebido → TROCADO; só itens de pedidos ENTREGUE; **bloqueio temporário** de produtos no carrinho com remoção/aviso na expiração).  
- **RNF0045–RNF0046 — Retirar item do carrinho** quando desbloquear; **notificar** autorização de troca.

**Estoque**
- **RN0051 — Dados de entrada obrigatórios** (produto, qtd, custo, fornecedor, data de entrada).  
- **RN005x — Itens com custos diferentes** → preço de venda pelo maior custo do lote (mantendo preço único).  
- **RN0061–RN0062 — Qtd > 0 e custo obrigatório**.  
- **RNF0064 — Data de entrada obrigatória**.

---

## 4) Critérios de aceite & verificação automática (o que o Claude deve checar)
Para **cada RF/RN crítico**, verifique:
1. **Back-end**  
   - Rotas/Controllers existentes (`server/src/app/...`) e **contratos** (ex.: `POST /api/quadrinhos`, `GET /api/quadrinhos?filtros`, `POST /api/compras` etc.).  
   - **Validações** (ex.: senha forte; cartões; estoque; margens de lucro).  
   - **Migrations** e relacionamentos (ex.: `Quadrinho` ↔ `Categoria` N:N; `Cliente` ↔ `Endereco` 1:N; `Compra` ↔ `ItemCompra` 1:N).  
   - **Logs** de escrita (RNF0012).  
2. **Front-end**  
   - Telas e formulários correspondentes; feedbacks de erro/empty states; timers/notificações do carrinho (expiração).  
   - Página **Análise** com **gráfico de linhas** (RNF0043).  
   - UI/UX para **trocas** (solicitar, acompanhar) e **recomendações com IA**.  
3. **Testes**  
   - **Compra aprovada** e **reprovada** (RN0037–RN0038).  
   - **Bloqueio/expiração** do carrinho (RN0044/RNF0042).  
   - **Inativação automática** (RF0013).  
   - **Troca**: autorizar, receber, gerar cupom (RF0041–RF0044).

---

## 5) Prompts prontos para usar no Claude Code
> Cole um prompt por vez no chat do Claude (VS Code/Claude Code).

### 5.1 Leitura e matriz de rastreabilidade
```
Leia o arquivo REQUISITOS_ECOM_HQ_CLAUDE.md.  
Crie uma matriz RF/RNF/RN → (arquivos, rotas, entidades, telas, testes) analisando as pastas /server e /client.  
Marque cada requisito como Implementado/Parcial/Faltando, com evidências (paths/trechos) e próximos passos.
```

### 5.2 Checagem de APIs e validações de negócio
```
Escaneie /server e liste as rotas REST previstas (carrinho, compras, estoque, trocas, clientes, quadrinhos).  
Para cada rota, verifique validações de estoque, margens de lucro, formas de pagamento, logs de escrita e mudanças de status.  
Aponte lacunas e gere contratos de API (OpenAPI ou TS types) quando faltarem.
```

### 5.3 UI/UX + testes
```
Varra /client e confirme telas/fluxos: catálogo, detalhe, carrinho, checkout, meus pedidos (troca), admin e análise com gráfico de linhas.  
Liste componentes/provas de teste automatizadas existentes e recomende casos faltantes.
```

### 5.4 Backlog de issues
```
Com base nas lacunas encontradas, gere um backlog priorizado com: título, descrição, critério de aceite, estimativa e dependências.  
Inclua skeletons de código quando viável.
```

---

## 6) Critérios de aceite (modelos rápidos)
Use estes modelos ao abrir issues:

- **RF0037 — Finalizar compra**
  - **Dado** um carrinho válido, **quando** o cliente selecionar endereço e forma de pagamento (cartão + cupons), **então** criar a compra com status **EM PROCESSAMENTO** e persistir auditoria (RNF0012).
- **RN0038 — Aprovação/Reprovação**
  - **Dado** retorno dos validadores (cupons/operadora), **então** mudar status para **APROVADA** ou **REPROVADA** e desbloquear itens conforme regra.
- **RN0044/RNF0042 — Bloqueio/expiração do carrinho**
  - **Dado** item bloqueado, **quando** faltar 5 min para o prazo, **então** notificar; **quando** expirar, **então** remover e registrar.

---

## 7) Dicas de implementação
- Use enum/status centralizados para **Compra** (`EM_PROCESSAMENTO`, `APROVADA`, `REPROVADA`, `EM_TRÂNSITO`, `ENTREGUE`, `EM_TROCA`, `TROCADO`).
- Mantenha **parâmetros** (margem lucro, prazos de bloqueio, valor mín. por cartão) em tabela/config.
- Registre **toda escrita** em tabela de **Log** (RNF0012).
- Para IA de recomendação: comece com **collaborative filtering** simples (histórico do cliente) + **chat** que chama endpoints de busca/filtro.

---

## 8) Saída esperada do Claude
- **Arquivo `RELATORIO_AUDITORIA.md`** com a matriz, o status por requisito, as evidências e o backlog.  
- Opcional: **`openapi.yaml`** ou tipos TS para as rotas mapeadas.

> _Fim do arquivo._
