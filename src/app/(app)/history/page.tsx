'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassSelect from '@/components/ui/LiquidGlassSelect';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LiquidGlassDatePicker from '@/components/ui/LiquidGlassDatePicker';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getOperations } from '@/actions/operations';
import { OPERATION_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { formatMoney, formatDate } from '@/lib/utils';
import { ClipboardList, User, HardHat, Folder, CreditCard, Package, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/components/shared/LanguageContext';

interface Operation {
  id: string;
  type: string;
  totalAmount: number;
  client?: { name: string };
  employee?: { fullName: string };
  expenseType?: { name: string };
  paymentMethod?: string;
  comment?: string;
  items?: { product: { name: string; dimensions?: string }; quantity: number; price: number; total: number }[];
  createdAt: string;
}

export default function HistoryPage() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { t } = useTranslation();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOperations({
        type: type || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setOperations(res.operations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [type, dateFrom, dateTo]);

  const typeStyles: Record<string, string> = {
    SALE: 'op-card__type--sale',
    CLIENT_PAYMENT: 'op-card__type--payment',
    CASH_EXPENSE: 'op-card__type--expense',
  };

  return (
    <>
      <div className="page__header">
        <h1 className="page__title">{t('nav_history')}</h1>
        <p className="page__subtitle">{t('rep_all_ops')}</p>
      </div>

      <div className="page__content">
        {/* Filters */}
        <LiquidGlassCard className="mb-4">
          <div className="form-row" style={{ marginBottom: 10 }}>
            <LiquidGlassDatePicker label={t('rep_from')} value={dateFrom} onChange={(val) => setDateFrom(val)} />
            <LiquidGlassDatePicker label={t('rep_to')} value={dateTo} onChange={(val) => setDateTo(val)} />
          </div>
          <LiquidGlassSelect
            label={t('exp_type')}
            options={[
              { value: '', label: t('rep_all_ops') },
              { value: 'SALE', label: t('rep_only_sales') },
              { value: 'CLIENT_PAYMENT', label: t('rep_only_payments') },
              { value: 'CASH_EXPENSE', label: t('rep_only_expenses') },
            ]}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </LiquidGlassCard>

        {loading ? (
          <LoadingSpinner />
        ) : operations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><ClipboardList size={48} color="var(--text-tertiary)" /></div>
            <div className="empty-state__title">{t('history_empty')}</div>
            <div className="empty-state__text">{t('history_empty_sub')}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {operations.map((op, i) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <LiquidGlassCard className="op-card">
                  <div className="op-card__header">
                    <span className={`op-card__type ${typeStyles[op.type] || ''}`}>
                      {OPERATION_LABELS[op.type] || op.type}
                    </span>
                    <span className="op-card__amount">
                      {formatMoney(op.totalAmount)}
                    </span>
                  </div>

                  <div className="op-card__details">
                    {op.client && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User size={14} /> {op.client.name}</span>}
                    {op.employee && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><HardHat size={14} /> {op.employee.fullName}</span>}
                    {op.expenseType && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Folder size={14} /> {op.expenseType.name}</span>}
                    {op.paymentMethod && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CreditCard size={14} /> {PAYMENT_METHOD_LABELS[op.paymentMethod]}</span>}
                    {op.items && op.items.length > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 4 }}>
                        <Package size={14} style={{ marginTop: 2 }} /> {op.items.map((item) =>
                          `${item.product.name}${item.product.dimensions ? ' ' + item.product.dimensions : ''} ×${item.quantity}`
                        ).join(', ')}
                      </span>
                    )}
                    {op.comment && <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 4 }}><MessageSquare size={14} style={{ marginTop: 2 }} /> {op.comment}</span>}
                  </div>

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
