import { z } from 'zod';
import { CX_NAMESPACE, type Translate } from '../i18n/resources';
import type { TextFieldRules } from '../types/fields';
import { applyValueTransform, isValidEmail, isValidPhone } from './text';

export type SchemaContext = {
  /** Hata mesajları için çeviri fonksiyonu (i18next `t`). */
  t: Translate;
  locale?: string;
  /** Alanın (çevrilmiş) label'ı; mesajlarda kullanılır. */
  label: string;
  required: boolean;
};

/** Bir alanın Zod şemasını üreten fonksiyon. Alan kaydında tutulur. */
export type FieldSchemaFactory = (ctx: SchemaContext) => z.ZodType;

const msg = (t: Translate, key: string, params?: Record<string, unknown>) =>
  t(`${CX_NAMESPACE}:validation.${key}`, params);

/**
 * Metin alanı şeması.
 * - Boş değer yalnızca `required` ise hatadır.
 * - Format kuralları (email, phone, uzunluk) yalnızca değer doluysa çalışır.
 * - Her kuralın kendi mesajı vardır.
 */
export function textSchema(rules: TextFieldRules): FieldSchemaFactory {
  return ({ t, locale, label, required }) =>
    z
      .string()
      .transform((v) => applyValueTransform(v ?? '', rules.kind, rules.transform, locale))
      .superRefine((v, ctx) => {
        if (v.length === 0) {
          if (required) ctx.addIssue({ code: 'custom', message: msg(t, 'required', { label }) });
          return;
        }
        if (rules.minLength !== undefined && v.length < rules.minLength) {
          ctx.addIssue({ code: 'custom', message: msg(t, 'minLength', { label, min: rules.minLength }) });
        }
        // Eski projedeki hata (length >= max) düzeltildi: tam max uzunluk geçerlidir.
        if (rules.maxLength !== undefined && v.length > rules.maxLength) {
          ctx.addIssue({ code: 'custom', message: msg(t, 'maxLength', { label, max: rules.maxLength }) });
        }
        if (rules.kind === 'email' && !isValidEmail(v)) {
          ctx.addIssue({ code: 'custom', message: msg(t, 'email', { label }) });
        }
        if (rules.kind === 'phone' && !isValidPhone(v)) {
          ctx.addIssue({ code: 'custom', message: msg(t, 'phone', { label }) });
        }
      });
}

/** Değer boş mu? (null, undefined, '', boş dizi) */
export function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/**
 * Yalnızca zorunluluk kontrolü yapan genel şema.
 * Business bileşenleri için varsayılan (ör. firma seçimi: Option | null).
 */
export const requiredOnlySchema: FieldSchemaFactory = ({ t, label, required }) =>
  z.any().superRefine((v, ctx) => {
    if (required && isEmptyValue(v)) ctx.addIssue({ code: 'custom', message: msg(t, 'required', { label }) });
  });

/** Forma kayıtlı bir alanın şema için gereken bilgileri. */
export type SchemaField = {
  name: string;
  label: string;
  required: boolean;
  schema: FieldSchemaFactory;
};

/**
 * Kayıtlı alanlardan form şeması üretir.
 * Kayıtlı olmayan (ör. koşullu gizlenmiş) alanlar şemaya girmez.
 */
export function buildSchema(
  fields: Iterable<SchemaField>,
  opts: { t: Translate; locale?: string; translateLabel?: (label: string) => string },
) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    const label = opts.translateLabel ? opts.translateLabel(f.label) : f.label;
    setPath(shape, f.name, f.schema({ t: opts.t, locale: opts.locale, label, required: f.required }));
  }
  return toObject(shape);
}

// "adres.il" gibi iç içe alan adlarını destekler.
type Shape = { [k: string]: z.ZodType | Shape };

function setPath(shape: Shape, path: string, schema: z.ZodType) {
  const parts = path.split('.');
  let node = shape;
  for (const p of parts.slice(0, -1)) {
    const next = node[p];
    if (!next || next instanceof z.ZodType) node[p] = {};
    node = node[p] as Shape;
  }
  node[parts[parts.length - 1]!] = schema;
}

function toObject(shape: Shape): z.ZodObject {
  const out: Record<string, z.ZodType> = {};
  for (const [k, v] of Object.entries(shape)) out[k] = v instanceof z.ZodType ? v : toObject(v);
  return z.object(out);
}
