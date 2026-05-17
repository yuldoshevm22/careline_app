'use client';

import { useState, useEffect } from 'react';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LiquidGlassSelect from '@/components/ui/LiquidGlassSelect';
import LiquidGlassSegment from '@/components/ui/LiquidGlassSegment';
import CreateClientModal from '@/components/clients/CreateClientModal';
import CreatePaymentCardModal from '@/components/operations/CreatePaymentCardModal';
import { getClients } from '@/actions/clients';
import { getCashHolders, getPaymentCards } from '@/actions/catalogs';
import { createClientPayment } from '@/actions/operations';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { useTranslation } from '@/components/shared/LanguageContext';
import type { Client } from '@/types';
import { Banknote, CreditCard, Landmark } from 'lucide-react';

export default function PaymentForm() {
  const { haptic } = useTelegram();
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [cashHolders, setCashHolders] = useState<{ id: string; name: string }[]>([]);
  const [paymentCards, setPaymentCards] = useState<{ id: string; cardNumber: string; holderName: string }[]>([]);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashHolderId, setCashHolderId] = useState('');
  const [paymentCardId, setPaymentCardId] = useState('');
  const [cardRecipient, setCardRecipient] = useState('');
  const [comment, setComment] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getClients().then(setClients);
    getCashHolders().then(setCashHolders);
    getPaymentCards().then(setPaymentCards);
  }, []);

  const handleSubmit = async () => {
    if (!clientId || !amount) return;
    setLoading(true);
    try {
      const result = await createClientPayment({
        clientId,
        amount: Number(amount),
        paymentMethod,
        cashHolderId: paymentMethod === 'CASH' ? cashHolderId || undefined : undefined,
        paymentCardId: paymentMethod === 'CARD_TRANSFER' ? paymentCardId || undefined : undefined,
        cardRecipient: paymentMethod === 'CARD_TRANSFER' ? cardRecipient || undefined : undefined,
        comment: comment || undefined,
      }, 'temp-user-id');
      if (result.success) {
        haptic.notification('success');
        setSuccess(true);
        setClientId('');
        setAmount('');
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

  return (
    <>
      {/* Client */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label className="glass-label" style={{ margin: 0 }}>{t('pay_client')}</label>
          <button onClick={() => setShowClientModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.813rem', fontWeight: 600, cursor: 'pointer' }}>
            {t('pay_create_client')}
          </button>
        </div>
        <LiquidGlassSelect
          options={clients.map((c) => ({
            value: c.id,
            label: `${c.name}${c.balance ? ` (${Number(c.balance) < 0 ? '' : '+'}${c.balance} сум)` : ''}`,
          }))}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder={t('pay_choose_client')}
          searchable
        />
      </div>

      {/* Amount */}
      <div className="form-group">
        <LiquidGlassInput
          label={t('pay_amount')}
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t('pay_amount_placeholder')}
        />
      </div>

      {/* Payment Method */}
      <div className="form-group">
        <label className="glass-label">{t('pay_type')}</label>
        <LiquidGlassSegment
          items={[
            { value: 'CASH', label: <span style={{ display: 'flex', alignItems: 'center' }}><Banknote size={16} style={{ marginRight: 6 }} /> {t('pay_cash')}</span> },
            { value: 'CARD_TRANSFER', label: <span style={{ display: 'flex', alignItems: 'center' }}><CreditCard size={16} style={{ marginRight: 6 }} /> {t('pay_card')}</span> },
            { value: 'BANK_TRANSFER', label: <span style={{ display: 'flex', alignItems: 'center' }}><Landmark size={16} style={{ marginRight: 6 }} /> {t('pay_transfer')}</span> },
          ]}
          value={paymentMethod}
          onChange={setPaymentMethod}
        />
      </div>

      {/* Cash specific */}
      {paymentMethod === 'CASH' && (
        <div className="form-group">
          <LiquidGlassSelect
            label={t('pay_cash_holder')}
            options={cashHolders.map((h) => ({ value: h.id, label: h.name }))}
            value={cashHolderId}
            onChange={(e) => setCashHolderId(e.target.value)}
            placeholder={t('pay_choose')}
          />
        </div>
      )}

      {/* Card specific */}
      {paymentMethod === 'CARD_TRANSFER' && (
        <>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="glass-label" style={{ margin: 0 }}>{t('pay_card_num')}</label>
              <button onClick={() => setShowCardModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.813rem', fontWeight: 600, cursor: 'pointer' }}>
                {t('pay_create_card')}
              </button>
            </div>
            <LiquidGlassSelect
              options={paymentCards.map((c) => ({ value: c.id, label: `${c.cardNumber} (${c.holderName})` }))}
              value={paymentCardId}
              onChange={(e) => setPaymentCardId(e.target.value)}
              placeholder={t('pay_choose_card')}
              searchable
            />
          </div>
          <div className="form-group">
            <LiquidGlassInput
              label={t('pay_card_recipient')}
              value={cardRecipient}
              onChange={(e) => setCardRecipient(e.target.value)}
              placeholder={t('pay_recipient_placeholder')}
            />
          </div>
        </>
      )}

      {/* Comment */}
      <div className="form-group">
        <LiquidGlassInput label={t('pay_comment')} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('pay_comment_placeholder')} />
      </div>

      <LiquidGlassButton variant="primary" fullWidth size="lg" loading={loading} onClick={handleSubmit} disabled={!clientId || !amount}>
        {success ? t('pay_success') : t('pay_submit')}
      </LiquidGlassButton>

      <CreateClientModal isOpen={showClientModal} onClose={() => setShowClientModal(false)} onCreated={(c) => { setClients((prev) => [c, ...prev]); setClientId(c.id); setShowClientModal(false); }} />
      <CreatePaymentCardModal isOpen={showCardModal} onClose={() => setShowCardModal(false)} onCreated={(c) => { setPaymentCards((prev) => [c, ...prev]); setPaymentCardId(c.id); setShowCardModal(false); }} />
    </>
  );
}
