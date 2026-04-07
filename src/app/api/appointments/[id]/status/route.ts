import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize, AuthenticatedRequest } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, notFound } from '@/lib/errors';

const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW']),
});

// PATCH /api/appointments/[id]/status (Barber/Admin only)
async function updateStatusHandler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const result = await validateBody(request, updateStatusSchema);
    if (result.error) return result.error;

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { client: { include: { clientDetails: true } } },
    });

    if (!appointment) return notFound('Agendamento não encontrado');

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: result.data.status },
    });

    // Handle no-show logic
    if (result.data.status === 'NO_SHOW' && appointment.client.clientDetails) {
      const newCount = appointment.client.clientDetails.noShowCount + 1;
      
      if (newCount >= 3) {
        const blockedUntil = new Date();
        blockedUntil.setDate(blockedUntil.getDate() + 30); // Block for 30 days
        
        await prisma.clientDetails.update({
          where: { id: appointment.client.clientDetails.id },
          data: {
            noShowCount: newCount,
            isBlocked: true,
            blockedReason: 'Múltiplas faltas sem aviso prévio',
            blockedUntil,
          },
        });
      } else {
        await prisma.clientDetails.update({
          where: { id: appointment.client.clientDetails.id },
          data: { noShowCount: newCount },
        });
      }
    }

    // Update barber stats if completed
    if (result.data.status === 'COMPLETED') {
      await prisma.barberDetails.update({
        where: { id: appointment.barberId },
        data: { totalServices: { increment: 1 } },
      });
    }

    return success({ message: 'Status atualizado com sucesso', appointment: updated });
  } catch (error) {
    return handleError(error);
  }
}

export const PATCH = authorize('BARBER', 'ADMIN')(updateStatusHandler);
