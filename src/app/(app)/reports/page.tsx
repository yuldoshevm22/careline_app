'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LiquidGlassCard from '@/components/ui/LiquidGlassCard';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import LiquidGlassInput from '@/components/ui/LiquidGlassInput';
import LiquidGlassDatePicker from '@/components/ui/LiquidGlassDatePicker';
import LiquidGlassSelect from '@/components/ui/LiquidGlassSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getDashboardStats } from '@/actions/reports';
import { getOperations } from '@/actions/operations';
import { getClients } from '@/actions/clients';
import { getEmployees } from '@/actions/employees';
import { formatMoney } from '@/lib/utils';
import { Wallet, TrendingUp, CreditCard, ArrowUpRight, AlertTriangle, Download, BarChart } from 'lucide-react';
import { useTranslation } from '@/components/shared/LanguageContext';
import type { Client } from '@/types';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { t } = useTranslation();
  
  // Export filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [opType, setOpType] = useState('');
  const [clientId, setClientId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<{ id: string; fullName: string }[]>([]);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getClients(),
      getEmployees()
    ])
    .then(([statsRes, clientsRes, empRes]) => {
      setStats(statsRes);
      setClients(clientsRes);
      setEmployees(empRes);
    })
    .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await getOperations({
        type: opType || undefined,
        clientId: clientId || undefined,
        employeeId: employeeId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: 5000,
      });

      // Dynamic import for exceljs and file-saver
      const ExcelJS = (await import('exceljs')).default;
      const { saveAs } = (await import('file-saver')).default || await import('file-saver');

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Отчет');

      // Title
      let title = 'Отчет CareLine';
      if (dateFrom && dateTo) title += ` за период с ${dateFrom} по ${dateTo}`;
      else if (dateFrom) title += ` начиная с ${dateFrom}`;
      else if (dateTo) title += ` до ${dateTo}`;
      else title += ' за все время';

      ws.mergeCells('A1:G1');
      const titleCell = ws.getCell('A1');
      titleCell.value = title;
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      
      ws.addRow([]); // Empty row

      // Headers
      const headers = ['Дата', 'Тип', 'Сумма (сум)', 'Клиент', 'Сотрудник', 'Тип расхода', 'Комментарий'];
      const headerRow = ws.addRow(headers);
      
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF09B5A0' } // Teal/Cyan color
        };
        cell.font = {
          name: 'Arial',
          color: { argb: 'FFFFFFFF' },
          bold: true,
          size: 11
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
        };
      });

      // Data Rows
      let totalSum = 0;
      res.operations.forEach((op: any) => {
        let typeStr = '';
        let typeColor = 'FF000000';
        
        if (op.type === 'SALE') { typeStr = 'Продажа'; typeColor = 'FF3B82F6'; } // Blue
        else if (op.type === 'CLIENT_PAYMENT') { typeStr = 'Оплата'; typeColor = 'FF10B981'; } // Green
        else if (op.type === 'CASH_EXPENSE') { typeStr = 'Расход'; typeColor = 'FFEF4444'; } // Red

        const row = ws.addRow([
          new Date(op.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }),
          typeStr,
          Number(op.totalAmount),
          op.client?.name || '-',
          op.employee?.fullName || '-',
          op.expenseType?.name || '-',
          op.comment || '-'
        ]);

        totalSum += Number(op.totalAmount);

        row.eachCell((cell, colNum) => {
          cell.alignment = { vertical: 'middle', horizontal: colNum === 3 ? 'right' : 'left' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
          };
          
          if (colNum === 2) {
            cell.font = { bold: true, color: { argb: typeColor } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
          if (colNum === 3) {
            cell.numFmt = '#,##0';
            cell.font = { bold: true };
          }
        });
      });

      // Add Total Row
      const totalRow = ws.addRow(['', 'ИТОГО:', totalSum, '', '', '', '']);
      totalRow.eachCell((cell, colNum) => {
        cell.font = { bold: true, size: 12 };
        if (colNum === 2) cell.alignment = { horizontal: 'right' };
        if (colNum === 3) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right' };
          cell.font = { bold: true, size: 12, color: { argb: 'FF09B5A0' } };
        }
      });

      // Columns Width
      ws.getColumn(1).width = 20;
      ws.getColumn(2).width = 15;
      ws.getColumn(3).width = 18;
      ws.getColumn(4).width = 25;
      ws.getColumn(5).width = 25;
      ws.getColumn(6).width = 20;
      ws.getColumn(7).width = 35;

      const buffer = await wb.xlsx.writeBuffer();
      const fileName = `CareLine_Report_${dateFrom || 'all'}_${dateTo || 'all'}.xlsx`;
      saveAs(new Blob([buffer]), fileName);

    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const cashFlow = (stats?.month.payments || 0) - (stats?.month.expenses || 0);

  return (
    <>
      <div className="page__header">
        <h1 className="page__title">{t('rep_title')}</h1>
        <p className="page__subtitle">{t('rep_subtitle')}</p>
      </div>

      <div className="page__content">
        {/* Cash Flow */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <LiquidGlassCard elevated className="mb-4">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Wallet size={16} /> {t('rep_cash_month')}
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: cashFlow >= 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                <AnimatedNumber value={cashFlow} suffix="сум" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                {t('rep_cash_calc')}
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        {/* Monthly Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <LiquidGlassCard className="mb-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={16} /> {t('rep_sales')}</span>
                <span style={{ fontWeight: 700 }}>{formatMoney(stats?.month.sales || 0)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--glass-border-subtle)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><CreditCard size={16} /> {t('rep_payments')}</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMoney(stats?.month.payments || 0)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--glass-border-subtle)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><ArrowUpRight size={16} /> {t('rep_expenses')}</span>
                <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatMoney(stats?.month.expenses || 0)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--glass-border-subtle)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={16} /> {t('rep_debt')}</span>
                <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{formatMoney(stats?.totalDebt || 0)}</span>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        {/* Export */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <LiquidGlassCard elevated>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Download size={18} /> {t('rep_export')}</h3>
            
            <div className="form-group" style={{ marginBottom: 12 }}>
              <LiquidGlassSelect
                options={[
                  { value: '', label: t('rep_all_ops') },
                  { value: 'SALE', label: t('rep_only_sales') },
                  { value: 'CLIENT_PAYMENT', label: t('rep_only_payments') },
                  { value: 'CASH_EXPENSE', label: t('rep_only_expenses') },
                ]}
                value={opType}
                onChange={(e) => setOpType(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <LiquidGlassSelect
                options={[{ value: '', label: t('rep_all_clients') }, ...clients.map(c => ({ value: c.id, label: c.name }))]}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                searchable
                placeholder={t('sale_choose_client')}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <LiquidGlassSelect
                options={[{ value: '', label: t('rep_all_employees') }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                searchable
                placeholder={t('exp_choose_employee')}
              />
            </div>

            <div className="form-row" style={{ marginBottom: 16 }}>
              <LiquidGlassDatePicker label={t('rep_from')} value={dateFrom} onChange={(val) => setDateFrom(val)} />
              <LiquidGlassDatePicker label={t('rep_to')} value={dateTo} onChange={(val) => setDateTo(val)} />
            </div>

            <LiquidGlassButton variant="primary" fullWidth loading={exporting} onClick={handleExport}>
              <BarChart size={18} style={{ marginRight: 8 }} /> {t('rep_download')}
            </LiquidGlassButton>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </>
  );
}
