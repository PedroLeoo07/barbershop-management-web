'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';
import { BackButton } from '@/components/BackButton';
import { PaymentStatusBadge } from '@/components/Badge';
import { 
  getAllPayments, 
  getPaymentByAppointment,
  confirmPayment, 
  getMockPayments 
} from '@/services/paymentService';
import { Payment, PaymentStatus, PaymentMethod } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function BarberPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Estado para confirmar pagamento
  const [confirmMethod, setConfirmMethod] = useState<PaymentMethod>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, statusFilter, methodFilter, searchTerm, dateFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // TODO: Filtrar por barbeiro quando integrado com backend
      // const data = await getAllPayments({ barberId: user?.id });
      const data = getMockPayments();
      setPayments(data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filtro por método
    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.method === methodFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.appointmentId.toLowerCase().includes(term) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(term))
      );
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.createdAt);
        
        if (dateFilter === 'today') {
          return paymentDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return paymentDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return paymentDate >= monthAgo;
        }
        return true;
      });
    }

    // Ordenar por data (mais recentes primeiro)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredPayments(filtered);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;

    setActionLoading(true);
    try {
      await confirmPayment(selectedPayment.id, confirmMethod, transactionId || undefined);
      await loadPayments();
      setShowConfirmModal(false);
      setShowDetailsModal(false);
      setTransactionId('');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Erro ao confirmar pagamento');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      pix: 'PIX',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro',
    };
    return labels[method];
  };

  const calculateStats = () => {
    const total = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
    const paid = filteredPayments
      .filter(p => p.status === 'paid')
      .reduce((acc, p) => acc + p.amount, 0);
    const pending = filteredPayments
      .filter(p => p.status === 'pending')
      .reduce((acc, p) => acc + p.amount, 0);
    const todayPaid = filteredPayments
      .filter(p => {
        const paymentDate = new Date(p.paidAt || p.createdAt);
        const today = new Date();
        return p.status === 'paid' &&
          paymentDate.getDate() === today.getDate() &&
          paymentDate.getMonth() === today.getMonth() &&
          paymentDate.getFullYear() === today.getFullYear();
      })
      .reduce((acc, p) => acc + p.amount, 0);

    return { total, paid, pending, todayPaid, count: filteredPayments.length };
  };

  const stats = calculateStats();

  if (loading) {
    return <Loading fullPage text="Carregando pagamentos..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Meus Pagamentos</h1>
      </div>

      {/* Estatísticas */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Total de Pagamentos</div>
          <div className={styles.statValue}>{stats.count}</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Recebido Hoje</div>
          <div className={styles.statValue} style={{ color: 'var(--success)' }}>
            {formatCurrency(stats.todayPaid)}
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Total Recebido</div>
          <div className={styles.statValue} style={{ color: 'var(--success)' }}>
            {formatCurrency(stats.paid)}
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Pendentes</div>
          <div className={styles.statValue} style={{ color: 'var(--warning)' }}>
            {formatCurrency(stats.pending)}
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className={styles.filtersCard}>
        <div className={styles.filters}>
          <Input
            type="text"
            placeholder="Buscar por ID do agendamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
            className={styles.select}
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'all')}
            className={styles.select}
          >
            <option value="all">Todos os Métodos</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="cash">Dinheiro</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">Todas as Datas</option>
            <option value="today">Hoje</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
          </select>
        </div>
      </Card>

      {/* Lista de Pagamentos */}
      <Card>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Agendamento</th>
                <th>Valor</th>
                <th>Método</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className={styles.appointmentId}>{payment.appointmentId}</td>
                    <td className={styles.amount}>{formatCurrency(payment.amount)}</td>
                    <td>{getMethodLabel(payment.method)}</td>
                    <td>
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleViewDetails(payment)}
                      >
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalhes do Pagamento"
      >
        {selectedPayment && (
          <div className={styles.paymentDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID do Pagamento:</span>
              <span className={styles.detailValue}>{selectedPayment.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID do Agendamento:</span>
              <span className={styles.detailValue}>{selectedPayment.appointmentId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Valor:</span>
              <span className={styles.detailValue}>
                {formatCurrency(selectedPayment.amount)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Método:</span>
              <span className={styles.detailValue}>
                {getMethodLabel(selectedPayment.method)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <PaymentStatusBadge status={selectedPayment.status} />
            </div>
            {selectedPayment.transactionId && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>ID da Transação:</span>
                <span className={styles.detailValue}>{selectedPayment.transactionId}</span>
              </div>
            )}
            {selectedPayment.paidAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Data do Pagamento:</span>
                <span className={styles.detailValue}>
                  {formatDate(selectedPayment.paidAt)}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Criado em:</span>
              <span className={styles.detailValue}>
                {formatDate(selectedPayment.createdAt)}
              </span>
            </div>
            {selectedPayment.notes && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Observações:</span>
                <span className={styles.detailValue}>{selectedPayment.notes}</span>
              </div>
            )}

            <div className={styles.actions}>
              {selectedPayment.status === 'pending' && (
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowConfirmModal(true);
                  }}
                >
                  Confirmar Recebimento
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmar Pagamento */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setShowDetailsModal(true);
        }}
        title="Confirmar Recebimento"
      >
        <div className={styles.formGroup}>
          <label>Forma de Pagamento Recebida</label>
          <select
            value={confirmMethod}
            onChange={(e) => setConfirmMethod(e.target.value as PaymentMethod)}
            className={styles.select}
          >
            <option value="cash">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>ID da Transação (opcional)</label>
          <Input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Ex: PIX123456"
          />
        </div>

        <div className={styles.info}>
          <p>⚠️ Ao confirmar, você está declarando que recebeu o pagamento do cliente.</p>
        </div>

        <div className={styles.modalActions}>
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirmModal(false);
              setShowDetailsModal(true);
            }}
            disabled={actionLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirmPayment} disabled={actionLoading}>
            {actionLoading ? 'Confirmando...' : 'Confirmar Recebimento'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
