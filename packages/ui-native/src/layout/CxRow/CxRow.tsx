import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { RowContext } from '../rowContext';
import type { CxRowProps } from './types';

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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
});
