/**
 * Tema token'ları. Bileşenlerde sabit renk kullanılmaz, her değer buradan gelir.
 * Web'de MUI createTheme'e, mobilde Paper MD3 temalarına çevrilir.
 * Renk çiftleri WCAG 2.1 AA kontrastını (normal metin ≥ 4.5:1) sağlayacak şekilde seçilmiştir.
 */

export type ColorMode = 'light' | 'dark';
export type ColorModeSetting = ColorMode | 'system';

export type ColorTokens = {
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  error: string;
  onError: string;
  background: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
};

export type CxTokens = {
  colors: Record<ColorMode, ColorTokens>;
  /** px */
  radius: { sm: number; md: number; lg: number };
  /** Temel boşluk birimi (px). spacing(2) = 2 * unit */
  spacingUnit: number;
  font: { family: string; sizeBase: number };
  /** px, min-width */
  breakpoints: { xs: number; sm: number; md: number; lg: number };
};

export const defaultTokens: CxTokens = {
  colors: {
    light: {
      primary: '#1F5FAD',
      onPrimary: '#FFFFFF',
      secondary: '#555F71',
      onSecondary: '#FFFFFF',
      error: '#B3261E',
      onError: '#FFFFFF',
      background: '#F8F9FC',
      surface: '#FFFFFF',
      onSurface: '#1A1C1E',
      onSurfaceVariant: '#43474E',
      outline: '#73777F',
    },
    dark: {
      primary: '#A6C8FF',
      onPrimary: '#00315F',
      secondary: '#BDC7DC',
      onSecondary: '#273141',
      error: '#F2B8B5',
      onError: '#601410',
      background: '#111418',
      surface: '#1A1C1E',
      onSurface: '#E2E2E6',
      onSurfaceVariant: '#C3C6CF',
      outline: '#8D9199',
    },
  },
  radius: { sm: 4, md: 8, lg: 16 },
  spacingUnit: 8,
  font: { family: 'Inter, "Segoe UI", Roboto, system-ui, sans-serif', sizeBase: 14 },
  breakpoints: { xs: 0, sm: 576, md: 768, lg: 992 },
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export type CxTokensOverride = DeepPartial<CxTokens>;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function merge<T>(base: T, override: unknown): T {
  if (!isObject(override) || !isObject(base)) return (override ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v !== undefined) out[k] = merge((base as Record<string, unknown>)[k], v);
  }
  return out as T;
}

/** Varsayılan token'ları uygulamaya özel değerlerle birleştirir. */
export function createTokens(override?: CxTokensOverride): CxTokens {
  return merge(defaultTokens, override);
}

/** 'system' ayarını gerçek moda çevirir. */
export function resolveColorMode(setting: ColorModeSetting, systemMode: ColorMode | null | undefined): ColorMode {
  if (setting === 'system') return systemMode === 'dark' ? 'dark' : 'light';
  return setting;
}
