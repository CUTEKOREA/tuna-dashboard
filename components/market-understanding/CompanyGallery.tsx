/**
 * 「기업 해부」 회사 선택 갤러리.
 *
 * 회사가 늘어날 것을 전제로 한 진입 화면이다. 카드는 뒷면(문양)이 기본이고,
 * 클릭하면 타로카드처럼 뒤집혀 회사 요약이 공개된 뒤 해부 화면으로 넘어간다.
 * prefers-reduced-motion 이면 뒤집기 없이 바로 넘어간다.
 */
'use client';

import React, { useRef, useState } from 'react';

import styles from './CompanyGallery.module.css';

export interface CompanyCard {
  key: string;
  /** 카드 뒷면 로마 숫자 — 수록 순서 */
  numeral: string;
  name: string;
  country: string;
  tagline: string;
  stats: { label: string; value: string }[];
  /** 뒷면 배경 — 그 나라 국기를 연상시키는 CSS 그라데이션 (회사별) */
  flagCss: string;
  /** 뒷면 회사명·테두리 잉크 — 국기 밴드 위에서 읽히는 색 */
  backInk: string;
}

interface CompanyGalleryProps {
  companies: CompanyCard[];
  onSelect: (key: string) => void;
}

/** flip 애니메이션(0.8s)이 끝나고 앞면을 잠깐 보여준 뒤 진입한다. */
const REVEAL_MS = 1400;

export default function CompanyGallery({ companies, onSelect }: CompanyGalleryProps) {
  const [flipped, setFlipped] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (key: string) => {
    if (flipped === key) return; // 공개 중 재클릭 무시 — 진입 예약이 이미 걸려 있다
    if (typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onSelect(key);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setFlipped(key);
    timer.current = setTimeout(() => onSelect(key), REVEAL_MS);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1>기업 해부</h1>
        <p>카드를 뒤집어 회사를 고르세요. 해부 대상은 계속 추가됩니다.</p>
      </div>
      <div className={styles.deck}>
        {companies.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`${styles.card} ${flipped === c.key ? styles.flipped : ''}`}
            onClick={() => handleClick(c.key)}
            aria-label={`${c.name} 해부 보기`}
          >
            <span className={styles.cardInner}>
              <span
                className={`${styles.face} ${styles.back}`}
                aria-hidden="true"
                style={{ background: c.flagCss, color: c.backInk }}
              >
                <span className={styles.backFrame} />
                <span className={styles.backNumeral}>{c.numeral}</span>
                <span className={styles.backName}>{c.name}</span>
                <span className={styles.backLabel}>기업 해부</span>
              </span>
              <span className={`${styles.face} ${styles.front}`}>
                <span className={styles.frontCountry}>{c.country}</span>
                <span className={styles.frontName}>{c.name}</span>
                <span className={styles.frontTagline}>{c.tagline}</span>
                <dl className={styles.frontStats}>
                  {c.stats.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <span className={styles.frontCta}>해부 보기</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
