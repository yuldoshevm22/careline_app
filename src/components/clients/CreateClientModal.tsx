'use client';

import { useState } from 'react';
import LiquidGlassModal from '@/components/ui/LiquidGlassModal';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import { createClient } from '@/actions/clients';
import { useTranslation } from '@/components/shared/LanguageContext';
import type { Client } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
}

export default function CreateClientModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Error'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await createClient({ name: name.trim(), phone, comment });
      if (result.success && result.data) {
        onCreated(result.data);
        setName('');
        setPhone('');
        setComment('');
      } else {
        setError(result.error || 'Error');
      }
    } catch {
      setError('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidGlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modal_new_client')}
      footer={
        <LiquidGlassButton variant="primary" fullWidth onClick={handleSubmit} loading={loading} disabled={!name.trim()}>
          {t('modal_create')}
        </LiquidGlassButton>
      }
    >
      <div className="form-group">
        <LiquidGlassInput label={t('modal_name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('modal_name_placeholder')} error={error} />
      </div>
      <div className="form-group">
        <LiquidGlassInput label={t('modal_phone')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('modal_phone_placeholder')} />
      </div>
      <div className="form-group">
        <LiquidGlassInput label={t('pay_comment')} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('pay_comment_placeholder')} />
      </div>
    </LiquidGlassModal>
  );
}
