'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, ReactElement, useCallback } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Drop-in replacement for Recharts ResponsiveContainer.
 * Optimized with debounce and stability checks to prevent flickering.
 */
interface SafeResponsiveContainerProps {
  width?: string | number;
  height: number | string;
  children: ReactElement;
  className?: string;
  style?: React.CSSProperties;
  debounce?: number;
}

export default function SafeResponsiveContainer({
  width = '100%',
  height,
  children,
  className,
  style,
  debounce = 200,
}: SafeResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateDimensions = useCallback((w: number, h: number) => {
    const roundedW = Math.round(w);
    const roundedH = Math.round(h);

    // ★ 핵심: 크기가 0이면 무시 (위젯 이동 중 일시적으로 0이 됨)
    if (roundedW < 10 || roundedH < 10) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDimensions((prev) => {
        // 크기가 실질적으로 같으면 리렌더 스킵 (임계값 3px로 상향하여 미세 플리커 방지)
        if (prev && Math.abs(prev.w - roundedW) < 3 && Math.abs(prev.h - roundedH) < 3) {
          return prev;
        }
        return { w: roundedW, h: roundedH };
      });
    }, debounce);
  }, [debounce]);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 초기 크기 설정
    const rect = el.getBoundingClientRect();
    if (rect.width >= 10 && rect.height >= 10) {
      setDimensions({ w: Math.floor(rect.width), h: Math.floor(rect.height) });
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        updateDimensions(w, h);
      }
    });

    observer.observe(el);
    window.addEventListener('resize', () => {
      const r = el.getBoundingClientRect();
      updateDimensions(r.width, r.height);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      observer.disconnect();
      window.removeEventListener('resize', () => {});
    };
  }, [updateDimensions]);

  const measuredWidth = dimensions?.w || 0;
  const measuredHeight = dimensions?.h || 0;

  const resolvedHeight = typeof height === 'number' ? height : (measuredHeight || 300);
  const resolvedWidth = typeof width === 'number' ? width : (measuredWidth || 500);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        ...style,
      }}
    >
      {(measuredWidth > 0 || typeof width === 'number') && React.cloneElement(children, {
        width: resolvedWidth,
        height: resolvedHeight,
      } as any)}
    </div>
  );
}
