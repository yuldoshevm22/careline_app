'use client';

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getDashboardStats } from '@/actions/reports';
import { Wallet, CreditCard, ArrowUpRight, Users, Globe } from 'lucide-react';
import { useTranslation } from '@/components/shared/LanguageContext';

interface Stats {
  today: {
    sales: { total: number; count: number };
    payments: { total: number; count: number };
    expenses: { total: number; count: number };
  };
  month: { sales: number; payments: number; expenses: number };
  clients: number;
  totalDebt: number;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'uz' : 'ru');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="page__header" style={{ position: 'relative' }}>
        <div>
          <div style={{ marginBottom: 4 }}>
            <img src="/careline_logo.png" alt="CareLine" style={{ height: 80, width: 'auto', display: 'block' }} />
          </div>
          <p className="page__subtitle">Управление операциями</p>
        </div>

        <button
          onClick={toggleLanguage}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid var(--glass-border)',
            padding: '6px 12px',
            borderRadius: 20,
            color: 'var(--text-primary)',
            fontSize: '0.813rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
          }}
        >
          <Globe size={14} />
          {language === 'ru' ? 'UZ' : 'RU'}
        </button>
      </div>

      <motion.div
        className="page__content"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Today Summary */}
        <motion.div variants={item}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('dashboard_today')}
          </h2>
        </motion.div>

        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <LiquidGlassCard elevated>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Wallet size={14} /> {t('dashboard_sales')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              <AnimatedNumber value={stats?.today.sales.total || 0} suffix="сум" />
            </div>
            <div style={{ fontSize: '0.688rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {stats?.today.sales.count || 0} {t('dashboard_operations')}
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard elevated>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CreditCard size={14} /> {t('dashboard_payments')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
              <AnimatedNumber value={stats?.today.payments.total || 0} suffix="сум" />
            </div>
            <div style={{ fontSize: '0.688rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {stats?.today.payments.count || 0} {t('dashboard_operations')}
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div variants={item} style={{ marginBottom: 20 }}>
          <LiquidGlassCard elevated>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><ArrowUpRight size={14} /> {t('dashboard_expenses')} {t('dashboard_today').toLowerCase()}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>
                  <AnimatedNumber value={stats?.today.expenses.total || 0} suffix="сум" />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {t('nav_clients')}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats?.clients || 0}</div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        {/* Month Summary */}
        <motion.div variants={item}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('rep_cash_month')}
          </h2>
        </motion.div>

        <motion.div variants={item}>
          <LiquidGlassCard elevated className="glass-card--elevated">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('dashboard_sales')}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                  <AnimatedNumber value={stats?.month.sales || 0} suffix="сум" />
                </span>
              </div>
              <div style={{ height: 1, background: 'var(--glass-border-subtle)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('dashboard_payments')}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>
                  <AnimatedNumber value={stats?.month.payments || 0} suffix="сум" />
                </span>
              </div>
              <div style={{ height: 1, background: 'var(--glass-border-subtle)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('dashboard_expenses')}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--danger)' }}>
                  <AnimatedNumber value={stats?.month.expenses || 0} suffix="сум" />
                </span>
              </div>
              <div style={{ height: 1, background: 'var(--glass-border-subtle)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('rep_debt')}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--warning)' }}>
                  <AnimatedNumber value={stats?.totalDebt || 0} suffix="сум" />
                </span>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </motion.div>
    </>
  );
}
