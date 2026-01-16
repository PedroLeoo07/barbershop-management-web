// API utilities and mock data

import { Service, Barber, Appointment, DashboardStats, DayAvailability } from '@/types';

// Base URL da API (configurar no .env)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper para fazer requisições
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
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

export const api = {
  // Services
  getServices: async (): Promise<Service[]> => {
    // Mock - substituir por: return fetchAPI<Service[]>('/services');
    return new Promise((resolve) => setTimeout(() => resolve(mockServices), 500));
  },

  createService: async (service: Omit<Service, 'id'>): Promise<Service> => {
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
  },

  updateService: async (id: string, service: Partial<Service>): Promise<Service> => {
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
  },

  deleteService: async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  // Barbers
  getBarbers: async (): Promise<Barber[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockBarbers), 500));
  },

  getBarberById: async (id: string): Promise<Barber> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockBarbers.find((b) => b.id === id)!), 500)
    );
  },

  // Appointments
  getAppointments: async (filters?: {
    clientId?: string;
    barberId?: string;
    date?: string;
  }): Promise<Appointment[]> => {
    // Mock appointments
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
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> => {
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
  },

  cancelAppointment: async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  // Availability
  getAvailability: async (barberId: string, date: string): Promise<DayAvailability> => {
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
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
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
  },
};
