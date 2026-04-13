'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { getMockRevenueReport, formatCurrency } from '@/services/reportService';
import type { RevenueReport } from '@/types';
import styles from './page.module.css';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [report, setReport] = useState<RevenueReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    setLoading(true);
    try {
      // Mock data - substituir por chamada real à API
      const data = getMockRevenueReport(period);
      setReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!report) {
    return <div>Erro ao carregar relatório</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1>Relatórios Financeiros</h1>
      </div>

      <div className={styles.filters}>
        <div className={styles.periodSelector}>
          <button
            className={period === 'day' ? styles.active : ''}
            onClick={() => setPeriod('day')}
          >
            Hoje
          </button>
          <button
            className={period === 'week' ? styles.active : ''}
            onClick={() => setPeriod('week')}
          >
            Semana
          </button>
          <button
            className={period === 'month' ? styles.active : ''}
            onClick={() => setPeriod('month')}
          >
            Mês
          </button>
          <button
            className={period === 'year' ? styles.active : ''}
            onClick={() => setPeriod('year')}
          >
            Ano
          </button>
        </div>
      </div>

      <div className={styles.summary}>
        <Card>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Receita Total</span>
              <span className={styles.value}>{formatCurrency(report.totalRevenue)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Agendamentos</span>
              <span className={styles.value}>{report.totalAppointments}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Ticket Médio</span>
              <span className={styles.value}>{formatCurrency(report.averageTicket)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.chartsGrid}>
        <Card>
          <h3>Receita por Barbeiro</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Barbeiro</th>
                  <th>Receita</th>
                  <th>Atendimentos</th>
                  <th>Comissão</th>
                </tr>
              </thead>
              <tbody>
                {report.revenueByBarber.map((barber) => (
                  <tr key={barber.barberId}>
                    <td>{barber.barberName}</td>
                    <td>{formatCurrency(barber.totalRevenue)}</td>
                    <td>{barber.totalAppointments}</td>
                    <td>{formatCurrency(barber.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3>Serviços Mais Vendidos</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Vendas</th>
                  <th>Receita</th>
                </tr>
              </thead>
              <tbody>
                {report.revenueByService.map((service) => (
                  <tr key={service.serviceId}>
                    <td>{service.serviceName}</td>
                    <td>{service.totalSold}</td>
                    <td>{formatCurrency(service.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3>Formas de Pagamento</h3>
          <div className={styles.paymentMethods}>
            {report.paymentMethods.map((method) => (
              <div key={method.method} className={styles.paymentMethod}>
                <div className={styles.methodInfo}>
                  <span className={styles.methodName}>
                    {method.method === 'pix' && '💸 Pix'}
                    {method.method === 'credit_card' && '💳 Crédito'}
                    {method.method === 'debit_card' && '💳 Débito'}
                    {method.method === 'cash' && '💵 Dinheiro'}
                  </span>
                  <span className={styles.methodValue}>{formatCurrency(method.total)}</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <span className={styles.percentage}>{method.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
