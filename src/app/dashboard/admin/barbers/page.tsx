'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Barber, TimeSlot } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';
import { BackButton } from '@/components/BackButton';
import styles from './page.module.css';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
  });

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const data = await api.getBarbers();
      setBarbers(data);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber);
      setFormData({
        name: barber.name,
        email: barber.email,
        phone: barber.phone,
        specialties: barber.specialties.join(', '),
      });
    } else {
      setEditingBarber(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialties: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const barberData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'barber' as const,
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
      workingHours: {
        monday: [{ start: '09:00', end: '18:00' }],
        tuesday: [{ start: '09:00', end: '18:00' }],
        wednesday: [{ start: '09:00', end: '18:00' }],
        thursday: [{ start: '09:00', end: '18:00' }],
        friday: [{ start: '09:00', end: '18:00' }],
        saturday: [{ start: '09:00', end: '17:00' }],
        sunday: [],
      },
      rating: 0,
      totalAppointments: 0,
    };

    try {
      if (editingBarber) {
        await api.updateBarber(editingBarber.id, barberData);
        alert('Barbeiro atualizado com sucesso!');
      } else {
        await api.createBarber(barberData);
        alert('Barbeiro criado com sucesso!');
      }
      setShowModal(false);
      loadBarbers();
    } catch (error) {
      alert('Erro ao salvar barbeiro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este barbeiro?')) return;

    try {
      await api.deleteBarber(id);
      alert('Barbeiro excluído com sucesso!');
      loadBarbers();
    } catch (error) {
      alert('Erro ao excluir barbeiro');
    }
  };

  const getWorkingDays = (barber: Barber) => {
    const days = DAYS_OF_WEEK.filter(day => {
      const slots = barber.workingHours[day.key as keyof typeof barber.workingHours];
      return slots && slots.length > 0;
    });
    return days.map(d => d.label.substring(0, 3)).join(', ');
  };

  if (loading) {
    return <Loading fullPage text="Carregando barbeiros..." />;
  }

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Barbeiros</h1>
          <p className={styles.subtitle}>Gerencie os barbeiros da barbearia</p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Novo Barbeiro</Button>
      </div>

      <div className={styles.grid}>
        {barbers.map((barber) => (
          <Card key={barber.id}>
            <CardHeader
              title={barber.name}
              subtitle={barber.email}
            />
            <CardContent>
              <div className={styles.barberInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>📞 Telefone:</span>
                  <span>{barber.phone}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>⭐ Avaliação:</span>
                  <span>{barber.rating.toFixed(1)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>📅 Agendamentos:</span>
                  <span>{barber.totalAppointments}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>✂️ Especialidades:</span>
                  <span>{barber.specialties.join(', ')}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>🗓️ Dias de trabalho:</span>
                  <span className={styles.workingDays}>{getWorkingDays(barber)}</span>
                </div>
              </div>
              <div className={styles.actions}>
                <Button variant="outline" onClick={() => handleOpenModal(barber)}>
                  Editar
                </Button>
                <Button variant="outline" onClick={() => handleDelete(barber.id)}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="text"
            label="Nome completo"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="tel"
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Input
            type="text"
            label="Especialidades"
            placeholder="Ex: Cortes Clássicos, Degradê, Barba"
            value={formData.specialties}
            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
            required
          />

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingBarber ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
