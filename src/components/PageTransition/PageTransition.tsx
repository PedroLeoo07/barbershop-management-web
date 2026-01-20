'use client';

import { ReactNode } from 'react';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'slide' | 'fade' | 'scale';
  className?: string;
}

export function PageTransition({ 
  children, 
  variant = 'slide',
  className = '' 
}: PageTransitionProps) {
  const variantClass = {
    slide: styles.slideIn,
    fade: styles.fadeIn,
    scale: styles.scaleIn,
  }[variant];

  return (
    <div className={`${variantClass} ${className}`}>
      {children}