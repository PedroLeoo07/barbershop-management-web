'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/Button';
import { StockStatusBadge } from '@/components/Badge';
import { getMockProducts, getMockStockAlerts } from '@/services/productService';
import { Product, StockAlert } from '@/types';
import styles from './page.module.css';

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data - substituir por chamadas reais à API
      const productsData = getMockProducts();
      const alertsData = getMockStockAlerts();
      setProducts(productsData);
      setStockAlerts(alertsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: Product): 'low' | 'out' | 'ok' => {
    if (product.stockQuantity === 0) return 'out';
    if (product.stockQuantity <= product.minStockLevel) return 'low';
    return 'ok';
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <div>
          <h1>Gestão de Produtos</h1>
          <p className={styles.subtitle}>Controle de estoque e produtos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          + Adicionar Produto
        </Button>
      </div>

      {stockAlerts.length > 0 && (
        <Card className={styles.alertsCard}>
          <div className={styles.alertsHeader}>
            <h3>⚠️ Alertas de Estoque</h3>
            <span className={styles.alertCount}>{stockAlerts.length}</span>
          </div>
          <div className={styles.alertsList}>
            {stockAlerts.map((alert) => (
              <div key={alert.productId} className={styles.alert}>
                <div>
                  <strong>{alert.productName}</strong>
                  <span className={styles.alertText}>
                    {alert.status === 'out' 
                      ? 'Produto sem estoque!' 
                      : `Estoque baixo: ${alert.currentStock} unidades (mínimo: ${alert.minStockLevel})`
                    }
                  </span>
                </div>
                <Button size="small" variant="secondary">
                  Repor
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className={styles.tableHeader}>
          <h3>Produtos Cadastrados</h3>
          <div className={styles.stats}>
            <span>Total: {products.length}</span>
            <span className={styles.statDivider}>|</span>
            <span>Estoque Baixo: {stockAlerts.filter(a => a.status === 'low').length}</span>
            <span className={styles.statDivider}>|</span>
            <span>Sem Estoque: {stockAlerts.filter(a => a.status === 'out').length}</span>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Marca</th>
                <th>Estoque</th>
                <th>Mín.</th>
                <th>Custo</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productInfo}>
                      <strong>{product.name}</strong>
                      <span className={styles.productDescription}>
                        {product.description}
                      </span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.brand || '-'}</td>
                  <td>
                    <span className={`${styles.stock} ${
                      product.stockQuantity === 0 ? styles.stockOut :
                      product.stockQuantity <= product.minStockLevel ? styles.stockLow : ''
                    }`}>
                      {product.stockQuantity} {product.unit}
                    </span>
                  </td>
                  <td>{product.minStockLevel}</td>
                  <td>R$ {product.cost?.toFixed(2) || '-'}</td>
                  <td>R$ {product.price.toFixed(2)}</td>
                  <td>
                    <StockStatusBadge status={getStockStatus(product)} />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Editar">
                        ✏️
                      </button>
                      <button className={styles.actionBtn} title="Ajustar Estoque">
                        📦
                      </button>
                      <button className={styles.actionBtn} title="Histórico">
                        📊
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
