import type { ReactNode } from 'react';

export type CxFormSectionProps = {
  /** Bölüm kimliği. Verilmezse otomatik üretilir. */
  id?: string;
  title?: string;
  children: ReactNode;
};
