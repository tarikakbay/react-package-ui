# Cx UI

Web (MUI) ve React Native (Paper) için ortak input/form bileşenleri. Kararların tamamı proje dokümanı `kararlar.md`'de.

> Durum: **iskelet**. Bileşen tabanlı form motoru ve örnek olarak yalnızca `CxTextField` yazıldı.
> Paket scope'u (`@cx`) geçicidir; GitHub Packages scope'u belirlenince değiştirilecek.

## Yapı

```
packages/
  core/src/
    types/              ortak sözleşme: Option, ColSpan, BaseFieldProps, CxFieldComponentProps, CxFieldHandle
    fields/text/        metin alanı: types, schema (Zod), transform
    form/               form motoru: useCxForm, connectField, context, buildSchema, submit, layout (col)
    errors/             FieldError
    i18n/               tr/en kaynakları
    theme/              token'lar (light/dark)
  ui-web/src/           (MUI)
    inputs/CxTextField/       CxTextField.tsx, types.ts, index.ts, CxTextField.test.tsx
    forms/CxForm/             CxForm.tsx, types.ts, index.ts, CxForm.test.tsx
    forms/CxFormSection/
    forms/CxFormTabs/         CxFormTabs + CxFormTab, test
    layout/CxRow/  layout/CxCol/
    theme/CxThemeProvider/
    base/connectField.ts      bileşeni forma bağlanabilir yapar
    test/utils.tsx            test yardımcıları (i18n, tema, submit)
  ui-native/src/        (React Native Paper) — aynı yapı + forms/CxSubmitButton/
apps/storybook/         Storybook (web): alan ve form örnekleri, dark mode ve tr/en seçici
docs/examples/          örnek ekran, business bileşeni, layout (henüz yazılmamış API'leri de gösterir)
```

Her bileşen kendi klasöründe: `Bileşen.tsx` (uygulama), `types.ts` (props tipleri), `index.ts` (dışa aktarım), varsa `Bileşen.test.tsx`.
Yeni bir alan eklerken: core'da `fields/<tip>/` (types, schema), ui paketlerinde `inputs/Cx<Ad>/`.

## Komutlar

```bash
pnpm install
pnpm build        # tsup: ESM + CJS + .d.ts
pnpm typecheck
pnpm test         # vitest (core: şema, ui-web: bileşen + form)
pnpm changeset    # değişiklik kaydı
pnpm storybook    # Storybook: http://localhost:6006 (tema ve dil seçici üst çubukta)
pnpm build-storybook  # statik çıktı: apps/storybook/storybook-static
```

## Kullanım

### 1. i18n (uygulamada bir kez)

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { cxResources, CX_NAMESPACE } from '@cx/core';

i18n.use(initReactI18next).init({
  lng: 'tr',
  resources: {
    tr: { translation: { /* uygulama metinleri */ }, [CX_NAMESPACE]: cxResources.tr },
    en: { translation: { /* ... */ }, [CX_NAMESPACE]: cxResources.en },
  },
  interpolation: { escapeValue: false },
});
```

### 2. Form (bileşen tabanlı)

```tsx
import { CxForm, CxTextField, useCxForm } from '@cx/ui-web'; // mobil: '@cx/ui-native'

type Kullanici = { kod: string; ad: string; ePosta: string }; // isteğe bağlı

export function KullaniciFormu() {
  const form = useCxForm<Kullanici>();
  return (
    <CxForm form={form} mode="create" onSubmit={(values) => api.post(values)}>
      <CxTextField name="kod" label="Kullanıcı Kodu" required maxLength={20} transform="upper" readOnlyOn="update" col={4} />
      <CxTextField name="ad" label="Ad Soyad" required minLength={2} transform="trim" col={8} />
      <CxTextField name="ePosta" label="E-posta" kind="email" col={6} />
      <CxTextField name="telefon" label="Telefon" kind="phone" col={6} />
      <button type="submit">Kaydet</button>
    </CxForm>
  );
}
```

- `col={6}` → md'de 6 kolon (xs'te tam satır). Verilmezse tam satır. İnce ayar: `col={{ md: 6, lg: 4 }}`.
- Zorunlu alanlarda label sonunda `*`, formun başında "* ile işaretli alanlar zorunludur" görünür.
- Hata: yazarken yok → alandan çıkınca var → hata görüldükten sonra her tuşta yeniden kontrol → gönderimde tümü.
- Geçersiz gönderimde `onSubmit` çağrılmaz; ilk hatalı alana (gerekirse sekmesine) odaklanılır.
- `onSubmit` `FieldError` fırlatırsa mesajlar alanlara yazılır.
- `form.clear()` tüm alanları boşaltır (Ekle), `form.load(values)` kayıtla doldurur (Düzenle).

### 3. Koşullu alan ve olay

```tsx
function VergiAlani() {
  const form = useCxFormContext();
  const tip = useCxWatch('musteriTipi');           // alt bileşende useCxWatch
  if (tip !== 'KURUMSAL') return null;              // gizlenen alan validasyona girmez
  return (
    <CxTextField
      name="vergiNo" label="Vergi No" required minLength={10} maxLength={10} col={4}
      onBlur={async () => {                         // alan geçerliyse çalışır; sürerken alan meşgul görünür
        const firma = await api.vergiNoSorgula(form.getValues('vergiNo'));
        if (!firma) return form.setError('vergiNo', 'Vergi numarası bulunamadı');
        form.setValue('unvan', firma.unvan);
      }}
    />
  );
}
```

### 4. Bölüm ve sekme

```tsx
<CxForm form={form}>
  <CxFormTabs>
    <CxFormTab id="genel" title="Genel">…</CxFormTab>
    <CxFormTab id="iletisim" title="İletişim">…</CxFormTab>   {/* hatalıysa başlıkta hata sayısı */}
  </CxFormTabs>
  <CxFormSection title="Notlar">…</CxFormSection>
</CxForm>
```

### 5. Business bileşeni

```tsx
const TenantSecimiBase = forwardRef<CxFieldHandle, CxFieldComponentProps<Option | null>>(…);
export const TenantSecimi = connectField(TenantSecimiBase, { empty: null });

<TenantSecimi name="tenant" label="Firma" required col={6} />     // forma bağlı
<TenantSecimi label="Firma" value={f} onChange={setF} />           // tek başına
```

### 6. Tema ve dark mode

```tsx
<CxThemeProvider mode="system">…</CxThemeProvider>   // web
<CxPaperProvider mode="system">…</CxPaperProvider>   // mobil
```

Next.js'te ilk yüklemede renk kayması olmaması için `app/layout.tsx` içinde `<CxInitColorSchemeScript attribute="class" />`.

## Kurallar

- Ekranlar MUI ya da Paper'ı doğrudan import etmez, yalnızca `@cx/ui-*` paketlerini kullanır.
- `react-hook-form`'u `@cx/core`'dan import edin (`Controller`, `useWatch`, …); ayrı kopya olmasın.
- Bileşen ref'i yalnızca `focus()` / `blur()` sunar (`CxFieldHandle`). Değer okuma/yazma ref ile yapılmaz.
- Validasyon kuralları alanın props'unda; form tarafında elle validasyon yazılmaz.

## Sıradaki adımlar

- Diğer alanlar: NumberField, Checkbox, Select, RadioGroup, MultiSelect, Autocomplete, Date/Time/DateTime, TagInput, FileField
- `CxScreenHost` / `CxScreen` ekran akışı (Ekle → `clear()`, kaydedilmemiş değişiklik uyarısı)
- JSON'dan form: `CxDynamicForm` (sonraki aşama)
- Sözleşme test seti (aynı FormDef → web ve native'de aynı sonuç), ui-native testleri, Storybook
- `apps/web` (Next.js) ve `apps/mobile` (Expo) örnek uygulamaları
