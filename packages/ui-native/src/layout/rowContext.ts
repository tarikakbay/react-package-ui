import { defaultTokens } from '@cx/core';
import { createContext } from 'react';

/** CxRow'un ölçtüğü genişlik ve boşluk; CxCol hücre genişliğini buna göre hesaplar. */
export type RowInfo = { width: number; gap: number };
export const RowContext = createContext<RowInfo>({ width: 0, gap: 16 });

export type Breakpoint = 'xs' | 'md' | 'lg';

/**
 * Kırılım konteyner genişliğinden hesaplanır (ekran genişliğinden değil):
 * modal ve tablet split view'da da doğru sonuç verir.
 */
export function breakpointOf(width: number): Breakpoint {
  const bp = defaultTokens.breakpoints;
  if (width >= bp.lg) return 'lg';
  if (width >= bp.md) return 'md';
  return 'xs';
}
