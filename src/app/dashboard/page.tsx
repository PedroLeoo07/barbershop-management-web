'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import styles from './page.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const navItems = [
    {
      section: 'Menu',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: '📊' },
        { label: 'Agendamentos', href: '/dashboard/appointments', icon: '📅' },
        { label: 'Histórico', href: '/dashboard/history', icon: '📋' },
      ],
    },
  ];

  if (user?.role === 'barber') {
    navItems.push({
      section: 'Barbeiro',
      items: [
        { label: 'Minha Agenda', href: '/dashboard/barber-schedule', icon: '🗓️' },
      ],
    });
  }

  if (user?.role === 'admin') {
    navItems.push({
      section: 'Administração',
      items: [
        { label: 'Serviços', href: '/dashboard/admin/services', icon: '✂️' },
        { label: 'Barbeiros', href: '/dashboard/admin/barbers', icon: '👨‍💼' },
        { label: 'Horários', href: '/dashboard/admin/schedules', icon: '⏰' },
      ],
    });
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>BarberShop</div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((section) => (
            <div key={section.section} className={styles.navSection}>
              <div className={styles.navTitle}>{section.section}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.navLink}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user && getInitials(user.name)}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </div>
          <Button variant="outline" fullWidth onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay Mobile */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button
              className={styles.mobileMenuButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className={styles.headerTitle}>Dashboard</h1>
          </div>
        </header>

        <div className={styles.content}>
          <h2 style={{ marginBottom: '2rem' }}>Bem-vindo, {user?.name}! 👋</h2>
          
          <p style={{ color: 'var(--color-primary-light-gray)', marginBottom: '2rem' }}>
            Selecione uma opção no menu lateral para começar.
          </p>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <Link href="/dashboard/appointments" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--color-primary-dark-gray)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-neutral-border)',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Agendamentos</h3>
                <p style={{ color: 'var(--color-primary-light-gray)', fontSize: '0.875rem' }}>
                  Faça um novo agendamento
                </p>
              </div>
            </Link>

            <Link href="/dashboard/history" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--color-primary-dark-gray)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-neutral-border)',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Histórico</h3>
                <p style={{ color: 'var(--color-primary-light-gray)', fontSize: '0.875rem' }}>
                  Veja seus agendamentos anteriores
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
