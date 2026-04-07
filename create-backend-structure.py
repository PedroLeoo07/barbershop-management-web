import os
import pathlib

# Base directory
BASE_DIR = pathlib.Path(__file__).parent

print("""
╔══════════════════════════════════════════════════════════╗
║   🏪 BARBERSHOP MANAGEMENT - BACKEND GENERATOR v2.0    ║
║   Gerando estrutura completa de API Routes...          ║
╚══════════════════════════════════════════════════════════╝
""")

# API Routes structure - COMPLETO
API_ROUTES = {
    "auth/login": """import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateBody } from '@/lib/validation';
import { handleError, success, unauthorized } from '@/lib/errors';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const result = await validateBody(request, loginSchema);
    if (result.error) return result.error;
    
    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { clientDetails: true, barberDetails: true },
    });

    if (!user || !user.isActive) {
      return unauthorized('Email ou senha incorretos');
    }

    if (user.role === 'CLIENT' && user.clientDetails?.isBlocked) {
      const blockedUntil = user.clientDetails.blockedUntil;
      if (blockedUntil && blockedUntil > new Date()) {
        return unauthorized(`Conta bloqueada até ${blockedUntil.toLocaleDateString('pt-BR')}`);
      }
      await prisma.clientDetails.update({
        where: { id: user.clientDetails.id },
        data: { isBlocked: false, blockedReason: null, blockedUntil: null },
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return unauthorized('Email ou senha incorretos');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    const { password: _, ...userWithoutPassword } = user;

    return success({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    return handleError(error);
  }
}
""",
    
    "auth/register": """import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateBody } from '@/lib/validation';
import { handleError, created, conflict } from '@/lib/errors';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.enum(['CLIENT', 'BARBER', 'ADMIN']).optional().default('CLIENT'),
});

export async function POST(request: NextRequest) {
  try {
    const result = await validateBody(request, registerSchema);
    if (result.error) return result.error;
    
    const { email, password, name, phone, cpf, role } = result.data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(cpf ? [{ cpf }] : [])] },
    });

    if (existingUser) {
      return conflict(existingUser.email === email ? 'Email já cadastrado' : 'CPF já cadastrado');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email, password: hashedPassword, name, phone, cpf, role,
        ...(role === 'CLIENT' && { clientDetails: { create: {} } }),
        ...(role === 'BARBER' && { 
          barberDetails: { create: { workingDays: [1,2,3,4,5], startTime: '09:00', endTime: '18:00' } } 
        }),
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    return created({ message: 'Usuário registrado com sucesso', user, tokens: { accessToken, refreshToken } });
  } catch (error) {
    return handleError(error);
  }
}
""",
    
    "auth/refresh": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateBody } from '@/lib/validation';
import { handleError, success, unauthorized } from '@/lib/errors';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const result = await validateBody(request, refreshSchema);
    if (result.error) return result.error;
    
    const { refreshToken: token } = result.data;

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      return unauthorized('Refresh token inválido ou expirado');
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return unauthorized('Refresh token expirado');
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email, role: payload.role });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email, role: payload.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { token: newRefreshToken, expiresAt },
    });

    return success({ message: 'Token renovado com sucesso', tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch (error) {
    return handleError(error);
  }
}
""",
    
    "auth/logout": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success } from '@/lib/errors';

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

async function logoutHandler(request: NextRequest & { user?: any }) {
  try {
    const result = await validateBody(request, logoutSchema);
    if (result.error) return result.error;
    
    const { refreshToken } = result.data;
    const userId = request.user?.userId;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId } });
    } else if (userId) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
    }

    return success({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = authenticate(logoutHandler);
""",
    
    "auth/me": """import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { handleError, success, notFound } from '@/lib/errors';

async function meHandler(request: AuthenticatedRequest) {
  try {
    const userId = request.user?.userId;
    if (!userId) return notFound('Usuário não encontrado');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, phone: true, cpf: true,
        role: true, isActive: true, createdAt: true, updatedAt: true,
        clientDetails: true, barberDetails: true,
      },
    });

    if (!user) return notFound('Usuário não encontrado');
    return success({ user });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = authenticate(meHandler);
""",
}

def create_api_routes():
    """Create all API route files"""
    api_dir = BASE_DIR / "src" / "app" / "api"
    
    for route_path, content in API_ROUTES.items():
        # Create directory
        route_dir = api_dir / route_path
        route_dir.mkdir(parents=True, exist_ok=True)
        
        # Create route.ts file
        route_file = route_dir / "route.ts"
        route_file.write_text(content, encoding='utf-8')
        print(f"✅ Created: {route_file}")

def create_prisma_schema():
    """Create prisma schema file"""
    prisma_dir = BASE_DIR / "prisma"
    prisma_dir.mkdir(exist_ok=True)
    
    schema_content = (BASE_DIR / "PRISMA_SCHEMA.txt").read_text(encoding='utf-8')
    schema_file = prisma_dir / "schema.prisma"
    schema_file.write_text(schema_content, encoding='utf-8')
    print(f"✅ Created: {schema_file}")

if __name__ == "__main__":
    print("🚀 Criando estrutura de backend...\n")
    
    try:
        create_prisma_schema()
        create_api_routes()
        
        print("\n✨ Estrutura criada com sucesso!")
        print("\n📝 Próximos passos:")
        print("1. Execute: setup-backend.bat (Windows) ou ./setup-backend.sh (Linux/Mac)")
        print("2. Configure o DATABASE_URL no .env.local")
        print("3. Execute: npx prisma migrate dev --name init")
        print("4. Teste a API em: http://localhost:3000/api/auth/login")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
