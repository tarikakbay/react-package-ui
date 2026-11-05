import type { CxFieldComponentProps, TextTransform } from '../../types/fields';

export type TextFieldKind = 'text' | 'email' | 'phone' | 'password';

/** Metin alanının validasyon kuralları (bağlı modda şemaya çevrilir). */
export type TextFieldRules = {
  kind?: TextFieldKind;
  minLength?: number;
  maxLength?: number;
  transform?: TextTransform;
};

export type TextFieldProps = CxFieldComponentProps<string> &
  TextFieldRules & {
    placeholder?: string;
    /** Çok satırlı giriş (eski DsTextarea'nın karşılığı). */
    multiline?: boolean;
    /** multiline için satır sayısı. Varsayılan: 3 */
    rows?: number;
  };
