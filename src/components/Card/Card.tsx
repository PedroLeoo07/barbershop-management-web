import { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'compact' | 'normal' | 'spacious';
  interactive?: boolean;
  loading?: boolean;
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export interface CardFooterProps {
  children: ReactNode;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'normal',
  interactive = false,
  loading = false,
  className = '',
  ...props
}: CardProps) {
  const cardClasses = [
    styles.card,
    styles[variant],
    padding !== 'normal' && styles[padding],
    interactive && styles.interactive,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...props}>
      {loading && <div className={styles.loadingSpinner} />}
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className={styles.footer}>{children}</div>;
}

export default Card;
