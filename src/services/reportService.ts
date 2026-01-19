import { 
  RevenueReport, 
  DayRevenue, 
  BarberRevenue, 
  ServiceRevenue,
  PaymentMethodStats 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ========== REPORTS API ==========

export async function getRevenueReport(
  period: 'day' | 'week' | 'month' | 'year',
  startDate?: string,
  endDate?: string
): Promise<RevenueReport> {
  const params = new URLSearchParams({ period });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return fetchAPI<RevenueReport>(`/reports/revenue?${params.toString()}`);
}

export async function getBarberPerformance(
  barberId: string,
  startDate: string,
  endDate: string
): Promise<BarberRevenue> {
  const params = new URLSearchParams({ startDate, endDate });
  return fetchAPI<BarberRevenue>(`/reports/barber/${barberId}?${params.toString()}`);
}

export async function getAllBarbersPerformance(
  startDate: string,
  endDate: string
): Promise<BarberRevenue[]> {
  const params = new URLSearchParams({ startDate, endDate });
  return fetchAPI<BarberRevenue[]>(`/reports/barbers?${params.toString()}`);
}

export async function getTopServices(
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<ServiceRevenue[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return fetchAPI<ServiceRevenue[]>(`/reports/services/top?${params.toString()}`);
}

export async function getPaymentMethodStats(
  startDate?: string,
  endDate?: string
): Promise<PaymentMethodStats[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const query = params.toString();
  return fetchAPI<PaymentMethodStats[]>(`/reports/payment-methods${query ? `?${query}` : ''}`);
}

export async function getDailyRevenue(
  startDate: string,
  endDate: string
): Promise<DayRevenue[]> {
  const params = new URLSearchParams({ startDate, endDate });
  return fetchAPI<DayRevenue[]>(`/reports/daily?${params.toString()}`);
}

// Relatório de comissões
export async function getBarberCommissions(
  barberId: string,
  startDate: string,
  endDate: string
): Promise<{
  barberId: string;
  barberName: string;
  totalRevenue: number;
  commission: number;
  commissionRate: number;
  appointments: number;
}> {
  const params = new URLSearchParams({ startDate, endDate });
  return fetchAPI(`/reports/barber/${barberId}/commissions?${params.toString()}`);
}

// ========== MOCK DATA ==========

function generateMockDailyRevenue(days: number): DayRevenue[] {
  const data: DayRevenue[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 500,
      appointments: Math.floor(Math.random() * 15) + 5,
    });
  }

  return data;
}

export function getMockRevenueReport(period: 'day' | 'week' | 'month' | 'year'): RevenueReport {
  const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const revenueByDay = generateMockDailyRevenue(days);
  
  const totalRevenue = revenueByDay.reduce((acc, day) => acc + day.revenue, 0);
  const totalAppointments = revenueByDay.reduce((acc, day) => acc + day.appointments, 0);

  return {
    period,
    startDate: revenueByDay[0].date,
    endDate: revenueByDay[revenueByDay.length - 1].date,
    totalRevenue,
    totalAppointments,
    averageTicket: totalRevenue / totalAppointments,
    revenueByDay,
    revenueByBarber: [
      {
        barberId: 'b1',
        barberName: 'Carlos Barbeiro',
        totalRevenue: totalRevenue * 0.6,
        totalAppointments: Math.floor(totalAppointments * 0.6),
        commission: totalRevenue * 0.6 * 0.5,
        commissionRate: 50,
      },
      {
        barberId: 'b2',
        barberName: 'João Cortador',
        totalRevenue: totalRevenue * 0.4,
        totalAppointments: Math.floor(totalAppointments * 0.4),
        commission: totalRevenue * 0.4 * 0.5,
        commissionRate: 50,
      },
    ],
    revenueByService: [
      {
        serviceId: 's1',
        serviceName: 'Corte Tradicional',
        totalRevenue: totalRevenue * 0.5,
        totalSold: Math.floor(totalAppointments * 0.5),
        averagePrice: 50,
      },
      {
        serviceId: 's2',
        serviceName: 'Barba',
        totalRevenue: totalRevenue * 0.3,
        totalSold: Math.floor(totalAppointments * 0.3),
        averagePrice: 40,
      },
      {
        serviceId: 's3',
        serviceName: 'Corte + Barba',
        totalRevenue: totalRevenue * 0.2,
        totalSold: Math.floor(totalAppointments * 0.2),
        averagePrice: 80,
      },
    ],
    paymentMethods: [
      {
        method: 'pix',
        total: totalRevenue * 0.4,
        count: Math.floor(totalAppointments * 0.4),
        percentage: 40,
      },
      {
        method: 'credit_card',
        total: totalRevenue * 0.35,
        count: Math.floor(totalAppointments * 0.35),
        percentage: 35,
      },
      {
        method: 'debit_card',
        total: totalRevenue * 0.15,
        count: Math.floor(totalAppointments * 0.15),
        percentage: 15,
      },
      {
        method: 'cash',
        total: totalRevenue * 0.1,
        count: Math.floor(totalAppointments * 0.1),
        percentage: 10,
      },
    ],
  };
}

export function getMockBarberPerformance(): BarberRevenue {
  return {
    barberId: 'b1',
    barberName: 'Carlos Barbeiro',
    totalRevenue: 15000,
    totalAppointments: 200,
    commission: 7500,
    commissionRate: 50,
  };
}

// Helpers para calcular períodos
export function getDateRange(period: 'day' | 'week' | 'month' | 'year'): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
