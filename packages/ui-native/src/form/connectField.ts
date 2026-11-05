import { createConnectField } from '@cx/core';
import { CxCol } from '../layout/CxGrid';

/**
 * Bir alan bileşenini (Cx ya da business bileşeni) forma bağlanabilir yapar.
 * Web'deki connectField ile aynı davranır.
 */
export const connectField = createConnectField(CxCol);
