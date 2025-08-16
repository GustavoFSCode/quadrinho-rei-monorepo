#!/bin/bash

# Script para limpeza rápida do banco de dados
# Executa a limpeza preservando produtos, clientes e dados de sistema

echo "🧹 SCRIPT DE LIMPEZA DO BANCO"
echo "============================="
echo ""

# Verificar se estamos na pasta correta
if [ ! -f "cleanup.sql" ]; then
    echo "❌ Erro: Arquivo cleanup.sql não encontrado!"
    echo "   Execute este script na pasta /server/"
    echo ""
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Erro: Arquivo .env não encontrado!"
    echo "   Verifique se está na pasta correta do servidor"
    echo ""
    exit 1
fi

# Ler credenciais do .env
DB_HOST=$(grep "DATABASE_HOST=" .env | cut -d '=' -f2)
DB_PORT=$(grep "DATABASE_PORT=" .env | cut -d '=' -f2)
DB_NAME=$(grep "DATABASE_NAME=" .env | cut -d '=' -f2)
DB_USER=$(grep "DATABASE_USERNAME=" .env | cut -d '=' -f2)
DB_PASS=$(grep "DATABASE_PASSWORD=" .env | cut -d '=' -f2)

echo "📊 Configuração do banco:"
echo "   Host: $DB_HOST"
echo "   Porta: $DB_PORT" 
echo "   Banco: $DB_NAME"
echo "   Usuário: $DB_USER"
echo ""

# Verificar conexão com o banco
echo "🔍 Testando conexão com o banco..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Erro: Não foi possível conectar ao banco!"
    echo "   Verifique se:"
    echo "   - PostgreSQL está rodando"
    echo "   - Credenciais no .env estão corretas"
    echo "   - Banco '$DB_NAME' existe"
    echo ""
    exit 1
fi

echo "✅ Conexão com banco OK!"
echo ""

# Pedir confirmação
read -p "⚠️  Tem certeza que deseja limpar o banco? (digite 'CONFIRMAR'): " confirmacao

if [ "$confirmacao" != "CONFIRMAR" ]; then
    echo "❌ Operação cancelada."
    echo ""
    exit 0
fi

echo ""
echo "🚀 Executando limpeza do banco..."
echo ""

# Executar o script SQL
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f cleanup.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 LIMPEZA CONCLUÍDA COM SUCESSO!"
    echo ""
    echo "✅ Dados preservados:"
    echo "   📚 Produtos (quadrinhos)"
    echo "   👥 Clientes"
    echo "   🏠 Endereços"  
    echo "   💳 Cartões"
    echo "   👤 Usuários"
    echo "   ⚙️  Status de sistema"
    echo ""
    echo "❌ Dados removidos:"
    echo "   🛒 Compras"
    echo "   🔄 Trocas" 
    echo "   🎫 Cupons"
    echo "   📦 Carrinho"
    echo "   💬 Chat"
    echo ""
    echo "✨ Banco pronto para uso!"
else
    echo ""
    echo "❌ ERRO durante a limpeza!"
    echo "   Verifique os logs acima para detalhes"
    echo ""
    exit 1
fi