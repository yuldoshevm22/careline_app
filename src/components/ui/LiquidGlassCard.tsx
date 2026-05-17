'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  padding?: boolean;
}

export default function LiquidGlassCard({
  children,
  className,
  elevated = false,
  interactive = false,
  onClick,
  padding = true,
}: LiquidGlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card',
        elevated && 'glass-card--elevated',
        interactive && 'glass-card--interactive',
        className
      )}
      style={padding ? { padding: '16px' } : undefined}
      onClick={onClick}
      whileTap={interactive ? { scale: 0.97 } : undefined}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
