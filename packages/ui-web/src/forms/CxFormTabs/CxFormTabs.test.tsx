import { useCxForm } from '@cx/core';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CxTextField } from '../../inputs/CxTextField';
import { initI18n, submit, wrap } from '../../test/utils';
import { CxForm } from '../CxForm';
import { CxFormTab, CxFormTabs } from './CxFormTabs';

beforeAll(initI18n);
afterEach(cleanup);

describe('CxFormTabs', () => {
  it('gizli sekmedeki hata sayısını gösterir ve gönderimde o sekmeye geçer', async () => {
    function Host() {
      const form = useCxForm();
      return (
        <CxForm form={form} onSubmit={() => {}}>
          <CxFormTabs>
            <CxFormTab id="genel" title="Genel">
              <CxTextField name="ad" label="Ad" />
            </CxFormTab>
            <CxFormTab id="iletisim" title="İletişim">
              <CxTextField name="ePosta" label="E-posta" required />
            </CxFormTab>
          </CxFormTabs>
        </CxForm>
      );
    }
    wrap(<Host />);
    const panels = () => screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels()[1]!.hidden).toBe(true);

    await submit();
    expect(screen.getByLabelText('1 hata')).toBeTruthy();
    await waitFor(() => expect(panels()[1]!.hidden).toBe(false));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/^E-posta/)));
  });
});
