import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateQuery } from '@/lib/validation';
import { handleError, success } from '@/lib/errors';

const querySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

// GET /api/reports/revenue?startDate=2024-01-01&endDate=2024-01-31 (Admin only)
async function revenueReportHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = validateQuery(searchParams, querySchema);
    if (result.error) return result.error;

    const { startDate, endDate } = result.data;

    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        paidAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: { appointment: { include: { service: true } } },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    return success({ total, count: payments.length, byMethod, payments });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = authorize('ADMIN')(revenueReportHandler);
