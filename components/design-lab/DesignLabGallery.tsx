/**
 * DesignLabGallery — 배포 전 시안 랭킹 하네스 (docs/SOUL.md «랭킹 루프»).
 *
 * 평가는 전부 브라우저 localStorage에 남는다. 서버 상태 없음 — 내부 도구라 계정·동기화가 필요 없고,
 * «평가 JSON 복사»가 다음 라운드 에이전트 브리프로 넘어가는 유일한 통로다.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardCopy, RotateCcw, Star } from 'lucide-react';
import { DESIGN_VARIANTS } from './variants';
import styles from './DesignLabGallery.module.css';

const STORAGE_KEY = 'design-lab-ratings-v1';

interface Rating {
  stars: number;
  comment: string;
  updatedAt: string;
}

type Ratings = Record<string, Rating>;

function loadRatings(): Ratings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? (parsed as Ratings) : {};
  } catch {
    return {};
  }
}

function StarRow({ value, onChange }: { value: number; onChange: (stars: number) => void }) {
  return (
    <div className={styles.stars} role="group" aria-label="별점">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= value ? styles.starOn : ''}`}
          aria-label={`${n}점`}
          aria-pressed={n <= value}
          onClick={() => onChange(n === value ? 0 : n)}
        >
          <Star size={20} fill={n <= value ? 'currentColor' : 'none'} aria-hidden />
        </button>
      ))}
      <span className={styles.starValue}>{value > 0 ? `${value}점` : '미평가'}</span>
    </div>
  );
}

export default function DesignLabGallery() {
  const [ratings, setRatings] = useState<Ratings>({});
  const [byScore, setByScore] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // localStorage는 마운트 후에만 읽는다 — SSR 기본값과의 hydration 불일치 방지가 목적이라 동기 setState가 맞다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRatings(loadRatings());
  }, []);

  const update = (id: string, patch: Partial<Rating>) => {
    const prev = ratings[id] ?? { stars: 0, comment: '', updatedAt: '' };
    const next = { ...ratings, [id]: { ...prev, ...patch, updatedAt: new Date().toISOString() } };
    setRatings(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const copyJson = async () => {
    const payload = DESIGN_VARIANTS.map((variant) => ({
      id: variant.id,
      title: variant.title,
      round: variant.round,
      stars: ratings[variant.id]?.stars ?? 0,
      comment: ratings[variant.id]?.comment ?? '',
      updatedAt: ratings[variant.id]?.updatedAt ?? null,
    }));

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setNotice('평가 JSON을 클립보드에 복사했습니다.');
    } catch {
      setNotice('클립보드 접근이 막혔습니다 - 브라우저 권한을 확인하세요.');
    }
  };

  const reset = () => {
    if (!window.confirm('저장된 평가를 전부 지웁니다. 계속할까요?')) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setRatings({});
    setNotice('평가를 초기화했습니다.');
  };

  const ordered = byScore
    ? [...DESIGN_VARIANTS].sort((a, b) => (ratings[b.id]?.stars ?? 0) - (ratings[a.id]?.stars ?? 0))
    : DESIGN_VARIANTS;

  return (
    <div className={styles.page} data-v3="light">
      <header className={styles.header}>
        <h1 className={styles.title}>디자인 랩</h1>
        <p className={styles.criteria}>
          평가 순서 - ① 5초 안에 오늘의 숫자가 읽히는가 → ② 취향 7조 위반이 있는가 →
          ③ 후진 부분이 어디인가 → ④ 이유를 한 문장으로 남긴다
        </p>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.toolButton} ${byScore ? styles.toolButtonOn : ''}`}
            aria-pressed={byScore}
            onClick={() => setByScore(!byScore)}
          >
            {byScore ? '평점순' : '등록순'}
          </button>
          <button type="button" className={styles.toolButton} onClick={copyJson}>
            <ClipboardCopy size={14} aria-hidden />
            평가 JSON 복사
          </button>
          <button type="button" className={styles.toolButton} onClick={reset}>
            <RotateCcw size={14} aria-hidden />
            초기화
          </button>
          {notice && <span className={styles.notice} role="status">{notice}</span>}
        </div>
      </header>

      {ordered.map((variant) => {
        const rating = ratings[variant.id];
        return (
          <section key={variant.id} className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{variant.title}</h2>
              <span className={styles.round}>{variant.round}라운드</span>
            </div>
            <p className={styles.note}>{variant.note}</p>

            <div className={styles.stage} data-v3="light">{variant.render()}</div>

            <div className={styles.review}>
              <StarRow
                value={rating?.stars ?? 0}
                onChange={(stars) => update(variant.id, { stars })}
              />
              <textarea
                className={styles.comment}
                value={rating?.comment ?? ''}
                onChange={(event) => update(variant.id, { comment: event.target.value })}
                placeholder="왜 좋은지/나쁜지 한 문장 - 5초 가독성·취향 7조 위반·후진 부분"
                rows={2}
                aria-label={`${variant.title} 코멘트`}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
