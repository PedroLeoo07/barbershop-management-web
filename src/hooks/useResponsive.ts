'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointValues {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
}

/**
 * Hook para detectar breakpoints responsivos
 */
export function useBreakpoint(): BreakpointValues & { current: Breakpoint } {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');
  const [breakpoints, setBreakpoints] = useState<BreakpointValues>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  });

  useEffect(() => {
    const calculateBreakpoint = () => {
      const width = window.innerWidth;
      
      const values: BreakpointValues = {
        xs: width >= 320,
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536,
      };

      let current: Breakpoint = 'xs';
      if (width >= 1536) current = '2xl';
      else if (width >= 1280) current = 'xl';
      else if (width >= 1024) current = 'lg';
      else if (width >= 768) current = 'md';
      else if (width >= 640) current = 'sm';

      setBreakpoints(values);
      setBreakpoint(current);
    };

    calculateBreakpoint();
    window.addEventListener('resize', calculateBreakpoint);
    return () => window.removeEventListener('resize', calculateBreakpoint);
  }, []);

  return { ...breakpoints, current: breakpoint };
}

/**
 * Hook para detectar se está em mobile
 */
export function useIsMobile(): boolean {
  const { sm } = useBreakpoint();
  return !sm;
}

/**
 * Hook para detectar se está em tablet
 */
export function useIsTablet(): boolean {
  const { md, lg } = useBreakpoint();
  return md && !lg;
}

/**
 * Hook para detectar se está em desktop
 */
export function useIsDesktop(): boolean {
  const { lg } = useBreakpoint();
  return lg;
}

/**
 * Hook para detectar orientação do dispositivo
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return orientation;
}

/**
 * Hook para detectar tamanho da viewport
 */
export function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
