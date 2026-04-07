import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody, validateQuery } from '@/lib/validation';
import { handleError, success, created } from '@/lib/errors';

const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  duration: z.number().int().positive('Duração deve ser positiva (em minutos)'),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

const querySchema = z.object({
  category: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

// GET /api/services - List services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = validateQuery(searchParams, querySchema);
    if (result.error) return result.error;

    const { category, isActive } = result.data;

    const services = await prisma.service.findMany({
      where: {
        ...(category && { category }),
        ...(isActive && { isActive: isActive === 'true' }),
      },
      orderBy: { name: 'asc' },
    });

    return success({ services, count: services.length });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/services - Create service (Admin only)
async function createServiceHandler(request: NextRequest) {
  try {
    const result = await validateBody(request, createServiceSchema);
    if (result.error) return result.error;

    const service = await prisma.service.create({
      data: result.data,
    });

    return created({ message: 'Serviço criado com sucesso', service });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = authorize('ADMIN')(createServiceHandler);
