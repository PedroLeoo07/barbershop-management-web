import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, notFound, noContent } from '@/lib/errors';

const updateBarberSchema = z.object({
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  workingDays: z.array(z.number().min(0).max(6)).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

// GET /api/barbers/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const barber = await prisma.barberDetails.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        reviews: {
          include: { client: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!barber) return notFound('Barbeiro não encontrado');
    return success({ barber });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/barbers/[id] - Update barber (Admin only)
async function updateBarberHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await validateBody(request, updateBarberSchema);
    if (result.error) return result.error;

    const barber = await prisma.barberDetails.update({
      where: { id: params.id },
      data: result.data,
    });

    return success({ message: 'Barbeiro atualizado com sucesso', barber });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/barbers/[id] - Deactivate barber (Admin only)
async function deleteBarberHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const barber = await prisma.barberDetails.findUnique({ where: { id: params.id } });
    if (!barber) return notFound('Barbeiro não encontrado');

    await prisma.user.update({
      where: { id: barber.userId },
      data: { isActive: false },
    });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = authorize('ADMIN')(updateBarberHandler);
export const DELETE = authorize('ADMIN')(deleteBarberHandler);
