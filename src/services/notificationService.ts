import { Notification, NotificationPreferences, NotificationType } from '@/types';

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

// ========== NOTIFICATIONS API ==========

export async function getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  const params = unreadOnly ? '?unread=true' : '';
  return fetchAPI<Notification[]>(`/notifications/user/${userId}${params}`);
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return fetchAPI<Notification>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  return fetchAPI<void>(`/notifications/user/${userId}/read-all`, {
    method: 'PATCH',
  });
}

export async function deleteNotification(notificationId: string): Promise<void> {
  return fetchAPI<void>(`/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  return fetchAPI<NotificationPreferences>(`/notifications/preferences/${userId}`);
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return fetchAPI<NotificationPreferences>(`/notifications/preferences/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
}

// Função auxiliar para enviar notificação (backend)
export async function sendNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}): Promise<Notification> {
  return fetchAPI<Notification>('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ========== NOTIFICATION TEMPLATES ==========

export const notificationTemplates = {
  appointmentCreated: (barberName: string, date: string, time: string) => ({
    title: 'Agendamento Confirmado',
    message: `Seu agendamento com ${barberName} foi confirmado para ${date} às ${time}.`,
  }),

  appointmentConfirmed: (barberName: string, date: string, time: string) => ({
    title: 'Agendamento Confirmado pelo Barbeiro',
    message: `${barberName} confirmou seu agendamento para ${date} às ${time}.`,
  }),

  appointmentReminder: (barberName: string, hours: number) => ({
    title: 'Lembrete de Agendamento',
    message: `Seu agendamento com ${barberName} é daqui a ${hours} hora(s). Não se esqueça!`,
  }),

  appointmentCancelled: (barberName: string, date: string, reason?: string) => ({
    title: 'Agendamento Cancelado',
    message: reason 
      ? `Seu agendamento com ${barberName} em ${date} foi cancelado. Motivo: ${reason}`
      : `Seu agendamento com ${barberName} em ${date} foi cancelado.`,
  }),

  reviewReceived: (clientName: string, rating: number) => ({
    title: 'Nova Avaliação Recebida',
    message: `${clientName} avaliou seu atendimento com ${rating} estrela(s)!`,
  }),

  paymentReceived: (amount: number, method: string) => ({
    title: 'Pagamento Recebido',
    message: `Pagamento de R$ ${amount.toFixed(2)} recebido via ${method}.`,
  }),
};

// ========== MOCK DATA ==========

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'c1',
    type: 'appointment_confirmed',
    title: 'Agendamento Confirmado',
    message: 'Seu agendamento com Carlos Barbeiro foi confirmado para amanhã às 14:00.',
    read: false,
    data: { appointmentId: 'apt1' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    userId: 'c1',
    type: 'appointment_reminder',
    title: 'Lembrete de Agendamento',
    message: 'Seu agendamento é daqui a 2 horas!',
    read: false,
    data: { appointmentId: 'apt1' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    userId: 'b1',
    type: 'review_received',
    title: 'Nova Avaliação',
    message: 'João Silva avaliou seu atendimento com 5 estrelas!',
    read: true,
    data: { reviewId: 'rev1' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockPreferences: NotificationPreferences = {
  userId: 'c1',
  email: true,
  push: true,
  sms: false,
  appointmentReminder: true,
  appointmentConfirmation: true,
  promotions: false,
};

export function getMockNotifications(userId: string, unreadOnly = false): Notification[] {
  let notifications = mockNotifications.filter(n => n.userId === userId);
  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read);
  }
  return notifications;
}

export function getMockPreferences(userId: string): NotificationPreferences {
  return { ...mockPreferences, userId };
}

export function getUnreadCount(userId: string): number {
  return mockNotifications.filter(n => n.userId === userId && !n.read).length;
}
