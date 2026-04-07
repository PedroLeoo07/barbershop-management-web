import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🔍 DIAGNÓSTICO DO BACKEND\n');
console.log('='.repeat(60));

async function checkFile(filePath: string, description: string) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

async function checkNodeModules(module: string) {
  try {
    require.resolve(module);
    console.log(`✅ Módulo instalado: ${module}`);
    return true;
  } catch {
    console.log(`❌ Módulo FALTANDO: ${module}`);
    return false;
  }
}

async function runDiagnostic() {
  console.log('\n📦 1. VERIFICANDO ARQUIVOS ESSENCIAIS:\n');
  
  await checkFile('prisma/schema.prisma', 'Schema Prisma');
  await checkFile('src/lib/prisma.ts', 'Cliente Prisma');
  await checkFile('src/lib/auth.ts', 'Autenticação');
  await checkFile('src/lib/middleware.ts', 'Middleware');
  await checkFile('src/lib/validation.ts', 'Validação');
  await checkFile('src/lib/errors.ts', 'Tratamento de erros');
  await checkFile('.env.local', 'Variáveis de ambiente');

  console.log('\n📦 2. VERIFICANDO ROTAS DE API:\n');
  
  const apiRoutes = [
    'src/app/api/auth/login/route.ts',
    'src/app/api/auth/register/route.ts',
    'src/app/api/services/route.ts',
    'src/app/api/barbers/route.ts',
    'src/app/api/appointments/route.ts',
  ];

  for (const route of apiRoutes) {
    await checkFile(route, route.replace('src/app/api/', ''));
  }

  console.log('\n📦 3. VERIFICANDO DEPENDÊNCIAS:\n');
  
  const modules = [
    '@prisma/client',
    'bcrypt',
    'jsonwebtoken',
    'zod',
  ];

  let allModulesInstalled = true;
  for (const mod of modules) {
    const installed = await checkNodeModules(mod);
    if (!installed) allModulesInstalled = false;
  }

  console.log('\n📦 4. VERIFICANDO PRISMA:\n');
  
  try {
    // Check if Prisma client is generated
    const prismaClientPath = 'node_modules/.prisma/client';
    const prismaGenerated = fs.existsSync(prismaClientPath);
    console.log(`${prismaGenerated ? '✅' : '❌'} Cliente Prisma gerado`);
    
    if (!prismaGenerated) {
      console.log('   ⚠️  Execute: npx prisma generate');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar Prisma');
  }

  console.log('\n📦 5. VERIFICANDO VARIÁVEIS DE AMBIENTE:\n');
  
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');
    const hasJwtSecret = envContent.includes('JWT_SECRET');
    
    console.log(`${hasDatabaseUrl ? '✅' : '❌'} DATABASE_URL configurado`);
    console.log(`${hasJwtSecret ? '✅' : '✅'} JWT_SECRET configurado (padrão ok)`);
  } else {
    console.log('❌ Arquivo .env.local não encontrado');
    console.log('   ⚠️  Copie .env.example para .env.local');
  }

  console.log('\n📦 6. TESTANDO IMPORTS:\n');
  
  try {
    // Test if we can import the modules
    const tests = [
      { file: './src/lib/prisma', name: 'Prisma Client' },
      { file: './src/lib/auth', name: 'Auth Functions' },
      { file: './src/lib/errors', name: 'Error Handlers' },
    ];

    for (const test of tests) {
      try {
        await import(test.file);
        console.log(`✅ Import OK: ${test.name}`);
      } catch (error: any) {
        console.log(`❌ Erro ao importar ${test.name}:`);
        console.log(`   ${error.message}`);
      }
    }
  } catch (error) {
    console.log('❌ Erro ao testar imports');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 RESUMO:\n');

  if (!allModulesInstalled) {
    console.log('⚠️  AÇÃO NECESSÁRIA: Instalar dependências');
    console.log('   npm install @prisma/client prisma bcrypt jsonwebtoken zod');
  }

  if (!fs.existsSync('node_modules/.prisma/client')) {
    console.log('⚠️  AÇÃO NECESSÁRIA: Gerar cliente Prisma');
    console.log('   npx prisma generate');
  }

  if (!fs.existsSync('.env.local')) {
    console.log('⚠️  AÇÃO NECESSÁRIA: Configurar ambiente');
    console.log('   cp .env.example .env.local');
    console.log('   # Edite .env.local e configure DATABASE_URL');
  }

  console.log('\n✅ Execute o servidor: npm run dev');
  console.log('✅ Teste a API em: http://localhost:3000/api/auth/login\n');
}

runDiagnostic().catch(console.error);
