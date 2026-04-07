import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, notFound, noContent, badRequest } from '@/lib/errors';

const updateAppointmentSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/appointments/[id]
async function getAppointmentHandler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        barber: { select: { id: true, user: { select: { name: true } } } },
        service: true,
        payment: true,
        review: true,
      },
    });

    if (!appointment) return notFound('Agendamento não encontrado');
    return success({ appointment });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/appointments/[id] - Reschedule
async function updateAppointmentHandler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const result = await validateBody(request, updateAppointmentSchema);
    if (result.error) return result.error;

    const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
    if (!appointment) return notFound('Agendamento não encontrado');

    if (appointment.status !== 'SCHEDULED') {
      return badRequest('Apenas agendamentos pendentes podem ser alterados');
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: result.data,
    });

    return success({ message: 'Agendamento atualizado com sucesso', appointment: updated });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/appointments/[id] - Cancel
async function cancelAppointmentHandler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.user?.userId;
    const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
    
    if (!appointment) return notFound('Agendamento não encontrado');

    await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
    });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}

export const GET = authenticate(getAppointmentHandler);
export const PUT = authenticate(updateAppointmentHandler);
export const DELETE = authenticate(cancelAppointmentHandler);
