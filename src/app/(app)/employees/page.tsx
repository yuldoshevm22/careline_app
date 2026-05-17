'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LiquidGlassModal from '@/components/ui/LiquidGlassModal';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getEmployees, createEmployee, deleteEmployee } from '@/actions/employees';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { useTranslation } from '@/components/shared/LanguageContext';
import { HardHat, Smartphone } from 'lucide-react';

interface Employee {
  id: string;
  fullName: string;
  phone?: string;
}

export default function EmployeesPage() {
  const { haptic } = useTelegram();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const res = await createEmployee({ fullName: name.trim(), phone });
    if (res.success && res.data) {
      setEmployees((prev) => [...prev, res.data]);
      setShowModal(false);
      setName('');
      setPhone('');
      haptic.notification('success');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteEmployee(id);
    if (res.success) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      haptic.notification('success');
    }
  };

  return (
    <>
      <div className="page__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page__title">{t('nav_employees')}</h1>
          <LiquidGlassButton size="sm" variant="primary" onClick={() => setShowModal(true)}>
            {t('clients_new')}
          </LiquidGlassButton>
        </div>
      </div>

      <div className="page__content">
        {loading ? (
          <LoadingSpinner />
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><HardHat size={48} color="var(--text-tertiary)" /></div>
            <div className="empty-state__title">{t('emp_empty')}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {employees.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <LiquidGlassCard>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                      {emp.phone && <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Smartphone size={14} /> {emp.phone}</div>}
                    </div>
                    <button
                      onClick={() => handleDelete(emp.id)}
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
        title={t('modal_new_employee')}
        footer={<LiquidGlassButton variant="primary" fullWidth onClick={handleCreate} disabled={!name.trim()}>{t('modal_create')}</LiquidGlassButton>}
      >
        <div className="form-group">
          <LiquidGlassInput label={t('modal_name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('modal_name_placeholder')} />
        </div>
        <div className="form-group">
          <LiquidGlassInput label={t('modal_phone')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('modal_phone_placeholder')} />
        </div>
      </LiquidGlassModal>
    </>
  );
}
