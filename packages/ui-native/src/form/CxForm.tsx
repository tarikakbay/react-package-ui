import {
  CX_NAMESPACE,
  CxFormContext,
  CxSectionActivatorContext,
  CxSectionContext,
  createSectionActivator,
  getPath,
  submitCxForm,
  useCxFormContext,
  useFormState,
  type CxFormApi,
  type CxFormMode,
  type FieldErrors,
  type FieldValues,
} from '@cx/core';
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, type ButtonProps } from 'react-native-paper';
import { CxCol, CxRow } from '../layout/CxGrid';

type SubmitFn = () => Promise<boolean>;
const SubmitContext = createContext<SubmitFn | null>(null);

export type CxFormProps<T extends FieldValues> = {
  form: CxFormApi<T>;
  children: ReactNode;
  onSubmit?: (values: T) => unknown | Promise<unknown>;
  onInvalid?: (errors: FieldErrors<T>) => void;
  mode?: CxFormMode;
  readOnly?: boolean;
  disabled?: boolean;
  /** Formun başındaki "* ile işaretli alanlar zorunludur" satırı. Varsayılan: true */
  requiredLegend?: boolean;
};

/** Bileşen tabanlı form (mobil). Web'deki CxForm ile aynı davranır. */
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

/** Formu gönderen fonksiyon (mobilde <form> olmadığı için). */
export function useCxFormSubmit(): SubmitFn {
  const submit = useContext(SubmitContext);
  if (!submit) throw new Error('useCxFormSubmit bir <CxForm> içinde kullanılmalıdır.');
  return submit;
}

/** Formu gönderen buton. Gönderim sürerken spinner gösterir ve tekrar basılamaz. */
export function CxSubmitButton(props: Omit<ButtonProps, 'onPress' | 'loading'>) {
  const submit = useCxFormSubmit();
  const form = useCxFormContext();
  const { isSubmitting } = useFormState({ control: form.control });
  return (
    <Button mode="contained" {...props} loading={isSubmitting} disabled={isSubmitting || props.disabled} onPress={() => void submit()} />
  );
}

export type CxFormSectionProps = { id?: string; title?: string; children: ReactNode };

/** Başlıklı alan grubu. */
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

export type CxFormTabProps = { id: string; title: string; children: ReactNode };
export function CxFormTab(_props: CxFormTabProps): null {
  return null;
}

/**
 * Sekmeli form (mobil). Tüm sekmeler mount kalır; hatalı sekmenin başlığında hata sayısı görünür,
 * geçersiz gönderimde ilk hatalı alanın sekmesi açılır.
 */
export function CxFormTabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(
    (c): c is ReactElement<CxFormTabProps> => isValidElement(c) && c.type === CxFormTab,
  );
  const [active, setActive] = useState(0);
  const activator = useContext(CxSectionActivatorContext);
  const { t } = useTranslation();
  const form = useCxFormContext();
  const { errors } = useFormState({ control: form.control });
  void form._cx.version;

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
  legend: { marginBottom: 12, opacity: 0.8 },
  section: { marginBottom: 16 },
  title: { marginBottom: 12 },
  tabs: { marginBottom: 16 },
  hidden: { display: 'none' },
});
