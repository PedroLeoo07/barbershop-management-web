import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, created } from '@/lib/errors';

const createPaymentSchema = z.object({
  appointmentId: z.string(),
  method: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH']),
  amount: z.number().positive(),
});

// GET /api/payments
async function listPaymentsHandler(request: AuthenticatedRequest) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            client: { select: { name: true } },
            barber: { select: { user: { select: { name: true } } } },
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success({ payments, count: payments.length });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/payments
async function createPaymentHandler(request: AuthenticatedRequest) {
  try {
    const result = await validateBody(request, createPaymentSchema);
    if (result.error) return result.error;

    const payment = await prisma.payment.create({
      data: result.data,
    });

    return created({ message: 'Pagamento criado com sucesso', payment });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = authenticate(listPaymentsHandler);
export const POST = authenticate(createPaymentHandler);
