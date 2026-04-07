import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { validateBody, validateQuery } from '@/lib/validation';
import { handleError, success, created, badRequest } from '@/lib/errors';

const createAppointmentSchema = z.object({
  barberId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  startTime: z.string(),
  notes: z.string().optional(),
});

const querySchema = z.object({
  status: z.string().optional(),
  barberId: z.string().optional(),
  clientId: z.string().optional(),
});

// GET /api/appointments
async function listAppointmentsHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = validateQuery(searchParams, querySchema);
    if (result.error) return result.error;

    const { status, barberId, clientId } = result.data;
    const userId = request.user?.userId;
    const userRole = request.user?.role;

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(barberId && { barberId }),
        ...(clientId && { clientId }),
        ...(userRole === 'CLIENT' && { clientId: userId }),
        ...(userRole === 'BARBER' && { barber: { userId } }),
      },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        barber: { select: { id: true, user: { select: { name: true } } } },
        service: true,
        payment: true,
      },
      orderBy: { date: 'desc' },
    });

    return success({ appointments, count: appointments.length });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/appointments
async function createAppointmentHandler(request: AuthenticatedRequest) {
  try {
    const result = await validateBody(request, createAppointmentSchema);
    if (result.error) return result.error;

    const { barberId, serviceId, date, startTime, notes } = result.data;
    const clientId = request.user?.userId;

    // Check if client is blocked
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { clientDetails: true },
    });

    if (client?.clientDetails?.isBlocked) {
      return badRequest('Você está bloqueado e não pode fazer agendamentos');
    }

    // Get service to calculate end time
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return badRequest('Serviço não encontrado');

    const [hour, min] = startTime.split(':').map(Number);
    const endHour = hour + Math.floor(service.duration / 60);
    const endMin = min + (service.duration % 60);
    const endTime = \`\${endHour.toString().padStart(2, '0')}:\${endMin.toString().padStart(2, '0')}\`;

    // Check for conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        date: new Date(date),
        startTime,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    if (conflictingAppointment) {
      return badRequest('Horário já está ocupado');
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: clientId!,
        barberId,
        serviceId,
        date: new Date(date),
        startTime,
        endTime,
        notes,
      },
      include: {
        client: { select: { name: true, email: true } },
        barber: { select: { user: { select: { name: true } } } },
        service: true,
      },
    });

    return created({ message: 'Agendamento criado com sucesso', appointment });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = authenticate(listAppointmentsHandler);
export const POST = authenticate(createAppointmentHandler);
