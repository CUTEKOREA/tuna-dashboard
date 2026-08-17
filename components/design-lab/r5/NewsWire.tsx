/**
 * r5 뉴스 시안 B — 와이어형.
 * 임팩트 넘버 가로 스트립을 머리에 두고, 기사 전체를 한 테이블에 밀도로 깐다
 * (순번 · 분류 배지 · 제목 · 첫 문장 1줄). 행 hover 리프트.
 * 순번은 파이프라인 수신 순서다 — 원문에 발행 시각이 없어 시각을 지어내지 않았다 (SOUL ④).
 */
'use client';

import { useState } from 'react';
import {
  buildBriefingImpactNumbers,
  categorizeBriefingTitle,
  dailyBriefing,
  type BriefingCategory,
} from '../../../lib/data/daily-briefing';

/* 분류 배지 — 단색 필 + 흰 글자 (취향 ②) */
const CATEGORY_COLOR: Record<BriefingCategory, string> = {
  시장: '#1c6bb0',
  규제: '#5b5c94',
  원료가: '#b45309',
  무역: '#4f7526',
  조업: '#0e7490',
  뉴스: '#5a6072',
};

/** 첫 문장만 — 소수점(2.5%)에서 끊기지 않게 «마침표 + 공백/끝»만 문장 끝으로 본다 */
function firstSentence(paragraph: string): string {
  const matched = paragraph.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (matched ? matched[0] : paragraph).trim();
}

const ROW_COLUMNS = '44px 66px minmax(0, 1fr)';

export default function NewsWire() {
  const [hover, setHover] = useState<number | null>(null);

  const impacts = buildBriefingImpactNumbers(dailyBriefing);
  const publishedOn = dailyBriefing.date.replaceAll('-', '.');

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <header style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap', marginBottom: 14,
      }}>
        <h2 style={{
          margin: 0, fontSize: '1.25rem', fontWeight: 900,
          letterSpacing: '-0.02em', color: 'var(--text-main)',
        }}>
          참치 뉴스 와이어
        </h2>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          기준일 {publishedOn} · 기사 {dailyBriefing.articles.length}건 · 파이프라인 동기
        </span>
      </header>

      {/* 임팩트 넘버 가로 스트립 — 수치는 기사 원문 토큰 그대로 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {impacts.map((impact) => (
          <div
            key={impact.label}
            style={{
              flex: '1 1 200px',
              border: '1px solid var(--card-border, #e2e4e9)', borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{
              fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.2,
              letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-main)',
            }}>
              {impact.value}
            </div>
            <div style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
              lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {impact.label}
            </div>
          </div>
        ))}
      </div>

      {/* 와이어 테이블 */}
      <div style={{
        display: 'grid', gridTemplateColumns: ROW_COLUMNS, gap: 12,
        padding: '0 10px 7px',
        borderBottom: '2px solid var(--text-main)',
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-muted)',
      }}>
        <span>순번</span>
        <span>분류</span>
        <span>헤드라인</span>
      </div>

      {dailyBriefing.articles.map((article, index) => {
        const category = categorizeBriefingTitle(article.titleKo);
        const isHover = hover === index;
        return (
          <div
            key={article.titleKo}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
            style={{
              display: 'grid', gridTemplateColumns: ROW_COLUMNS, gap: 12, alignItems: 'baseline',
              padding: '9px 10px',
              borderBottom: '1px solid var(--card-border, #e2e4e9)',
              background: isHover ? 'rgba(80, 158, 227, 0.06)' : 'transparent',
              borderRadius: isHover ? 8 : 0,
              transform: isHover ? 'translateY(-2px)' : 'none',
              boxShadow: isHover ? '0 6px 16px rgba(16, 24, 40, 0.12)' : 'none',
              transition: 'transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <span style={{
              fontSize: '0.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-muted)',
            }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 4, textAlign: 'center',
              background: CATEGORY_COLOR[category], color: '#ffffff',
              fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap',
            }}>
              {category}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{
                display: 'block', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.35,
                letterSpacing: '-0.01em', color: 'var(--text-main)',
              }}>
                {article.titleKo}
              </span>
              <span style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.5,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {firstSentence(article.paragraphs[0])}
              </span>
            </span>
          </div>
        );
      })}

      <p style={{ margin: '12px 0 0', fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
        순번은 파이프라인 수신 순서 (원문에 발행 시각 없음) · 행에 마우스를 올리면 리프트
      </p>
    </div>
  );
}
