import type { FieldErrors, FieldValues } from 'react-hook-form';
import { isFieldError } from '../errors/fieldError';
import type { CxSectionActivator } from './context';
import { firstErrorField, type CxFormApi } from './useCxForm';

/**
 * Formu gönderir. CxForm (web ve native) ve CxScreen aynı akışı kullanır:
 * 1. Tüm kayıtlı alanlar doğrulanır.
 * 2. Geçersizse ilk hatalı alanın sekmesi açılır ve alana odaklanılır; onValid çağrılmaz.
 * 3. Geçerliyse onValid dönüştürülmüş değerlerle çağrılır.
 * 4. onValid FieldError fırlatırsa mesajlar alanlara yazılır.
 *
 * @returns geçerli gönderildiyse ve onValid hatasız bittiyse true
 */
export async function submitCxForm<T extends FieldValues>(
  form: CxFormApi<T>,
  onValid: (values: T) => unknown | Promise<unknown>,
  opts: { activators?: Map<string, () => void>; onInvalid?: (errors: FieldErrors<T>) => void } = {},
): Promise<boolean> {
  let ok = false;
  await form.handleSubmit(
    async (values) => {
      try {
        await onValid(values);
        ok = true;
      } catch (err) {
        if (!isFieldError(err)) throw err;
        let first = true;
        for (const [name, message] of Object.entries(err.fields)) {
          form.setError(name as never, message, { shouldFocus: first });
          first = false;
        }
      }
    },
    (errors) => {
      focusFirstError(form, errors, opts.activators);
      opts.onInvalid?.(errors);
    },
  )();
  return ok;
}

export function focusFirstError<T extends FieldValues>(
  form: CxFormApi<T>,
  errors: FieldErrors<T>,
  activators?: Map<string, () => void>,
) {
  const field = firstErrorField(form._cx.fields(), errors);
  if (!field) return;
  if (field.section) activators?.get(field.section)?.();
  // Sekme açıldıktan sonra odaklan (gizli alana odaklanılamaz).
  setTimeout(() => form.setFocus(field.name as never), 0);
}

/** CxSectionActivator'ı Map üzerinde gerçekleyen yardımcı. */
export function createSectionActivator(map: Map<string, () => void>): CxSectionActivator {
  return {
    register(section, activate) {
      map.set(section, activate);
      return () => {
        if (map.get(section) === activate) map.delete(section);
      };
    },
  };
}
