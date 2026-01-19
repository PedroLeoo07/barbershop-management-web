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
  updatePaymentStatus, 
  confirmPayment, 
  refundPayment, 
  getMockPayments 
} from '@/services/paymentService';
import { Payment, PaymentStatus, PaymentMethod } from '@/types';
import styles from './page.module.css';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Estado para ações
  const [confirmMethod, setConfirmMethod] = useState<PaymentMethod>('pix');
  const [transactionId, setTransactionId] = useState('');
  const [refundReason, setRefundReason] = useState('');
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
      // Por enquanto usando mock data
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

    // Filtro por busca (ID do agendamento ou transaction ID)
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

  const handleRefundPayment = async () => {
    if (!selectedPayment || !refundReason.trim()) {
      alert('Por favor, informe o motivo do reembolso');
      return;
    }

    setActionLoading(true);
    try {
      await refundPayment(selectedPayment.id, refundReason);
      await loadPayments();
      setShowRefundModal(false);
      setShowDetailsModal(false);
      setRefundReason('');
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      alert('Erro ao processar reembolso');
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

    return { total, paid, pending, count: filteredPayments.length };
  };

  const stats = calculateStats();

  if (loading) {
    return <Loading fullPage text="Carregando pagamentos..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Gestão de Pagamentos</h1>
      </div>

      {/* Estatísticas */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Total de Pagamentos</div>
          <div className={styles.statValue}>{stats.count}</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Total Geral</div>
          <div className={styles.statValue}>{formatCurrency(stats.total)}</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Pagos</div>
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
            placeholder="Buscar por ID do agendamento ou transação..."
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
                  Confirmar Pagamento
                </Button>
              )}
              {selectedPayment.status === 'paid' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowRefundModal(true);
                  }}
                >
                  Processar Reembolso
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
        title="Confirmar Pagamento"
      >
        <div className={styles.formGroup}>
          <label>Método de Pagamento</label>
          <select
            value={confirmMethod}
            onChange={(e) => setConfirmMethod(e.target.value as PaymentMethod)}
            className={styles.select}
          >
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="cash">Dinheiro</option>
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
            {actionLoading ? 'Confirmando...' : 'Confirmar Pagamento'}
          </Button>
        </div>
      </Modal>

      {/* Modal de Reembolso */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setShowDetailsModal(true);
        }}
        title="Processar Reembolso"
      >
        <div className={styles.formGroup}>
          <label>Motivo do Reembolso *</label>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Descreva o motivo do reembolso..."
            className={styles.textarea}
            rows={4}
          />
        </div>

        <div className={styles.modalActions}>
          <Button
            variant="outline"
            onClick={() => {
              setShowRefundModal(false);
              setShowDetailsModal(true);
            }}
            disabled={actionLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleRefundPayment} disabled={actionLoading}>
            {actionLoading ? 'Processando...' : 'Processar Reembolso'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
