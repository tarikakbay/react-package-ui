import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // peer'lar pakete gömülmez (çift kopya olmasın)
  external: ['react', 'react-hook-form', 'zod', 'i18next', 'react-i18next'],
});
