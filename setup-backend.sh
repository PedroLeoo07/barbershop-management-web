#!/bin/bash

echo "🚀 Instalando dependências do backend..."

# Instalar dependências principais
npm install @prisma/client prisma bcrypt jsonwebtoken zod dotenv

# Instalar types
npm install --save-dev @types/bcrypt @types/jsonwebtoken

echo "✅ Dependências instaladas!"

echo ""
echo "📦 Configurando Prisma..."

# Criar diretório prisma se não existir
mkdir -p prisma

# Gerar cliente Prisma
npx prisma generate

echo ""
echo "🗄️  Para configurar o banco de dados, execute:"
echo "  1. Configure o DATABASE_URL no .env.local"
echo "  2. npx prisma migrate dev --name init"
echo "  3. npx prisma db seed (opcional)"

echo ""
echo "✨ Setup completo!"
