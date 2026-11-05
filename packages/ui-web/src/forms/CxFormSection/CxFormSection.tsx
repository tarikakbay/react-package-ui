import { CxSectionContext } from '@cx/core';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
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
        <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
          {title && (
            <Typography component="legend" variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {t(title, { defaultValue: title })}
            </Typography>
          )}
          <CxRow>{children}</CxRow>
        </Box>
      </CxCol>
    </CxSectionContext.Provider>
  );
}
