import { CX_NAMESPACE, cxResources } from '@cx/core';
import { CxThemeProvider } from '@cx/ui-web';
import type { Decorator, Preview } from '@storybook/react-vite';
import i18n from 'i18next';
import { useEffect } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  lng: 'tr',
  fallbackLng: 'tr',
  resources: {
    tr: { [CX_NAMESPACE]: cxResources.tr },
    en: { [CX_NAMESPACE]: cxResources.en },
  },
  interpolation: { escapeValue: false },
});

const withProviders: Decorator = (Story, ctx) => {
  const locale = (ctx.globals.locale as string) ?? 'tr';
  const mode = (ctx.globals.theme as 'light' | 'dark' | 'system') ?? 'light';
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);
  return (
    <I18nextProvider i18n={i18n}>
      <CxThemeProvider mode={mode}>
        <div style={{ padding: 24, minHeight: '100vh', background: 'var(--mui-palette-background-default)' }}>
          <Story />
        </div>
      </CxThemeProvider>
    </I18nextProvider>
  );
};

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Tema',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'Sistem' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Dil',
      toolbar: {
        title: 'Dil',
        icon: 'globe',
        items: [
          { value: 'tr', title: 'Türkçe' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', locale: 'tr' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'todo' },
  },
};

export default preview;
