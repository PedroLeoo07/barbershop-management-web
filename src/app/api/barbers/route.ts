import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, created } from '@/lib/errors';
import { hashPassword } from '@/lib/auth';

const createBarberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  workingDays: z.array(z.number().min(0).max(6)),
  startTime: z.string(),
  endTime: z.string(),
});

// GET /api/barbers - List barbers
export async function GET(request: NextRequest) {
  try {
    const barbers = await prisma.barberDetails.findMany({
      where: { isAvailable: true, user: { isActive: true } },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    return success({ barbers, count: barbers.length });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/barbers - Create barber (Admin only)
async function createBarberHandler(request: NextRequest) {
  try {
    const result = await validateBody(request, createBarberSchema);
    if (result.error) return result.error;

    const { email, password, name, phone, ...barberData } = result.data;
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email, password: hashedPassword, name, phone, role: 'BARBER',
        barberDetails: { create: barberData },
      },
      include: { barberDetails: true },
    });

    return created({ message: 'Barbeiro criado com sucesso', barber: user });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = authorize('ADMIN')(createBarberHandler);
