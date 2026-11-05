import { defaultTokens, spanAt, type ColSpan } from '@cx/core';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

type RowInfo = { width: number; gap: number };
const RowContext = createContext<RowInfo>({ width: 0, gap: 16 });

type Breakpoint = 'xs' | 'md' | 'lg';

/**
 * Kırılım konteyner genişliğinden hesaplanır (ekran genişliğinden değil):
 * modal ve tablet split view'da da doğru sonuç verir.
 */
function breakpointOf(width: number): Breakpoint {
  const bp = defaultTokens.breakpoints;
  if (width >= bp.lg) return 'lg';
  if (width >= bp.md) return 'md';
  return 'xs';
}

export type CxRowProps = {
  children: ReactNode;
  /** Alanlar arası boşluk (px). Varsayılan: 16 */
  gap?: number;
};

/** 12 kolonlu satır (Flexbox + wrap). */
export function CxRow({ children, gap = 16 }: CxRowProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return (
    <RowContext.Provider value={{ width, gap }}>
      <View onLayout={onLayout} style={[styles.row, { columnGap: gap }]}>
        {children}
      </View>
    </RowContext.Provider>
  );
}

export type CxColProps = {
  /** Sayı verilirse md anlamına gelir (`col={6}`). Verilmezse tam satır. */
  col?: ColSpan;
  children: ReactNode;
};

/** 12 kolonlu grid hücresi. Yüzde + gap taşırdığı için genişlik piksel olarak hesaplanır. */
export function CxCol({ col, children }: CxColProps) {
  const { width, gap } = useContext(RowContext);
  const span = spanAt(col, breakpointOf(width));
  const w = width === 0 ? '100%' : ((width - gap * 11) / 12) * span + gap * (span - 1);
  return <View style={{ width: w }}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
});
