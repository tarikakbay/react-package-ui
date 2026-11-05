import { cxResources, CX_NAMESPACE } from '@cx/core';
import { act, fireEvent, render } from '@testing-library/react';
import i18next, { type i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { CxThemeProvider } from '../theme/CxThemeProvider';

/** Testlerde kullanılan i18n örneği (tr varsayılan). */
export const i18n: I18n = i18next.createInstance();

export async function initI18n() {
  if (i18n.isInitialized) return;
  await i18n.use(initReactI18next).init({
    lng: 'tr',
    resources: { tr: { [CX_NAMESPACE]: cxResources.tr }, en: { [CX_NAMESPACE]: cxResources.en } },
    interpolation: { escapeValue: false },
  });
}

/** i18n + tema sağlayıcılarıyla render eder. */
export const wrap = (ui: ReactNode) =>
  render(
    <I18nextProvider i18n={i18n}>
      <CxThemeProvider mode="light">{ui}</CxThemeProvider>
    </I18nextProvider>,
  );

/** Formu gönderir (jsdom'da ilk etkileşim olarak buton tıklaması submit tetiklemediği için). */
export const submit = async () => {
  await act(async () => {
    fireEvent.submit(document.querySelector('form')!);
  });
};
