'use client';

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  invalidate: (key: string) => void;
  clear: () => void;
}

const CacheContext = createContext<CacheContextType | null>(null);

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function CacheProvider({ children }: { children: ReactNode }) {
  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > DEFAULT_TTL) {
      cache.delete(key);
      return null;
    }

    return entry.data as T;
  }, []);

  const set = useCallback(<T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.delete(key);
  }, []);

  const clear = useCallback(() => {
    cache.clear();
  }, []);

  const value = useMemo(
    () => ({ get, set, invalidate, clear }),
    [get, set, invalidate, clear]
  );

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
}
