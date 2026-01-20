'use client';

import { ReactNode, CSSProperties } from 'react';
import styles from './Grid.module.css';

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  smCols?: 1 | 2 | 3 | 4 | 6;
  mdCols?: 1 | 2 | 3 | 4 | 6;
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6;
  xlCols?: 4 | 5 | 6;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  autoFit?: boolean;
  autoFill?: boolean;
  minItemWidth?: string;
  style?: CSSProperties;
}

export function Grid({
  children,
  className = '',
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  xlCols,
  gap = 'md',
  autoFit = false,
  autoFill = false,
  minItemWidth = '280px',
  style,
}: GridProps) {
  const classes = [
    styles.grid,
    !autoFit && !autoFill && styles[`cols-${cols}`],
    smCols && styles[`sm-cols-${smCols}`],
    mdCols && styles[`md-cols-${mdCols}`],
    lgCols && styles[`lg-cols-${lgCols}`],
    xlCols && styles[`xl-cols-${xlCols}`],
    styles[`gap-${gap}`],
    autoFit && styles.autoFit,
    autoFill && styles.autoFill,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const gridStyle: CSSProperties = {
    ...style,
    ...(autoFit || autoFill
      ? {
          gridTemplateColumns: `repeat(${autoFit ? 'auto-fit' : 'auto-fill'}, minmax(${minItemWidth}, 1fr))`,
        }
      : {}),
  };

  return (
    <div className={classes} style={gridStyle}>
      {children}
    </div>
  );
}

// Componente para item do grid
interface GridItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  rowSpan?: 1 | 2 | 3 | 4;
  style?: CSSProperties;
}

export function GridItem({
  children,
  className = '',
  colSpan,
  rowSpan,
  style,
}: GridItemProps) {
  const classes = [
    styles.gridItem,
    colSpan && styles[`col-span-${colSpan}`],
    rowSpan && styles[`row-span-${rowSpan}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
