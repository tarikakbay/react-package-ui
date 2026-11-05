import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentType,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from 'react';
import { useController } from 'react-hook-form';
import type { ColSpan, CxFieldComponentProps, CxFieldHandle } from '../types/fields';
import { CxFormContext, CxSectionContext, type CxFormContextValue } from './context';
import { requiredOnlySchema, type FieldSchemaFactory } from './schema';

export type ConnectFieldConfig<P> = {
  /** Alan temizlenince / ilk açılışta değeri. */
  empty: unknown;
  /** Props'tan validasyon şeması. Verilmezse yalnızca zorunluluk kontrolü yapılır. */
  schema?: (props: P) => FieldSchemaFactory;
};

/** Grid hücresi: ui paketleri platformuna göre verir (web: MUI Grid, native: View). */
export type CellComponent = ComponentType<{ col?: ColSpan; children: ReactNode }>;

/**
 * Bağlanabilir alan props'u:
 * - CxForm içinde `name` ile → forma bağlı (value/onChange form'dan gelir)
 * - `value` + `onChange` ile → tek başına (controlled)
 */
export type ConnectableProps<P extends CxFieldComponentProps<any>> = Omit<P, 'value' | 'onChange'> & {
  value?: P['value'];
  onChange?: P['onChange'];
  /** Sayı verilirse md anlamına gelir. CxForm içinde verilmezse tam satır. */
  col?: ColSpan;
  /** 'update': kayıt oluşturulduktan sonra değiştirilemez (ör. kullanıcı kodu). */
  readOnlyOn?: 'update';
};

type LooseProps = {
  name?: string;
  label: string;
  value?: unknown;
  onChange?: (v: any) => void;
  onBlur?: () => void | Promise<unknown>;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  busy?: boolean;
  col?: ColSpan;
  readOnlyOn?: 'update';
};

/**
 * ui paketleri kendi grid hücresiyle bir kez çağırır ve `connectField`'i dışa aktarır.
 */
export function createConnectField(Cell: CellComponent) {
  return function connectField<P extends CxFieldComponentProps<any>>(
    Base: ComponentType<P & RefAttributes<CxFieldHandle>>,
    config: ConnectFieldConfig<P>,
  ): ForwardRefExoticComponent<ConnectableProps<P> & RefAttributes<CxFieldHandle>> {
    // İç bileşenler gevşek tiplidir; dışarıya verilen tip en sonda ConnectableProps<P> olarak sabitlenir.
    const Connected = forwardRef<CxFieldHandle, LooseProps & { ctx: CxFormContextValue; name: string }>(
      function Connected({ ctx, col: _col, readOnlyOn, ...props }, ref) {
        const section = useContext(CxSectionContext);
        const { field, fieldState } = useController({
          name: props.name,
          control: ctx.form.control,
          defaultValue: config.empty as never,
        });

        const readOnly = Boolean(props.readOnly || ctx.readOnly || (ctx.mode === 'update' && readOnlyOn === 'update'));
        const disabled = Boolean(props.disabled || ctx.disabled);
        // Kullanıcı bu alanla bir şey yapamıyorsa * gösterilmez.
        const showRequired = Boolean(props.required) && !readOnly && !disabled;

        // Kurallar her doğrulamada o anki props'tan okunur (koşullu required çalışır).
        const propsRef = useRef(props);
        propsRef.current = props;

        const { register, setRequired } = ctx.form._cx;
        useEffect(
          () =>
            register({
              name: props.name,
              empty: config.empty,
              section,
              getRules: () => {
                const p = propsRef.current as unknown as P;
                return {
                  label: p.label,
                  required: Boolean(p.required),
                  schema: config.schema ? config.schema(p) : requiredOnlySchema,
                };
              },
            }),
          [register, props.name, section],
        );
        useEffect(() => setRequired(props.name, showRequired), [setRequired, props.name, showRequired]);

        // Ref: dışarıya ve forma (ilk hatalı alana odaklanma) aynı handle verilir.
        const inner = useRef<CxFieldHandle>(null);
        const handle: CxFieldHandle = {
          focus: () => inner.current?.focus(),
          blur: () => inner.current?.blur(),
        };
        useImperativeHandle(ref, () => handle);
        const setInner = useCallback(
          (h: CxFieldHandle | null) => {
            inner.current = h;
            field.ref(h ? { focus: () => h.focus() } : null);
          },
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [field.ref],
        );

        const [busy, setBusy] = useState(false);
        const userOnBlur = props.onBlur;
        const userOnChange = props.onChange;

        const onChange = (v: unknown) => {
          field.onChange(v);
          userOnChange?.(v);
        };

        // onBlur: önce alan doğrulanır; geçerliyse kullanıcının onBlur'ü çalışır.
        const onBlur = () => {
          field.onBlur();
          if (!userOnBlur) return;
          void ctx.form.trigger(props.name).then((valid: boolean) => {
            if (!valid) return;
            const r = userOnBlur();
            if (r && typeof (r as Promise<unknown>).then === 'function') {
              setBusy(true);
              (r as Promise<unknown>).finally(() => setBusy(false));
            }
          });
        };

        const BaseAny = Base as ComponentType<any>;
        return (
          <BaseAny
            {...props}
            ref={setInner}
            value={field.value}
            onChange={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message ?? props.error}
            required={showRequired}
            readOnly={readOnly}
            disabled={disabled || (ctx.form.formState.isSubmitting && !readOnly)}
            busy={busy || props.busy}
          />
        );
      },
    );

    const Connectable = forwardRef<CxFieldHandle, LooseProps>(function Connectable(props, ref) {
      const ctx = useContext(CxFormContext);
      // CxForm içinde, `name` verilmiş ve value dışarıdan verilmemişse forma bağlanır.
      if (ctx && props.name && props.value === undefined) {
        return (
          <Cell col={props.col}>
            <Connected {...props} name={props.name} ctx={ctx} ref={ref} />
          </Cell>
        );
      }
      const { col, readOnlyOn: _r, ...rest } = props;
      const BaseAny = Base as ComponentType<any>;
      const el = <BaseAny {...rest} ref={ref} />;
      return col !== undefined || ctx ? <Cell col={col}>{el}</Cell> : el;
    });

    Connectable.displayName = `Connected(${Base.displayName ?? Base.name ?? 'Field'})`;
    return Connectable as unknown as ForwardRefExoticComponent<ConnectableProps<P> & RefAttributes<CxFieldHandle>>;
  };
}
