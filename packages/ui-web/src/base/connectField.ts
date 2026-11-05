import { createConnectField } from '@cx/core';
import { CxCol } from '../layout/CxCol';

/**
 * Bir alan bileşenini (Cx ya da business bileşeni) forma bağlanabilir yapar.
 * Bileşen Cx alan sözleşmesini uygulamalıdır: value / onChange / onBlur / error / label / required …
 *
 * @example
 * export const TenantSecimi = connectField(TenantSecimiBase, { empty: null });
 * // <TenantSecimi name="tenant" label="Firma" required col={6} />
 */
export const connectField = createConnectField(CxCol);
