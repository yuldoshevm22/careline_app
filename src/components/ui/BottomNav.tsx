'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, PlusCircle, Users, ClipboardList, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/components/shared/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const tabs = [
    { path: '/dashboard', label: t('nav_home'), icon: <Home size={20} /> },
    { path: '/operations', label: t('nav_operations'), icon: <PlusCircle size={20} /> },
    { path: '/clients', label: t('nav_clients'), icon: <Users size={20} /> },
    { path: '/history', label: t('nav_history'), icon: <ClipboardList size={20} /> },
    { path: '/reports', label: t('nav_reports'), icon: <BarChart3 size={20} /> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || pathname?.startsWith(tab.path + '/');
        return (
          <motion.button
            key={tab.path}
            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
            onClick={() => router.push(tab.path)}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              className="bottom-nav__icon"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              animate={isActive ? { scale: 1.15, y: -2, color: 'var(--primary)' } : { scale: 1, y: 0, color: 'var(--text-secondary)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {tab.icon}
            </motion.span>
            <span className="bottom-nav__label">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: '2px',
                  background: 'var(--primary)',
                  borderRadius: '0 0 2px 2px',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
