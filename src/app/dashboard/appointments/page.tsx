'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Service, Barber } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';
import styles from './page.module.css';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, barbersData] = await Promise.all([
        api.getServices(),
        api.getBarbers(),
      ]);
      setServices(servicesData);
      setBarbers(barbersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setSubmitting(true);
    try {
      await api.createAppointment({
        clientId: user!.id,
        clientName: user!.name,
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        status: 'scheduled',
        price: selectedService.price,
      });

      alert('Agendamento realizado com sucesso!');
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Erro ao realizar agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const openModal = (service: Service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  if (loading) {
    return <Loading fullPage text="Carregando serviços..." />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Agendar Serviço</h1>
      <p className={styles.subtitle}>Escolha o serviço desejado</p>

      <div className={styles.grid}>
        {services.map((service) => (
          <Card key={service.id} interactive>
            <CardHeader title={service.name} />
            <CardContent>
              <p className={styles.description}>{service.description}</p>
              <div className={styles.details}>
                <div className={styles.detail}>
                  <span className={styles.icon}>⏱️</span>
                  <span>{service.duration} min</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.icon}>💰</span>
                  <span>R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
              <Button fullWidth onClick={() => openModal(service)}>
                Agendar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Finalizar Agendamento"
        size="large"
      >
        {selectedService && (
          <div className={styles.modalContent}>
            <div className={styles.selectedService}>
              <h3>{selectedService.name}</h3>
              <p>R$ {selectedService.price.toFixed(2)} • {selectedService.duration} min</p>
            </div>

            <div className={styles.formGroup}>
              <label>Escolha o barbeiro:</label>
              <div className={styles.barbersList}>
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className={`${styles.barberCard} ${
                      selectedBarber?.id === barber.id ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedBarber(barber)}
                  >
                    <div className={styles.barberAvatar}>
                      {barber.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className={styles.barberName}>{barber.name}</div>
                      <div className={styles.barberRating}>⭐ {barber.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <Input
                type="date"
                label="Data"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                type="time"
                label="Horário"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button fullWidth onClick={handleSubmit} loading={submitting}>
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
