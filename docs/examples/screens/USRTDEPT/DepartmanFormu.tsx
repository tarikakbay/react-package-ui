/**
 * ÖRNEK — Departman formu (bileşen tabanlı).
 * Kurallar alanların yanında; validasyon şeması bunlardan otomatik üretilir.
 * Mobilde import '@cx/ui-native' olur, içerik aynı kalır.
 */
import type { Option } from '@cx/core';
import { CxTextField } from '@cx/ui-web';
import { TenantSecimi } from '@/business/TenantSecimi';

/** İsteğe bağlı: create/update içindeki values tipli gelsin diye. */
export type Departman = { tenant: Option | null; name: string; description: string };

export function DepartmanFormu() {
  return (
    <>
      <TenantSecimi
        name="tenant"
        label="Firma"
        required
        readOnlyOn="update" // departman başka firmaya taşınamaz
        tenantType="CUSTOMER"
        col={6}
      />
      <CxTextField name="name" label="Adi" required maxLength={100} transform="trim" col={6} />
      <CxTextField name="description" label="Aciklama" multiline rows={4} maxLength={500} />
    </>
  );
}
