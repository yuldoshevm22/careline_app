'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LiquidGlassModal from '@/components/ui/LiquidGlassModal';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getProducts, createProduct, deleteProduct } from '@/actions/catalogs';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { useTranslation } from '@/components/shared/LanguageContext';
import { formatMoney } from '@/lib/utils';
import type { Product } from '@/types';
import { Package, Ruler, Wallet } from 'lucide-react';

export default function ProductsPage() {
  const { haptic } = useTelegram();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  
  // Form state
  const [name, setName] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const res = await createProduct({ 
      name: name.trim(), 
      dimensions: dimensions.trim() || undefined,
      defaultPrice: Number(defaultPrice) || 0
    });
    
    if (res.success && res.data) {
      setProducts((prev) => [...prev, res.data]);
      setShowModal(false);
      setName('');
      setDimensions('');
      setDefaultPrice('');
      haptic.notification('success');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      haptic.notification('success');
    }
  };

  return (
    <>
      <div className="page__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page__title">{t('nav_products')}</h1>
          <LiquidGlassButton size="sm" variant="primary" onClick={() => setShowModal(true)}>
            {t('clients_new')}
          </LiquidGlassButton>
        </div>
      </div>

      <div className="page__content">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><Package size={48} color="var(--text-tertiary)" /></div>
            <div className="empty-state__title">{t('prod_empty')}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <LiquidGlassCard>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                        {product.dimensions && <span style={{ marginRight: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ruler size={14} /> {product.dimensions}</span>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Wallet size={14} /> {formatMoney(product.defaultPrice)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.813rem' }}
                    >
                      {t('btn_delete')}
                    </button>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <LiquidGlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t('modal_new_product')}
        footer={<LiquidGlassButton variant="primary" fullWidth onClick={handleCreate} disabled={!name.trim()}>{t('modal_create')}</LiquidGlassButton>}
      >
        <div className="form-group">
          <LiquidGlassInput label={t('modal_name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('prod_name_ph')} />
        </div>
        <div className="form-group">
          <LiquidGlassInput label={t('prod_dim')} value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder={t('prod_dim_ph')} />
        </div>
        <div className="form-group">
          <LiquidGlassInput label={t('prod_price')} type="number" min={0} value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} placeholder="0" />
        </div>
      </LiquidGlassModal>
    </>
  );
}
