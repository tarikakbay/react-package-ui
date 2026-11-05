import type { ColorModeSetting, CxTokensOverride } from '@cx/core';
import type { ReactNode } from 'react';

export type CxThemeProviderProps = {
  children: ReactNode;
  /** Varsayılan: 'system'. Kullanıcı seçimini saklamak uygulamanın işidir. */
  mode?: ColorModeSetting;
  tokens?: CxTokensOverride;
  /** Tarayıcı varsayılan stillerini sıfırlar. Varsayılan: true */
  cssBaseline?: boolean;
};
