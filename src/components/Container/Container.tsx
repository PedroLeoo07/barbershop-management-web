'use client';

import { ReactNode, CSSProperties } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centerContent?: boolean;
  as?: 'div' | 'section' | 'article' | 'main' | 'aside';
  style?: CSSProperties;
}

export function Container({
  children,
  className = '',
  maxWidth = 'xl',
  padding = true,
  centerContent = false,
  as: Component = 'div',
  style,
}: ContainerProps) {
  const classes = [
    styles.container,
    maxWidth && styles[`maxWidth-${maxWidth}`],
    !padding && styles.noPadding,
    centerContent && styles.centerContent,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  );
}

// Componentes especializados
export function Section({ children, className = '', ...props }: Omit<ContainerProps, 'as'>) {
  return (
    <Container as="section" className={className} {...props}>
      {children}
    </Container>
  );
}

export function MainContent({ children, className = '', ...props }: Omit<ContainerProps, 'as'>) {
  return (
    <Container as="main" className={`${styles.mainContent} ${className}`} {...props}>
      {children}
    </Container>
  );
}
