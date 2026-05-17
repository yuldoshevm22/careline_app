'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CreateClientModal from '@/components/clients/CreateClientModal';
import { getClients } from '@/actions/clients';
import { formatMoney } from '@/lib/utils';
import type { Client } from '@/types';
import { Search, Users, Smartphone } from 'lucide-react';
import { useTranslation } from '@/components/shared/LanguageContext';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const load = async (q?: string) => {
    try {
      const data = await getClients(q || undefined);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <div className="page__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page__title">{t('nav_clients')}</h1>
          <LiquidGlassButton size="sm" variant="primary" onClick={() => setShowModal(true)}>
            {t('clients_new')}
          </LiquidGlassButton>
        </div>
      </div>

      <div className="page__content">
        <div className="glass-search mb-4">
          <input
            className="glass-search__input"
            placeholder={t('sale_search_client')}
            icon={<Search size={18} color="var(--text-secondary)" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><Users size={48} color="var(--text-tertiary)" /></div>
            <div className="empty-state__title">{t('clients_empty')}</div>
            <div className="empty-state__text">{t('clients_empty_sub')}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <LiquidGlassCard
                  interactive
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{client.name}</div>
                      {client.phone && (
                        <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          <Smartphone size={14} style={{ marginRight: 4 }} /> {client.phone}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: Number(client.balance) < 0 ? 'var(--danger)' : Number(client.balance) > 0 ? 'var(--success)' : 'var(--text-secondary)',
                      }}>
                        {formatMoney(client.balance)}
                      </div>
                      <span className={`badge ${Number(client.balance) < 0 ? 'badge--danger' : 'badge--success'}`}>
                        {Number(client.balance) < 0 ? t('clients_debt') : t('clients_balance')}
                      </span>
                    </div>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(c) => { setClients((prev) => [c, ...prev]); setShowModal(false); }}
      />
    </>
  );
}
