import { NextRequest } from 'next/server';
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
        ...(role === 'BARBER' && { barberDetails: { create: { workingDays: [1,2,3,4,5], startTime: '09:00', endTime: '18:00' } } }),
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
