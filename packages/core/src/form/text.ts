import type { TextFieldKind, TextTransform } from '../types/fields';

/** E.164: + ile başlar, ülke kodu 0 ile başlamaz, toplam 8–15 rakam. */
const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Basit ve öngörülebilir e-posta kontrolü.
 * Kesin doğrulama sunucunun işidir; burada bariz hatalar yakalanır.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value);
}

export function isValidPhone(value: string): boolean {
  return E164.test(value);
}

/** Telefonu E.164'e yaklaştırır: boşluk, parantez, tire ve noktaları atar. */
export function normalizePhone(value: string): string {
  const cleaned = value.replace(/[\s().-]/g, '');
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  return cleaned;
}

/**
 * Yazarken uygulanan dönüşüm (bileşenler onChange'de çağırır).
 * 'trim' burada uygulanmaz: kullanıcı kelimeler arasına boşluk yazabilmeli.
 */
export function applyInputTransform(
  value: string,
  kind: TextFieldKind | undefined,
  transform: TextTransform | undefined,
  locale?: string,
): string {
  let v = value;
  if (transform === 'upper') v = v.toLocaleUpperCase(locale);
  if (transform === 'lower' || kind === 'email') v = v.toLocaleLowerCase(locale);
  if (kind === 'email') v = v.replace(/\s/g, '');
  return v;
}

/** Doğrulamadan önce uygulanan son dönüşüm (şema üretici çağırır). */
export function applyValueTransform(
  value: string,
  kind: TextFieldKind | undefined,
  transform: TextTransform | undefined,
  locale?: string,
): string {
  let v = applyInputTransform(value, kind, transform, locale);
  // Kenar boşlukları her zaman kırpılır; 'trim' ek olarak iç boşlukları da sadeleştirir.
  v = v.trim();
  if (transform === 'trim') v = v.replace(/\s+/g, ' ');
  if (kind === 'phone') v = normalizePhone(v);
  return v;
}
