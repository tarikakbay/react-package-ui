import {
  createTokens,
  resolveColorMode,
  type ColorMode,
  type ColorModeSetting,
  type CxTokens,
  type CxTokensOverride,
} from '@cx/core';
import { useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, type MD3Theme } from 'react-native-paper';

/** Cx token'larından Paper MD3 teması üretir. */
export function createCxPaperTheme(tokens: CxTokens, mode: ColorMode): MD3Theme {
  const base = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const c = tokens.colors[mode];
  return {
    ...base,
    dark: mode === 'dark',
    roundness: tokens.radius.sm,
    colors: {
      ...base.colors,
      primary: c.primary,
      onPrimary: c.onPrimary,
      secondary: c.secondary,
      onSecondary: c.onSecondary,
      error: c.error,
      onError: c.onError,
      background: c.background,
      surface: c.surface,
      onSurface: c.onSurface,
      onSurfaceVariant: c.onSurfaceVariant,
      outline: c.outline,
    },
  };
}

export type CxPaperProviderProps = {
  children: ReactNode;
  /** Varsayılan: 'system'. Kullanıcı seçimini saklamak uygulamanın işidir. */
  mode?: ColorModeSetting;
  tokens?: CxTokensOverride;
};

export function CxPaperProvider({ children, mode = 'system', tokens }: CxPaperProviderProps) {
  const system = useColorScheme();
  const resolved = resolveColorMode(mode, system === 'dark' ? 'dark' : 'light');
  const theme = useMemo(() => createCxPaperTheme(createTokens(tokens), resolved), [tokens, resolved]);
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}

/** Aktif Cx token'larını bileşen dışı stillerde kullanmak için. */
export { useTheme as useCxPaperTheme } from 'react-native-paper';
