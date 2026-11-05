/**
 * ÖRNEK — Ekran kayıt listesi (uygulamada bir kez).
 * CxScreenHost aktif route'tan ekran kodunu buradan bulur.
 */
import { defineScreens } from '@cx/core';

export const screens = defineScreens({
  USRTDEPT: { path: '/departmanlar', title: 'screens.USRTDEPT', load: () => import('./screens/USRTDEPT') },
  USRTKULA: { path: '/kullanicilar', title: 'screens.USRTKULA', load: () => import('./screens/USRTKULA') },
  // ...
});
