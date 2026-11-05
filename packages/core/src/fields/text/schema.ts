import { z } from 'zod';
import { validationMessage as msg, type FieldSchemaFactory } from '../../form/schema';
import { applyValueTransform, isValidEmail, isValidPhone } from './transform';
import type { TextFieldRules } from './types';

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
