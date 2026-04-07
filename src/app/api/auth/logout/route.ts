import { NextRequest } from 'next/server';
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
