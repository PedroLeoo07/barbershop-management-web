@echo off
echo 🚀 Instalando dependências do backend...

REM Instalar dependências principais
call npm install @prisma/client prisma bcrypt jsonwebtoken zod dotenv

REM Instalar types
call npm install --save-dev @types/bcrypt @types/jsonwebtoken

echo ✅ Dependências instaladas!

echo.
echo 📦 Configurando Prisma...

REM Criar diretório prisma se não existir
if not exist prisma mkdir prisma

REM Gerar cliente Prisma
call npx prisma generate

echo.
echo 🗄️  Para configurar o banco de dados, execute:
echo   1. Configure o DATABASE_URL no .env.local
echo   2. npx prisma migrate dev --name init
echo   3. npx prisma db seed (opcional)

echo.
echo ✨ Setup completo!
pause
