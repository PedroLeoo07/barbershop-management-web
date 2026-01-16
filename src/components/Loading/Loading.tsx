import styles from './Loading.module.css';

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'white';
  text?: string;
  fullPage?: boolean;
}

export function Loading({
  size = 'medium',
  variant = 'primary',
  text,
  fullPage = false,
}: LoadingProps) {
  const spinnerClasses = [
    styles.spinner,
    size !== 'medium' && styles[size],
    styles[variant],
  ]
    .filter(Boolean)
    .join(' ');

  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.fullPageContent}>
          <div className={styles.logo}>BarberShop</div>
          <div className={spinnerClasses} />
          {text && <p className={styles.text}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={spinnerClasses} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className={styles.dots}>
      <div className={styles.dot} />
      <div className={styles.dot} />
      <div className={styles.dot} />
    </div>
  );
}

export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`${styles.skeleton} ${className}`} style={style} />;
}

export function SkeletonText() {
  return <div className={`${styles.skeleton} ${styles.skeletonText}`} />;
}

export function SkeletonTitle() {
  return <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />;
}

export function SkeletonCard() {
  return <div className={`${styles.skeleton} ${styles.skeletonCard}`} />;
}

export default Loading;
