import { resolveColSpan, type ColSpan } from '@cx/core';
import Grid from '@mui/material/Grid';
import type { ReactNode } from 'react';

export type CxRowProps = {
  children: ReactNode;
  /** Alanlar arası boşluk (tema spacing birimi). Varsayılan: 2 */
  gap?: number;
};

/** 12 kolonlu satır. */
export function CxRow({ children, gap = 2 }: CxRowProps) {
  return (
    <Grid container spacing={gap}>
      {children}
    </Grid>
  );
}

export type CxColProps = {
  /** Sayı verilirse md anlamına gelir (`col={6}`). Verilmezse tam satır. */
  col?: ColSpan;
  children: ReactNode;
};

/** 12 kolonlu grid hücresi. */
export function CxCol({ col, children }: CxColProps) {
  const c = resolveColSpan(col);
  return <Grid size={{ xs: c.xs, md: c.md, lg: c.lg }}>{children}</Grid>;
}
