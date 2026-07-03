'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import styles from './TermTooltip.module.css';

interface TermTooltipProps {
  term: string | React.ReactNode;
  description: string | React.ReactNode;
}

export default function TermTooltip({ term, description }: TermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const clickRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        clickRef.current && !clickRef.current.contains(event.target as Node) &&
        popupRef.current && !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && clickRef.current) {
      const rect = clickRef.current.getBoundingClientRect();
      const tooltipW = 250;
      let left = rect.left + rect.width / 2 - tooltipW / 2;
      if (left + tooltipW > window.innerWidth - 12) left = window.innerWidth - tooltipW - 12;
      if (left < 12) left = 12;
      let top = rect.bottom + 12;
      if (top + 150 > window.innerHeight) top = rect.top - 162;
      setPos({ top, left });
    }
    setIsOpen(!isOpen);
  };

  const popup = isOpen && typeof document !== 'undefined' ? createPortal(
    <div ref={popupRef} className={styles.tooltip} style={{
      position: 'fixed',
      top: pos.top,
      left: pos.left,
      transform: 'none',
    }}>
      {description}
    </div>,
    document.body
  ) : null;

  return (
    <span className={styles.container} ref={clickRef} onClick={toggleOpen}>
      <span className={styles.term}>{term}</span>
      <span className={styles.icon}>
        <Info size={14} />
      </span>
      {popup}
    </span>
  );
}
