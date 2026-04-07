import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, notFound, noContent } from '@/lib/errors';

const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/services/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service) return notFound('Serviço não encontrado');
    return success({ service });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/services/[id] - Update service (Admin only)
async function updateServiceHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await validateBody(request, updateServiceSchema);
    if (result.error) return result.error;

    const service = await prisma.service.update({
      where: { id: params.id },
      data: result.data,
    });

    return success({ message: 'Serviço atualizado com sucesso', service });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/services/[id] - Delete service (Admin only)
async function deleteServiceHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.service.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = authorize('ADMIN')(updateServiceHandler);
export const DELETE = authorize('ADMIN')(deleteServiceHandler);
