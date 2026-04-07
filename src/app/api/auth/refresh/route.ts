import { NextRequest } from 'next/server';
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
