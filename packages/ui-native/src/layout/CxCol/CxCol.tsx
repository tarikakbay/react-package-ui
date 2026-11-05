import { spanAt } from '@cx/core';
import { useContext } from 'react';
import { View } from 'react-native';
import { breakpointOf, RowContext } from '../rowContext';
import type { CxColProps } from './types';

/** 12 kolonlu grid hücresi. Yüzde + gap taşırdığı için genişlik piksel olarak hesaplanır. */
export function CxCol({ col, children }: CxColProps) {
  const { width, gap } = useContext(RowContext);
  const span = spanAt(col, breakpointOf(width));
  const w = width === 0 ? '100%' : ((width - gap * 11) / 12) * span + gap * (span - 1);
  return <View style={{ width: w }}>{children}</View>;
}
