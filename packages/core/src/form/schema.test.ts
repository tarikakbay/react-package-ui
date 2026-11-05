import { describe, expect, it } from 'vitest';
import type { Translate } from '../i18n/resources';
import { resolveColSpan, spanAt } from './layout';
import { buildSchema, requiredOnlySchema, textSchema, type SchemaField } from './schema';

// Mesaj anahtarını ve parametreleri görünür kılan sahte çeviri
const t: Translate = (key, params) => `${key}${params ? ' ' + JSON.stringify(params) : ''}`;

const fields: SchemaField[] = [
  { name: 'kod', label: 'Kod', required: true, schema: textSchema({ maxLength: 5, transform: 'upper' }) },
  { name: 'ad', label: 'Ad', required: true, schema: textSchema({ minLength: 2, transform: 'trim' }) },
  { name: 'ePosta', label: 'E-posta', required: false, schema: textSchema({ kind: 'email' }) },
  { name: 'telefon', label: 'Telefon', required: false, schema: textSchema({ kind: 'phone' }) },
];

const schema = buildSchema(fields, { t, locale: 'tr' });
const valid = { kod: 'ab', ad: 'Ali', ePosta: '', telefon: '' };

const errorsOf = (input: Record<string, unknown>) => {
  const r = schema.safeParse(input);
  if (r.success) return {};
  return Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

describe('textSchema', () => {
  it('geçerli değerleri dönüştürerek kabul eder', () => {
    const r = schema.safeParse({ ...valid, ad: '  Ali   Veli ', ePosta: ' Ali@Ornek.COM ' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toMatchObject({ kod: 'AB', ad: 'Ali Veli', ePosta: 'ali@ornek.com' });
    }
  });

  it('Türkçe büyük harf dönüşümü locale ile yapılır', () => {
    const r = schema.safeParse({ ...valid, kod: 'iı' });
    expect(r.success && r.data.kod).toBe('İI');
  });

  it('zorunlu alan boşsa yalnızca required hatası verir', () => {
    expect(errorsOf({ ...valid, ad: '   ' })).toEqual({ ad: 'cx:validation.required {"label":"Ad"}' });
  });

  it('zorunlu olmayan alan boş bırakılabilir, doluysa formatı kontrol edilir', () => {
    expect(errorsOf(valid)).toEqual({});
    expect(errorsOf({ ...valid, ePosta: 'ali@' }).ePosta).toContain('validation.email');
  });

  it('tam maxLength uzunluğu geçerlidir (eski projedeki hata düzeltildi)', () => {
    expect(errorsOf({ ...valid, kod: 'ABCDE' })).toEqual({});
    expect(errorsOf({ ...valid, kod: 'ABCDEF' }).kod).toContain('validation.maxLength');
  });

  it('minLength kendi mesajını verir', () => {
    expect(errorsOf({ ...valid, ad: 'A' }).ad).toBe('cx:validation.minLength {"label":"Ad","min":2}');
  });

  it('telefon E.164 olarak normalize edilir ve doğrulanır', () => {
    const r = schema.safeParse({ ...valid, telefon: '+90 (532) 123 45 67' });
    expect(r.success && r.data.telefon).toBe('+905321234567');
    expect(errorsOf({ ...valid, telefon: '0532 123' }).telefon).toContain('validation.phone');
  });

  it('label çevirisi mesajlara yansır', () => {
    const s = buildSchema(fields, { t, translateLabel: (l) => `[${l}]` });
    const r = s.safeParse({ ...valid, ad: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toContain('"label":"[Ad]"');
  });

  it('kayıtlı olmayan alanlar şemaya girmez ve sonuçtan çıkar', () => {
    const s = buildSchema(fields.slice(0, 1), { t });
    const r = s.safeParse({ kod: 'x', gizli: 'deger' });
    expect(r.success && r.data).toEqual({ kod: 'X' });
  });

  it('iç içe alan adlarını destekler', () => {
    const s = buildSchema([{ name: 'adres.il', label: 'İl', required: true, schema: textSchema({}) }], { t });
    expect(s.safeParse({ adres: { il: 'Ankara' } }).success).toBe(true);
    expect(s.safeParse({ adres: { il: '' } }).success).toBe(false);
  });
});

describe('requiredOnlySchema (business bileşenleri)', () => {
  const s = buildSchema([{ name: 'firma', label: 'Firma', required: true, schema: requiredOnlySchema }], { t });
  it('null ve boş değeri reddeder, seçimi kabul eder', () => {
    expect(s.safeParse({ firma: null }).success).toBe(false);
    expect(s.safeParse({ firma: { value: '1', label: 'A' } }).success).toBe(true);
  });
});

describe('col', () => {
  it('sayı md anlamına gelir, verilmezse tam satır', () => {
    expect(resolveColSpan(6)).toEqual({ xs: 12, md: 6 });
    expect(resolveColSpan(undefined)).toEqual({ xs: 12 });
    expect(spanAt(6, 'lg')).toBe(6);
    expect(spanAt(6, 'xs')).toBe(12);
    expect(spanAt({ md: 6, lg: 4 }, 'lg')).toBe(4);
  });
});
