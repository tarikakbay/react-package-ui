// Tipler
export type {
  BaseFieldProps,
  ColSpan,
  CxFieldComponentProps,
  CxFieldHandle,
  Option,
  TextTransform,
} from './types/fields';

// Alan tipleri (her tip kendi klasöründe: fields/<tip>)
export {
  applyInputTransform,
  applyValueTransform,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  textSchema,
  type TextFieldKind,
  type TextFieldProps,
  type TextFieldRules,
} from './fields/text';

// Form motoru (bileşen tabanlı)
export {
  firstErrorField,
  getPath,
  useCxForm,
  type CxFormApi,
  type CxFormInternals,
  type CxFormMode,
  type RegisteredField,
  type UseCxFormOptions,
} from './form/useCxForm';
export {
  CxFormContext,
  CxSectionActivatorContext,
  CxSectionContext,
  useCxFormContext,
  useCxFormContextOptional,
  useCxWatch,
  type CxFormContextValue,
  type CxSectionActivator,
} from './form/context';
export {
  createConnectField,
  type CellComponent,
  type ConnectableProps,
  type ConnectFieldConfig,
} from './form/connectField';
export {
  buildSchema,
  isEmptyValue,
  requiredOnlySchema,
  validationMessage,
  type FieldSchemaFactory,
  type SchemaContext,
  type SchemaField,
} from './form/schema';
export { resolveColSpan, spanAt, type ResolvedColSpan } from './form/layout';

// Sunucu alan hataları
export { applyFieldErrors, FieldError, isFieldError } from './errors/fieldError';

// i18n
export { CX_NAMESPACE, cxResources, type CxResource, type Translate } from './i18n/resources';

// Tema
export {
  createTokens,
  defaultTokens,
  resolveColorMode,
  type ColorMode,
  type ColorModeSetting,
  type ColorTokens,
  type CxTokens,
  type CxTokensOverride,
} from './theme/tokens';

// react-hook-form yeniden dışa aktarılır: ui paketleri ve uygulamalar ayrı kopya kullanmaz.
export {
  Controller,
  useController,
  useFormState,
  useWatch,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from 'react-hook-form';

export { createSectionActivator, focusFirstError, submitCxForm } from './form/submit';
