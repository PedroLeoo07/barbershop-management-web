@echo off
echo.
echo ================================================
echo   🚀 FIX AUTOMATICO - Erro 404 Backend
echo ================================================
echo.

echo 📍 Passo 1: Parando servidor...
echo    (Pressione Ctrl+C se o servidor estiver rodando)
timeout /t 3 /nobreak > nul

echo.
echo 📍 Passo 2: Limpando cache do Next.js...
if exist .next rmdir /s /q .next
if exist .turbo rmdir /s /q .turbo
echo    ✅ Cache limpo!

echo.
echo 📍 Passo 3: Verificando dependências...
call npm install @prisma/client prisma bcrypt jsonwebtoken zod dotenv @types/bcrypt @types/jsonwebtoken ts-node --silent

echo.
echo 📍 Passo 4: Gerando cliente Prisma...
call npx prisma generate

echo.
echo 📍 Passo 5: Iniciando servidor...
echo.
echo ================================================
echo   ✅ PRONTO! Servidor iniciando...
echo ================================================
echo.
echo 🧪 TESTE AGORA:
echo    1. Abra: http://localhost:3000/api/health
echo    2. Deve retornar: {"status":"ok",...}
echo.
echo    Se funcionar, backend está OK!
echo ================================================
echo.

npm run dev
