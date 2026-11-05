import {
  CxForm,
  CxFormSection,
  CxFormTab,
  CxFormTabs,
  CxTextField,
  FieldError,
  useCxForm,
  useCxFormContext,
  useCxWatch,
} from '@cx/ui-web';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card, Note, Result, wait } from './helpers';

const meta: Meta = { title: 'Form/CxForm' };
export default meta;
type Story = StoryObj;

type Kullanici = { kod: string; ad: string; ePosta: string; telefon: string; aciklama: string };

const ornekKayit: Kullanici = {
  kod: 'K0001',
  ad: 'Ayşe Yılmaz',
  ePosta: 'ayse@ornek.com',
  telefon: '+905321234567',
  aciklama: 'Muhasebe',
};

/**
 * Temel form: kurallar alanların props'unda, validasyon otomatik.
 * Ekle → clear(), Düzenle → load(kayıt) + update modu (Kod kilitlenir).
 */
export const Temel: Story = {
  render: function Render() {
    const form = useCxForm<Kullanici>();
    const [mode, setMode] = useState<'create' | 'update'>('create');
    const [sonuc, setSonuc] = useState<unknown>();

    return (
      <>
        <Note>
          Yazarken hata gösterilmez; alandan çıkınca gösterilir; düzeltince anında kalkar. Kaydet her zaman aktiftir:
          geçersizse ilk hatalı alana odaklanılır. Kod alanı <code>readOnlyOn="update"</code>: Düzenle'de kilitlenir.
        </Note>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => { form.clear(); setMode('create'); setSonuc(undefined); }}>
            Ekle (clear)
          </Button>
          <Button variant="outlined" onClick={() => { form.load(ornekKayit); setMode('update'); setSonuc(undefined); }}>
            Düzenle (load)
          </Button>
          <ToggleButtonGroup size="small" exclusive value={mode} onChange={(_, m) => m && setMode(m)}>
            <ToggleButton value="create">create</ToggleButton>
            <ToggleButton value="update">update</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Card>
          <CxForm form={form} mode={mode} onSubmit={async (v) => { await wait(600); setSonuc(v); }}>
            <CxTextField name="kod" label="Kullanıcı Kodu" required maxLength={10} transform="upper" readOnlyOn="update" col={4} />
            <CxTextField name="ad" label="Ad Soyad" required minLength={2} transform="trim" col={8} />
            <CxTextField name="ePosta" label="E-posta" kind="email" col={6} />
            <CxTextField name="telefon" label="Telefon" kind="phone" col={6} />
            <CxTextField name="aciklama" label="Açıklama" multiline rows={3} maxLength={200} />
            <KaydetButonu />
          </CxForm>
          <Result value={sonuc} />
        </Card>
      </>
    );
  },
};

function KaydetButonu({ label = 'Kaydet' }: { label?: string }) {
  const form = useCxFormContext();
  const sending = form.formState.isSubmitting;
  return (
    <Stack direction="row" sx={{ mt: 1, width: '100%', justifyContent: 'flex-end' }}>
      <Button type="submit" variant="contained" loading={sending}>
        {label}
      </Button>
    </Stack>
  );
}

/** Koşullu alan + async onBlur. Vergi No: 1234567890 → bulunur, başka 10 hane → bulunamaz. */
export const KosulluVeOnBlur: Story = {
  name: 'Koşullu alan ve async onBlur',
  render: function Render() {
    const form = useCxForm();
    const [sonuc, setSonuc] = useState<unknown>();
    return (
      <>
        <Note>
          Ad alanına <b>Kurum</b> yazın: Vergi No ve Ünvan görünür (zorunlu). Gizliyken validasyona ve gönderilen
          değerlere girmez. Vergi No alandan çıkınca, yalnızca geçerliyse sorgulanır (1 sn). <code>1234567890</code>{' '}
          ünvanı doldurur, diğerleri hata verir.
        </Note>
        <Card>
          <CxForm form={form} onSubmit={setSonuc}>
            <CxTextField name="ad" label="Müşteri Tipi (Kurum / Bireysel)" required col={4} />
            <KurumsalAlanlar />
            <KaydetButonu />
          </CxForm>
          <Result value={sonuc} />
        </Card>
      </>
    );
  },
};

function KurumsalAlanlar() {
  const form = useCxFormContext();
  const tip = useCxWatch<{ ad: string }>('ad');
  if (tip?.trim().toLocaleLowerCase('tr') !== 'kurum') return null;
  return (
    <>
      <CxTextField
        name="vergiNo"
        label="Vergi No"
        required
        minLength={10}
        maxLength={10}
        col={4}
        onBlur={async () => {
          await wait(1000);
          if (form.getValues('vergiNo') !== '1234567890') {
            form.setError('vergiNo', 'Vergi numarası bulunamadı');
            return;
          }
          form.setValue('unvan', 'Örnek Teknoloji A.Ş.');
        }}
      />
      <CxTextField name="unvan" label="Ünvan" required col={4} />
    </>
  );
}

/** Sekmeler: tüm sekmeler mount kalır, gizli sekmedeki hata başlıkta sayılır, gönderimde o sekmeye geçilir. */
export const Sekmeler: Story = {
  render: function Render() {
    const form = useCxForm();
    const [sonuc, setSonuc] = useState<unknown>();
    return (
      <>
        <Note>Hiçbir şey doldurmadan Kaydet'e basın: İletişim sekmesindeki hata başlıkta sayılır ve o sekmeye geçilir.</Note>
        <Card>
          <CxForm form={form} onSubmit={setSonuc}>
            <CxFormTabs>
              <CxFormTab id="genel" title="Genel">
                <CxTextField name="ad" label="Ad Soyad" col={6} />
                <CxTextField name="unvan" label="Ünvan" col={6} />
              </CxFormTab>
              <CxFormTab id="iletisim" title="İletişim">
                <CxTextField name="ePosta" label="E-posta" kind="email" required col={6} />
                <CxTextField name="telefon" label="Telefon" kind="phone" required col={6} />
              </CxFormTab>
            </CxFormTabs>
            <CxFormSection title="Notlar">
              <CxTextField name="not" label="Not" multiline />
            </CxFormSection>
            <KaydetButonu />
          </CxForm>
          <Result value={sonuc} />
        </Card>
      </>
    );
  },
};

/** Sunucu alan hatası: create FieldError fırlatırsa mesaj ilgili alanın altına yazılır. */
export const SunucuHatasi: Story = {
  name: 'Sunucu alan hatası (FieldError)',
  render: function Render() {
    const form = useCxForm<{ kod: string; ad: string }>();
    const [sonuc, setSonuc] = useState<unknown>();
    return (
      <>
        <Note>
          Kod olarak <b>ADMIN</b> girin: sunucu "Bu kod kullanılıyor" der ve mesaj Kod alanının altına yazılır. Alanı
          değiştirince kalkar.
        </Note>
        <Card maxWidth={600}>
          <CxForm
            form={form}
            onSubmit={async (v) => {
              await wait(500);
              if (v.kod === 'ADMIN') throw new FieldError({ kod: 'Bu kod kullanılıyor' });
              setSonuc(v);
            }}
          >
            <CxTextField name="kod" label="Kod" required transform="upper" col={6} />
            <CxTextField name="ad" label="Ad" required col={6} />
            <KaydetButonu />
          </CxForm>
          <Result value={sonuc} />
        </Card>
      </>
    );
  },
};

/** Grid: col sayı ise md anlamına gelir; verilmezse tam satır. Pencereyi daraltın. */
export const Yerlesim: Story = {
  name: 'Yerleşim (col)',
  render: function Render() {
    const form = useCxForm();
    return (
      <Card>
        <CxForm form={form} requiredLegend={false}>
          <CxTextField name="a" label="col={12} (varsayılan)" />
          <CxTextField name="b" label="col={6}" col={6} />
          <CxTextField name="c" label="col={6}" col={6} />
          <CxTextField name="d" label="col={4}" col={4} />
          <CxTextField name="e" label="col={4}" col={4} />
          <CxTextField name="f" label="col={4}" col={4} />
          <CxTextField name="g" label="col={{ md: 6, lg: 3 }}" col={{ md: 6, lg: 3 }} />
          <CxTextField name="h" label="col={{ md: 6, lg: 9 }}" col={{ md: 6, lg: 9 }} />
        </CxForm>
      </Card>
    );
  },
};
