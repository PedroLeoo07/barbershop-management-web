import os
import pathlib

# Base directory
BASE_DIR = pathlib.Path(__file__).parent

print("""
╔══════════════════════════════════════════════════════════╗
║   🏪 BARBERSHOP MANAGEMENT - BACKEND GENERATOR v2.0    ║
║   Gerando estrutura completa de API Routes...          ║
╚══════════════════════════════════════════════════════════╝
""")

# ============================================
# COMPLETE API ROUTES STRUCTURE
# ============================================

API_ROUTES = {
    # ========== AUTH ROUTES ==========
    "auth/login/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateBody } from '@/lib/validation';
import { handleError, success, unauthorized } from '@/lib/errors';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const result = await validateBody(request, loginSchema);
    if (result.error) return result.error;
    
    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { clientDetails: true, barberDetails: true },
    });

    if (!user || !user.isActive) {
      return unauthorized('Email ou senha incorretos');
    }

    if (user.role === 'CLIENT' && user.clientDetails?.isBlocked) {
      const blockedUntil = user.clientDetails.blockedUntil;
      if (blockedUntil && blockedUntil > new Date()) {
        return unauthorized(`Conta bloqueada até ${blockedUntil.toLocaleDateString('pt-BR')}`);
      }
      await prisma.clientDetails.update({
        where: { id: user.clientDetails.id },
        data: { isBlocked: false, blockedReason: null, blockedUntil: null },
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return unauthorized('Email ou senha incorretos');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    const { password: _, ...userWithoutPassword } = user;
    return success({ message: 'Login realizado com sucesso', user: userWithoutPassword, tokens: { accessToken, refreshToken } });
  } catch (error) {
    return handleError(error);
  }
}
""",

    "auth/register/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateBody } from '@/lib/validation';
import { handleError, created, conflict } from '@/lib/errors';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.enum(['CLIENT', 'BARBER', 'ADMIN']).optional().default('CLIENT'),
});

export async function POST(request: NextRequest) {
  try {
    const result = await validateBody(request, registerSchema);
    if (result.error) return result.error;
    
    const { email, password, name, phone, cpf, role } = result.data;
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(cpf ? [{ cpf }] : [])] },
    });

    if (existingUser) {
      return conflict(existingUser.email === email ? 'Email já cadastrado' : 'CPF já cadastrado');
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email, password: hashedPassword, name, phone, cpf, role,
        ...(role === 'CLIENT' && { clientDetails: { create: {} } }),
        ...(role === 'BARBER' && { barberDetails: { create: { workingDays: [1,2,3,4,5], startTime: '09:00', endTime: '18:00' } } }),
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    return created({ message: 'Usuário registrado com sucesso', user, tokens: { accessToken, refreshToken } });
  } catch (error) {
    return handleError(error);
  }
}
""",

    "auth/refresh/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateBody } from '@/lib/validation';
import { handleError, success, unauthorized } from '@/lib/errors';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const result = await validateBody(request, refreshSchema);
    if (result.error) return result.error;
    
    const { refreshToken: token } = result.data;
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      return unauthorized('Refresh token inválido ou expirado');
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return unauthorized('Refresh token expirado');
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email, role: payload.role });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email, role: payload.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { token: newRefreshToken, expiresAt },
    });

    return success({ message: 'Token renovado com sucesso', tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch (error) {
    return handleError(error);
  }
}
""",

    "auth/logout/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success } from '@/lib/errors';

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

async function logoutHandler(request: NextRequest & { user?: any }) {
  try {
    const result = await validateBody(request, logoutSchema);
    if (result.error) return result.error;
    
    const { refreshToken } = result.data;
    const userId = request.user?.userId;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId } });
    } else if (userId) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
    }

    return success({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = authenticate(logoutHandler);
""",

    "auth/me/route.ts": """import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { handleError, success, notFound } from '@/lib/errors';

async function meHandler(request: AuthenticatedRequest) {
  try {
    const userId = request.user?.userId;
    if (!userId) return notFound('Usuário não encontrado');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, phone: true, cpf: true,
        role: true, isActive: true, createdAt: true, updatedAt: true,
        clientDetails: true, barberDetails: true,
      },
    });

    if (!user) return notFound('Usuário não encontrado');
    return success({ user });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = authenticate(meHandler);
""",

    # ========== SERVICES ROUTES ==========
    "services/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody, validateQuery } from '@/lib/validation';
import { handleError, success, created } from '@/lib/errors';

const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  duration: z.number().int().positive('Duração deve ser positiva (em minutos)'),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

const querySchema = z.object({
  category: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

// GET /api/services - List services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = validateQuery(searchParams, querySchema);
    if (result.error) return result.error;

    const { category, isActive } = result.data;

    const services = await prisma.service.findMany({
      where: {
        ...(category && { category }),
        ...(isActive && { isActive: isActive === 'true' }),
      },
      orderBy: { name: 'asc' },
    });

    return success({ services, count: services.length });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/services - Create service (Admin only)
async function createServiceHandler(request: NextRequest) {
  try {
    const result = await validateBody(request, createServiceSchema);
    if (result.error) return result.error;

    const service = await prisma.service.create({
      data: result.data,
    });

    return created({ message: 'Serviço criado com sucesso', service });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = authorize('ADMIN')(createServiceHandler);
""",

    "services/[id]/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, notFound, noContent } from '@/lib/errors';

const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/services/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service) return notFound('Serviço não encontrado');
    return success({ service });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/services/[id] - Update service (Admin only)
async function updateServiceHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await validateBody(request, updateServiceSchema);
    if (result.error) return result.error;

    const service = await prisma.service.update({
      where: { id: params.id },
      data: result.data,
    });

    return success({ message: 'Serviço atualizado com sucesso', service });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/services/[id] - Delete service (Admin only)
async function deleteServiceHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.service.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = authorize('ADMIN')(updateServiceHandler);
export const DELETE = authorize('ADMIN')(deleteServiceHandler);
""",

    # ========== BARBERS ROUTES ==========
    "barbers/route.ts": """import { NextRequest } from 'next/server';
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
""",

    "barbers/[id]/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/middleware';
import { validateBody } from '@/lib/validation';
import { handleError, success, notFound, noContent } from '@/lib/errors';

const updateBarberSchema = z.object({
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  workingDays: z.array(z.number().min(0).max(6)).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

// GET /api/barbers/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const barber = await prisma.barberDetails.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        reviews: {
          include: { client: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!barber) return notFound('Barbeiro não encontrado');
    return success({ barber });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/barbers/[id] - Update barber (Admin only)
async function updateBarberHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await validateBody(request, updateBarberSchema);
    if (result.error) return result.error;

    const barber = await prisma.barberDetails.update({
      where: { id: params.id },
      data: result.data,
    });

    return success({ message: 'Barbeiro atualizado com sucesso', barber });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/barbers/[id] - Deactivate barber (Admin only)
async function deleteBarberHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const barber = await prisma.barberDetails.findUnique({ where: { id: params.id } });
    if (!barber) return notFound('Barbeiro não encontrado');

    await prisma.user.update({
      where: { id: barber.userId },
      data: { isActive: false },
    });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = authorize('ADMIN')(updateBarberHandler);
export const DELETE = authorize('ADMIN')(deleteBarberHandler);
""",

    "barbers/[id]/availability/route.ts": """import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { validateQuery } from '@/lib/validation';
import { handleError, success, notFound } from '@/lib/errors';

const querySchema = z.object({
  date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
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
""",

    # ========== APPOINTMENTS ROUTES ==========
    "appointments/route.ts": """import { NextRequest } from 'next/server';
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
""",

    "appointments/[id]/route.ts": """import { NextRequest } from 'next/server';
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
""",

    "appointments/[id]/status/route.ts": """import { NextRequest } from 'next/server';
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
""",

    # ========== PAYMENTS ROUTES ==========
    "payments/route.ts": """import { NextRequest } from 'next/server';
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
""",

    "payments/[id]/route.ts": """import { NextRequest } from 'next/server';
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
""",

    # ========== REVIEWS ROUTES ==========
    "reviews/route.ts": """import { NextRequest } from 'next/server';
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
""",

    # ========== PRODUCTS ROUTES ==========
    "products/route.ts": """import { NextRequest } from 'next/server';
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
""",

    # ========== REPORTS ROUTES ==========
    "reports/revenue/route.ts": """import { NextRequest } from 'next/server';
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
""",
}

def create_api_routes():
    """Create all API route files"""
    api_dir = BASE_DIR / "src" / "app" / "api"
    
    total = len(API_ROUTES)
    current = 0
    
    for route_path, content in API_ROUTES.items():
        current += 1
        # Create directory
        route_file = api_dir / route_path
        route_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Create route file
        route_file.write_text(content, encoding='utf-8')
        
        progress = int((current / total) * 30)
        bar = '█' * progress + '░' * (30 - progress)
        print(f"\r[{bar}] {current}/{total} - {route_path}", end='', flush=True)
    
    print("\n")

def create_prisma_schema():
    """Create prisma schema file"""
    print("📦 Criando schema do Prisma...")
    prisma_dir = BASE_DIR / "prisma"
    prisma_dir.mkdir(exist_ok=True)
    
    schema_source = BASE_DIR / "PRISMA_SCHEMA.txt"
    if not schema_source.exists():
        print("⚠️  PRISMA_SCHEMA.txt não encontrado! Copie o schema manualmente.")
        return
    
    schema_content = schema_source.read_text(encoding='utf-8')
    schema_file = prisma_dir / "schema.prisma"
    schema_file.write_text(schema_content, encoding='utf-8')
    print(f"✅ {schema_file}")

def create_seed_file():
    """Create seed file with demo data"""
    print("\n🌱 Criando arquivo de seed...")
    seed_content = '''import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@barbershop.com' },
    update: {},
    create: {
      email: 'admin@barbershop.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create barber
  const barberPassword = await hashPassword('barber123');
  const barber = await prisma.user.upsert({
    where: { email: 'barber@barbershop.com' },
    update: {},
    create: {
      email: 'barber@barbershop.com',
      password: barberPassword,
      name: 'João Silva',
      phone: '11999999999',
      role: 'BARBER',
      barberDetails: {
        create: {
          specialties: ['Corte masculino', 'Barba'],
          bio: 'Barbeiro profissional com 10 anos de experiência',
          workingDays: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '18:00',
          commissionRate: 0.5,
        },
      },
    },
  });

  console.log('✅ Barber created:', barber.email);

  // Create services
  const services = [
    { name: 'Corte Masculino', price: 50, duration: 30, category: 'Cabelo' },
    { name: 'Barba', price: 30, duration: 20, category: 'Barba' },
    { name: 'Corte + Barba', price: 70, duration: 45, category: 'Combo' },
    { name: 'Hidratação', price: 80, duration: 60, category: 'Tratamento' },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }

  console.log(`✅ ${services.length} services created`);

  // Create client
  const clientPassword = await hashPassword('client123');
  const client = await prisma.user.upsert({
    where: { email: 'client@barbershop.com' },
    update: {},
    create: {
      email: 'client@barbershop.com',
      password: clientPassword,
      name: 'Carlos Santos',
      phone: '11988888888',
      role: 'CLIENT',
      clientDetails: {
        create: {},
      },
    },
  });

  console.log('✅ Client created:', client.email);

  console.log('\\n🎉 Database seeded successfully!');
  console.log('\\n📝 Demo credentials:');
  console.log('   Admin: admin@barbershop.com / admin123');
  console.log('   Barber: barber@barbershop.com / barber123');
  console.log('   Client: client@barbershop.com / client123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'''
    
    prisma_dir = BASE_DIR / "prisma"
    seed_file = prisma_dir / "seed.ts"
    seed_file.write_text(seed_content, encoding='utf-8')
    print(f"✅ {seed_file}")

if __name__ == "__main__":
    try:
        print("\n🚀 Iniciando geração da estrutura completa...\n")
        
        create_prisma_schema()
        create_seed_file()
        
        print("\n📁 Criando rotas de API...")
        create_api_routes()
        
        print("\n✨ Estrutura criada com sucesso!\n")
        print("=" * 60)
        print("📝 PRÓXIMOS PASSOS:")
        print("=" * 60)
        print("1. Execute: npm install @prisma/client prisma bcrypt jsonwebtoken zod dotenv @types/bcrypt @types/jsonwebtoken")
        print("2. Configure DATABASE_URL no .env.local")
        print("3. Execute: npx prisma generate")
        print("4. Execute: npx prisma migrate dev --name init")
        print("5. Execute: npx prisma db seed (opcional)")
        print("6. Execute: npm run dev")
        print("7. Teste: http://localhost:3000/api/auth/login")
        print("=" * 60)
        
        print(f"\n📊 Estatísticas:")
        print(f"   • {len(API_ROUTES)} rotas de API criadas")
        print(f"   • Schema Prisma configurado")
        print(f"   • Seed file com dados demo")
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
