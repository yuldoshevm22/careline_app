'use client';

import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface LiquidGlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClass?: string;
}

export default function LiquidGlassInput({
  label,
  error,
  wrapperClass,
  className,
  type,
  ...props
}: LiquidGlassInputProps) {
  return (
    <div className={cn('glass-input-wrapper', wrapperClass)}>
      {label && <label className="glass-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          className={cn('glass-input', error && 'glass-input--error', className)}
          {...props}
        />
        {type === 'date' && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-tertiary)' }}>
            <Calendar size={18} />
          </div>
        )}
      </div>
      {error && <p className="glass-error">{error}</p>}
    </div>
  );
}
