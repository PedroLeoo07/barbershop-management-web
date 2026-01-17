'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { BackButton } from '@/components/BackButton';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <BackButton />
        <div className={styles.header}>
          <h1 className={styles.logo}>BarberShop</h1>
          <p className={styles.subtitle}>Sistema de Gestão Premium</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} fullWidth>
            Entrar
          </Button>
        </form>

        <div className={styles.footer}>
          Não tem uma conta?{' '}
          <Link href="/register" className={styles.link}>
            Cadastre-se
          </Link>
        </div>

        <div className={styles.demoInfo}>
          <div className={styles.demoTitle}>💡 Contas de Demonstração:</div>
          <div className={styles.demoList}>
            • Cliente: client@example.com<br />
            • Barbeiro: barber@example.com<br />
            • Admin: admin@example.com<br />
            • Senha para todos: 123456
          </div>
        </div>
      </div>
    </div>
  );
}
