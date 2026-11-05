import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

/** Gönderilen değerleri göstermek için. Storybook'a özeldir; ekranlar MUI'yi doğrudan kullanmaz. */
export function Result({ title = 'Gönderilen değerler', value }: { title?: string; value: unknown }) {
  if (value === undefined) return null;
  return (
    <Alert severity="success" sx={{ mt: 3 }}>
      <Typography variant="subtitle2">{title}</Typography>
      <Box component="pre" sx={{ m: 0, fontSize: 13 }}>
        {JSON.stringify(value, null, 2)}
      </Box>
    </Alert>
  );
}

export function Card({ children, maxWidth = 900 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth }}>
      {children}
    </Paper>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 900 }}>
      {children}
    </Typography>
  );
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
