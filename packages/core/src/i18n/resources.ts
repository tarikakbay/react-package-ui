/**
 * Cx bileşenlerinin metinleri. Uygulama bu kaynakları kendi i18next örneğine ekler:
 *
 * @example
 * import { cxResources, CX_NAMESPACE } from '@cx/core';
 * i18n.addResourceBundle('tr', CX_NAMESPACE, cxResources.tr);
 * i18n.addResourceBundle('en', CX_NAMESPACE, cxResources.en);
 */
export const CX_NAMESPACE = 'cx';

const tr = {
  validation: {
    required: '{{label}} zorunludur',
    minLength: '{{label}} en az {{min}} karakter olmalıdır',
    maxLength: '{{label}} en fazla {{max}} karakter olabilir',
    email: 'Geçerli bir e-posta adresi giriniz',
    phone: 'Geçerli bir telefon numarası giriniz (ör. +905321234567)',
  },
  field: {
    showPassword: 'Şifreyi göster',
    hidePassword: 'Şifreyi gizle',
    busy: 'Kontrol ediliyor…',
  },
  form: {
    requiredLegend: '* ile işaretli alanlar zorunludur',
    sectionErrors_one: '{{count}} hata',
    sectionErrors_other: '{{count}} hata',
  },
} as const;

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };
export type CxResource = Shape<typeof tr>;

const en: CxResource = {
  validation: {
    required: '{{label}} is required',
    minLength: '{{label}} must be at least {{min}} characters',
    maxLength: '{{label}} must be at most {{max}} characters',
    email: 'Enter a valid email address',
    phone: 'Enter a valid phone number (e.g. +15551234567)',
  },
  field: {
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    busy: 'Checking…',
  },
  form: {
    requiredLegend: '* indicates required fields',
    sectionErrors_one: '{{count}} error',
    sectionErrors_other: '{{count}} errors',
  },
};

export const cxResources: Record<'tr' | 'en', CxResource> = { tr, en };

/** Çeviri fonksiyonu. i18next'in `t`'si doğrudan verilebilir. */
export type Translate = (key: string, params?: Record<string, unknown>) => string;
