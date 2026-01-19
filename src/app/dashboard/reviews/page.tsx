'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/Button';
import { RatingStars } from '@/components/RatingStars';
import { getMockReviews } from '@/services/reviewService';
import { Review } from '@/types';
import styles from './page.module.css';

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Mock data - substituir por chamada real à API
      const data = getMockReviews();
      setReviews(data);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar envio da avaliação
    console.log('Nova avaliação:', newReview);
    setShowModal(false);
    setNewReview({ rating: 0, comment: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Minhas Avaliações</h1>
      </div>

      <div className={styles.summary}>
        <Card>
          <div className={styles.summaryContent}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Total de Avaliações</span>
              <span className={styles.value}>{reviews.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Avaliação Média</span>
              <div className={styles.avgRating}>
                <RatingStars 
                  rating={reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length} 
                  readonly 
                  showValue 
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <Card key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div>
                <h3>{review.barberName}</h3>
                <span className={styles.date}>{formatDate(review.createdAt)}</span>
              </div>
              <RatingStars rating={review.rating} readonly size="large" />
            </div>
            {review.comment && (
              <p className={styles.comment}>{review.comment}</p>
            )}
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <div className={styles.empty}>
              <p>Você ainda não fez nenhuma avaliação.</p>
              <p className={styles.emptySubtext}>
                Após um atendimento concluído, você poderá avaliar o barbeiro.
              </p>
            </div>
          </Card>
        )}
      </div>

      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Avaliar Atendimento</h2>
            <form onSubmit={handleSubmitReview}>
              <div className={styles.formGroup}>
                <label>Como foi seu atendimento?</label>
                <div className={styles.ratingInput}>
                  <RatingStars
                    rating={newReview.rating}
                    onRate={(rating) => setNewReview({ ...newReview, rating })}
                    size="large"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Comentário (opcional)</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Conte-nos sobre sua experiência..."
                  rows={4}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={newReview.rating === 0}>
                  Enviar Avaliação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
