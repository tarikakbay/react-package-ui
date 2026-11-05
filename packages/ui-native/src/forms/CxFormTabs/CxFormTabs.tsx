import { CxSectionActivatorContext, CxSectionContext, getPath, useCxFormContext, useFormState } from '@cx/core';
import { Children, isValidElement, useContext, useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { CxCol } from '../../layout/CxCol';
import { CxRow } from '../../layout/CxRow';
import type { CxFormTabProps, CxFormTabsProps } from './types';

/** CxFormTabs içindeki bir sekme. */
export function CxFormTab(_props: CxFormTabProps): null {
  return null; // CxFormTabs tarafından çizilir
}

/**
 * Sekmeli form (mobil). Tüm sekmeler mount kalır; hatalı sekmenin başlığında hata sayısı görünür,
 * geçersiz gönderimde ilk hatalı alanın sekmesi açılır.
 */
export function CxFormTabs({ children }: CxFormTabsProps) {
  const tabs = Children.toArray(children).filter(
    (c): c is ReactElement<CxFormTabProps> => isValidElement(c) && c.type === CxFormTab,
  );
  const [active, setActive] = useState(0);
  const activator = useContext(CxSectionActivatorContext);
  const { t } = useTranslation();
  const form = useCxFormContext();
  const { errors } = useFormState({ control: form.control });
  void form._cx.version; // kayıt değişince yeniden hesaplanır

  const count = (id: string) =>
    form._cx.fields().filter((f) => f.section === id && getPath(errors, f.name) !== undefined).length;

  useEffect(() => {
    if (!activator) return;
    const offs = tabs.map((tab, i) => activator.register(tab.props.id, () => setActive(i)));
    return () => offs.forEach((off) => off());
  }, [activator, tabs.map((x) => x.props.id).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CxCol>
      <SegmentedButtons
        value={String(active)}
        onValueChange={(v) => setActive(Number(v))}
        style={styles.tabs}
        buttons={tabs.map((tab, i) => {
          const n = count(tab.props.id);
          const title = t(tab.props.title, { defaultValue: tab.props.title });
          return { value: String(i), label: n ? `${title} (${n})` : title };
        })}
      />
      {tabs.map((tab, i) => (
        <View key={tab.props.id} style={i === active ? undefined : styles.hidden}>
          <CxSectionContext.Provider value={tab.props.id}>
            <CxRow>{tab.props.children}</CxRow>
          </CxSectionContext.Provider>
        </View>
      ))}
    </CxCol>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: 16 },
  hidden: { display: 'none' },
});
