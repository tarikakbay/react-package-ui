import type { CxFormApi, CxFormMode, FieldErrors, FieldValues } from '@cx/core';
import type { ReactNode } from 'react';

export type CxFormProps<T extends FieldValues> = {
  /** `useCxForm()` ile oluşturulan form. */
  form: CxFormApi<T>;
  children: ReactNode;
  /** Doğrulanmış ve dönüştürülmüş değerlerle çağrılır. FieldError fırlatırsa mesajlar alanlara yazılır. */
  onSubmit?: (values: T) => unknown | Promise<unknown>;
  onInvalid?: (errors: FieldErrors<T>) => void;
  /** 'update' modunda readOnlyOn: 'update' alanlar kilitlenir. Varsayılan: 'create' */
  mode?: CxFormMode;
  readOnly?: boolean;
  disabled?: boolean;
  /** Formun başındaki "* ile işaretli alanlar zorunludur" satırı. Varsayılan: true */
  requiredLegend?: boolean;
};
