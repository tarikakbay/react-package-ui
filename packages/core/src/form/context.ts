import { createContext, useContext } from 'react';
import { useWatch, type FieldValues, type Path, type PathValue } from 'react-hook-form';
import type { CxFormApi, CxFormMode } from './useCxForm';

export type CxFormContextValue = {
  form: CxFormApi<FieldValues>;
  mode: CxFormMode;
  readOnly: boolean;
  disabled: boolean;
};

export const CxFormContext = createContext<CxFormContextValue | null>(null);

/** Bölüm / sekme kimliği: içindeki alanlar bu kimlikle kaydolur. */
export const CxSectionContext = createContext<string | undefined>(undefined);

/** Bir CxForm içindeysek formu döner, değilsek null. */
export function useCxFormContextOptional(): CxFormContextValue | null {
  return useContext(CxFormContext);
}

/**
 * CxForm içindeki herhangi bir bileşenden forma erişim.
 * `const form = useCxFormContext(); form.watch('musteriTipi')`
 */
export function useCxFormContext<T extends FieldValues = FieldValues>(): CxFormApi<T> {
  const ctx = useContext(CxFormContext);
  if (!ctx) throw new Error('useCxFormContext bir <CxForm> içinde kullanılmalıdır.');
  return ctx.form as unknown as CxFormApi<T>;
}

/**
 * Sekmeler kendini buraya kaydeder; form geçersiz gönderilince CxForm
 * ilk hatalı alanın sekmesini açmak için kullanır.
 */
export type CxSectionActivator = {
  register: (section: string, activate: () => void) => () => void;
};
export const CxSectionActivatorContext = createContext<CxSectionActivator | null>(null);

/**
 * CxForm içindeki bir bileşenden alan değerini izler; değer değişince yalnızca bu bileşen yeniden çizilir.
 * Formu oluşturan bileşende `form.watch('ad')`, alt bileşenlerde `useCxWatch('ad')` kullanılır.
 */
export function useCxWatch<T extends FieldValues = FieldValues, N extends Path<T> = Path<T>>(name: N): PathValue<T, N> {
  const ctx = useContext(CxFormContext);
  if (!ctx) throw new Error('useCxWatch bir <CxForm> içinde kullanılmalıdır.');
  return useWatch({ control: ctx.form.control as never, name }) as PathValue<T, N>;
}
