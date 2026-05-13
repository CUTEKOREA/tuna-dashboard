'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import { motion } from 'framer-motion';

// Track which instances have already been revealed (persists across re-mounts)
const revealedSet = new Set<string>();

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stableId = useId();
  const alreadyRevealed = revealedSet.has(stableId);
  const [isVisible, setIsVisible] = useState(alreadyRevealed);

  useEffect(() => {
    if (alreadyRevealed) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealedSet.add(stableId);
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stableId, alreadyRevealed]);

  const directionMap = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  // If already revealed, render instantly without animation
  if (alreadyRevealed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

