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

// ========== AVALIAÇÕES ==========
export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  barberId: string;
  barberName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface BarberRating {
  barberId: string;
  barberName: string;
  averageRating: number;
  totalReviews: number;
  ratings: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ========== PAGAMENTOS ==========
export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash';

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

// ========== NOTIFICAÇÕES ==========
export type NotificationType = 
  | 'appointment_created'
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'review_received'
  | 'payment_received';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  appointmentReminder: boolean;
  appointmentConfirmation: boolean;
  promotions: boolean;
}

// ========== RELATÓRIOS ==========
export interface RevenueReport {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalAppointments: number;
  averageTicket: number;
  revenueByDay: DayRevenue[];
  revenueByBarber: BarberRevenue[];
  revenueByService: ServiceRevenue[];
  paymentMethods: PaymentMethodStats[];
}

export interface DayRevenue {
  date: string;
  revenue: number;
  appointments: number;
}

export interface BarberRevenue {
  barberId: string;
  barberName: string;
  totalRevenue: number;
  totalAppointments: number;
  commission: number;
  commissionRate: number;
}

export interface ServiceRevenue {
  serviceId: string;
  serviceName: string;
  totalRevenue: number;
  totalSold: number;
  averagePrice: number;
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  total: number;
  count: number;
  percentage: number;
}

// ========== PRODUTOS E ESTOQUE ==========
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string; // 'un', 'ml', 'g', etc
  barcode?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  userId: string;
  userName: string;
  previousStock: number;
  newStock: number;
  createdAt: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  status: 'low' | 'out';
}

// ========== BARBEIROS EXPANDIDO ==========
export interface BarberDetails extends Barber {
  commissionRate: number; // percentual (ex: 50 para 50%)
  salary?: number;
  hireDate: string;
  active: boolean;
  blockedDates: string[]; // datas de folga/férias
  lunchBreak?: TimeSlot;
  productivity: BarberProductivity;
}

export interface BarberProductivity {
  barberId: string;
  period: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  commission: number;
  averageRating: number;
  clientsServed: number;
}

// ========== CLIENTES EXPANDIDO ==========
export interface ClientDetails extends User {
  role: 'client';
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShows: number;
  blocked: boolean;
  blockedReason?: string;
  preferredBarberId?: string;
  lastAppointment?: string;
  totalSpent: number;
  averageRating: number; // rating que o cliente dá
  loyaltyPoints?: number;
}

// ========== SERVIÇOS COMBINADOS ==========
export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: string[]; // IDs dos serviços
  totalDuration: number;
  originalPrice: number;
  packagePrice: number;
  discount: number; // percentual
  active: boolean;
  imageUrl?: string;
}

// ========== AGENDA INTELIGENTE ==========
export interface ScheduleRule {
  id: string;
  type: 'block_hours' | 'lunch_break' | 'day_off' | 'holiday';
  barberId?: string; // null = aplica a todos
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  reason: string;
  active: boolean;
}

export interface AppointmentValidation {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ClientRestriction {
  clientId: string;
  type: 'block' | 'warning';
  reason: string;
  expiresAt?: string;
  createdAt: string;
  active: boolean;
}

// ========== CONFIGURAÇÕES DO SISTEMA ==========
export interface SystemSettings {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  openingHours: WorkingHours;
  appointmentRules: AppointmentRules;
  notificationSettings: SystemNotificationSettings;
  paymentSettings: PaymentSettings;
}

export interface AppointmentRules {
  minAdvanceBooking: number; // horas
  maxAdvanceBooking: number; // dias
  cancellationDeadline: number; // horas
  autoConfirmAfter: number; // horas
  autoCancelAfter: number; // horas de não confirmação
  maxCancellationsPerMonth: number;
  blockAfterNoShows: number;
}

export interface SystemNotificationSettings {
  reminderHoursBefore: number;
  confirmationRequired: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface PaymentSettings {
  acceptPix: boolean;
  acceptCard: boolean;
  acceptCash: boolean;
  pixKey?: string;
  requirePaymentUpfront: boolean;
  defaultCommissionRate: number;
}
