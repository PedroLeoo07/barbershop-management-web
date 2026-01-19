import { Payment, PaymentMethod, PaymentStatus } from '@/types';

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

// ========== PAYMENTS API ==========

export async function createPayment(data: {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}): Promise<Payment> {
  return fetchAPI<Payment>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPaymentByAppointment(appointmentId: string): Promise<Payment> {
  return fetchAPI<Payment>(`/payments/appointment/${appointmentId}`);
}

export async function getAllPayments(filters?: {
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}): Promise<Payment[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.method) params.append('method', filters.method);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const query = params.toString();
  return fetchAPI<Payment[]>(`/payments${query ? `?${query}` : ''}`);
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  transactionId?: string
): Promise<Payment> {
  return fetchAPI<Payment>(`/payments/${paymentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, transactionId }),
  });
}

export async function confirmPayment(
  paymentId: string,
  method: PaymentMethod,
  transactionId?: string
): Promise<Payment> {
  return fetchAPI<Payment>(`/payments/${paymentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ method, transactionId }),
  });
}

export async function refundPayment(
  paymentId: string,
  reason: string
): Promise<Payment> {
  return fetchAPI<Payment>(`/payments/${paymentId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ========== MOCK DATA ==========

const mockPayments: Payment[] = [
  {
    id: '1',
    appointmentId: 'apt1',
    amount: 50,
    method: 'pix',
    status: 'paid',
    paidAt: new Date().toISOString(),
    transactionId: 'PIX123456',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    appointmentId: 'apt2',
    amount: 80,
    method: 'credit_card',
    status: 'paid',
    paidAt: new Date().toISOString(),
    transactionId: 'CC789012',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    appointmentId: 'apt3',
    amount: 50,
    method: 'cash',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export function getMockPayments(): Payment[] {
  return mockPayments;
}

export function getMockPaymentStats() {
  const totalPaid = mockPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = mockPayments
    .filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const byMethod = mockPayments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + (p.status === 'paid' ? p.amount : 0);
    return acc;
  }, {} as Record<PaymentMethod, number>);

  return {
    totalPaid,
    totalPending,
    byMethod,
    count: mockPayments.length,
  };
}
