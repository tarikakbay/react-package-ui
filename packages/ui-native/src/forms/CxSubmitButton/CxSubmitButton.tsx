import { useCxFormContext, useFormState } from '@cx/core';
import { Button } from 'react-native-paper';
import { useCxFormSubmit } from '../CxForm/submitContext';
import type { CxSubmitButtonProps } from './types';

/** Formu gönderen buton. Gönderim sürerken spinner gösterir ve tekrar basılamaz. */
export function CxSubmitButton(props: CxSubmitButtonProps) {
  const submit = useCxFormSubmit();
  const form = useCxFormContext();
  const { isSubmitting } = useFormState({ control: form.control });
  return (
    <Button mode="contained" {...props} loading={isSubmitting} disabled={isSubmitting || props.disabled} onPress={() => void submit()} />
  );
}
