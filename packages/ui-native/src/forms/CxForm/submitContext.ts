import { createContext, useContext } from 'react';

export type SubmitFn = () => Promise<boolean>;
export const SubmitContext = createContext<SubmitFn | null>(null);

/** Formu gönderen fonksiyon (mobilde <form> olmadığı için). */
export function useCxFormSubmit(): SubmitFn {
  const submit = useContext(SubmitContext);
  if (!submit) throw new Error('useCxFormSubmit bir <CxForm> içinde kullanılmalıdır.');
  return submit;
}
