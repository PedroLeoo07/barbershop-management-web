import { NextRequest } from 'next/server';
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
