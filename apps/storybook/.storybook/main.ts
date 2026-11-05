import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';

const src = (p: string) => fileURLToPath(new URL(`../../../packages/${p}/src/index.ts`, import.meta.url));

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  // Paketler kaynaktan okunur: değişiklikler build gerektirmeden anında görünür.
  viteFinal: async (cfg) => {
    cfg.resolve ??= {};
    cfg.resolve.alias = { ...(cfg.resolve.alias as object), '@cx/core': src('core'), '@cx/ui-web': src('ui-web') };
    return cfg;
  },
};

export default config;
