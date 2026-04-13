import { Badge } from '../Badge/Badge';
import type { BadgeVariant } from '../Badge/Badge';
import styles from './StatusBadges.module.css';

export interface AppointmentStatusProps {
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'noshow';
  showTime?: boolean;
  time?: string;
}

export function AppointmentStatusBadge({ status, showTime, time }: AppointmentStatusProps) {
  const variants: Record<string, BadgeVariant> = {
    scheduled: 'info',
    confirmed: 'success',
    'in-progress': 'warning',
    completed: 'success',
    cancelled: 'danger',
    noshow: 'danger',
  };

  const labels: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    'in-progress': 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    noshow: 'Não Compareceu',
  };

  const icons: Record<string, string> = {
    scheduled: '📅',
    confirmed: '✓',
    'in-progress': '⏳',
    completed: '✓✓',
    cancelled: '✕',
    noshow: '⚠',
  };

  return (
    <div className={styles.container}>
      <Badge variant={variants[status] || 'neutral'} pulse={status === 'in-progress'}>
        <span className={styles.icon}>{icons[status]}</span>
        {labels[status] || status}
      </Badge>
      {showTime && time && <span className={styles.time}>{time}</span>}
    </div>
  );
}

export interface PaymentStatusProps {
  status: 'paid' | 'pending' | 'processing' | 'failed' | 'cancelled' | 'refunded';
  amount?: number;
  currency?: string;
}

export function PaymentStatusBadge({ status, amount, currency = 'R$' }: PaymentStatusProps) {
  const variants: Record<string, BadgeVariant> = {
    paid: 'gold',
    pending: 'warning',
    processing: 'info',
    failed: 'danger',
    cancelled: 'danger',
    refunded: 'info',
  };

  const labels: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    processing: 'Processando',
    failed: 'Falha',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  const icons: Record<string, string> = {
    paid: '💳',
    pending: '⏳',
    processing: '⟳',
    failed: '✕',
    cancelled: '✕',
    refunded: '↩',
  };

  return (
    <div className={styles.container}>
      <Badge variant={variants[status] || 'neutral'} pulse={status === 'processing'}>
        <span className={styles.icon}>{icons[status]}</span>
        {labels[status] || status}
      </Badge>
      {amount && <span className={styles.amount}>{currency} {amount.toFixed(2)}</span>}
    </div>
  );
}
