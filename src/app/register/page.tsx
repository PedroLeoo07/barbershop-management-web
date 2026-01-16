'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>BarberShop</h1>
          <p className={styles.subtitle}>Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <Input
            type="text"
            name="name"
            label="Nome completo"
            placeholder="João Silva"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            type="tel"
            name="phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <Input
            type="password"
            name="password"
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            type="password"
            name="confirmPassword"
            label="Confirmar senha"
            placeholder="Digite a senha novamente"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button type="submit" loading={loading} fullWidth>
            Criar conta
          </Button>
        </form>

        <div className={styles.footer}>
          Já tem uma conta?{' '}
          <Link href="/login" className={styles.link}>
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
