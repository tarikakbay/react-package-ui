import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react', 'react/jsx-runtime', 'react-native', 'react-native-paper', 'react-native-safe-area-context',
    '@cx/core', 'react-hook-form', 'zod', 'i18next', 'react-i18next',
  ],
});
