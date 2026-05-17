'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlassSegment from '@/components/ui/LiquidGlassSegment';
import SaleForm from '@/components/operations/SaleForm';
import PaymentForm from '@/components/operations/PaymentForm';
import ExpenseForm from '@/components/operations/ExpenseForm';
import { useTranslation } from '@/components/shared/LanguageContext';

export default function OperationsPage() {
  const [type, setType] = useState('SALE');
  const { t } = useTranslation();

  const operationTypes = [
    { value: 'SALE', label: t('op_tab_sale') },
    { value: 'CLIENT_PAYMENT', label: t('op_tab_payment') },
    { value: 'CASH_EXPENSE', label: t('op_tab_expense') },
  ];

  return (
    <>
      <div className="page__header">
        <h1 className="page__title">{t('op_new')}</h1>
        <p className="page__subtitle">{t('op_subtitle')}</p>
      </div>

      <div className="page__content">
        <div style={{ marginBottom: 20 }}>
          <LiquidGlassSegment
            items={operationTypes}
            value={type}
            onChange={setType}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={type}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {type === 'SALE' && <SaleForm />}
            {type === 'CLIENT_PAYMENT' && <PaymentForm />}
            {type === 'CASH_EXPENSE' && <ExpenseForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
