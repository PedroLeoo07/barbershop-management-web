import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { validateQuery } from '@/lib/validation';
import { handleError, success, notFound } from '@/lib/errors';

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string(),
});

// GET /api/barbers/[id]/availability?date=2024-01-15&serviceId=xxx
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const result = validateQuery(searchParams, querySchema);
    if (result.error) return result.error;

    const { date, serviceId } = result.data;

    const barber = await prisma.barberDetails.findUnique({
      where: { id: params.id },
    });

    if (!barber) return notFound('Barbeiro não encontrado');

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) return notFound('Serviço não encontrado');

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    if (!barber.workingDays.includes(dayOfWeek)) {
      return success({ availableSlots: [], message: 'Barbeiro não trabalha neste dia' });
    }

    // Get appointments for this day
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: params.id,
        date: targetDate,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    // Get schedule rules
    const rules = await prisma.scheduleRule.findMany({
      where: {
        barberId: params.id,
        isActive: true,
        startDate: { lte: targetDate },
        OR: [
          { endDate: null },
          { endDate: { gte: targetDate } },
        ],
      },
    });

    // Generate slots (simplified - you'd implement proper slot generation)
    const availableSlots = [];
    const [startHour, startMin] = barber.startTime.split(':').map(Number);
    const [endHour, endMin] = barber.endTime.split(':').map(Number);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = \`\${hour.toString().padStart(2, '0')}:00\`;
      const isBooked = appointments.some(apt => apt.startTime === timeSlot);
      if (!isBooked) {
        availableSlots.push({ time: timeSlot, available: true });
      }
    }

    return success({ availableSlots, barber: { name: barber.user }, service });
  } catch (error) {
    return handleError(error);
  }
}
