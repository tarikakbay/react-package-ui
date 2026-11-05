import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { initI18n, wrap } from '../../test/utils';
import { CxTextField } from './CxTextField';

beforeAll(initI18n);
afterEach(cleanup);

describe('CxTextField · tek başına', () => {
  it('onChange değerin kendisini döner ve dönüşüm uygular', async () => {
    const onChange = vi.fn();
    function Host() {
      const [v, setV] = useState('');
      return <CxTextField label="Kod" value={v} transform="upper" onChange={(x) => { onChange(x); setV(x); }} />;
    }
    wrap(<Host />);
    await userEvent.type(screen.getByLabelText('Kod'), 'ab');
    expect(onChange).toHaveBeenLastCalledWith('AB');
    expect(screen.getByLabelText('Kod')).toHaveProperty('value', 'AB');
  });

  it('hata mesajını helperText yerine gösterir ve alanı geçersiz işaretler', () => {
    wrap(<CxTextField label="Ad" value="" onChange={() => {}} helperText="Yardım" error="Ad zorunludur" />);
    expect(screen.getByText('Ad zorunludur')).toBeTruthy();
    expect(screen.queryByText('Yardım')).toBeNull();
    expect(screen.getByLabelText('Ad').getAttribute('aria-invalid')).toBe('true');
  });

  it('şifre alanında göster/gizle butonu çalışır', async () => {
    wrap(<CxTextField label="Şifre" kind="password" value="gizli" onChange={() => {}} />);
    const input = screen.getByLabelText('Şifre');
    expect(input.getAttribute('type')).toBe('password');
    await userEvent.click(screen.getByRole('button', { name: 'Şifreyi göster' }));
    expect(input.getAttribute('type')).toBe('text');
  });
});
