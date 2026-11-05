<h1 align="center"> Quadrinho Rei </h1>

<p align="center">
  E-commerce de quadrinhos com catálogo, gestão de pedidos, estoque, trocas e um assistente com inteligência artificial. <br/>
  Projeto acadêmico full stack desenvolvido com Next.js, TypeScript, Strapi e PostgreSQL.
</p>

<p align="center">
  <a href="#-projeto">Projeto</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#como-rodar">Como rodar</a> •
  <a href="#-testes">Testes</a>
</p>

<br>

## 💻 Projeto

O **Quadrinho Rei** é um e-commerce de quadrinhos desenvolvido como trabalho de faculdade. O sistema reúne a experiência de compra do cliente e as operações de gestão da loja em um monorepo, com front-end e back-end organizados em aplicações separadas.

O projeto vai além do cadastro de produtos: conecta catálogo, carrinho, estoque, finalização de compras, acompanhamento de pedidos, solicitações de troca e utilização de cupons. Também inclui o **Alfred**, um assistente integrado ao Google Gemini que utiliza informações do catálogo e do cliente para contextualizar suas respostas.

Foi meu projeto mais desafiador até aqui, principalmente pela necessidade de conectar diferentes regras de negócio e manter consistência entre operações que afetam compras, estoque e pós-venda.

### Funcionalidades e conceitos aplicados

#### Experiência do cliente

- **Cadastro e autenticação:** formulários com validação, login com JWT e gerenciamento de dados pessoais, endereços de entrega e cobrança e cartões de demonstração.
- **Catálogo de quadrinhos:** consulta de produtos com informações como título, autor, editora, preço e disponibilidade, além de filtros e paginação.
- **Carrinho integrado ao estoque:** inclusão, alteração de quantidade e remoção de produtos com verificação de disponibilidade e ajuste das quantidades em estoque.
- **Finalização da compra:** seleção de endereços e cartões, aplicação de cupons e validação dos valores, incluindo regras para utilização de múltiplos cartões.
- **Compras e pós-venda:** histórico de pedidos, acompanhamento de status e solicitação de troca de produtos entregues.

#### Gestão da loja

- **Clientes:** consulta, cadastro, edição, bloqueio e exclusão por meio de telas e serviços próprios.
- **Produtos e estoque:** cadastro e edição de quadrinhos, associação a categorias e tipos de precificação e controle das quantidades disponíveis.
- **Vendas e trocas:** consulta de pedidos, atualização de status e geração de cupons vinculados às trocas, com tratamento da reentrada de estoque.
- **Cupons promocionais:** criação, ativação, desativação, exclusão e consulta de utilizações.
- **Dashboard:** visualização de vendas com gráficos e filtros por período e categoria.

#### Alfred — assistente com IA

- **Respostas contextualizadas:** integração com o Google Gemini no back-end, utilizando dados do catálogo, compras e preferências do cliente.
- **Recomendações de produtos:** seleção de quadrinhos considerando informações disponíveis na loja e preferências identificadas nas conversas.
- **Histórico persistido:** armazenamento de conversas e mensagens no Strapi.
- **Feedback das respostas:** avaliação positiva ou negativa das mensagens do assistente.
- **Tratamento de falhas:** validação das mensagens, limite de envio no servidor e tentativas de reenvio no cliente para determinadas falhas.

### Desafios e aprendizados

- **Consistência entre os fluxos:** relacionar alterações no carrinho, finalização de pedidos, cancelamentos e trocas com seus efeitos no estoque.
- **Regras comerciais:** organizar validações de pagamento, aplicação de cupons, cupons de troco e operações de pós-venda.
- **Modelagem relacional:** conectar usuários, clientes, endereços, cartões, produtos, compras, trocas e cupons.
- **Organização full stack:** separar componentes, formulários, hooks e serviços no cliente, com rotas, controllers e serviços de negócio no servidor.
- **Integração de IA:** construir contexto a partir dos dados da aplicação e manter o histórico de conversas.
- **Automação de testes:** criar cenários de ponta a ponta para fluxos de clientes, vendas e trocas com Cypress.

## 🚀 Tecnologias

| Camada | Tecnologias e utilização |
| --- | --- |
| Front-end | **React 18, Next.js 14 e TypeScript**, com páginas organizadas pelo App Router |
| Interface | **Styled Components**, estilos por componente e tema compartilhado |
| Formulários | **React Hook Form e Yup**, para gerenciamento e validação dos campos |
| Comunicação com a API | **Axios**, com interceptadores, e **TanStack Query**, utilizado em hooks de consulta |
| Gráficos | **Chart.js e React Chart.js 2**, para visualização dos dados de vendas |
| Back-end | **Node.js, Strapi 5 e TypeScript**, com endpoints e serviços personalizados |
| Banco de dados | **PostgreSQL**, com relacionamentos definidos nos content-types do Strapi |
| Inteligência artificial | **Google Gemini**, integrado pelo SDK `@google/genai` no servidor |
| Imagens | Upload local em desenvolvimento e provider **Cloudinary** configurado para produção |
| Testes | **Cypress**, com cenários de ponta a ponta |
| Ferramentas | **Yarn**, **Concurrently**, **ESLint**, **Prettier** e **Git** |

## 🧩 Arquitetura

O front-end consome a API do Strapi por uma camada de serviços. No servidor, os controllers encaminham as operações para serviços que concentram as regras de negócio e o acesso aos dados. A integração com o Gemini também acontece no back-end.

```text
quadrinho-rei-monorepo/
├── client/
│   ├── src/app/                # Páginas e rotas do Next.js
│   ├── src/components/         # Formulários, tabelas, modais e componentes
│   ├── src/hooks/              # Autenticação e consultas
│   ├── src/services/           # Comunicação com a API
│   ├── src/validations/        # Schemas de validação
│   └── cypress/                # Cenários E2E e configuração do cliente
├── server/
│   ├── config/                # Banco, uploads e configuração do Strapi
│   ├── src/api/               # Content-types, rotas, controllers e serviços
│   ├── src/api/operation/     # Operações e regras de negócio da loja
│   ├── src/middlewares/       # Middleware de auditoria
│   └── tests/                 # Roteiro de integração entre carrinho e estoque
├── CHAT-IA-DOCUMENTATION.md
├── DEPLOYMENT.md
└── package.json               # Comandos para iniciar as duas aplicações
```

<a id="como-rodar"></a>

## ▶️ Como rodar o projeto

### Pré-requisitos

- **Git**.
- **Node.js 22.x**, dentro da faixa declarada pelo back-end.
- **Yarn Classic (1.x)**: os scripts da raiz utilizam o comando `yarn`.
- **PostgreSQL** instalado e em execução, com um banco criado para o projeto.
- Uma chave do **Google Gemini**, caso queira utilizar respostas reais do assistente.

### 1. Clone o repositório e instale as dependências

```bash
git clone https://github.com/GustavoFSCode/quadrinho-rei-monorepo.git
cd quadrinho-rei-monorepo

yarn install

cd server
yarn install

cd ../client
yarn install

cd ..
```

A instalação deve ser feita na raiz e em cada aplicação; o repositório não declara Yarn Workspaces.

### 2. Configure as variáveis de ambiente

Copie os arquivos de exemplo, a partir da raiz:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

No PowerShell, você também pode usar `Copy-Item` no lugar de `cp`.

Em `server/.env`, configure a conexão com seu banco:

```dotenv
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=quadrinho_rei
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_SSL=false
```

Crie previamente o banco com o mesmo nome definido em `DATABASE_NAME`, usando seu cliente PostgreSQL.

Substitua também os valores de exemplo de `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT` e `JWT_SECRET` por valores próprios. Para gerar cada segredo, execute:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Em `APP_KEYS`, utilize duas chaves diferentes, separadas por vírgula.

Para as respostas reais do Alfred, preencha `GEMINI_API_KEY` em `server/.env`. Sem uma chave configurada, o serviço possui uma resposta de demonstração.

Em `client/.env.local`, confirme o endereço da API:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:1337/api/
NEXT_PUBLIC_CHAT_ENABLED=true
```

O arquivo `.env.local` permite definir a configuração da sua máquina sem alterar os arquivos de ambiente já versionados no cliente.

### 3. Inicie o back-end e prepare os dados

```bash
cd server
yarn d
```

Acesse **http://localhost:1337/admin** e crie a conta administrativa do Strapi na primeira execução.

Em um banco novo, os schemas são criados pelo Strapi, mas os dados necessários aos fluxos da loja precisam ser cadastrados:

- Configure as permissões dos papéis **Public** e **Authenticated** em **Settings → Users & Permissions Plugin → Roles**, conforme os endpoints utilizados. O cadastro de cliente utiliza a ação `createClient`; as demais operações exigem as permissões correspondentes.
- Cadastre categorias, tipos de precificação e os status usados pelos pedidos e trocas. Há consultas por nomes específicos no código, como **Em processamento**, **Entregue** e **Aberto**.
- Cadastre produtos e crie um cliente pelo formulário da aplicação para gerar os relacionamentos de usuário, cliente e carrinho.

A conta administrativa do Strapi e a conta do cliente da loja são cadastros diferentes. O serviço de cadastro associa o usuário ao papel de ID `1`; confira essa associação na sua instalação.

O script `seed:example` contém dados do template do Strapi e **não prepara todos os dados comerciais da loja**.

### 4. Inicie o front-end

Em outro terminal, a partir da raiz do repositório:

```bash
cd client
yarn dev
```

Acesse **http://localhost:3000**.

Depois da configuração inicial, você pode iniciar as duas aplicações juntas, pela raiz:

```bash
yarn start
```

Nesse repositório, `yarn start` na raiz inicia os servidores de desenvolvimento com Concurrently.

## 🧪 Testes

Com as aplicações em execução e os dados de teste preparados, abra o Cypress a partir de `client/`:

```bash
cd client
yarn cypress open
```

Para executar os cenários sem abrir a interface do Cypress:

```bash
yarn cypress run
```

Os cenários incluem cadastro, edição e exclusão de clientes, fluxo de venda, gestão de pedidos e solicitações de troca.

**Estado atual:** parte das tarefas `db:*` em `client/cypress.config.ts` retorna dados simulados e não cria registros reais no PostgreSQL. Alguns cenários dependem de dados e contas específicos; a suíte ainda exige preparação do ambiente e não representa uma execução automática completa em um banco vazio.

## 📝 Escopo e documentação

O projeto tem finalidade acadêmica. O checkout implementa regras de compra e validação de valores, sem integração identificada com uma adquirente para cobrança real. Utilize dados fictícios nos cadastros de demonstração.

O Alfred atende por texto; a transcrição de áudio ainda está em desenvolvimento. A presença de telas de gestão também não substitui a configuração de autorização dos endpoints no servidor.

- [Documentação do chat com IA](CHAT-IA-DOCUMENTATION.md)
- [Guia de implantação](DEPLOYMENT.md)
- [Roteiro de integração entre carrinho e estoque](server/tests/cart-stock-integration.test.md)
