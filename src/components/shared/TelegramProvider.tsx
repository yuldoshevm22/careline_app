'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  colorScheme: 'light' | 'dark';
  isReady: boolean;
  haptic: {
    impact: (style?: 'light' | 'medium' | 'heavy') => void;
    notification: (type: 'success' | 'error' | 'warning') => void;
    selection: () => void;
  };
  showBackButton: (onBack: () => void) => void;
  hideBackButton: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  colorScheme: 'light',
  isReady: false,
  haptic: {
    impact: () => {},
    notification: () => {},
    selection: () => {},
  },
  showBackButton: () => {},
  hideBackButton: () => {},
});

export function useTelegram() {
  return useContext(TelegramContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      setWebApp(tg);
      setIsReady(true);

      // Apply Telegram theme to CSS variables
      const cs = tg.colorScheme;
      document.documentElement.setAttribute('data-theme', cs);
    } else {
      // Dev mode — no Telegram
      setIsReady(true);
    }
  }, []);

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: 'success' | 'error' | 'warning') => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback?.selectionChanged();
    },
  };

  const showBackButton = useCallback((onBack: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onBack);
    }
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  }, [webApp]);

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user: webApp?.initDataUnsafe?.user || null,
        colorScheme: webApp?.colorScheme || 'light',
        isReady,
        haptic,
        showBackButton,
        hideBackButton,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
