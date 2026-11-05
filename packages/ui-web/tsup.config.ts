import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Next.js App Router: MUI bileşenleri client bileşeni olmak zorunda.
  banner: { js: '"use client";' },
  external: [
    'react', 'react-dom', 'react/jsx-runtime',
    '@mui/material', '@emotion/react', '@emotion/styled',
    '@cx/core', 'react-hook-form', 'zod', 'i18next', 'react-i18next',
  ],
});
