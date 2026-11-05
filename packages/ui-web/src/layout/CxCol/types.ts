import type { ColSpan } from '@cx/core';
import type { ReactNode } from 'react';

export type CxColProps = {
  /** Sayı verilirse md anlamına gelir (`col={6}`). Verilmezse tam satır. */
  col?: ColSpan;
  children: ReactNode;
};
