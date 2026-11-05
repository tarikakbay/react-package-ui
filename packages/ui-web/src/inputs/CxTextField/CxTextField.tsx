import { applyInputTransform, CX_NAMESPACE, textSchema, type CxFieldHandle, type TextFieldKind, type TextFieldProps } from '@cx/core';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import { forwardRef, useId, useImperativeHandle, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connectField } from '../../base/connectField';

const inputType: Record<TextFieldKind, string> = {
  text: 'text',
  email: 'email',
  phone: 'tel',
  password: 'password',
};

const inputMode: Record<TextFieldKind, 'text' | 'email' | 'tel'> = {
  text: 'text',
  email: 'email',
  phone: 'tel',
  password: 'text',
};

const autoComplete: Partial<Record<TextFieldKind, string>> = {
  email: 'email',
  phone: 'tel',
  password: 'current-password',
};

// İkon paketi bağımlılığı eklememek için Material ikonlarının yolları
const EyeIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3" />
  </SvgIcon>
);
const EyeOffIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z" />
  </SvgIcon>
);

/**
 * Metin alanı (web), tek başına çalışan taban bileşen.
 * Floating label: alan boşken label içeride durur, değer girilince küçülüp üste çıkar.
 * Uygulamalar genelde bunun yerine forma bağlanabilen `CxTextField`'ı kullanır.
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
    name,
  } = props;

  const { t, i18n } = useTranslation(CX_NAMESPACE);
  const autoId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = kind === 'password';

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(applyInputTransform(e.target.value, kind, transform, i18n.language));
  };

  return (
    <TextField
      inputRef={inputRef}
      id={id ?? autoId}
      name={name}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      error={Boolean(error)}
      helperText={error ?? helperText}
      // Kullanıcı bu alanla bir şey yapamıyorsa * gösterilmez.
      required={Boolean(required) && !readOnly && !disabled}
      disabled={disabled}
      placeholder={placeholder}
      multiline={multiline && !isPassword}
      minRows={multiline ? rows : undefined}
      type={isPassword && showPassword ? 'text' : inputType[kind]}
      fullWidth
      slotProps={{
        htmlInput: {
          maxLength,
          readOnly,
          inputMode: inputMode[kind],
          autoComplete: autoComplete[kind],
          autoCapitalize: kind === 'email' ? 'none' : undefined,
          spellCheck: kind === 'email' || isPassword ? false : undefined,
          'aria-busy': busy ? true : undefined,
        },
        input: busy
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <CircularProgress size={18} aria-label={t('field.busy')} />
                </InputAdornment>
              ),
            }
          : isPassword
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label={t(showPassword ? 'field.hidePassword' : 'field.showPassword')}
                    onClick={() => setShowPassword((s) => !s)}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={disabled}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          : undefined,
      }}
    />
  );
});

/**
 * Metin alanı.
 * - `<CxForm>` içinde `name` ile: forma bağlanır, kuralları (required, maxLength, kind …) validasyona girer.
 * - `value` + `onChange` ile: tek başına çalışır (filtre, arama kutusu).
 * - `col={6}`: md'de 6 kolon kaplar.
 */
export const CxTextField = connectField(CxTextFieldBase, {
  empty: '',
  schema: (p) => textSchema({ kind: p.kind, minLength: p.minLength, maxLength: p.maxLength, transform: p.transform }),
});
