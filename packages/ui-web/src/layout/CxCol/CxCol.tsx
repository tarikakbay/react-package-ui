import { resolveColSpan } from '@cx/core';
import Grid from '@mui/material/Grid';
import type { CxColProps } from './types';

/** 12 kolonlu grid hücresi. */
export function CxCol({ col, children }: CxColProps) {
  const c = resolveColSpan(col);
  return <Grid size={{ xs: c.xs, md: c.md, lg: c.lg }}>{children}</Grid>;
}
