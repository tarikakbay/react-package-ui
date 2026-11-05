/**
 * ÖRNEK — Firma seçimi business bileşeni (eski cTenant'ın karşılığı).
 *
 * Eski cTenant: DsTextbox + buton + DsModal içinde DsDataGrid; değer ref ile okunuyor
 * (cTenant.current.selectedTenant), forma uyması için isValid/makeInvalid taklit ediliyor.
 *
 * Yeni kural: business bileşeni Cx alan sözleşmesini uygular
 *   → value / onChange / onBlur / error / label / required / disabled / readOnly + CxFieldHandle ref,
 * ve connectField ile sarılır. Böylece Cx alanları gibi:
 *   - <CxForm> içinde `name` ile forma bağlanır (validasyon, hata, *, odaklanma, readOnlyOn kendiliğinden)
 *   - `value` + `onChange` ile tek başına çalışır (ör. liste filtresi)
 *
 * Bu dosya uygulamada (ya da ayrı bir business paketinde) durur, Cx paketlerinde değil.
 * Not: CxAutocomplete henüz yazılmadı; tasarlanan API'ye göre gösterilmiştir.
 */
import type { CxFieldComponentProps, CxFieldHandle, Option } from '@cx/core';
import { connectField, CxAutocomplete } from '@cx/ui-web';
import { forwardRef, useRef } from 'react';
import { pTenants, type dTenant } from '@/services/api';

export type TenantSecimiProps = CxFieldComponentProps<Option | null> & {
  /** Firma tipi filtresi (eski tenantType) */
  tenantType?: string;
  /** Müşteri tipi filtresi (eski customerType) */
  customerType?: string;
  /** Seçilen firmanın tüm verisi gerekiyorsa (eski onSelectedTenant) */
  onSelectTenant?: (tenant: dTenant | null) => void;
};

const TenantSecimiBase = forwardRef<CxFieldHandle, TenantSecimiProps>(function TenantSecimiBase(
  { tenantType, customerType, onSelectTenant, onChange, ...field },
  ref,
) {
  // Seçilen satırın ham verisini saklamak için (onSelectTenant'a vermek üzere)
  const cache = useRef(new Map<string, dTenant>()).current;

  return (
    <CxAutocomplete
      ref={ref}
      {...field}
      minChars={2}
      // Arama sunucu tarafında; istek iptali, debounce ve loading CxAutocomplete'te
      loadOptions={async (query, signal) => {
        const rows = (await new pTenants().search({ query, tenantType, customerType }, { signal })).body;
        rows.forEach((r) => cache.set(r.guid!, r));
        return rows.map((r) => ({ value: r.guid!, label: r.customer?.title ?? r.guid! }));
      }}
      onChange={(opt) => {
        onChange(opt);
        onSelectTenant?.(opt ? cache.get(opt.value) ?? null : null);
      }}
    />
  );
});

/**
 * Forma bağlanabilir firma seçimi.
 * Boş değeri null; şema verilmediği için yalnızca `required` kontrol edilir.
 *
 * @example
 * <TenantSecimi name="tenant" label="Firma" required readOnlyOn="update" col={6} tenantType="CUSTOMER" />
 */
export const TenantSecimi = connectField(TenantSecimiBase, { empty: null });
