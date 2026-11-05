import type { ReactNode } from 'react';

export type CxRowProps = {
  children: ReactNode;
  /** Alanlar arası boşluk (tema spacing birimi). Varsayılan: 2 */
  gap?: number;
};
