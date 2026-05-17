'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface LiquidGlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function LiquidGlassModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: LiquidGlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="glass-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="glass-modal"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="glass-modal__handle" />
            <div className="glass-modal__header">
              <h2 className="glass-modal__title">{title}</h2>
            </div>
            <div className="glass-modal__body">{children}</div>
            {footer && <div className="glass-modal__footer">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
