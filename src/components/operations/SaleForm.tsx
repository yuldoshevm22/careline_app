'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LiquidGlassSelect from '@/components/ui/LiquidGlassSelect';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import CreateClientModal from '@/components/clients/CreateClientModal';
import { getClients } from '@/actions/clients';
import { getProducts } from '@/actions/catalogs';
import { createSale } from '@/actions/operations';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { useTranslation } from '@/components/shared/LanguageContext';
import type { Client, Product } from '@/types';

interface SaleItem {
  productId: string;
  quantity: number | string;
  price: number | string;
}

export default function SaleForm() {
  const { haptic } = useTelegram();
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SaleItem[]>([{ productId: '', quantity: 1, price: 0 }]);
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [comment, setComment] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts);
    getClients().then(setClients);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch) getClients(clientSearch).then(setClients);
      else getClients().then(setClients);
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch]);

  const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    haptic.impact('light');
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      haptic.impact('light');
    }
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const updated = [...items];
    if (field === 'productId') {
      updated[index].productId = value as string;
      const product = products.find((p) => p.id === value);
      if (product) updated[index].price = product.defaultPrice;
    } else if (field === 'quantity') {
      updated[index].quantity = value === '' ? '' : Number(value);
    } else if (field === 'price') {
      updated[index].price = value === '' ? '' : Number(value);
    }
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!clientId || items.some((i) => !i.productId)) return;
    setLoading(true);
    try {
      const formattedItems = items.map(i => ({
        ...i,
        quantity: Math.max(1, Number(i.quantity) || 1),
        price: Math.max(0, Number(i.price) || 0)
      }));
      const result = await createSale({ items: formattedItems, clientId, comment }, 'temp-user-id');
      if (result.success) {
        haptic.notification('success');
        setSuccess(true);
        setItems([{ productId: '', quantity: 1, price: 0 }]);
        setClientId('');
        setComment('');
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      haptic.notification('error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientCreated = (client: Client) => {
    setClients((prev) => [client, ...prev]);
    setClientId(client.id);
    setShowClientModal(false);
    haptic.notification('success');
  };

  return (
    <>
      {/* Product Items */}
      <div className="form-group">
        <label className="glass-label">{t('sale_items')}</label>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 10 }}
          >
            <LiquidGlassCard padding={true}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('sale_item')} #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.25rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <LiquidGlassSelect
                options={products.map((p) => ({
                  value: p.id,
                  label: p.dimensions ? `${p.name} ${p.dimensions}` : p.name,
                }))}
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                placeholder={t('sale_choose_product')}
              />

              <div className="form-row" style={{ marginTop: 10 }}>
                <LiquidGlassInput
                  label={t('sale_qty')}
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                />
                <LiquidGlassInput
                  label={t('sale_price')}
                  type="number"
                  min={0}
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t('sale_amount')}: <strong style={{ color: 'var(--primary)' }}>
                  <AnimatedNumber value={(Number(item.quantity) || 0) * (Number(item.price) || 0)} suffix="сум" />
                </strong>
              </div>
            </LiquidGlassCard>
          </motion.div>
        ))}

        <LiquidGlassButton size="sm" onClick={addItem} fullWidth>
          {t('sale_add_item')}
        </LiquidGlassButton>
      </div>

      {/* Total */}
      <LiquidGlassCard elevated className="mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>{t('sale_total')}:</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            <AnimatedNumber value={total} suffix="сум" />
          </span>
        </div>
      </LiquidGlassCard>

      {/* Client */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label className="glass-label" style={{ margin: 0 }}>{t('sale_client')}</label>
          <button
            onClick={() => setShowClientModal(true)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.813rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('sale_create_client')}
          </button>
        </div>
        <input
          className="glass-input"
          placeholder={t('sale_search_client')}
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <LiquidGlassSelect
          options={clients.map((c) => ({ value: c.id, label: `${c.name}${c.phone ? ` (${c.phone})` : ''}` }))}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder={t('sale_choose_client')}
        />
      </div>

      {/* Comment */}
      <div className="form-group">
        <LiquidGlassInput
          label={t('sale_comment')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('sale_comment_placeholder')}
        />
      </div>

      {/* Submit */}
      <LiquidGlassButton
        variant="primary"
        fullWidth
        size="lg"
        loading={loading}
        onClick={handleSubmit}
        disabled={!clientId || items.some((i) => !i.productId)}
      >
        {success ? t('sale_success') : t('sale_submit')}
      </LiquidGlassButton>

      <CreateClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onCreated={handleClientCreated}
      />
    </>
  );
}
