# Meu E-commerce Monorepo

Este repositório contém os códigos de **Front-end** e **Back-end** de um e-commerce desenvolvido para o trabalho de faculdade.


- **server/**: Contém o projeto do servidor (Node.js, Strapi, etc.).
- **client/**: Contém o projeto do cliente (React, Next.js, etc.).

## Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) ou [npm](https://www.npmjs.com/)

### Passos para iniciar

1. **Instale as dependências** (na raiz, caso use scripts de workspace ou nas pastas separadas `backend` e `frontend`):
   ```bash
   # Na raiz (se usar scripts do package.json principal)
   yarn install

   # OU em cada pasta separadamente
   cd backend
   yarn install

   cd ../frontend
   yarn install

# Iniciando projeto direto na raiz (package.json na raiz):
yarn start

# OU iniciar manualmente cada um:
cd backend
yarn d
# Em outro terminal:
cd frontend
yarn dev
