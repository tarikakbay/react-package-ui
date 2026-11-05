import {
  CX_NAMESPACE,
  CxFormContext,
  CxSectionActivatorContext,
  createSectionActivator,
  submitCxForm,
  type CxFormApi,
  type FieldValues,
} from '@cx/core';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CxRow } from '../../layout/CxRow';
import { SubmitContext, type SubmitFn } from './submitContext';
import type { CxFormProps } from './types';

/** Bileşen tabanlı form (mobil). Web'deki CxForm ile aynı davranır; gönderim CxSubmitButton ile. */
export function CxForm<T extends FieldValues>(props: CxFormProps<T>) {
  const { form, children, onSubmit, onInvalid, mode = 'create', readOnly = false, disabled = false, requiredLegend = true } = props;
  const { t } = useTranslation(CX_NAMESPACE);
  const activators = useRef(new Map<string, () => void>()).current;
  const activator = useMemo(() => createSectionActivator(activators), [activators]);

  const ctx = useMemo(
    () => ({ form: form as unknown as CxFormApi<FieldValues>, mode, readOnly, disabled }),
    [form, mode, readOnly, disabled],
  );

  const submit: SubmitFn = async () => {
    if (readOnly || !onSubmit) return false;
    return submitCxForm(form, onSubmit, { activators, onInvalid });
  };

  const showLegend = requiredLegend && !readOnly && form._cx.requiredCount > 0;

  return (
    <CxFormContext.Provider value={ctx}>
      <CxSectionActivatorContext.Provider value={activator}>
        <SubmitContext.Provider value={submit}>
          {showLegend && (
            <Text variant="bodySmall" style={styles.legend}>
              {t('form.requiredLegend')}
            </Text>
          )}
          <CxRow>{children}</CxRow>
        </SubmitContext.Provider>
      </CxSectionActivatorContext.Provider>
    </CxFormContext.Provider>
  );
}

const styles = StyleSheet.create({
  legend: { marginBottom: 12, opacity: 0.8 },
});
