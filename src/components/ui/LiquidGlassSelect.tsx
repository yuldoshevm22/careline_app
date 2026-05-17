'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiquidGlassSelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

export default function LiquidGlassSelect({
  label,
  error,
  options,
  placeholder = 'Выберите...',
  value,
  onChange,
  disabled,
  className,
  searchable = false,
}: LiquidGlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const handleSelect = useCallback(
    (val: string) => {
      onChange?.({ target: { value: val } });
      setIsOpen(false);
      setSearch('');
    },
    [onChange]
  );

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  // Focus search when opened
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <div className="glass-input-wrapper" ref={containerRef}>
      {label && <label className="glass-label">{label}</label>}

      {/* Trigger */}
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
        <span
          className={cn(
            'glass-select-trigger__value',
            !selectedOption && 'glass-select-trigger__placeholder'
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.span
          className="glass-select-trigger__chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-select-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Search */}
            {searchable && (
              <div className="glass-select-dropdown__search">
                <Search
                  size={16}
                  className="glass-select-dropdown__search-icon"
                />
                <input
                  ref={searchRef}
                  type="text"
                  className="glass-select-dropdown__search-input"
                  placeholder="Поиск..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}

            {/* Options list */}
            <div className="glass-select-dropdown__list">
              {filteredOptions.length === 0 ? (
                <div className="glass-select-dropdown__empty">
                  Ничего не найдено
                </div>
              ) : (
                filteredOptions.map((opt, i) => (
                  <motion.button
                    key={opt.value}
                    type="button"
                    className={cn(
                      'glass-select-option',
                      opt.value === value && 'glass-select-option--selected'
                    )}
                    onClick={() => handleSelect(opt.value)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="glass-select-option__label">
                      {opt.label}
                    </span>
                    {opt.value === value && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="glass-select-option__check"
                      >
                        <Check size={16} />
                      </motion.span>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="glass-error">{error}</p>}
    </div>
  );
}
