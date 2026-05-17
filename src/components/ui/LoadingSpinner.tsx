'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
    }}>
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '3px solid var(--glass-border)',
          borderTopColor: 'var(--primary)',
          willChange: 'transform',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
