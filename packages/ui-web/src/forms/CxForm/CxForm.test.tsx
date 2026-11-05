import { FieldError, useCxForm, useCxWatch, type CxFormApi } from '@cx/core';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CxTextField } from '../../inputs/CxTextField';
import { i18n, initI18n, submit, wrap } from '../../test/utils';
import { CxForm } from './CxForm';

beforeAll(initI18n);
afterEach(cleanup);

type Kullanici = { kod: string; ad: string; ePosta: string };

function KullaniciHost(props: {
  mode?: 'create' | 'update';
  onSubmit?: (v: Kullanici) => unknown;
  formRef?: (f: CxFormApi<Kullanici>) => void;
  children?: ReactNode;
}) {
  const form = useCxForm<Kullanici>();
  props.formRef?.(form);
  return (
    <CxForm form={form} mode={props.mode} onSubmit={props.onSubmit ?? (() => {})}>
      <CxTextField name="kod" label="Kod" required readOnlyOn="update" col={6} />
      <CxTextField name="ad" label="Ad" required minLength={2} col={6} />
      <CxTextField name="ePosta" label="E-posta" kind="email" />
      {props.children}
    </CxForm>
  );
}

describe('CxForm · bağlı alanlar', () => {
  it('yazarken hata göstermez, alandan çıkınca gösterir, düzeltince kalkar', async () => {
    wrap(<KullaniciHost />);
    const ad = screen.getByLabelText(/^Ad/);
    await userEvent.type(ad, 'A');
    expect(screen.queryByText(/en az 2 karakter/)).toBeNull();
    await userEvent.tab();
    expect(await screen.findByText('Ad en az 2 karakter olmalıdır')).toBeTruthy();
    await userEvent.type(ad, 'li');
    await waitFor(() => expect(screen.queryByText(/en az 2 karakter/)).toBeNull());
  });

  it('geçersiz gönderimde onSubmit çağrılmaz, ilk hatalı alana odaklanılır', async () => {
    const onSubmit = vi.fn();
    wrap(<KullaniciHost onSubmit={onSubmit} />);
    await submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Kod zorunludur')).toBeTruthy();
    expect(screen.getByText('Ad zorunludur')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/^Kod/)));
  });

  it('geçerli gönderimde dönüştürülmüş değerleri verir', async () => {
    const onSubmit = vi.fn();
    wrap(<KullaniciHost onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/^Kod/), 'k1');
    await userEvent.type(screen.getByLabelText(/^Ad/), 'Ali');
    await userEvent.type(screen.getByLabelText('E-posta'), 'Ali@Ornek.com');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ kod: 'k1', ad: 'Ali', ePosta: 'ali@ornek.com' });
  });

  it('zorunlu alanlarda * ve formun başında açıklama satırı görünür', () => {
    wrap(<KullaniciHost />);
    expect(screen.getByText('* ile işaretli alanlar zorunludur')).toBeTruthy();
    expect(screen.getByLabelText(/^Kod/).hasAttribute('required')).toBe(true);
    expect(screen.getByLabelText('E-posta').hasAttribute('required')).toBe(false);
  });

  it("update modunda readOnlyOn alanı kilitlenir ve * gösterilmez", () => {
    wrap(<KullaniciHost mode="update" />);
    const kod = screen.getByLabelText(/^Kod/);
    expect(kod.hasAttribute('readonly')).toBe(true);
    expect(kod.hasAttribute('required')).toBe(false);
  });

  it('clear() tüm alanları boşaltır ve hataları siler (Ekle)', async () => {
    let form!: CxFormApi<Kullanici>;
    wrap(<KullaniciHost formRef={(f) => (form = f)} />);
    await act(async () => form.load({ kod: 'K1', ad: 'Ali', ePosta: 'a@b.co' }));
    expect(screen.getByLabelText(/^Kod/)).toHaveProperty('value', 'K1');
    await submit();
    await act(async () => form.setError('ad', 'Sunucu hatası'));
    expect(screen.getByText('Sunucu hatası')).toBeTruthy();

    await act(async () => form.clear());
    expect(screen.getByLabelText(/^Kod/)).toHaveProperty('value', '');
    expect(screen.getByLabelText(/^Ad/)).toHaveProperty('value', '');
    expect(screen.queryByText('Sunucu hatası')).toBeNull();
    expect(form.formState.isDirty).toBe(false);
  });

  it('FieldError mesajı ilgili alanın altına yazılır', async () => {
    wrap(
      <KullaniciHost
        onSubmit={() => {
          throw new FieldError({ kod: 'Bu kod kullanılıyor' });
        }}
      />,
    );
    await userEvent.type(screen.getByLabelText(/^Kod/), 'k1');
    await userEvent.type(screen.getByLabelText(/^Ad/), 'Ali');
    await submit();
    expect(await screen.findByText('Bu kod kullanılıyor')).toBeTruthy();
  });

  it('koşullu gizlenen alan validasyona ve değerlere girmez', async () => {
    const onSubmit = vi.fn();
    function Kosullu() {
      const ad = useCxWatch<Kullanici>('ad');
      return ad === 'Kurum' ? <CxTextField name="vergiNo" label="Vergi No" required /> : null;
    }
    wrap(
      <KullaniciHost onSubmit={onSubmit}>
        <Kosullu />
      </KullaniciHost>,
    );
    await userEvent.type(screen.getByLabelText(/^Kod/), 'k1');
    await userEvent.type(screen.getByLabelText(/^Ad/), 'Ali');
    await submit();
    expect(onSubmit).toHaveBeenLastCalledWith({ kod: 'k1', ad: 'Ali', ePosta: '' });

    await userEvent.clear(screen.getByLabelText(/^Ad/));
    await userEvent.type(screen.getByLabelText(/^Ad/), 'Kurum');
    await submit();
    expect(screen.getByText('Vergi No zorunludur')).toBeTruthy();
  });

  it('onBlur yalnızca alan geçerliyse çalışır; Promise dönerse alan meşgul görünür', async () => {
    let resolve!: () => void;
    const onBlur = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    function Host() {
      const form = useCxForm();
      return (
        <CxForm form={form}>
          <CxTextField name="vergiNo" label="Vergi No" maxLength={10} minLength={10} onBlur={onBlur} />
        </CxForm>
      );
    }
    wrap(<Host />);
    const input = screen.getByLabelText('Vergi No');
    await userEvent.type(input, '123');
    await userEvent.tab();
    await waitFor(() => expect(screen.getByText(/en az 10 karakter/)).toBeTruthy());
    expect(onBlur).not.toHaveBeenCalled();

    await userEvent.type(input, '4567890');
    await userEvent.tab();
    await waitFor(() => expect(onBlur).toHaveBeenCalledTimes(1));
    expect(input.getAttribute('aria-busy')).toBe('true');
    await act(async () => resolve());
    await waitFor(() => expect(input.getAttribute('aria-busy')).toBeNull());
  });

  it('dil değişince mesajlar da değişir', async () => {
    wrap(<KullaniciHost />);
    await act(() => i18n.changeLanguage('en'));
    await submit();
    expect(await screen.findByText('Kod is required')).toBeTruthy();
    await act(() => i18n.changeLanguage('tr'));
  });
});
