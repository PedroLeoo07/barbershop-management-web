import styles from './LoadingSkeleton.module.css';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width = '100%',
  height = '1rem',
  count = 1,
  className = '',
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${styles.skeleton} ${styles[variant]}`}
          style={{ width: widthStyle, height: heightStyle }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`${styles.cardSkeleton} ${className}`}>
      <Skeleton variant="rectangular" width="100%" height="200px" className={styles.image} />
      <div className={styles.content}>
        <Skeleton variant="text" count={2} className={styles.title} />
        <Skeleton variant="text" count={3} className={styles.text} />
      </div>
    </div>
  );
}

export function AvatarSkeleton({ className = '' }: { className?: string }) {
  return <Skeleton variant="circular" width={48} height={48} className={className} />;
}

export default Skeleton;
