# 🚀 Guia de Deploy na Vercel - Quadrinhos Rei

Este guia detalha o processo completo para fazer deploy da aplicação Quadrinhos Rei (frontend + backend) na Vercel.

## 📋 Pré-requisitos

- Conta na Vercel (https://vercel.com)
- Conta no Cloudinary (https://cloudinary.com) para upload de imagens
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Vercel CLI instalada (opcional): `npm i -g vercel`

---

## 🗂️ Estrutura de Deploy

O projeto será dividido em **2 projetos separados** na Vercel:

1. **Frontend** (Next.js) - `/client`
2. **Backend** (Strapi) - `/server`

Ambos usarão **PostgreSQL** (via Neon) para o banco de dados.

---

## 📝 Passo a Passo

### **1. Preparar o Repositório Git**

Certifique-se de que o código está commitado e enviado para o GitHub/GitLab/Bitbucket:

```bash
git add .
git commit -m "feat: configurações de deploy para Vercel"
git push origin main
```

---

### **2. Configurar PostgreSQL (Neon)**

A Vercel agora oferece bancos de dados através do **Marketplace**. Para este projeto, usaremos o **Neon** (Serverless Postgres).

#### 2.1. Criar banco de dados no Neon

**Opção A: Via Vercel Dashboard (Recomendado)**

1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. Vá em **Storage** > **Create Database**
3. Na lista do Marketplace, escolha **Neon** (Serverless Postgres)
4. Clique em **Continue**
5. Você será redirecionado para criar uma conta no Neon (se ainda não tiver)
6. Após criar a conta Neon:
   - Nome do projeto: `quadrinhos-rei`
   - Região: Escolha a mais próxima do Brasil (ex: `US East (Ohio)` ou `AWS São Paulo` se disponível)
7. Clique em **Create Project**
8. O Neon será automaticamente integrado com a Vercel

**Opção B: Direto no Neon**

1. Acesse: https://neon.tech
2. Crie uma conta gratuita
3. Clique em **Create Project**
4. Configure:
   - Nome: `quadrinhos-rei`
   - Região: `AWS São Paulo` (sa-east-1) ou `US East`
   - PostgreSQL Version: 16 (latest)
5. Clique em **Create**

#### 2.2. Obter credenciais do banco

Após criar o banco no Neon, você verá a **Connection String**:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Exemplo:**
```
postgresql://neondb_owner:AbCd1234@ep-quiet-rain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Anote essa connection string completa** - você usará no backend.

Você também pode obter as credenciais individuais na aba **Connection Details**:
- `Host`: ep-quiet-rain-123456.us-east-2.aws.neon.tech
- `Database`: neondb
- `User`: neondb_owner
- `Password`: [sua senha]
- `Port`: 5432

#### 2.3. Conectar Neon à Vercel (se usou Opção B)

Se você criou o banco diretamente no Neon (Opção B), conecte-o à Vercel:

1. Na página do projeto Vercel, vá em **Settings** > **Integrations**
2. Busque por **Neon** e clique em **Add Integration**
3. Autorize a conexão
4. Selecione o projeto `quadrinhos-rei`
5. As variáveis de ambiente serão adicionadas automaticamente

**Variáveis que serão adicionadas:**
- `DATABASE_URL` ou `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` (opcional)
- `POSTGRES_URL_NON_POOLING` (opcional)

#### 2.4. Por que Neon? (e alternativas)

**✅ Recomendamos Neon porque:**
- Serverless (escala automaticamente, inclusive para zero)
- Plano gratuito generoso (0.5GB)
- Excelente integração com Vercel
- PostgreSQL nativo (compatível 100% com o projeto)
- Pooling de conexões integrado
- Backups automáticos
- Suporte a branches do banco (ideal para desenvolvimento)

**Alternativas disponíveis no Marketplace da Vercel:**

| Banco de Dados | Tipo | Plano Gratuito | Melhor Para |
|---------------|------|----------------|-------------|
| **Neon** ✅ | Postgres | 0.5GB | Produção, serverless, melhor custo-benefício |
| **Supabase** | Postgres | 500MB + Auth/Storage | Se precisar de autenticação integrada |
| **Prisma Postgres** | Postgres | 5GB grátis | Maior storage gratuito |
| **Turso** | SQLite | 9GB + 1B rows | Alta performance, baixo custo |
| **Railway** | Postgres (externo) | $5 crédito/mês | Deploy completo (backend + DB juntos) |

**Nota**: Se escolher outra opção, basta usar a connection string fornecida na variável `DATABASE_URL`.

---

### **3. Gerar Secrets de Produção**

Execute os comandos abaixo para gerar secrets seguros:

```bash
# Gera 4 APP_KEYS
node -e "console.log(Array(4).fill(0).map(() => require('crypto').randomBytes(32).toString('base64')).join(','))"

# Gera API_TOKEN_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Gera ADMIN_JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Gera TRANSFER_TOKEN_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Gera JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Anote todos esses valores** - você precisará deles no passo 5.

---

### **4. Configurar Cloudinary**

#### 4.1. Criar conta gratuita

1. Acesse: https://cloudinary.com/users/register/free
2. Complete o cadastro
3. Acesse o Dashboard: https://console.cloudinary.com/

#### 4.2. Obter credenciais

No Dashboard do Cloudinary, você verá:
- **Cloud Name**
- **API Key**
- **API Secret**

**Anote essas credenciais** - você usará no backend.

---

### **5. Deploy do Backend (Strapi)**

#### 5.1. Criar projeto na Vercel

1. Acesse: https://vercel.com/new
2. Importe seu repositório Git
3. Configure o projeto:
   - **Project Name**: `quadrinhos-rei-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: `yarn build`
   - **Output Directory**: `.strapi`
   - **Install Command**: `yarn install`

#### 5.2. Configurar variáveis de ambiente

Vá em **Environment Variables** e adicione:

```bash
# Node
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

# APP_KEYS (use os valores gerados no passo 3)
APP_KEYS=seu_app_key_1,seu_app_key_2,seu_app_key_3,seu_app_key_4

# Secrets (use os valores gerados no passo 3)
API_TOKEN_SALT=seu_api_token_salt
ADMIN_JWT_SECRET=seu_admin_jwt_secret
TRANSFER_TOKEN_SALT=seu_transfer_token_salt
JWT_SECRET=seu_jwt_secret

# Database - Neon (use as credenciais do passo 2)
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://neondb_owner:sua_senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
# OU configure individualmente:
DATABASE_HOST=ep-xxx.us-east-2.aws.neon.tech
DATABASE_PORT=5432
DATABASE_NAME=neondb
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=sua_senha
DATABASE_SSL_REJECT_UNAUTHORIZED=false

# Cloudinary (use as credenciais do passo 4)
CLOUDINARY_NAME=seu_cloud_name
CLOUDINARY_KEY=sua_api_key
CLOUDINARY_SECRET=sua_api_secret

# Chat AI - Google Gemini (opcional)
GEMINI_API_KEY=sua_gemini_api_key
CHAT_ENABLED=true

# Frontend URL (você preencherá depois do deploy do frontend)
FRONTEND_URL=https://seu-frontend.vercel.app
```

#### 5.3. Conectar Neon ao Projeto (se necessário)

Se você criou o banco via Vercel Dashboard (Opção A no passo 2), as variáveis já foram adicionadas automaticamente.

Se criou direto no Neon (Opção B), adicione manualmente:

1. Na página do projeto backend, vá em **Settings** > **Environment Variables**
2. Adicione a variável `DATABASE_URL` com a connection string do Neon
3. Ou use a integração:
   - **Settings** > **Integrations** > **Browse Marketplace**
   - Busque **Neon** > **Add Integration**
   - Conecte seu projeto Neon

#### 5.4. Fazer deploy

1. Clique em **Deploy**
2. Aguarde o build completar (pode levar 5-10 minutos)
3. Após o deploy, anote a URL: `https://quadrinhos-rei-backend.vercel.app`

#### 5.5. Executar migrations do banco

Após o primeiro deploy, você precisará popular o banco de dados:

**Opção A: Usar Strapi Admin**
1. Acesse: `https://quadrinhos-rei-backend.vercel.app/admin`
2. Crie o usuário admin
3. O Strapi criará automaticamente as tabelas

**Opção B: Seed local + deploy**
```bash
cd server
# Configure .env local com a DATABASE_URL de produção
yarn seed:example
```

---

### **6. Deploy do Frontend (Next.js)**

#### 6.1. Criar projeto na Vercel

1. Acesse: https://vercel.com/new
2. Importe o **mesmo repositório** Git
3. Configure o projeto:
   - **Project Name**: `quadrinhos-rei-frontend`
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `yarn build`
   - **Output Directory**: `.next`
   - **Install Command**: `yarn install`

#### 6.2. Configurar variáveis de ambiente

Vá em **Environment Variables** e adicione:

```bash
# API do Backend (use a URL do passo 5.4)
NEXT_PUBLIC_API_URL=https://quadrinhos-rei-backend.vercel.app/api/

# Chat habilitado
NEXT_PUBLIC_CHAT_ENABLED=true

# Node
NODE_ENV=production
```

#### 6.3. Fazer deploy

1. Clique em **Deploy**
2. Aguarde o build completar (2-5 minutos)
3. Após o deploy, anote a URL: `https://quadrinhos-rei-frontend.vercel.app`

---

### **7. Atualizar CORS no Backend**

Agora que você tem a URL do frontend, precisa atualizar a variável `FRONTEND_URL` no backend:

1. Acesse o projeto backend na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Edite a variável `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://quadrinhos-rei-frontend.vercel.app
   ```
4. **Importante**: Clique em **Redeploy** para aplicar a mudança

---

### **8. Testar a Aplicação**

1. Acesse o frontend: `https://quadrinhos-rei-frontend.vercel.app`
2. Teste as funcionalidades:
   - Login/Registro
   - Listagem de produtos
   - Adicionar ao carrinho
   - Finalizar compra
   - Upload de imagens (deve ir para Cloudinary)

---

## 🔄 Deploys Automáticos

Agora, toda vez que você fizer push para o repositório:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

A Vercel **automaticamente** fará o rebuild e deploy de ambos os projetos!

---

## 🛠️ Comandos Úteis

### Deploy via CLI (alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy do backend
cd server
vercel --prod

# Deploy do frontend
cd ../client
vercel --prod
```

### Visualizar logs

```bash
# Logs do backend
vercel logs quadrinhos-rei-backend --prod

# Logs do frontend
vercel logs quadrinhos-rei-frontend --prod
```

### Rollback para deploy anterior

```bash
# Listar deploys
vercel ls quadrinhos-rei-backend

# Promover deploy específico
vercel promote <deployment-url> --prod
```

---

## ⚠️ Limitações do Serverless

### Backend (Strapi na Vercel)

1. **Cold Starts**: Primeira requisição pode demorar 5-10s
2. **Timeout**: Funções têm limite de 30s (pode ser insuficiente para operações pesadas)
3. **Upload de Arquivos**: Apenas via Cloudinary (não salva localmente)
4. **Memória**: Limitado a 3GB por função
5. **Alguns Plugins**: Podem não funcionar (ex: plugins que dependem de filesystem)

### Frontend (Next.js)

✅ Funciona perfeitamente sem limitações!

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

1. Verifique se as variáveis `DATABASE_URL` ou `DATABASE_*` estão corretas
2. Certifique-se de que `DATABASE_SSL_REJECT_UNAUTHORIZED=false`
3. Teste a conexão localmente primeiro

### Erro: "CORS policy"

1. Verifique se `FRONTEND_URL` está configurada corretamente no backend
2. Certifique-se de fazer redeploy após mudar variáveis
3. Confirme que o frontend está usando a URL correta em `NEXT_PUBLIC_API_URL`

### Erro: "Function timeout"

1. Aumente o limite em `server/vercel.json` (máx 30s no plano gratuito):
   ```json
   "functions": {
     "api/index.js": {
       "maxDuration": 30
     }
   }
   ```
2. Considere otimizar queries lentas

### Erro: "Module not found"

1. Certifique-se de que todas as dependências estão em `package.json`
2. Execute `yarn install` localmente para testar
3. Limpe o cache da Vercel e faça redeploy

### Cold Start muito lento

**Solução**: Use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) para manter a função "aquecida":

1. Crie `server/api/health.js`:
   ```javascript
   module.exports = (req, res) => {
     res.json({ status: 'ok' });
   };
   ```

2. Configure em `vercel.json`:
   ```json
   "crons": [{
     "path": "/api/health",
     "schedule": "*/5 * * * *"
   }]
   ```

---

## 📊 Monitoramento

### Vercel Analytics

1. Vá no projeto frontend > **Analytics**
2. Ative **Vercel Analytics** (gratuito)
3. Adicione ao código (já incluído automaticamente)

### Logs em Tempo Real

```bash
# Terminal 1: Logs do backend
vercel logs quadrinhos-rei-backend --follow

# Terminal 2: Logs do frontend
vercel logs quadrinhos-rei-frontend --follow
```

---

## 💰 Custos Estimados (Plano Gratuito)

- **Vercel**: Grátis até 100GB bandwidth/mês
- **Neon**: Grátis até 0.5GB (plano Free Tier) - depois a partir de $19/mês
- **Cloudinary**: Grátis até 25GB storage + 25GB bandwidth/mês
- **Google Gemini**: Grátis até 60 requests/minuto

**Total**: ~$0/mês no plano gratuito (suficiente para testes e projetos pequenos) 💸

**Nota**: O plano gratuito do Neon é bem generoso e inclui:
- 0.5 GB de storage
- Branches ilimitadas
- Pooling de conexões
- Escala automática para zero (não paga quando não usa)

---

## 📚 Referências

- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs/introduction)
- [Neon + Vercel Integration](https://neon.tech/docs/guides/vercel)
- [Strapi Deployment](https://docs.strapi.io/dev-docs/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## ✅ Checklist de Deploy

- [ ] Repositório Git configurado e atualizado
- [ ] Neon PostgreSQL criado e credenciais anotadas
- [ ] Secrets de produção gerados (APP_KEYS, JWT_SECRET, etc)
- [ ] Conta Cloudinary criada e credenciais anotadas
- [ ] Backend deployado na Vercel
- [ ] Banco de dados populado/migrado
- [ ] Frontend deployado na Vercel
- [ ] CORS configurado com URL do frontend
- [ ] Testes realizados (login, compra, upload)
- [ ] Variáveis de ambiente revisadas
- [ ] Domínio customizado configurado (opcional)

---

## 🎉 Pronto!

Seu projeto está no ar! 🚀

Se encontrar problemas, consulte a seção de Troubleshooting ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para Quadrinhos Rei**
