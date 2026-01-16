// API utilities and mock data

import { Service, Barber, Appointment, DashboardStats, DayAvailability } from '@/types';

// Base URL da API (configurar no .env)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper para obter o token de autenticação
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Helper para fazer requisições
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

// ========== MOCK DATA ==========

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte Tradicional',
    description: 'Corte clássico com acabamento premium',
    duration: 30,
    price: 50,
    category: 'Cortes',
    active: true,
  },
  {
    id: '2',
    name: 'Barba',
    description: 'Aparar e modelar a barba com navalha',
    duration: 20,
    price: 35,
    category: 'Barba',
    active: true,
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Combo completo de corte e barba',
    duration: 45,
    price: 75,
    category: 'Combos',
    active: true,
  },
  {
    id: '4',
    name: 'Corte Degradê',
    description: 'Corte moderno com degradê fade',
    duration: 40,
    price: 60,
    category: 'Cortes',
    active: true,
  },
];

export const mockBarbers: Barber[] = [
  {
    id: '2',
    name: 'Carlos Silva',
    email: 'carlos@barbershop.com',
    phone: '(11) 98888-8888',
    role: 'barber',
    specialties: ['Cortes Clássicos', 'Degradê'],
    rating: 4.8,
    totalAppointments: 256,
    workingHours: {
      monday: [{ start: '09:00', end: '18:00' }],
      tuesday: [{ start: '09:00', end: '18:00' }],
      wednesday: [{ start: '09:00', end: '18:00' }],
      thursday: [{ start: '09:00', end: '18:00' }],
      friday: [{ start: '09:00', end: '20:00' }],
      saturday: [{ start: '09:00', end: '17:00' }],
      sunday: [],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Roberto Lima',
    email: 'roberto@barbershop.com',
    phone: '(11) 97777-7777',
    role: 'barber',
    specialties: ['Barba', 'Tratamentos'],
    rating: 4.9,
    totalAppointments: 189,
    workingHours: {
      monday: [{ start: '10:00', end: '19:00' }],
      tuesday: [{ start: '10:00', end: '19:00' }],
      wednesday: [{ start: '10:00', end: '19:00' }],
      thursday: [{ start: '10:00', end: '19:00' }],
      friday: [{ start: '10:00', end: '20:00' }],
      saturday: [{ start: '10:00', end: '18:00' }],
      sunday: [],
    },
    createdAt: new Date().toISOString(),
  },
];

// ========== API FUNCTIONS ==========

// 🔐 Authentication
export const login = async (email: string, password: string) => {
  // return fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  return new Promise((resolve) => setTimeout(() => resolve({ token: 'mock-token', user: {} }), 500));
};

export const register = async (name: string, email: string, password: string, phone: string) => {
  // return fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone }) });
  return new Promise((resolve) => setTimeout(() => resolve({ token: 'mock-token', user: {} }), 500));
};

export const logout = async () => {
  // return fetchAPI('/auth/logout', { method: 'POST' });
  return new Promise((resolve) => setTimeout(resolve, 300));
};

export const getMe = async () => {
  // return fetchAPI('/auth/me');
  return new Promise((resolve) => setTimeout(() => resolve({}), 500));
};

// 💈 Services
export const getServices = async (active?: boolean): Promise<Service[]> => {
  // const query = active !== undefined ? `?active=${active}` : '';
  // return fetchAPI<Service[]>(`/services${query}`);
  return new Promise((resolve) => setTimeout(() => resolve(mockServices), 500));
};

export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  // return fetchAPI<Service>('/services', { method: 'POST', body: JSON.stringify(service) });
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ...service,
          id: Math.random().toString(36).substr(2, 9),
        }),
      500
    )
  );
};

export const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
  // return fetchAPI<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(service) });
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ...mockServices.find((s) => s.id === id)!,
          ...service,
        }),
      500
    )
  );
};

export const deleteService = async (id: string): Promise<void> => {
  // return fetchAPI<void>(`/services/${id}`, { method: 'DELETE' });
  return new Promise((resolve) => setTimeout(resolve, 500));
};

// 👨‍💼 Barbers
export const getBarbers = async (available?: boolean): Promise<Barber[]> => {
  // const query = available !== undefined ? `?available=${available}` : '';
  // return fetchAPI<Barber[]>(`/barbers${query}`);
  return new Promise((resolve) => setTimeout(() => resolve(mockBarbers), 500));
};

export const getBarberById = async (id: string): Promise<Barber> => {
  // return fetchAPI<Barber>(`/barbers/${id}`);
  return new Promise((resolve) =>
    setTimeout(() => resolve(mockBarbers.find((b) => b.id === id)!), 500)
  );
};

export const createBarber = async (barber: any): Promise<Barber> => {
  // return fetchAPI<Barber>('/barbers', { method: 'POST', body: JSON.stringify(barber) });
  return new Promise((resolve) => setTimeout(() => resolve({ ...barber, id: '3' }), 500));
};

export const updateBarber = async (id: string, barber: Partial<Barber>): Promise<Barber> => {
  // return fetchAPI<Barber>(`/barbers/${id}`, { method: 'PUT', body: JSON.stringify(barber) });
  return new Promise((resolve) =>
    setTimeout(() => resolve({ ...mockBarbers[0], ...barber }), 500)
  );
};

export const deleteBarber = async (id: string): Promise<void> => {
  // return fetchAPI<void>(`/barbers/${id}`, { method: 'DELETE' });
  return new Promise((resolve) => setTimeout(resolve, 500));
};

export const getBarberSchedule = async (barberId: string, date: string): Promise<Appointment[]> => {
  // return fetchAPI<Appointment[]>(`/barbers/${barberId}/schedule?date=${date}`);
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      clientId: '1',
      clientName: 'João Silva',
      barberId,
      barberName: 'Carlos Silva',
      serviceId: '1',
      serviceName: 'Corte Tradicional',
      date,
      time: '09:00',
      duration: 30,
      status: 'pending',
      price: 50,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Maria Santos',
      barberId,
      barberName: 'Carlos Silva',
      serviceId: '3',
      serviceName: 'Corte + Barba',
      date,
      time: '10:00',
      duration: 45,
      status: 'confirmed',
      price: 75,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      clientId: '3',
      clientName: 'Pedro Costa',
      barberId,
      barberName: 'Carlos Silva',
      serviceId: '2',
      serviceName: 'Barba',
      date,
      time: '11:30',
      duration: 20,
      status: 'completed',
      price: 35,
      createdAt: new Date().toISOString(),
    },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(mockAppointments), 500));
};

// 📅 Appointments
export const getAppointments = async (params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Appointment[]> => {
  // const query = new URLSearchParams(params as any).toString();
  // return fetchAPI<Appointment[]>(`/appointments${query ? `?${query}` : ''}`);
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      clientId: '1',
      clientName: 'João Silva',
      barberId: '2',
      barberName: 'Carlos Silva',
      serviceId: '1',
      serviceName: 'Corte Tradicional',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: 30,
      status: 'scheduled',
      price: 50,
      createdAt: new Date().toISOString(),
    },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(mockAppointments), 500));
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  // return fetchAPI<Appointment>(`/appointments/${id}`);
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          id,
          clientId: '1',
          clientName: 'João Silva',
          barberId: '2',
          barberName: 'Carlos Silva',
          serviceId: '1',
          serviceName: 'Corte Tradicional',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 30,
          status: 'scheduled',
          price: 50,
          createdAt: new Date().toISOString(),
        }),
      500
    )
  );
};

export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt'>
): Promise<Appointment> => {
  // return fetchAPI<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(appointment) });
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ...appointment,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        }),
      500
    )
  );
};

export const updateAppointmentStatus = async (
  id: string,
  status: 'confirmed' | 'completed' | 'cancelled',
  cancellationReason?: string
): Promise<Appointment> => {
  // return fetchAPI<Appointment>(`/appointments/${id}/status`, {
  //   method: 'PATCH',
  //   body: JSON.stringify({ status, cancellationReason }),
  // });
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          id,
          status,
          clientId: '1',
          clientName: 'João Silva',
          barberId: '2',
          barberName: 'Carlos Silva',
          serviceId: '1',
          serviceName: 'Corte Tradicional',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 30,
          price: 50,
          createdAt: new Date().toISOString(),
        }),
      500
    )
  );
};

export const cancelAppointment = async (id: string, reason: string): Promise<void> => {
  // return fetchAPI<void>(`/appointments/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) });
  return new Promise((resolve) => setTimeout(resolve, 500));
};

// 📊 Dashboard & Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // return fetchAPI<DashboardStats>('/dashboard/stats');
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          totalAppointments: 1245,
          todayAppointments: 12,
          totalRevenue: 62500,
          monthRevenue: 8900,
          activeClients: 456,
          activeBarbers: 2,
          averageRating: 4.85,
          appointmentsByStatus: {
            scheduled: 8,
            confirmed: 3,
            'in-progress': 1,
            completed: 1189,
            cancelled: 44,
          },
        }),
      500
    )
  );
};

// 🔔 Notifications
export const getNotifications = async (unread?: boolean) => {
  // const query = unread !== undefined ? `?unread=${unread}` : '';
  // return fetchAPI(`/notifications${query}`);
  return new Promise((resolve) => setTimeout(() => resolve([]), 500));
};

export const markNotificationAsRead = async (id: string) => {
  // return fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' });
  return new Promise((resolve) => setTimeout(() => resolve({ id, read: true }), 300));
};

export const deleteNotification = async (id: string) => {
  // return fetchAPI(`/notifications/${id}`, { method: 'DELETE' });
  return new Promise((resolve) => setTimeout(resolve, 300));
};

// 💬 Ratings
export const addAppointmentRating = async (id: string, rating: number, comment?: string) => {
  // return fetchAPI(`/appointments/${id}/rating`, { method: 'POST', body: JSON.stringify({ rating, comment }) });
  return new Promise((resolve) =>
    setTimeout(() => resolve({ appointmentId: id, rating, comment }), 500)
  );
};

export const getBarberRatings = async (barberId: string) => {
  // return fetchAPI(`/barbers/${barberId}/ratings`);
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          barberId,
          averageRating: 4.8,
          totalRatings: 150,
          ratings: [],
        }),
      500
    )
  );
};

// 🔧 Settings
export const getSettings = async () => {
  // return fetchAPI('/settings');
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          businessName: 'Premium Barbershop',
          businessPhone: '(11) 99999-9999',
          businessEmail: 'contato@barbershop.com',
          businessAddress: 'Rua Example, 123',
          workingDays: [1, 2, 3, 4, 5, 6],
          workingHours: { start: '08:00', end: '18:00' },
          slotDuration: 30,
          cancellationDeadline: 2,
          allowedPaymentMethods: ['cash', 'credit', 'debit', 'pix'],
        }),
      500
    )
  );
};

export const updateSettings = async (settings: any) => {
  // return fetchAPI('/settings', { method: 'PUT', body: JSON.stringify(settings) });
  return new Promise((resolve) => setTimeout(() => resolve(settings), 500));
};

// Availability
export const getAvailability = async (barberId: string, date: string): Promise<DayAvailability> => {
  // return fetchAPI<DayAvailability>(`/barbers/${barberId}/schedule?date=${date}`);
  const mockSlots = Array.from({ length: 9 }, (_, i) => ({
    time: `${9 + i}:00`,
    available: Math.random() > 0.3,
  }));

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          date,
          available: true,
          slots: mockSlots,
        }),
      500
    )
  );
};

// Manter export do objeto api para compatibilidade com código existente
export const api = {
  getServices,
  createService,
  updateService,
  deleteService,
  getBarbers,
  getBarberById,
  getAppointments,
  createAppointment,
  cancelAppointment,
  getAvailability,
  getDashboardStats,
};
