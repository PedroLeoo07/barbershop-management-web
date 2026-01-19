import { 
  ScheduleRule, 
  AppointmentValidation, 
  ClientRestriction,
  Appointment,
  TimeSlot,
  WorkingHours
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

// ========== SCHEDULE RULES API ==========

export async function getScheduleRules(barberId?: string): Promise<ScheduleRule[]> {
  const params = barberId ? `?barberId=${barberId}` : '';
  return fetchAPI<ScheduleRule[]>(`/schedule/rules${params}`);
}

export async function createScheduleRule(data: Omit<ScheduleRule, 'id'>): Promise<ScheduleRule> {
  return fetchAPI<ScheduleRule>('/schedule/rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateScheduleRule(ruleId: string, data: Partial<ScheduleRule>): Promise<ScheduleRule> {
  return fetchAPI<ScheduleRule>(`/schedule/rules/${ruleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteScheduleRule(ruleId: string): Promise<void> {
  return fetchAPI<void>(`/schedule/rules/${ruleId}`, {
    method: 'DELETE',
  });
}

// ========== APPOINTMENT VALIDATION API ==========

export async function validateAppointment(data: {
  barberId: string;
  clientId: string;
  date: string;
  time: string;
  serviceId: string;
}): Promise<AppointmentValidation> {
  return fetchAPI<AppointmentValidation>('/schedule/validate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function checkAvailability(
  barberId: string,
  date: string,
  duration: number
): Promise<string[]> {
  const params = new URLSearchParams({ barberId, date, duration: duration.toString() });
  return fetchAPI<string[]>(`/schedule/availability?${params.toString()}`);
}

// ========== CLIENT RESTRICTIONS API ==========

export async function getClientRestrictions(clientId: string): Promise<ClientRestriction[]> {
  return fetchAPI<ClientRestriction[]>(`/schedule/restrictions/client/${clientId}`);
}

export async function createClientRestriction(data: Omit<ClientRestriction, 'createdAt'>): Promise<ClientRestriction> {
  return fetchAPI<ClientRestriction>('/schedule/restrictions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function removeClientRestriction(clientId: string): Promise<void> {
  return fetchAPI<void>(`/schedule/restrictions/client/${clientId}`, {
    method: 'DELETE',
  });
}

export async function checkClientCanBook(clientId: string): Promise<{
  canBook: boolean;
  reason?: string;
}> {
  return fetchAPI(`/schedule/restrictions/client/${clientId}/can-book`);
}

// ========== SMART SCHEDULING FUNCTIONS ==========

/**
 * Valida se um horário está disponível considerando todas as regras
 */
export function validateTimeSlot(
  appointments: Appointment[],
  barberId: string,
  date: string,
  time: string,
  duration: number,
  rules: ScheduleRule[]
): AppointmentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Verificar conflito de horários
  const requestedStart = parseTime(time);
  const requestedEnd = requestedStart + duration;

  const conflicts = appointments.filter(apt => {
    if (apt.barberId !== barberId || apt.date !== date || apt.status === 'cancelled') {
      return false;
    }

    const aptStart = parseTime(apt.time);
    const aptEnd = aptStart + apt.duration;

    return (requestedStart < aptEnd && requestedEnd > aptStart);
  });

  if (conflicts.length > 0) {
    errors.push('Horário já ocupado com outro agendamento');
  }

  // 2. Verificar regras de bloqueio
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
  const activeRules = rules.filter(rule => {
    if (!rule.active) return false;
    if (rule.barberId && rule.barberId !== barberId) return false;
    
    const ruleStart = new Date(rule.startDate);
    const ruleEnd = rule.endDate ? new Date(rule.endDate) : null;
    const checkDate = new Date(date);

    if (checkDate < ruleStart) return false;
    if (ruleEnd && checkDate > ruleEnd) return false;

    return true;
  });

  // Verificar bloqueios de horário (lunch break, etc)
  for (const rule of activeRules) {
    if (rule.type === 'lunch_break' && rule.startTime && rule.endTime) {
      const lunchStart = parseTime(rule.startTime);
      const lunchEnd = parseTime(rule.endTime);

      if (requestedStart < lunchEnd && requestedEnd > lunchStart) {
        errors.push(`Horário de almoço: ${rule.startTime} - ${rule.endTime}`);
      }
    }

    if (rule.type === 'day_off') {
      errors.push(`Barbeiro em folga neste dia: ${rule.reason}`);
    }

    if (rule.type === 'holiday') {
      errors.push(`Feriado: ${rule.reason}`);
    }
  }

  // 3. Verificar horário de trabalho
  // (Isso dependeria de ter acesso aos workingHours do barbeiro)

  // 4. Verificar antecedência mínima/máxima
  const now = new Date();
  const appointmentDate = new Date(`${date}T${time}`);
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilAppointment < 2) {
    errors.push('Agendamento deve ser feito com pelo menos 2 horas de antecedência');
  }

  if (hoursUntilAppointment > 30 * 24) {
    warnings.push('Agendamento com mais de 30 dias de antecedência');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gera horários disponíveis para um dia
 */
export function generateAvailableSlots(
  workingHours: TimeSlot[],
  appointments: Appointment[],
  serviceDuration: number,
  date: string,
  rules: ScheduleRule[]
): string[] {
  const availableSlots: string[] = [];

  for (const slot of workingHours) {
    let currentTime = parseTime(slot.start);
    const endTime = parseTime(slot.end);

    while (currentTime + serviceDuration <= endTime) {
      const timeString = formatTime(currentTime);
      
      const validation = validateTimeSlot(
        appointments,
        '', // barberId seria passado como parâmetro
        date,
        timeString,
        serviceDuration,
        rules
      );

      if (validation.valid) {
        availableSlots.push(timeString);
      }

      currentTime += 30; // Incremento de 30 minutos
    }
  }

  return availableSlots;
}

/**
 * Bloqueia automaticamente cliente após X faltas
 */
export function shouldBlockClient(clientStats: {
  noShows: number;
  cancelledAppointments: number;
  totalAppointments: number;
}): { shouldBlock: boolean; reason?: string } {
  const MAX_NO_SHOWS = 3;
  const MAX_CANCELLATIONS_RATIO = 0.5;

  if (clientStats.noShows >= MAX_NO_SHOWS) {
    return {
      shouldBlock: true,
      reason: `Cliente faltou ${clientStats.noShows} vezes sem avisar`,
    };
  }

  if (clientStats.totalAppointments >= 10) {
    const cancellationRatio = clientStats.cancelledAppointments / clientStats.totalAppointments;
    if (cancellationRatio > MAX_CANCELLATIONS_RATIO) {
      return {
        shouldBlock: true,
        reason: `Taxa de cancelamento muito alta (${(cancellationRatio * 100).toFixed(0)}%)`,
      };
    }
  }

  return { shouldBlock: false };
}

/**
 * Verifica se agendamento deve ser cancelado automaticamente
 */
export function shouldAutoCancelAppointment(appointment: Appointment): boolean {
  const AUTO_CANCEL_HOURS = 24;
  
  if (appointment.status !== 'scheduled') {
    return false;
  }

  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilAppointment <= AUTO_CANCEL_HOURS;
}

// ========== UTILITY FUNCTIONS ==========

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getWorkingHoursForDate(workingHours: WorkingHours, date: string): TimeSlot[] {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof WorkingHours;
  return workingHours[dayOfWeek] || [];
}

// ========== MOCK DATA ==========

const mockScheduleRules: ScheduleRule[] = [
  {
    id: 'r1',
    type: 'lunch_break',
    barberId: 'b1',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '13:00',
    recurrence: 'daily',
    reason: 'Horário de almoço',
    active: true,
  },
  {
    id: 'r2',
    type: 'day_off',
    barberId: 'b1',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Folga programada',
    active: true,
  },
];

const mockClientRestrictions: ClientRestriction[] = [];

export function getMockScheduleRules(barberId?: string): ScheduleRule[] {
  return barberId 
    ? mockScheduleRules.filter(r => !r.barberId || r.barberId === barberId)
    : mockScheduleRules;
}

export function getMockClientRestrictions(clientId: string): ClientRestriction[] {
  return mockClientRestrictions.filter(r => r.clientId === clientId && r.active);
}
