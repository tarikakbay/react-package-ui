import type { ColorModeSetting, CxTokensOverride } from '@cx/core';
import type { ReactNode } from 'react';

export type CxPaperProviderProps = {
  children: ReactNode;
  /** Varsayılan: 'system'. Kullanıcı seçimini saklamak uygulamanın işidir. */
  mode?: ColorModeSetting;
  tokens?: CxTokensOverride;
};
