'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData, UserRole } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock API - Substituir por chamadas reais à API
const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simular delay de rede
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock de usuários para desenvolvimento
  const mockUsers: Record<string, User> = {
    'client@example.com': {
      id: '1',
      name: 'João Silva',
      email: 'client@example.com',
      phone: '(11) 99999-9999',
      role: 'client',
      createdAt: new Date().toISOString(),
    },
    'barber@example.com': {
      id: '2',
      name: 'Carlos Barbeiro',
      email: 'barber@example.com',
      phone: '(11) 98888-8888',
      role: 'barber',
      createdAt: new Date().toISOString(),
    },
    'admin@example.com': {
      id: '3',
      name: 'Admin Sistema',
      email: 'admin@example.com',
      phone: '(11) 97777-7777',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  };

  const user = mockUsers[email];
  if (!user || password !== '123456') {
    throw new Error('Email ou senha inválidos');
  }

  return user;
};

const mockRegister = async (data: RegisterData): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role || 'client',
    createdAt: new Date().toISOString(),
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await mockLogin(email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const userData = await mockRegister(data);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
