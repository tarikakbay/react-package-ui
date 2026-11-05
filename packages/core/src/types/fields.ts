/**
 * Cx props sözleşmesi.
 * Web (ui-web) ve mobil (ui-native) paketleri bu tiplerin birebir aynısını uygular.
 * Tüm bileşenler controlled'dır ve onChange her zaman değerin kendisini döner.
 */

export type Option = { value: string; label: string };

/**
 * 12 kolonlu grid'de alanın kapladığı kolon sayısı.
 * Sayı verilirse `md` anlamına gelir (`col={6}` → md: 6, xs: 12).
 * Verilmezse alan tam satır kaplar.
 */
export type ColSpan = number | { xs?: number; md?: number; lg?: number };

export type TextTransform = 'upper' | 'lower' | 'trim';

/**
 * Alan bileşenlerinin ref'i. İki platformda aynıdır; form ilk hatalı alana
 * odaklanmak için `focus`'u kullanır. Eski projedeki value/text okuma-yazma ref'leri yoktur.
 */
export type CxFieldHandle = {
  focus(): void;
  blur(): void;
};

/** Tüm alanların ortak props'u. Alan tipine özel props bundan türetilir. */
export type BaseFieldProps = {
  /** Floating label. Alan boşken içeride durur, değer girilince küçülüp üste çıkar. */
  label: string;
  /** Hata mesajı. Doluysa alan hatalı görünür ve helperText yerine bu gösterilir. */
  error?: string;
  helperText?: string;
  /** Label sonunda * gösterilir (salt okunur ve pasif alanlarda gösterilmez). */
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Async işlem sürüyor (ör. onBlur'deki sunucu kontrolü). Alanda yükleniyor göstergesi çıkar. */
  busy?: boolean;
  /** Promise dönerse alan bitene kadar `busy` görünür. */
  onBlur?: () => void | Promise<unknown>;
  /** Test ve erişilebilirlik için. Verilmezse otomatik üretilir. */
  id?: string;
  /** Form içinde alan adı. Bir CxForm içinde verilirse alan forma bağlanır. */
  name?: string;
};

/** Değer tipine göre alan props'u. Business bileşenleri de bu sözleşmeyi uygular. */
export type CxFieldComponentProps<TValue> = BaseFieldProps & {
  value: TValue;
  onChange: (value: TValue) => void;
};

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
