import { Review, BarberRating } from '@/types';

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

// ========== REVIEWS API ==========

export async function createReview(data: {
  appointmentId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  return fetchAPI<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getReviewsByBarber(barberId: string): Promise<Review[]> {
  return fetchAPI<Review[]>(`/reviews/barber/${barberId}`);
}

export async function getReviewsByClient(clientId: string): Promise<Review[]> {
  return fetchAPI<Review[]>(`/reviews/client/${clientId}`);
}

export async function getBarberRating(barberId: string): Promise<BarberRating> {
  return fetchAPI<BarberRating>(`/reviews/barber/${barberId}/rating`);
}

export async function getAllBarberRatings(): Promise<BarberRating[]> {
  return fetchAPI<BarberRating[]>('/reviews/ratings');
}

export async function updateReview(reviewId: string, data: {
  rating: number;
  comment?: string;
}): Promise<Review> {
  return fetchAPI<Review>(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReview(reviewId: string): Promise<void> {
  return fetchAPI<void>(`/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}

// ========== MOCK DATA para desenvolvimento ==========

const mockReviews: Review[] = [
  {
    id: '1',
    appointmentId: 'apt1',
    clientId: 'c1',
    clientName: 'João Silva',
    barberId: 'b1',
    barberName: 'Carlos Barbeiro',
    rating: 5,
    comment: 'Excelente atendimento! Muito profissional.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    appointmentId: 'apt2',
    clientId: 'c2',
    clientName: 'Pedro Santos',
    barberId: 'b1',
    barberName: 'Carlos Barbeiro',
    rating: 4,
    comment: 'Muito bom, recomendo!',
    createdAt: new Date().toISOString(),
  },
];

export function getMockReviews(): Review[] {
  return mockReviews;
}

export function getMockBarberRating(barberId: string): BarberRating {
  const barberReviews = mockReviews.filter(r => r.barberId === barberId);
  const totalReviews = barberReviews.length;
  const averageRating = totalReviews > 0 
    ? barberReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
    : 0;

  const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  barberReviews.forEach(r => {
    ratings[r.rating as keyof typeof ratings]++;
  });

  return {
    barberId,
    barberName: barberReviews[0]?.barberName || 'Barbeiro',
    averageRating,
    totalReviews,
    ratings,
  };
}
