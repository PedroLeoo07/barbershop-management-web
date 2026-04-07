@echo off
echo.
echo ====================================
echo  🔧 TESTE RAPIDO DO BACKEND
echo ====================================
echo.

echo 📍 Testando endpoint de login...
echo.

curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"123456\",\"name\":\"Test User\"}"

echo.
echo.
echo ====================================
echo.
echo Se você viu um JSON de resposta acima, o backend está funcionando!
echo.
echo Se viu erro 404 ou erro de conexão:
echo   1. Certifique-se que o servidor está rodando (npm run dev)
echo   2. Verifique se a porta 3000 está livre
echo   3. Veja os logs do terminal
echo.
echo ====================================
pause
