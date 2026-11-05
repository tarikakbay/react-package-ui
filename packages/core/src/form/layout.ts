import type { ColSpan } from '../types/fields';

export type ResolvedColSpan = { xs: number; md?: number; lg?: number };

/**
 * ColSpan'ı açık hale getirir.
 * - undefined → tam satır
 * - 6        → { xs: 12, md: 6 }
 * - { md: 4, lg: 3 } → { xs: 12, md: 4, lg: 3 }
 */
export function resolveColSpan(col: ColSpan | undefined): ResolvedColSpan {
  if (col === undefined) return { xs: 12 };
  if (typeof col === 'number') return { xs: 12, md: clamp(col) };
  return {
    xs: clamp(col.xs ?? 12),
    md: col.md === undefined ? undefined : clamp(col.md),
    lg: col.lg === undefined ? undefined : clamp(col.lg),
  };
}

/** Verilen kırılımda kaç kolon kaplanacağı (küçük kırılımlar büyüklere miras kalır). */
export function spanAt(col: ColSpan | undefined, bp: 'xs' | 'md' | 'lg'): number {
  const c = resolveColSpan(col);
  if (bp === 'lg') return c.lg ?? c.md ?? c.xs;
  if (bp === 'md') return c.md ?? c.xs;
  return c.xs;
}

function clamp(n: number): number {
  return Math.min(12, Math.max(1, Math.round(n)));
}
