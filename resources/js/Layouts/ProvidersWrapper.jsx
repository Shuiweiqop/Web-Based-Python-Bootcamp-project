import React from 'react';
import { SFXProvider } from '@/Contexts/SFXContext';
import { MusicProvider } from '@/Contexts/MusicContext';
import { EquipProvider } from '@/Contexts/EquipContext';
import { NotificationsProvider } from '@/Contexts/NotificationsContext'; // ✅ 新增

export default function ProvidersWrapper({ children }) {
  return (
    <SFXProvider>
      <MusicProvider>
        <EquipProvider>
          <NotificationsProvider> {/* ✅ 新增 */}
            {children}
          </NotificationsProvider>
        </EquipProvider>
      </MusicProvider>
    </SFXProvider>
  );
}