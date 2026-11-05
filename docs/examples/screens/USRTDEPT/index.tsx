/**
 * ÖRNEK — Departman ekranı (eski USRTDEPT'in karşılığı).
 *
 * Eski ekran: 266 satır; withDsTFormHOC + useImperativeHandle, her handler'da new Promise + try/catch,
 * değerler ref'lerden tek tek okunuyor, satır çift tıklamasında alanlar ref'lerle dolduruluyor.
 *
 * Yeni ekran yalnızca "ne yapılacağını" yazar:
 *   - Yetki, pasif ekran, loading, hata mesajları → CxScreenHost / CxScreen
 *   - Validasyon → alanların kuralları (DepartmanFormu.tsx)
 *   - Ekle → form tüm alanları temizlenmiş olarak açılır
 *   - Butonlar → tanımlı handler'lardan türetilir (create var → "Ekle", delete var → "Sil" …)
 *   - ?id=… ile gelinirse kayıt doğrudan açılır (get handler'ı)
 *
 * Not: CxScreen ve useScreen henüz yazılmadı; kararlar.md §10'daki tasarıma göre gösterilmiştir.
 */
import { FieldError } from '@cx/core';
import { CxScreen, useScreen } from '@cx/ui-web'; // mobilde: '@cx/ui-native' — ekran kodu aynı kalır
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pDepartmanlar, type dDepartman } from '@/services/api';
import { GeciciListe } from '@/components/GeciciListe'; // DataGrid kararına kadar
import { DepartmanFormu, type Departman } from './DepartmanFormu';

/** Form değeri → API isteği (required olduğu için tenant burada dolu) */
const toRequest = (v: Departman) => ({
  tenantGuid: v.tenant!.value,
  name: v.name,
  description: v.description,
});

export default function USRTDEPT() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<dDepartman[]>([]);
  const api = new pDepartmanlar();

  return (
    <CxScreen<Departman>
      form={<DepartmanFormu />}
      handlers={{
        // Liste (Listele butonu, açılış ve her kayıt/silme sonrası otomatik)
        read: async () => setRows((await api.get()).body),

        // Tek kayıt: satır açılınca ve /departmanlar?id=… ile gelinince
        get: async ({ id }) => {
          const d = (await api.getById(id)).body;
          return {
            // Seçim alanları Option tutar: düzenlemede firma adı ayrıca sorgulanmadan görünür
            tenant: { value: d.tenantGuid!, label: d.tenant?.customer?.title ?? '' },
            name: d.name,
            description: d.description,
          };
        },

        // values doğrulanmış ve tipli gelir: { tenant: Option | null, name, description }
        create: async ({ values }) => {
          const r = await api.post(toRequest(values));
          // Sunucu alan hatası → mesaj ilgili alanın altına yazılır, genel hata kutusu açılmaz
          if (r.messageCode === 'DEPARTMENT_NAME_EXISTS') {
            throw new FieldError({ name: t('DepartmanAdiKullaniliyor') });
          }
        },
        update: async ({ id, values }) => {
          await api.put(id, toRequest(values));
        },
        delete: async ({ id }) => {
          await api.delete(id);
        },
      }}
      // Ekrana özel ek buton (aynı spinner ve hata yönetimini kullanır)
      actions={[
        {
          id: 'export',
          label: t('ExceleAktar'),
          icon: 'download',
          onPress: async () => exportToExcel(rows),
        },
      ]}
    >
      <DepartmanListe rows={rows} />
    </CxScreen>
  );
}

/** Altındaki bileşen ekrana useScreen() ile bağlanır; prop geçirmeye gerek yok. */
function DepartmanListe({ rows }: { rows: dDepartman[] }) {
  const { t } = useTranslation();
  const screen = useScreen();

  return (
    <GeciciListe
      rows={rows}
      columns={[
        { field: 'tenant.customer.title', header: t('Firma') },
        { field: 'name', header: t('DepartmanAdi') },
        { field: 'description', header: t('Aciklama') },
      ]}
      // Eski dgOnRowDoubleClicked: kaydı get ile taze çekip formu güncelleme modunda açar, URL ?id=… olur
      onOpen={(row) => screen.edit(row.guid!)}
    />
  );
}

declare function exportToExcel(rows: dDepartman[]): Promise<void>;
