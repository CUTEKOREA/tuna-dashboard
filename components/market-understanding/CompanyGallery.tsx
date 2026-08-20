/**
 * 「기업 해부」 회사 선택 갤러리.
 *
 * 회사가 늘어날 것을 전제로 한 진입 화면이다. 카드는 뒷면(문양)이 기본이고,
 * 클릭하면 타로카드처럼 뒤집혀 회사 요약이 공개된 뒤 해부 화면으로 넘어간다.
 * prefers-reduced-motion 이면 뒤집기 없이 바로 넘어간다.
 *
 * 뒷면 글자는 국기 배경 위에 바로 얹지 않는다. 바스크 이쿠리냐의 붉은 사선과
 * 히노마루의 원이 회사명을 가로질러 읽히지 않았다. 명판(backPlate)을 깔고 그 위에
 * 올린다. 명판 색은 잉크 밝기에서 자동으로 뒤집으므로 카드가 늘어도 손볼 데가 없다.
 */
'use client';

import React, { useMemo, useRef, useState } from 'react';

import { nearTieWith, revenueUsdM, scaleLabel, scaleOf } from '@/lib/data/company-scale';

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
  /** 뒷면 회사명·테두리 잉크 — 명판 위에서 읽히는 색 */
  backInk: string;
}

interface CompanyGalleryProps {
  companies: CompanyCard[];
  onSelect: (key: string) => void;
}

/** flip 애니메이션(0.8s)이 끝나고 앞면을 잠깐 보여준 뒤 진입한다. */
const REVEAL_MS = 1400;

type SortKey = 'listed' | 'revenue' | 'country';

const SORTS: { key: SortKey; label: string; note: string }[] = [
  { key: 'listed', label: '수록순', note: '해부한 차례대로. 앞 회사를 알아야 뒤 회사가 읽힌다.' },
  {
    key: 'revenue',
    label: '매출순',
    note: '통화가 회사마다 달라 USD 로 환산해 세운다. 표기는 공시 원통화 그대로이고, 환율 오차 안에 붙은 쌍은 「≈동률」로 둔다.',
  },
  { key: 'country', label: '국가순', note: '본사 소재국 가나다순. 같은 나라는 수록순으로 둔다.' },
];

/** 국기 배경 대신 명판 위에서 읽히도록, 잉크 밝기의 반대쪽 판을 깐다. */
export function plateFor(ink: string): string {
  const hex = ink.replace('#', '');
  const n = hex.length === 3
    ? hex.split('').map((c) => parseInt(c + c, 16))
    : [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  // 지각 밝기 근사(ITU-R BT.601). 정확한 상대휘도까지 갈 일이 아니다.
  const lum = (n[0] * 299 + n[1] * 587 + n[2] * 114) / 255000;
  return lum > 0.5 ? 'rgba(9, 14, 26, 0.78)' : 'rgba(250, 250, 247, 0.88)';
}

/** '스페인 · 갈리시아' → '스페인'. 국가순 정렬 키다. */
export function countryOf(card: CompanyCard): string {
  return card.country.split('·')[0].trim();
}

export function sortCompanies(companies: CompanyCard[], sort: SortKey): CompanyCard[] {
  const listed = new Map(companies.map((c, i) => [c.key, i]));
  const next = [...companies];
  if (sort === 'revenue') {
    next.sort((a, b) => revenueUsdM(b.key) - revenueUsdM(a.key)
      || (listed.get(a.key) ?? 0) - (listed.get(b.key) ?? 0));
  } else if (sort === 'country') {
    next.sort((a, b) => countryOf(a).localeCompare(countryOf(b), 'ko')
      || (listed.get(a.key) ?? 0) - (listed.get(b.key) ?? 0));
  }
  return next;
}

export default function CompanyGallery({ companies, onSelect }: CompanyGalleryProps) {
  const [flipped, setFlipped] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('listed');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ordered = useMemo(() => sortCompanies(companies, sort), [companies, sort]);
  const note = SORTS.find((s) => s.key === sort)?.note ?? '';

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
        <div className={styles.headText}>
          <h1>기업 해부</h1>
          <p>카드를 뒤집어 회사를 고르세요. 해부 대상은 계속 추가됩니다.</p>
        </div>
        <div className={styles.sortBox}>
          <div className={styles.sortRow} role="group" aria-label="카드 정렬">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`${styles.sortBtn} ${sort === s.key ? styles.sortOn : ''}`}
                aria-pressed={sort === s.key}
                onClick={() => setSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className={styles.sortNote}>{note}</p>
        </div>
      </div>
      <div className={styles.deck}>
        {ordered.map((c) => {
          const scale = scaleOf(c.key);
          const tied = sort === 'revenue'
            ? nearTieWith(c.key, companies.map((x) => x.key))
            : [];
          return (
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
                  <span
                    className={styles.backPlate}
                    style={{ background: plateFor(c.backInk) }}
                  >
                    <span className={styles.backNumeral}>{c.numeral}</span>
                    <span className={styles.backName}>{c.name}</span>
                    {sort === 'revenue' && scale ? (
                      <span className={styles.backScale}>
                        {scaleLabel(c.key)}
                        <em>
                          {`${scale.기준} · 등급 ${scale.등급}`}
                          {tied.length ? ' · ≈동률' : ''}
                        </em>
                      </span>
                    ) : null}
                    {sort === 'country' ? (
                      <span className={styles.backScale}>{c.country}</span>
                    ) : null}
                    <span className={styles.backLabel}>기업 해부</span>
                  </span>
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
          );
        })}
      </div>
    </div>
  );
}
