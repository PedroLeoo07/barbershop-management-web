'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent } from 'react';
import styles from './SmoothLink.module.css';

interface SmoothLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
}

export function SmoothLink({ 
  href, 
  children, 
  className = '',
  prefetch = true,
  replace = false,
  scroll = true,
  ...props 
}: SmoothLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Permitir Ctrl+Click e Command+Click para abrir em nova aba
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    e.preventDefault();
    
    // Adicionar classe de transição
    document.body.classList.add(styles.transitioning);

    // Pequeno delay para animação
    setTimeout(() => {
      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
      
      // Remover classe após navegação
      setTimeout(() => {
        document.body.classList.remove(styles.transitioning);
      }, 300);
    }, 50);
  };

  return (
    <Link 
      href={href}
      onClick={handleClick}
      className={`${styles.smoothLink} ${className}`}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}
