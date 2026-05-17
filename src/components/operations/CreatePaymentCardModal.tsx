'use client';

import { useState } from 'react';
import LiquidGlassModal from '@/components/ui/LiquidGlassModal';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { createPaymentCard } from '@/actions/catalogs';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { useTranslation } from '@/components/shared/LanguageContext';

interface CreatePaymentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (card: { id: string; cardNumber: string; holderName: string }) => void;
}

export default function CreatePaymentCardModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePaymentCardModalProps) {
  const { haptic } = useTelegram();
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!cardNumber || !holderName) {
      setError('Error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createPaymentCard(cardNumber, holderName);
      if (result.success && result.data) {
        haptic.notification('success');
        onCreated(result.data);
        setCardNumber('');
        setHolderName('');
      } else {
        haptic.notification('error');
        setError(result.error || 'Error');
      }
    } catch (err) {
      haptic.notification('error');
      setError('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidGlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal_new_card')}
    >
      <div className="flex flex-col gap-4">
        <LiquidGlassInput
          label={t('modal_card_num')}
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
            setCardNumber(formatted);
          }}
          error={error}
        />
        
        <LiquidGlassInput
          label={t('modal_card_holder')}
          placeholder="IVAN IVANOV"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value.toUpperCase())}
        />

        <div className="mt-2">
          <LiquidGlassButton
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            disabled={!cardNumber || !holderName}
          >
            {t('modal_add_card')}
          </LiquidGlassButton>
        </div>
      </div>
    </LiquidGlassModal>
  );
}
