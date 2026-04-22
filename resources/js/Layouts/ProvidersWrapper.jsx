import React from 'react';
import { MusicProvider } from '@/Contexts/MusicContext';
import { EquipProvider } from '@/Contexts/EquipContext';
import { NotificationsProvider } from '@/Contexts/NotificationsContext';

export default function ProvidersWrapper({ children }) {
  return (
    <MusicProvider>
      <EquipProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </EquipProvider>
    </MusicProvider>
  );
}
