import React, { useEffect, useState } from 'react';

/**
 * Hook to detect user motion preference
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Animated Counter Component for numeric KPIs and dashboard metrics.
 * Runs count-up animation smoothly, respecting prefers-reduced-motion.
 */
export interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals,
  duration = 800,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const prefersReduced = usePrefersReducedMotion();
  const hasDecimals = decimals !== undefined ? decimals > 0 : !Number.isInteger(value);
  const precision = decimals ?? (hasDecimals ? 1 : 0);

  const [displayValue, setDisplayValue] = useState<number>(() => (prefersReduced ? value : 0));

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutCubic curve for smooth decelerating motion
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [value, duration, prefersReduced]);

  const formattedOutput = precision > 0
    ? displayValue.toFixed(precision)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formattedOutput}
      {suffix}
    </span>
  );
};

/**
 * Motion Container for page contents with subtle fade + translateY entrance.
 */
interface MotionFadeProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

export const MotionFade: React.FC<MotionFadeProps> = ({
  children,
  delayMs = 0,
  className = ''
}) => {
  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className={`animate-page-entrance motion-reduce:animate-none ${className}`}
    >
      {children}
    </div>
  );
};
