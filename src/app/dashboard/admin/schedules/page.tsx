'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Barber, WorkingHours, TimeSlot } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';
import { BackButton } from '@/components/BackButton';
import styles from './page.module.css';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' },
];

export default function AdminSchedulesPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState({ start: '09:00', end: '18:00' });

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const data = await api.getBarbers();
      setBarbers(data);
      if (data.length > 0) {
        setSelectedBarber(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (day: string) => {
    if (!selectedBarber) return;
    
    const dayKey = day as keyof WorkingHours;
    const slots = selectedBarber.workingHours[dayKey] || [];
    setEditingDay(day);
    setTimeSlots([...slots]);
    setShowModal(true);
  };

  const handleAddSlot = () => {
    setTimeSlots([...timeSlots, { ...newSlot }]);
    setNewSlot({ start: '09:00', end: '18:00' });
  };

  const handleRemoveSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = async () => {
    if (!selectedBarber || !editingDay) return;

    try {
      const updatedWorkingHours = {
        ...selectedBarber.workingHours,
        [editingDay]: timeSlots,
      };

      await api.updateBarber(selectedBarber.id, {
        workingHours: updatedWorkingHours,
      });

      alert('Horários atualizados com sucesso!');
      setShowModal(false);
      loadBarbers();
    } catch (error) {
      alert('Erro ao atualizar horários');
    }
  };

  const getDaySlots = (day: string) => {
    if (!selectedBarber) return [];
    const dayKey = day as keyof WorkingHours;
    return selectedBarber.workingHours[dayKey] || [];
  };

  const formatTimeRange = (slots: TimeSlot[]) => {
    if (slots.length === 0) return 'Não trabalha';
    return slots.map(slot => `${slot.start} - ${slot.end}`).join(', ');
  };

  if (loading) {
    return <Loading fullPage text="Carregando horários..." />;
  }

  if (barbers.length === 0) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.empty}>
          <h2>Nenhum barbeiro cadastrado</h2>
          <p>Cadastre barbeiros primeiro para gerenciar seus horários</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Horários de Trabalho</h1>
          <p className={styles.subtitle}>Gerencie os horários disponíveis dos barbeiros</p>
        </div>
      </div>

      <div className={styles.barberSelector}>
        <label className={styles.selectorLabel}>Selecione o barbeiro:</label>
        <select
          value={selectedBarber?.id || ''}
          onChange={(e) => {
            const barber = barbers.find(b => b.id === e.target.value);
            setSelectedBarber(barber || null);
          }}
          className={styles.select}
        >
          {barbers.map(barber => (
            <option key={barber.id} value={barber.id}>
              {barber.name}
            </option>
          ))}
        </select>
      </div>

      {selectedBarber && (
        <div className={styles.scheduleGrid}>
          {DAYS_OF_WEEK.map(day => {
            const slots = getDaySlots(day.key);
            const isWorking = slots.length > 0;

            return (
              <Card key={day.key} className={styles.dayCard}>
                <CardHeader
                  title={day.label}
                  subtitle={
                    <span className={isWorking ? styles.working : styles.notWorking}>
                      {isWorking ? '✓ Trabalha' : '✕ Não trabalha'}
                    </span>
                  }
                />
                <CardContent>
                  <div className={styles.timeInfo}>
                    {formatTimeRange(slots)}
                  </div>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleEditSchedule(day.key)}
                  >
                    Editar Horários
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Horários - ${DAYS_OF_WEEK.find(d => d.key === editingDay)?.label}`}
      >
        <div className={styles.modalContent}>
          <div className={styles.slotsList}>
            {timeSlots.length === 0 ? (
              <p className={styles.emptySlots}>Nenhum horário configurado. O barbeiro não trabalha neste dia.</p>
            ) : (
              timeSlots.map((slot, index) => (
                <div key={index} className={styles.slotItem}>
                  <span className={styles.slotTime}>
                    {slot.start} - {slot.end}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handleRemoveSlot(index)}
                  >
                    Remover
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className={styles.addSlot}>
            <h3>Adicionar horário</h3>
            <div className={styles.slotInputs}>
              <Input
                type="time"
                label="Início"
                value={newSlot.start}
                onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
              />
              <Input
                type="time"
                label="Fim"
                value={newSlot.end}
                onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
              />
            </div>
            <Button onClick={handleAddSlot} fullWidth>
              + Adicionar Horário
            </Button>
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSchedule}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
