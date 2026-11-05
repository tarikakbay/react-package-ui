import {
  CX_NAMESPACE,
  CxSectionActivatorContext,
  CxSectionContext,
  getPath,
  useCxFormContext,
  useFormState,
} from '@cx/core';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Children, isValidElement, useContext, useEffect, useId, useState, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CxCol, CxRow } from '../layout/CxGrid';

export type CxFormSectionProps = {
  /** Bölüm kimliği. Verilmezse otomatik üretilir. */
  id?: string;
  title?: string;
  children: ReactNode;
};

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

export type CxFormTabProps = { id: string; title: string; children: ReactNode };

/** CxFormTabs içindeki bir sekme. */
export function CxFormTab(_props: CxFormTabProps): null {
  return null; // CxFormTabs tarafından çizilir
}

/** Hata sayısı: bu sekmeye kayıtlı alanlardan hatalı olanlar. */
function useSectionErrorCount(section: string): number {
  const form = useCxFormContext();
  const { errors } = useFormState({ control: form.control });
  void form._cx.version; // kayıt değişince yeniden hesaplanır
  return form._cx.fields().filter((f) => f.section === section && getPath(errors, f.name) !== undefined).length;
}

function TabLabel({ id, title }: { id: string; title: string }) {
  const { t } = useTranslation();
  const { t: tcx } = useTranslation(CX_NAMESPACE);
  const count = useSectionErrorCount(id);
  return (
    <Badge
      color="error"
      badgeContent={count}
      invisible={count === 0}
      slotProps={{ badge: { 'aria-label': tcx('form.sectionErrors', { count }) } as object }}
    >
      <Box component="span" sx={{ pr: count ? 1.5 : 0 }}>
        {t(title, { defaultValue: title })}
      </Box>
    </Badge>
  );
}

/**
 * Sekmeli form (eski DsTab / DsTabPane'in karşılığı).
 * - Tüm sekmeler mount kalır: gizli sekmedeki alanlar da validasyona girer.
 * - Hatalı alan içeren sekmenin başlığında hata sayısı görünür.
 * - Form geçersiz gönderilirse ilk hatalı alanın sekmesi açılır.
 */
export function CxFormTabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(
    (c): c is ReactElement<CxFormTabProps> => isValidElement(c) && c.type === CxFormTab,
  );
  const [active, setActive] = useState(0);
  const activator = useContext(CxSectionActivatorContext);
  const baseId = useId();

  useEffect(() => {
    if (!activator) return;
    const offs = tabs.map((tab, i) => activator.register(tab.props.id, () => setActive(i)));
    return () => offs.forEach((off) => off());
  }, [activator, tabs.map((t) => t.props.id).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CxCol>
      <Tabs value={active} onChange={(_, v: number) => setActive(v)} variant="scrollable" sx={{ mb: 2 }}>
        {tabs.map((tab, i) => (
          <Tab
            key={tab.props.id}
            id={`${baseId}-tab-${i}`}
            aria-controls={`${baseId}-panel-${i}`}
            label={<TabLabel id={tab.props.id} title={tab.props.title} />}
          />
        ))}
      </Tabs>
      {tabs.map((tab, i) => (
        <div
          key={tab.props.id}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
        >
          <CxSectionContext.Provider value={tab.props.id}>
            <CxRow>{tab.props.children}</CxRow>
          </CxSectionContext.Provider>
        </div>
      ))}
    </CxCol>
  );
}
