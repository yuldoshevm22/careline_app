'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { getClient } from '@/actions/clients';
import { OPERATION_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { formatMoney, formatDate } from '@/lib/utils';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { XCircle, Smartphone, MessageSquare, Package } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showBackButton, hideBackButton } = useTelegram();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    showBackButton(() => router.back());
    return () => hideBackButton();
  }, [showBackButton, hideBackButton, router]);

  useEffect(() => {
    if (params.id) {
      getClient(params.id as string)
        .then(setClient)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!client) return (
    <div className="empty-state">
      <div className="empty-state__icon"><XCircle size={48} color="var(--danger)" /></div>
      <div className="empty-state__title">Клиент не найден</div>
    </div>
  );

  const typeStyles: Record<string, string> = {
    SALE: 'op-card__type--sale',
    CLIENT_PAYMENT: 'op-card__type--payment',
    CASH_EXPENSE: 'op-card__type--expense',
  };

  return (
    <>
      <div className="page__header">
        <h1 className="page__title">{client.name}</h1>
        {client.phone && <p className="page__subtitle" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Smartphone size={16} /> {client.phone}</p>}
      </div>

      <div className="page__content">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LiquidGlassCard elevated className="mb-4">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Баланс</div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: Number(client.balance) < 0 ? 'var(--danger)' : 'var(--success)',
              }}>
                <AnimatedNumber value={Number(client.balance)} suffix="сум" />
              </div>
              {client.comment && (
                <div style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                  <MessageSquare size={16} /> {client.comment}
                </div>
              )}
            </div>
          </LiquidGlassCard>
        </motion.div>

        {/* Operations History */}
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          История операций
        </h2>

        {client.operations?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">Нет операций</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {client.operations?.map((op: any, i: number) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <LiquidGlassCard className="op-card">
                  <div className="op-card__header">
                    <span className={`op-card__type ${typeStyles[op.type] || ''}`}>
                      {OPERATION_LABELS[op.type]}
                    </span>
                    <span className="op-card__amount">{formatMoney(op.totalAmount)}</span>
                  </div>
                  {op.items?.length > 0 && (
                    <div className="op-card__details">
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 4 }}><Package size={14} style={{ marginTop: 2 }} /> {op.items.map((item: any) => `${item.product.name} ×${item.quantity}`).join(', ')}</span>
                    </div>
                  )}
                  {op.comment && <div className="op-card__details"><span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 4 }}><MessageSquare size={14} style={{ marginTop: 2 }} /> {op.comment}</span></div>}
                  <div className="op-card__date">{formatDate(op.createdAt)}</div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
