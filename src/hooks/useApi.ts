'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCache } from '@/contexts/CacheContext';

interface UseApiOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    cacheKey,
    cacheTTL,
    immediate = true,
    onSuccess,
    onError,
  } = options;

  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cacheKey) {
        const cached = cache.get<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          onSuccess?.(cached);
          return cached;
        }
      }

      // Fetch data
      const result = await fetcher();
      
      // Update cache
      if (cacheKey) {
        cache.set(cacheKey, result, cacheTTL);
      }

      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetcher, cacheKey, cacheTTL, cache, onSuccess, onError]);

  const invalidate = useCallback(() => {
    if (cacheKey) {
      cache.invalidate(cacheKey);
    }
  }, [cacheKey, cache]);

  const refetch = useCallback(() => {
    invalidate();
    return execute();
  }, [invalidate, execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // Only run on mount if immediate

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    invalidate,
  };
}
