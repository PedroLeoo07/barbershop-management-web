// Types - Definições de tipos do sistema

export type UserRole = 'client' | 'barber' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Barber extends User {
  role: 'barber';
  specialties: string[];
  workingHours: WorkingHours;
  rating: number;
  totalAppointments: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  category: string;
  active: boolean;
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  price: number;
  notes?: string;
  createdAt: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface WorkingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // formato: "HH:mm"
  end: string;   // formato: "HH:mm"
}

export interface DayAvailability {
  date: string;
  available: boolean;
  slots: AvailableSlot[];
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  barberId?: string;
}

export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  totalRevenue: number;
  monthRevenue: number;
  activeClients: number;
  activeBarbers: number;
  averageRating: number;
  appointmentsByStatus: Record<AppointmentStatus, number>;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FormErrors {
  [key: string]: string;
}
