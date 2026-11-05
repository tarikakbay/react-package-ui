import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * Sunucudan gelen alan bazlı hatalar.
 * Handler (create/update) bunu fırlatırsa kabuk mesajları ilgili alanların altına yazar,
 * genel hata kutusu açmaz.
 *
 * @example
 * throw new FieldError({ ePosta: 'Bu e-posta zaten kayıtlı' });
 */
export class FieldError extends Error {
  readonly fields: Readonly<Record<string, string>>;

  constructor(fields: Record<string, string>, message = 'Field validation failed') {
    super(message);
    this.name = 'FieldError';
    this.fields = fields;
  }
}

export function isFieldError(err: unknown): err is FieldError {
  return err instanceof FieldError || (err instanceof Error && err.name === 'FieldError' && 'fields' in err);
}

/** FieldError'daki mesajları forma uygular. İlk hatalı alana odaklanır. */
export function applyFieldErrors<T extends FieldValues>(err: FieldError, setError: UseFormSetError<T>): void {
  let first = true;
  for (const [name, message] of Object.entries(err.fields)) {
    setError(name as Path<T>, { type: 'server', message }, { shouldFocus: first });
    first = false;
  }
}
