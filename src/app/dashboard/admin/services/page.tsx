'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Service } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Textarea } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';
import styles from './page.module.css';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: '',
    active: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        active: service.active,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        category: '',
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        await api.updateService(editingService.id, formData);
        alert('Serviço atualizado com sucesso!');
      } else {
        await api.createService(formData);
        alert('Serviço criado com sucesso!');
      }
      setShowModal(false);
      loadServices();
    } catch (error) {
      alert('Erro ao salvar serviço');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este serviço?')) return;

    try {
      await api.deleteService(id);
      alert('Serviço excluído com sucesso!');
      loadServices();
    } catch (error) {
      alert('Erro ao excluir serviço');
    }
  };

  if (loading) {
    return <Loading fullPage text="Carregando serviços..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Serviços</h1>
          <p className={styles.subtitle}>Gerencie os serviços da barbearia</p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Novo Serviço</Button>
      </div>

      <div className={styles.grid}>
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader
              title={service.name}
              subtitle={service.category}
              action={
                <span
                  className={styles.activeStatus}
                  style={{
                    color: service.active ? '#4CAF50' : '#F44336',
                  }}
                >
                  {service.active ? '● Ativo' : '● Inativo'}
                </span>
              }
            />
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
              <div className={styles.actions}>
                <Button variant="outline" size="small" onClick={() => handleOpenModal(service)}>
                  Editar
                </Button>
                <Button variant="danger" size="small" onClick={() => handleDelete(service.id)}>
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
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nome do Serviço"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <Input
            label="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Cortes, Barba, Combos"
            required
          />

          <Input
            type="number"
            label="Duração (minutos)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            min={10}
            step={5}
            required
          />

          <Input
            type="number"
            label="Preço (R$)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min={0}
            step={0.01}
            required
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="outline" fullWidth onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth>
              {editingService ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
