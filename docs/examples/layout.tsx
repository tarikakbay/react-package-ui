/**
 * ÖRNEK — Next.js App Router: app/(screens)/layout.tsx
 * Ekranları açan wrapper. Yetki ve pasif ekran kontrolü tek yerde, uygulamanın kendi API'siyle.
 * Mobilde (Expo Router) app/(screens)/_layout.tsx içinde aynı şekilde @cx/ui-native'den kullanılır.
 */
'use client';
import { CxScreenHost, CxThemeProvider } from '@cx/ui-web';
import type { ReactNode } from 'react';
import { pMenus, pScreens } from '@/services/api';
import { useThemePreference } from '@/hooks/useThemePreference';
import { screens } from '../screens';

export default function ScreensLayout({ children }: { children: ReactNode }) {
  const mode = useThemePreference(); // 'light' | 'dark' | 'system', saklamak uygulamanın işi

  return (
    <CxThemeProvider mode={mode}>
      <CxScreenHost
        screens={screens}
        // Eski DsTForm'daki kullaniciEkraniGizle'nin karşılığı
        authorize={async (code) => {
          const ekran = (await new pScreens().get(code)).body[0];
          if (!ekran) return { allowed: false, reason: 'forbidden' };
          if (ekran.isPassive) return { allowed: false, reason: 'passive' };
          const yetkili = (await new pMenus().get(false, true, code)).body.length > 0;
          return yetkili ? { allowed: true } : { allowed: false, reason: 'forbidden' };
        }}
      >
        {children}
      </CxScreenHost>
    </CxThemeProvider>
  );
}
