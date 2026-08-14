'use client';
/**
 * AnimatedNumber — KPI 숫자 카운트업 (OriginKit 검토 → 자체 구현, 외부 의존 0)
 *
 * "$11.3억", "70%+", "55.2만톤", "+1.36℃" 같은 접두/접미 혼합 문자열에서
 * 숫자 부분만 0→목표로 rAF 카운트업. 접두·접미·소수자리·콤마 보존.
 * prefers-reduced-motion 시 애니메이션 생략(즉시 최종값) — 모션 a11y 준수.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Parsed = { prefix: string; num: number; decimals: number; hasComma: boolean; suffix: string } | null;

type AnimationState = {
  sourceValue: string;
  display: string;
};

function parse(value: string): Parsed {
  const m = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)([\s\S]*)$/);
  if (!m) return null;
  const raw = m[2];
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  return {
    prefix: m[1],
    num: parseFloat(raw.replace(/,/g, '')),
    decimals,
    hasComma: raw.includes(','),
    suffix: m[3],
  };
}

function fmt(n: number, p: NonNullable<Parsed>): string {
  const fixed = n.toFixed(p.decimals);
  if (!p.hasComma) return fixed;
  const [int, dec] = fixed.split('.');
  const withComma = Number(int).toLocaleString('en-US');
  return dec ? `${withComma}.${dec}` : withComma;
}

export default function AnimatedNumber({
  value,
  durationMs = 1100,
}: {
  value: string;
  durationMs?: number;
}) {
  const parsed = useMemo(() => parse(value), [value]);
  const [animation, setAnimation] = useState<AnimationState>(() => ({
    sourceValue: value,
    display: value,
  }));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!parsed) return;

    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let startTs: number | null = null;
    const target = parsed.num;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const t = Math.min((ts - startTs) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setAnimation({
        sourceValue: value,
        display: `${parsed.prefix}${fmt(target * eased, parsed)}${parsed.suffix}`,
      });
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [durationMs, parsed, value]);

  const display = animation.sourceValue === value && parsed
    ? animation.display
    : value;

  return <span>{display}</span>;
}
