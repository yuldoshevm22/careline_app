'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  suffix = '',
  className = '',
  duration = 0.6,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  
  const spring = useSpring(prevValue.current, {
    stiffness: 100,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (v) =>
    new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(v))
  );

  useEffect(() => {
    prevValue.current = value;
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(parseFloat(v.replace(/\s/g, '')) || 0));
    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      className={`animated-number ${className}`}
      key={value}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.span>{display}</motion.span>
      {suffix && ` ${suffix}`}
    </motion.span>
  );
}
