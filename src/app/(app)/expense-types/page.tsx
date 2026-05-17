'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LiquidGlassModal from '@/components/ui/LiquidGlassModal';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getExpenseTypes, createExpenseType } from '@/actions/catalogs';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { useTranslation } from '@/components/shared/LanguageContext';
import type { ExpenseType } from '@/types';
import { Folder } from 'lucide-react';

export default function ExpenseTypesPage() {
  const { haptic } = useTelegram();
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    getExpenseTypes()
      .then(setTypes)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const res = await createExpenseType({ name: name.trim() });
    
    if (res.success && res.data) {
      setTypes((prev) => [...prev, res.data]);
      setShowModal(false);
      setName('');
      haptic.notification('success');
    }
  };

  return (
    <>
      <div className="page__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page__title">{t('nav_exp_types')}</h1>
          <LiquidGlassButton size="sm" variant="primary" onClick={() => setShowModal(true)}>
            {t('clients_new')}
          </LiquidGlassButton>
        </div>
      </div>

      <div className="page__content">
        {loading ? (
          <LoadingSpinner />
        ) : types.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><Folder size={48} color="var(--text-tertiary)" /></div>
            <div className="empty-state__title">{t('exp_type_empty')}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {types.map((type, i) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <LiquidGlassCard>
                  <div style={{ fontWeight: 600 }}>{type.name}</div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <LiquidGlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t('modal_new_exp_type')}
        footer={<LiquidGlassButton variant="primary" fullWidth onClick={handleCreate} disabled={!name.trim()}>{t('modal_create')}</LiquidGlassButton>}
      >
        <div className="form-group">
          <LiquidGlassInput label={t('modal_name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('modal_title_placeholder')} />
        </div>
      </LiquidGlassModal>
    </>
  );
}
