import Grid from '@mui/material/Grid';
import type { CxRowProps } from './types';

/** 12 kolonlu satır. */
export function CxRow({ children, gap = 2 }: CxRowProps) {
  return (
    <Grid container spacing={gap}>
      {children}
    </Grid>
  );
}
