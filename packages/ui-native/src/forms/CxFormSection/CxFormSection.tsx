import { CxSectionContext } from '@cx/core';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CxCol } from '../../layout/CxCol';
import { CxRow } from '../../layout/CxRow';
import type { CxFormSectionProps } from './types';

/** Başlıklı alan grubu (eski DsFieldset'in karşılığı). Tam satır kaplar. */
export function CxFormSection({ id, title, children }: CxFormSectionProps) {
  const autoId = useId();
  const { t } = useTranslation();
  return (
    <CxSectionContext.Provider value={id ?? autoId}>
      <CxCol>
        <View style={styles.section}>
          {title && (
            <Text variant="titleMedium" style={styles.title} accessibilityRole="header">
              {t(title, { defaultValue: title })}
            </Text>
          )}
          <CxRow>{children}</CxRow>
        </View>
      </CxCol>
    </CxSectionContext.Provider>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  title: { marginBottom: 12 },
});
