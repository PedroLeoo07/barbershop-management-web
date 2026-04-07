import { NextRequest, NextResponse } from 'next/server';
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
