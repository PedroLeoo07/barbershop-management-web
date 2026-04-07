import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, created } from '@/lib/errors';

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  costPrice: z.number().positive(),
  sellPrice: z.number().positive(),
  currentStock: z.number().int().min(0),
  minStock: z.number().int().min(0),
  maxStock: z.number().int().positive(),
  unit: z.string().default('un'),
});

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return success({ products, count: products.length });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/products (Admin only)
async function createProductHandler(request: NextRequest) {
  try {
    const result = await validateBody(request, createProductSchema);
    if (result.error) return result.error;

    const product = await prisma.product.create({
      data: result.data,
    });

    return created({ message: 'Produto criado com sucesso', product });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = authorize('ADMIN')(createProductHandler);
