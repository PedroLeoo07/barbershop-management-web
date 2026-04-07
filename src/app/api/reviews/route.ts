import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, created, badRequest } from '@/lib/errors';

const createReviewSchema = z.object({
  appointmentId: z.string(),
  barberId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// POST /api/reviews
async function createReviewHandler(request: AuthenticatedRequest) {
  try {
    const result = await validateBody(request, createReviewSchema);
    if (result.error) return result.error;

    const clientId = request.user?.userId;
    const { appointmentId, barberId, rating, comment } = result.data;

    // Check if appointment exists and is completed
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.status !== 'COMPLETED') {
      return badRequest('Apenas agendamentos concluídos podem ser avaliados');
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId },
    });

    if (existingReview) {
      return badRequest('Este agendamento já foi avaliado');
    }

    const review = await prisma.review.create({
      data: { appointmentId, clientId: clientId!, barberId, rating, comment },
    });

    // Update barber rating
    const reviews = await prisma.review.findMany({ where: { barberId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.barberDetails.update({
      where: { id: barberId },
      data: { rating: avgRating, reviewCount: reviews.length },
    });

    return created({ message: 'Avaliação criada com sucesso', review });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = authenticate(createReviewHandler);
