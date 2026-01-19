import styles from './Badge.module.css';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'medium',
  className = '' 
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`}>
      {children}
    </span>
  );
}

// Badges específicos para status
export function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    paid: 'success',
    pending: 'warning',
    cancelled: 'danger',
    refunded: 'info',
  };

  const labels: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  return (
    <Badge variant={variants[status] || 'neutral'}>
      {labels[status] || status}
    </Badge>
  );
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    scheduled: 'info',
    confirmed: 'success',
    'in-progress': 'warning',
    completed: 'success',
    cancelled: 'danger',
  };

  const labels: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    'in-progress': 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  return (
    <Badge variant={variants[status] || 'neutral'}>
      {labels[status] || status}
    </Badge>
  );
}

export function StockStatusBadge({ status }: { status: 'low' | 'out' | 'ok' }) {
  const variants: Record<string, BadgeVariant> = {
    low: 'warning',
    out: 'danger',
    ok: 'success',
  };

  const labels: Record<string, string> = {
    low: 'Estoque Baixo',
    out: 'Sem Estoque',
    ok: 'OK',
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}
