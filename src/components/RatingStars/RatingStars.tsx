import { useState } from 'react';
import styles from './RatingStars.module.css';

interface RatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

export function RatingStars({
  rating,
  onRate,
  readonly = false,
  size = 'medium',
  showValue = false,
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const displayRating = hoveredRating || rating;

  const handleClick = (value: number) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={`${styles.star} ${value <= displayRating ? styles.filled : ''} ${
              readonly ? styles.readonly : ''
            }`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoveredRating(value)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            disabled={readonly}
            aria-label={`${value} estrela${value > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      {showValue && (
        <span className={styles.value}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
