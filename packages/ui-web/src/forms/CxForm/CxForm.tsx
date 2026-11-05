import {
  CX_NAMESPACE,
  CxFormContext,
  CxSectionActivatorContext,
  createSectionActivator,
  submitCxForm,
  type CxFormApi,
  type FieldValues,
} from '@cx/core';
import Typography from '@mui/material/Typography';
import { useMemo, useRef, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CxRow } from '../../layout/CxRow';
import type { CxFormProps } from './types';

/**
 * Bileşen tabanlı form. İçindeki `name` verilmiş Cx alanları kendiliğinden forma bağlanır;
 * içerik 12 kolonlu grid olarak çizilir, her alan `col` değerine göre yer kaplar.
 */
export function CxForm<T extends FieldValues>(props: CxFormProps<T>) {
  const { form, children, onSubmit, onInvalid, mode = 'create', readOnly = false, disabled = false, requiredLegend = true, id } = props;
  const { t } = useTranslation(CX_NAMESPACE);
  const activators = useRef(new Map<string, () => void>()).current;
  const activator = useMemo(() => createSectionActivator(activators), [activators]);

  const ctx = useMemo(
    () => ({ form: form as unknown as CxFormApi<FieldValues>, mode, readOnly, disabled }),
    [form, mode, readOnly, disabled],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (readOnly || !onSubmit) return;
    void submitCxForm(form, onSubmit, { activators, onInvalid });
  };

  const showLegend = requiredLegend && !readOnly && form._cx.requiredCount > 0;

  return (
    <CxFormContext.Provider value={ctx}>
      <CxSectionActivatorContext.Provider value={activator}>
        {/* noValidate: tarayıcının kendi required balonları yerine Cx validasyonu */}
        <form id={id} noValidate onSubmit={handleSubmit}>
          {showLegend && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('form.requiredLegend')}
            </Typography>
          )}
          <CxRow>{children}</CxRow>
        </form>
      </CxSectionActivatorContext.Provider>
    </CxFormContext.Provider>
  );
}
