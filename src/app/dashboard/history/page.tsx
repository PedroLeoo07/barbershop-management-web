'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Appointment } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import styles from './page.module.css';

export default function HistoryPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await api.getAppointments({ clientId: user!.id });
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    try {
      await api.cancelAppointment(id);
      alert('Agendamento cancelado com sucesso!');
      loadAppointments();
    } catch (error) {
      alert('Erro ao cancelar agendamento');
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      scheduled: '#2196F3',
      confirmed: '#4CAF50',
      'in-progress': '#FF9800',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status];
  };

  const getStatusLabel = (status: Appointment['status']) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      'in-progress': 'Em andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status];
  };

  if (loading) {
    return <Loading fullPage text="Carregando histórico..." />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Histórico de Agendamentos</h1>
      <p className={styles.subtitle}>Todos os seus agendamentos</p>

      {appointments.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📅</div>
          <h3>Nenhum agendamento encontrado</h3>
          <p>Você ainda não realizou nenhum agendamento</p>
          <Button onClick={() => window.location.href = '/dashboard/appointments'}>
            Fazer Agendamento
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent>
                <div className={styles.appointmentCard}>
                  <div className={styles.appointmentHeader}>
                    <div>
                      <h3>{appointment.serviceName}</h3>
                      <p className={styles.barber}>com {appointment.barberName}</p>
                    </div>
                    <div
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {getStatusLabel(appointment.status)}
                    </div>
                  </div>

                  <div className={styles.appointmentDetails}>
                    <div className={styles.detail}>
                      <span className={styles.icon}>📅</span>
                      <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.icon}>⏰</span>
                      <span>{appointment.time}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.icon}>⏱️</span>
                      <span>{appointment.duration} min</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.icon}>💰</span>
                      <span>R$ {appointment.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {appointment.status === 'scheduled' && (
                    <div className={styles.actions}>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
