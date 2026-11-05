import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  useForm,
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CX_NAMESPACE } from '../i18n/resources';
import { buildSchema, type FieldSchemaFactory } from './schema';

/** Forma kayıtlı alan. Bağlı alanlar mount olunca kaydolur, unmount olunca silinir. */
export type RegisteredField = {
  name: string;
  /** Şema üretilirken o anki değerler okunur (koşullu `required` desteklenir). */
  getRules: () => { label: string; required: boolean; schema: FieldSchemaFactory };
  /** Alan temizlenince alacağı değer. */
  empty: unknown;
  /** İçinde bulunduğu CxFormSection / sekme. */
  section?: string;
};

export type CxFormMode = 'create' | 'update';

export type UseCxFormOptions<T extends FieldValues> = {
  /** Başlangıç değerleri (ör. düzenleme için `get` sonucu). */
  defaultValues?: DefaultValues<T>;
};

export type CxFormApi<T extends FieldValues = FieldValues> = Omit<UseFormReturn<T>, 'setError'> & {
  /**
   * Alana hata yazar. Kullanıcı alanı değiştirince kalkar.
   * `form.setError('vergiNo', 'Vergi numarası bulunamadı')`
   */
  setError: (name: Path<T> | 'root', error: string | { message: string; type?: string }, options?: { shouldFocus?: boolean }) => void;
  /**
   * Tüm kayıtlı alanları boş değerine döndürür; hatalar, touched ve dirty bilgisi sıfırlanır.
   * Ekle dendiğinde kabuk bunu çağırır.
   */
  clear: () => void;
  /** Form değerlerini verilen kayıtla doldurur ve bunu yeni başlangıç noktası yapar (düzenleme). */
  load: (values: Partial<T>) => void;
  /** @internal ui paketleri için */
  readonly _cx: CxFormInternals;
};

export type CxFormInternals = {
  register: (field: RegisteredField) => () => void;
  fields: () => RegisteredField[];
  /** Kayıt değiştikçe artar (zorunlu alan bilgisi ve sekme hata sayıları için). */
  version: number;
  setRequired: (name: string, required: boolean) => void;
  requiredCount: number;
};

/**
 * Bileşen tabanlı formun motoru.
 * Validasyon şeması forma bağlı alanların kurallarından her doğrulamada yeniden üretilir;
 * form tarafında elle validasyon yazılmaz.
 */
export function useCxForm<T extends FieldValues = FieldValues>(options: UseCxFormOptions<T> = {}): CxFormApi<T> {
  const { t, i18n } = useTranslation(CX_NAMESPACE);
  const registry = useRef(new Map<string, RegisteredField>());
  const [version, setVersion] = useState(0);
  const [requiredSet, setRequiredSet] = useState<ReadonlySet<string>>(new Set());

  const resolver = useCallback<Resolver<T>>(
    (values, context, opts) => {
      const fields = [...registry.current.values()].map((f) => ({ name: f.name, ...f.getRules() }));
      const schema = buildSchema(fields, {
        t,
        locale: i18n.language,
        translateLabel: (label) => i18n.t(label, { defaultValue: label }),
      });
      return (zodResolver(schema as never) as unknown as Resolver<T>)(values, context, opts);
    },
    [t, i18n],
  );

  const rhf = useForm<T>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    // Ekrandan kalkan alanın değeri formdan da çıkar (validasyona girmez).
    shouldUnregister: true,
    // Odaklanmayı CxForm yapar: hatalı alan kapalı bir sekmedeyse önce sekmeye geçer.
    shouldFocusError: false,
    resolver,
    defaultValues: options.defaultValues,
  });

  const internals = useMemo<Omit<CxFormInternals, 'version' | 'requiredCount'>>(
    () => ({
      register(field) {
        registry.current.set(field.name, field);
        setVersion((v) => v + 1);
        return () => {
          if (registry.current.get(field.name) === field) registry.current.delete(field.name);
          setRequiredSet((s) => {
            if (!s.has(field.name)) return s;
            const n = new Set(s);
            n.delete(field.name);
            return n;
          });
          setVersion((v) => v + 1);
        };
      },
      fields: () => [...registry.current.values()],
      setRequired(name, required) {
        setRequiredSet((s) => {
          if (s.has(name) === required) return s;
          const n = new Set(s);
          if (required) n.add(name);
          else n.delete(name);
          return n;
        });
      },
    }),
    [],
  );

  const setError = useCallback<CxFormApi<T>['setError']>(
    (name, error, opts) => {
      const e = typeof error === 'string' ? { type: 'manual', message: error } : { type: error.type ?? 'manual', message: error.message };
      rhf.setError(name as Path<T>, e, opts?.shouldFocus ? { shouldFocus: true } : undefined);
    },
    [rhf],
  );

  const clear = useCallback(() => {
    const empty: Record<string, unknown> = {};
    for (const f of registry.current.values()) setPathValue(empty, f.name, f.empty);
    rhf.reset(empty as T, { keepDefaultValues: false });
  }, [rhf]);

  const load = useCallback((values: Partial<T>) => {
    const merged: Record<string, unknown> = {};
    for (const f of registry.current.values()) setPathValue(merged, f.name, f.empty);
    rhf.reset({ ...merged, ...values } as T);
  }, [rhf]);

  return useMemo(
    () => ({
      ...rhf,
      setError,
      clear,
      load,
      _cx: { ...internals, version, requiredCount: requiredSet.size },
    }),
    [rhf, setError, clear, load, internals, version, requiredSet],
  );
}

/** Hatalar içinde kayıt sırasına göre ilk hatalı alanı bulur. */
export function firstErrorField(fields: RegisteredField[], errors: FieldErrors): RegisteredField | undefined {
  return fields.find((f) => getPath(errors, f.name) !== undefined);
}

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function setPathValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  let node = obj;
  for (const p of parts.slice(0, -1)) {
    if (typeof node[p] !== 'object' || node[p] === null) node[p] = {};
    node = node[p] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]!] = value;
}
