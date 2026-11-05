import { applyInputTransform, CX_NAMESPACE, textSchema, type CxFieldHandle, type TextFieldKind, type TextFieldProps } from '@cx/core';
import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connectField } from '../form/connectField';
import { ActivityIndicator, View, type KeyboardTypeOptions } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

const keyboardType: Record<TextFieldKind, KeyboardTypeOptions> = {
  text: 'default',
  email: 'email-address',
  phone: 'phone-pad',
  password: 'default',
};

const autoComplete = {
  text: undefined,
  email: 'email',
  phone: 'tel',
  password: 'current-password',
} as const;

/**
 * Metin alanı (mobil), tek başına çalışan taban bileşen.
 * Web'deki CxTextFieldBase ile aynı props. Floating label Paper TextInput'un label davranışıdır.
 */
export const CxTextFieldBase = forwardRef<CxFieldHandle, TextFieldProps>(function CxTextFieldBase(props, ref) {
  const {
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    required,
    disabled,
    readOnly,
    kind = 'text',
    placeholder,
    maxLength,
    multiline,
    rows = 3,
    transform,
    busy,
    id,
  } = props;

  const { t, i18n } = useTranslation(CX_NAMESPACE);
  const autoId = useId();
  const inputId = id ?? autoId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = kind === 'password';
  const message = error ?? helperText;

  const inputRef = useRef<CxFieldHandle>(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  return (
    <View>
      <TextInput
        ref={inputRef as never}
        testID={inputId}
        mode="outlined"
        // Kullanıcı bu alanla bir şey yapamıyorsa * gösterilmez.
        label={required && !readOnly && !disabled ? `${label} *` : label}
        value={value}
        onChangeText={(text) => onChange(applyInputTransform(text, kind, transform, i18n.language))}
        onBlur={onBlur}
        error={Boolean(error)}
        disabled={disabled}
        editable={!readOnly}
        placeholder={placeholder}
        maxLength={maxLength}
        multiline={multiline && !isPassword}
        numberOfLines={multiline ? rows : undefined}
        keyboardType={keyboardType[kind]}
        autoComplete={autoComplete[kind]}
        autoCapitalize={kind === 'email' || isPassword ? 'none' : 'sentences'}
        autoCorrect={kind === 'text'}
        secureTextEntry={isPassword && !showPassword}
        accessibilityLabel={label}
        accessibilityState={{ busy: Boolean(busy), disabled: Boolean(disabled) }}
        aria-invalid={Boolean(error)}
        aria-required={Boolean(required) && !readOnly && !disabled}
        right={
          busy ? (
            <TextInput.Icon icon={() => <ActivityIndicator size="small" />} accessibilityLabel={t('field.busy')} />
          ) : isPassword ? (
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((s) => !s)}
              accessibilityLabel={t(showPassword ? 'field.hidePassword' : 'field.showPassword')}
              disabled={disabled}
            />
          ) : undefined
        }
      />
      {/* Yer sabit kalsın diye mesaj yokken de alan ayrılır (layout zıplamaz). */}
      <HelperText type={error ? 'error' : 'info'} visible={Boolean(message)}>
        {message ?? ' '}
      </HelperText>
    </View>
  );
});

/**
 * Metin alanı (mobil). Web'deki CxTextField ile aynı kullanım:
 * `<CxForm>` içinde `name` ile forma bağlanır, `value` + `onChange` ile tek başına çalışır.
 */
export const CxTextField = connectField(CxTextFieldBase, {
  empty: '',
  schema: (p) => textSchema({ kind: p.kind, minLength: p.minLength, maxLength: p.maxLength, transform: p.transform }),
});
