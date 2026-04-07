import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { handleError, success, notFound } from '@/lib/errors';

// GET /api/payments/[id]
async function getPaymentHandler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        appointment: {
          include: {
            client: { select: { name: true, email: true } },
            service: true,
          },
        },
      },
    });

    if (!payment) return notFound('Pagamento não encontrado');
    return success({ payment });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = authenticate(getPaymentHandler);
