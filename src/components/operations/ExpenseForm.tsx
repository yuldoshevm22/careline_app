'use client';

import { useState, useEffect } from 'react';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LiquidGlassSelect from '@/components/ui/LiquidGlassSelect';
import LiquidGlassModal from '@/components/ui/LiquidGlassModal';
import { getEmployees, createEmployee } from '@/actions/employees';
import { getExpenseTypes, createExpenseType } from '@/actions/catalogs';
import { createCashExpense } from '@/actions/operations';
import { useTelegram } from '@/components/shared/TelegramProvider';
import { useTranslation } from '@/components/shared/LanguageContext';

export default function ExpenseForm() {
  const { haptic } = useTelegram();
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<{ id: string; fullName: string }[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<{ id: string; name: string }[]>([]);
  const [amount, setAmount] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [expenseTypeId, setExpenseTypeId] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Employee modal
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');

  // Expense type modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeName, setTypeName] = useState('');

  useEffect(() => {
    getEmployees().then(setEmployees);
    getExpenseTypes().then(setExpenseTypes);
  }, []);

  const handleSubmit = async () => {
    if (!amount || !employeeId || !expenseTypeId) return;
    setLoading(true);
    try {
      const result = await createCashExpense({ amount: Number(amount), employeeId, expenseTypeId, comment }, 'temp-user-id');
      if (result.success) {
        haptic.notification('success');
        setSuccess(true);
        setAmount('');
        setEmployeeId('');
        setExpenseTypeId('');
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

  const handleCreateEmployee = async () => {
    if (!empName) return;
    const res = await createEmployee({ fullName: empName, phone: empPhone });
    if (res.success && res.data) {
      setEmployees((prev) => [...prev, res.data]);
      setEmployeeId(res.data.id);
      setShowEmpModal(false);
      setEmpName('');
      setEmpPhone('');
      haptic.notification('success');
    }
  };

  const handleCreateType = async () => {
    if (!typeName) return;
    const res = await createExpenseType({ name: typeName });
    if (res.success && res.data) {
      setExpenseTypes((prev) => [...prev, res.data]);
      setExpenseTypeId(res.data.id);
      setShowTypeModal(false);
      setTypeName('');
      haptic.notification('success');
    }
  };

  return (
    <>
      {/* Amount */}
      <div className="form-group">
        <LiquidGlassInput label={t('exp_amount')} type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('exp_amount_placeholder')} />
      </div>

      {/* Employee */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label className="glass-label" style={{ margin: 0 }}>{t('exp_employee')}</label>
          <button onClick={() => setShowEmpModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.813rem', fontWeight: 600, cursor: 'pointer' }}>{t('exp_create')}</button>
        </div>
        <LiquidGlassSelect
          options={employees.map((e) => ({ value: e.id, label: e.fullName }))}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder={t('exp_choose_employee')}
        />
      </div>

      {/* Expense Type */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label className="glass-label" style={{ margin: 0 }}>{t('exp_type')}</label>
          <button onClick={() => setShowTypeModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.813rem', fontWeight: 600, cursor: 'pointer' }}>{t('exp_create')}</button>
        </div>
        <LiquidGlassSelect
          options={expenseTypes.map((t) => ({ value: t.id, label: t.name }))}
          value={expenseTypeId}
          onChange={(e) => setExpenseTypeId(e.target.value)}
          placeholder={t('exp_choose_type')}
        />
      </div>

      {/* Comment */}
      <div className="form-group">
        <LiquidGlassInput label={t('exp_comment')} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('exp_comment_placeholder')} />
      </div>

      <LiquidGlassButton variant="primary" fullWidth size="lg" loading={loading} onClick={handleSubmit} disabled={!amount || !employeeId || !expenseTypeId}>
        {success ? t('exp_success') : t('exp_submit')}
      </LiquidGlassButton>

      {/* Create Employee Modal */}
      <LiquidGlassModal isOpen={showEmpModal} onClose={() => setShowEmpModal(false)} title={t('modal_new_employee')} footer={
        <LiquidGlassButton variant="primary" fullWidth onClick={handleCreateEmployee} disabled={!empName}>{t('modal_create')}</LiquidGlassButton>
      }>
        <div className="form-group">
          <LiquidGlassInput label={t('modal_name')} value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder={t('modal_name_placeholder')} />
        </div>
        <div className="form-group">
          <LiquidGlassInput label={t('modal_phone')} value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} placeholder={t('modal_phone_placeholder')} />
        </div>
      </LiquidGlassModal>

      {/* Create Expense Type Modal */}
      <LiquidGlassModal isOpen={showTypeModal} onClose={() => setShowTypeModal(false)} title={t('modal_new_exp_type')} footer={
        <LiquidGlassButton variant="primary" fullWidth onClick={handleCreateType} disabled={!typeName}>{t('modal_create')}</LiquidGlassButton>
      }>
        <div className="form-group">
          <LiquidGlassInput label={t('modal_name')} value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder={t('modal_title_placeholder')} />
        </div>
      </LiquidGlassModal>
    </>
  );
}
