'use client';

import { TelegramProvider } from '@/components/shared/TelegramProvider';
import { AuthProvider } from '@/components/shared/AuthProvider';
import { LanguageProvider } from '@/components/shared/LanguageContext';
import BottomNav from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TelegramProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="page">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
      </LanguageProvider>
    </TelegramProvider>
  );
}
