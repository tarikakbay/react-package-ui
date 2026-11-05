// Tipler
export type {
  BaseFieldProps,
  ColSpan,
  CxFieldComponentProps,
  CxFieldHandle,
  Option,
  TextFieldKind,
  TextFieldProps,
  TextFieldRules,
  TextTransform,
} from './types/fields';

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
  textSchema,
  type FieldSchemaFactory,
  type SchemaContext,
  type SchemaField,
} from './form/schema';
export { resolveColSpan, spanAt, type ResolvedColSpan } from './form/layout';
export {
  applyInputTransform,
  applyValueTransform,
  isValidEmail,
  isValidPhone,
  normalizePhone,
} from './form/text';

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
