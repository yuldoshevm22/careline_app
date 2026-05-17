'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { ru, uz } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useTranslation } from '@/components/shared/LanguageContext';

interface LiquidGlassDatePickerProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function LiquidGlassDatePicker({
  label,
  error,
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Выберите дату',
}: LiquidGlassDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  const displayFormat = 'dd.MM.yyyy';
  const displayValue = selectedDate ? format(selectedDate, displayFormat) : '';

  return (
    <div className="glass-input-wrapper" ref={containerRef}>
      {label && <label className="glass-label">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        className={cn(
          'glass-select-trigger',
          isOpen && 'glass-select-trigger--open',
          error && 'glass-select-trigger--error',
          disabled && 'glass-select-trigger--disabled',
          className
        )}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <span className={cn('glass-select-trigger__value', !selectedDate && 'glass-select-trigger__placeholder')}>
          {displayValue || placeholder}
        </span>
        <motion.span className="glass-select-trigger__chevron">
          <CalendarIcon size={18} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-select-dropdown"
            style={{ width: 'max-content', padding: '10px' }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={language === 'uz' ? uz : ru}
              className="rdp-glass"
              showOutsideDays
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="glass-error">{error}</p>}
    </div>
  );
}
