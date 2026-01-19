import { Product, StockMovement, StockAlert } from '@/types';

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

// ========== PRODUCTS API ==========

export async function getAllProducts(activeOnly = false): Promise<Product[]> {
  const params = activeOnly ? '?active=true' : '';
  return fetchAPI<Product[]>(`/products${params}`);
}

export async function getProductById(productId: string): Promise<Product> {
  return fetchAPI<Product>(`/products/${productId}`);
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  return fetchAPI<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
  return fetchAPI<Product>(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  return fetchAPI<void>(`/products/${productId}`, {
    method: 'DELETE',
  });
}

export async function toggleProductStatus(productId: string, active: boolean): Promise<Product> {
  return fetchAPI<Product>(`/products/${productId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

// ========== STOCK MANAGEMENT API ==========

export async function getStockMovements(
  productId?: string,
  startDate?: string,
  endDate?: string
): Promise<StockMovement[]> {
  const params = new URLSearchParams();
  if (productId) params.append('productId', productId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const query = params.toString();
  return fetchAPI<StockMovement[]>(`/stock/movements${query ? `?${query}` : ''}`);
}

export async function addStockMovement(data: {
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
}): Promise<StockMovement> {
  return fetchAPI<StockMovement>('/stock/movements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getStockAlerts(): Promise<StockAlert[]> {
  return fetchAPI<StockAlert[]>('/stock/alerts');
}

export async function adjustStock(
  productId: string,
  newQuantity: number,
  reason: string
): Promise<Product> {
  return fetchAPI<Product>(`/stock/adjust`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: newQuantity, reason }),
  });
}

// Relatório de produtos mais usados
export async function getProductUsageReport(
  startDate?: string,
  endDate?: string
): Promise<Array<{
  productId: string;
  productName: string;
  totalUsed: number;
  averagePerDay: number;
}>> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const query = params.toString();
  return fetchAPI(`/stock/usage-report${query ? `?${query}` : ''}`);
}

// ========== MOCK DATA ==========

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Pomada Modeladora',
    description: 'Pomada para modelar cabelo com fixação forte',
    category: 'Finalização',
    brand: 'American Crew',
    price: 89.90,
    cost: 45.00,
    stockQuantity: 15,
    minStockLevel: 5,
    unit: 'un',
    barcode: '7891234567890',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Shampoo Anti-Resíduo',
    description: 'Shampoo para limpeza profunda',
    category: 'Limpeza',
    brand: 'QOD',
    price: 65.00,
    cost: 32.00,
    stockQuantity: 3,
    minStockLevel: 5,
    unit: 'un',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Óleo para Barba',
    description: 'Óleo hidratante para barba',
    category: 'Barba',
    brand: 'Barba Forte',
    price: 45.00,
    cost: 20.00,
    stockQuantity: 8,
    minStockLevel: 3,
    unit: 'un',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Cera Modeladora',
    description: 'Cera para finalização com efeito natural',
    category: 'Finalização',
    brand: 'Gatsby',
    price: 35.00,
    cost: 18.00,
    stockQuantity: 0,
    minStockLevel: 4,
    unit: 'un',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockStockMovements: StockMovement[] = [
  {
    id: 'sm1',
    productId: 'p1',
    productName: 'Pomada Modeladora',
    type: 'in',
    quantity: 20,
    reason: 'Compra de estoque',
    userId: 'admin1',
    userName: 'Admin Sistema',
    previousStock: 10,
    newStock: 30,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sm2',
    productId: 'p1',
    productName: 'Pomada Modeladora',
    type: 'out',
    quantity: 15,
    reason: 'Uso em atendimentos',
    userId: 'b1',
    userName: 'Carlos Barbeiro',
    previousStock: 30,
    newStock: 15,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sm3',
    productId: 'p2',
    productName: 'Shampoo Anti-Resíduo',
    type: 'out',
    quantity: 7,
    reason: 'Uso em atendimentos',
    userId: 'b1',
    userName: 'Carlos Barbeiro',
    previousStock: 10,
    newStock: 3,
    createdAt: new Date().toISOString(),
  },
];

export function getMockProducts(activeOnly = false): Product[] {
  return activeOnly ? mockProducts.filter(p => p.active) : mockProducts;
}

export function getMockStockAlerts(): StockAlert[] {
  return mockProducts
    .filter(p => p.stockQuantity <= p.minStockLevel)
    .map(p => ({
      productId: p.id,
      productName: p.name,
      currentStock: p.stockQuantity,
      minStockLevel: p.minStockLevel,
      status: p.stockQuantity === 0 ? 'out' : 'low',
    }));
}

export function getMockStockMovements(productId?: string): StockMovement[] {
  return productId 
    ? mockStockMovements.filter(m => m.productId === productId)
    : mockStockMovements;
}

// Helpers
export function calculateStockValue(products: Product[]): number {
  return products.reduce((total, product) => {
    return total + (product.cost || 0) * product.stockQuantity;
  }, 0);
}

export function getLowStockCount(products: Product[]): number {
  return products.filter(p => p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0).length;
}

export function getOutOfStockCount(products: Product[]): number {
  return products.filter(p => p.stockQuantity === 0).length;
}
