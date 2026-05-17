'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface LiquidGlassSegmentProps {
  items: { value: string; label: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
}

export default function LiquidGlassSegment({
  items,
  value,
  onChange,
}: LiquidGlassSegmentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    if (!containerRef.current || !indicatorRef.current) return;
    const activeIndex = items.findIndex((item) => item.value === value);
    if (activeIndex === -1) return;

    const buttons = containerRef.current.querySelectorAll('.glass-segment__item');
    const activeBtn = buttons[activeIndex] as HTMLElement;
    if (!activeBtn) return;

    indicatorRef.current.style.left = `${activeBtn.offsetLeft}px`;
    indicatorRef.current.style.width = `${activeBtn.offsetWidth}px`;
  }, [items, value]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div className="glass-segment" ref={containerRef}>
      <div className="glass-segment__indicator" ref={indicatorRef} />
      {items.map((item) => (
        <motion.button
          key={item.value}
          className={`glass-segment__item ${
            item.value === value ? 'glass-segment__item--active' : ''
          }`}
          onClick={() => onChange(item.value)}
          whileTap={{ scale: 0.96 }}
          type="button"
        >
          {item.label}
        </motion.button>
      ))}
    </div>
  );
}
