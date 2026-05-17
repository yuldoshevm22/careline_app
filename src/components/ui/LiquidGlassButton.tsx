'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface LiquidGlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export default function LiquidGlassButton({
  children,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: LiquidGlassButtonProps) {
  return (
    <motion.button
      className={cn(
        'glass-btn',
        variant === 'primary' && 'glass-btn--primary',
        variant === 'danger' && 'glass-btn--danger',
        size === 'sm' && 'glass-btn--sm',
        size === 'lg' && 'glass-btn--lg',
        fullWidth && 'glass-btn--full',
        className
      )}
      disabled={disabled || loading}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...(props as Record<string, unknown>)}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', width: 18, height: 18 }}
        >
          ⟳
        </motion.span>
      ) : (
        <>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
