'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getBarberSchedule, updateAppointmentStatus } from '@/lib/api';
import { Appointment } from '@/types';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import Loading from '@/components/Loading/Loading';
import { BackButton } from '@/components/BackButton';
import styles from './page.module.css';

export default function BarberSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  useEffect(() => {
    if (user?.role !== 'barber') {
      router.push('/dashboard');
      return;
    }
    loadSchedule();
  }, [user, selectedDate]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const data = await getBarberSchedule(user?.id || '', selectedDate);
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      await loadSchedule();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading variant="spinner" size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minha Agenda</h1>
          <p className={styles.subtitle}>Gerencie seus agendamentos do dia</p>
        </div>
        
        <div className={styles.dateSelector}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className={styles.statsGrid}>
        <Card variant="elevated" className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total do Dia</span>
          </div>
        </Card>

        <Card variant="elevated" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⏳</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>Pendentes</span>
          </div>
        </Card>

        <Card variant="elevated" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✓</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.confirmed}</span>
            <span className={styles.statLabel}>Confirmados</span>
          </div>
        </Card>

        <Card variant="elevated" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>✔</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Concluídos</span>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setFilter('pending')}
        >
          Pendentes ({stats.pending})
        </Button>
        <Button
          variant={filter === 'confirmed' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setFilter('confirmed')}
        >
          Confirmados ({stats.confirmed})
        </Button>
      </div>

      {/* Lista de Agendamentos */}
      {filteredAppointments.length === 0 ? (
        <Card variant="elevated" className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h3>Nenhum agendamento encontrado</h3>
          <p>Não há agendamentos para os filtros selecionados.</p>
        </Card>
      ) : (
        <div className={styles.appointmentsList}>
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} variant="elevated" className={styles.appointmentCard}>
              <div className={styles.appointmentHeader}>
                <div className={styles.timeSection}>
                  <span className={styles.time}>🕐 {appointment.time}</span>
                  <span className={styles.duration}>{appointment.duration} min</span>
                </div>
                <span 
                  className={styles.status}
                  style={{ 
                    background: `${getStatusColor(appointment.status)}20`,
                    color: getStatusColor(appointment.status)
                  }}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className={styles.appointmentBody}>
                <div className={styles.clientInfo}>
                  <div className={styles.clientAvatar}>
                    {appointment.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={styles.clientName}>{appointment.clientName}</h4>
                    <p className={styles.serviceName}>💈 {appointment.serviceName}</p>
                  </div>
                </div>

                <div className={styles.appointmentDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Valor:</span>
                    <span className={styles.detailValue}>R$ {appointment.price.toFixed(2)}</span>
                  </div>
                  {appointment.notes && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Observações:</span>
                      <span className={styles.detailValue}>{appointment.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.appointmentActions}>
                {appointment.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                    >
                      ✓ Confirmar
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                    >
                      ✕ Cancelar
                    </Button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                    >
                      ✔ Concluir
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                    >
                      ✕ Cancelar
                    </Button>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <Button variant="ghost" size="small" disabled>
                    ✔ Concluído
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
