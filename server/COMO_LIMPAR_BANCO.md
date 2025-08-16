# 🧹 Como Limpar o Banco de Dados - Guia Completo

Este guia te ensina como executar a limpeza do banco de dados quando precisar.

## 📋 Pré-requisitos

1. **PostgreSQL** deve estar rodando
2. **Credenciais do banco** devem estar corretas no arquivo `.env`
3. **Terminal/Prompt** de comando disponível

## 🚀 Passo a Passo

### Opção 1: Usando o Script SQL (Recomendado)

#### 1. Navegue até a pasta do servidor
```bash
cd /home/gustavo_santos/Downloads/quadrinho-rei-monorepo/server
```

#### 2. Execute o script de limpeza
```bash
PGPASSWORD=Minato1112 psql -h localhost -U gustavo -d quadrinhos-rei -f cleanup.sql
```

**Pronto!** A limpeza será executada automaticamente.

---

### Opção 2: Script Interativo (Mais Seguro)

#### 1. Navegue até a pasta do servidor
```bash
cd /home/gustavo_santos/Downloads/quadrinho-rei-monorepo/server
```

#### 2. Primeiro, verifique o status atual do banco
```bash
node scripts/check-database-status.js
```
*Isso mostra quantos dados existem antes da limpeza*

#### 3. Execute a limpeza interativa
```bash
node scripts/cleanup-database.js
```
*Digite "CONFIRMAR" quando solicitado*

---

### Opção 3: Comando Direto (Mais Rápido)

Se você quiser um comando único para copiar/colar:

```bash
cd /home/gustavo_santos/Downloads/quadrinho-rei-monorepo/server && PGPASSWORD=Minato1112 psql -h localhost -U gustavo -d quadrinhos-rei -f cleanup.sql
```

## 📊 O que Cada Script Faz

### `cleanup.sql` ✅ **RECOMENDADO**
- ✅ **Mais rápido** (execução direta no banco)
- ✅ **Mais confiável** (sem dependências JavaScript)
- ✅ **Mostra progresso** em tempo real
- ✅ **Preserva dados de sistema** (status, categorias)

### `check-database-status.js`
- 📊 Mostra quantos dados existem
- 🔍 Permite verificar antes de limpar
- ⚠️ Pode dar erro 403 se servidor não estiver rodando

### `cleanup-database.js` 
- 🛡️ Pede confirmação antes de executar
- 📱 Interface mais amigável
- ⚠️ Pode ter problemas de conectividade

## 🗂️ Localização dos Arquivos

Todos os scripts estão em:
```
/home/gustavo_santos/Downloads/quadrinho-rei-monorepo/server/
├── cleanup.sql                    ← Script SQL principal
├── scripts/
│   ├── check-database-status.js   ← Verificar status
│   ├── cleanup-database.js        ← Script interativo
│   └── cleanup-simple.js          ← Alternativa
└── DATABASE_CLEANUP_GUIDE.md      ← Documentação completa
```

## 🛡️ Dados Preservados vs. Removidos

### ✅ **SEMPRE PRESERVADOS:**
- 📚 **Produtos** (quadrinhos)
- 👥 **Clientes**  
- 🏠 **Endereços**
- 💳 **Cartões**
- 👤 **Usuários**
- ⚙️ **Status de compras e trocas**
- 📂 **Categorias de produtos**
- 💰 **Tipos de precificação**

### ❌ **SEMPRE REMOVIDOS:**
- 🛒 **Compras**
- 🔄 **Trocas**
- 🎫 **Cupons**
- 📦 **Itens do carrinho**
- 💬 **Chat (conversas e mensagens)**

## 🔧 Solução de Problemas

### Erro: "psql: command not found"
**Causa:** PostgreSQL não está instalado ou não está no PATH

**Solução:**
```bash
# Ubuntu/Debian
sudo apt install postgresql-client

# macOS
brew install postgresql
```

### Erro: "connection refused"
**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
# Verificar se está rodando
sudo systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql
```

### Erro: "authentication failed"
**Causa:** Senha ou usuário incorretos

**Solução:**
1. Verifique o arquivo `.env`:
   ```bash
   cat .env | grep DATABASE
   ```
2. Confirme se as credenciais estão corretas
3. Teste a conexão:
   ```bash
   PGPASSWORD=Minato1112 psql -h localhost -U gustavo -d quadrinhos-rei -c "SELECT 1;"
   ```

### Erro: "database does not exist"
**Causa:** Nome do banco incorreto

**Solução:**
1. Verifique bancos disponíveis:
   ```bash
   PGPASSWORD=Minato1112 psql -h localhost -U gustavo -l
   ```
2. Ajuste o nome no comando se necessário

## 📝 Exemplo de Execução Completa

```bash
# 1. Navegar para a pasta
cd /home/gustavo_santos/Downloads/quadrinho-rei-monorepo/server

# 2. Ver dados atuais (opcional)
echo "📊 Status antes da limpeza:"
PGPASSWORD=Minato1112 psql -h localhost -U gustavo -d quadrinhos-rei -c "SELECT 'Compras: ' || COUNT(*) FROM purchases; SELECT 'Trocas: ' || COUNT(*) FROM trades;"

# 3. Executar limpeza
echo "🧹 Executando limpeza..."
PGPASSWORD=Minato1112 psql -h localhost -U gustavo -d quadrinhos-rei -f cleanup.sql

# 4. Confirmar resultado (opcional)
echo "✅ Limpeza concluída!"
```

## 💡 Dicas Importantes

1. **⚠️ SEMPRE** faça backup antes de executar em produção
2. **✅ TESTE** primeiro em ambiente de desenvolvimento  
3. **📊 VERIFIQUE** o status antes e depois da limpeza
4. **🔒 MANTENHA** as credenciais do `.env` seguras
5. **📱 USE** a **Opção 1** (SQL) para máxima confiabilidade

## 📞 Em Caso de Problemas

Se algo der errado, você pode:

1. **Verificar logs** do PostgreSQL
2. **Testar conexão** com o banco manualmente
3. **Restaurar backup** se disponível
4. **Re-executar** o script (é seguro rodar múltiplas vezes)

---

**✨ Pronto! Agora você pode limpar o banco sempre que precisar!**