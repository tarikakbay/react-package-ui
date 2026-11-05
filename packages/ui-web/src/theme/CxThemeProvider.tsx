import { createTokens, type ColorModeSetting, type ColorTokens, type CxTokens, type CxTokensOverride } from '@cx/core';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, useColorScheme, type Theme } from '@mui/material/styles';
import { useEffect, useMemo, type ReactNode } from 'react';

function palette(c: ColorTokens) {
  return {
    primary: { main: c.primary, contrastText: c.onPrimary },
    secondary: { main: c.secondary, contrastText: c.onSecondary },
    error: { main: c.error, contrastText: c.onError },
    background: { default: c.background, paper: c.surface },
    text: { primary: c.onSurface, secondary: c.onSurfaceVariant },
    divider: c.outline,
  };
}

/** Cx token'larından MUI teması üretir (light + dark, CSS değişkenleriyle). */
export function createCxTheme(tokens: CxTokens): Theme {
  return createTheme({
    // CSS değişkenleri: Next.js'te ilk yüklemede renk kayması olmaz.
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: {
      light: { palette: palette(tokens.colors.light) },
      dark: { palette: palette(tokens.colors.dark) },
    },
    // MUI varsayılanları 600/900/1200; Cx kırılımları token'dan gelir.
    breakpoints: {
      values: {
        xs: tokens.breakpoints.xs,
        sm: tokens.breakpoints.sm,
        md: tokens.breakpoints.md,
        lg: tokens.breakpoints.lg,
        xl: Math.round(tokens.breakpoints.lg * 1.2),
      },
    },
    shape: { borderRadius: tokens.radius.md },
    spacing: tokens.spacingUnit,
    typography: { fontFamily: tokens.font.family, fontSize: tokens.font.sizeBase },
  });
}

function ModeSync({ mode }: { mode: ColorModeSetting }) {
  const { setMode } = useColorScheme();
  useEffect(() => {
    setMode(mode);
  }, [mode, setMode]);
  return null;
}

export type CxThemeProviderProps = {
  children: ReactNode;
  /** Varsayılan: 'system'. Kullanıcı seçimini saklamak uygulamanın işidir. */
  mode?: ColorModeSetting;
  tokens?: CxTokensOverride;
  /** Tarayıcı varsayılan stillerini sıfırlar. Varsayılan: true */
  cssBaseline?: boolean;
};

export function CxThemeProvider({ children, mode = 'system', tokens, cssBaseline = true }: CxThemeProviderProps) {
  const theme = useMemo(() => createCxTheme(createTokens(tokens)), [tokens]);
  return (
    <ThemeProvider theme={theme} defaultMode={mode}>
      <ModeSync mode={mode} />
      {cssBaseline && <CssBaseline enableColorScheme />}
      {children}
    </ThemeProvider>
  );
}

/**
 * Next.js App Router'da <body> içinde, uygulamadan önce kullanılır.
 * İlk boyamadan önce doğru renk şemasını uygular (flicker önlenir).
 */
export { default as CxInitColorSchemeScript } from '@mui/material/InitColorSchemeScript';
