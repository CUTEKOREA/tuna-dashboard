/**
 * 오늘의 참치 뉴스 — 신문 1면형. 디자인 랩 5라운드 최종 채택본 (r5-A ★4, 2026-08-17).
 * 리드 초대형 헤드라인 + 첫 문단, 우측 임팩트 넘버 스택, 나머지 2단 컬럼(제목+첫 문장 상시).
 * 승격 시 추가: 기사 클릭 = 그 자리 전문 펼침 (시안은 첫 문장뿐이라 전문 접근이 후퇴했었음).
 * 임팩트 넘버에 증감색 없음은 의도 — 수준값에 상승색을 붙이면 없는 주장이 생긴다 (SOUL ④).
 */
'use client';

import { useState } from 'react';
import {
  buildBriefingImpactNumbers,
  categorizeBriefingTitle,
  dailyBriefing,
  type BriefingCategory,
} from '../lib/data/daily-briefing';
import { NEWS_CATEGORY_ID } from '@/lib/chart-palette';

/* 분류 배지 — 선단 DB 정체성 겹(C). 연한 아웃라인 대신 단색 필 + 흰 글자 */
const CATEGORY_COLOR: Record<BriefingCategory, string> = NEWS_CATEGORY_ID;

function Badge({ title }: { title: string }) {
  const category = categorizeBriefingTitle(title);
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 4,
      background: CATEGORY_COLOR[category], color: '#ffffff',
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {category}
    </span>
  );
}

/** 첫 문장만 — 소수점(2.5%)에서 끊기지 않게 «마침표 + 공백/끝»만 문장 끝으로 본다 */
function firstSentence(paragraph: string): string {
  const matched = paragraph.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (matched ? matched[0] : paragraph).trim();
}

export default function NewsFrontPage() {
  const [hover, setHover] = useState<number | null>(null);
  // 전문 펼침 — -1 = 리드, 0.. = 나머지 기사 인덱스
  const [open, setOpen] = useState<number | null>(null);

  const impacts = buildBriefingImpactNumbers(dailyBriefing);
  const [lead, ...rest] = dailyBriefing.articles;
  const publishedOn = dailyBriefing.date.replaceAll('-', '.');

  return (
    <div className="dsc-card" style={{ padding: '24px 26px' }}>
      {/* 제호 */}
      <header style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
        paddingBottom: 10, marginBottom: 18, borderBottom: '3px solid var(--text-main)',
      }}>
        <h2 style={{
          margin: 0, fontSize: '2rem', fontWeight: 900,
          letterSpacing: '-0.03em', color: 'var(--text-main)',
        }}>
          오늘의 참치 뉴스
        </h2>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          기준일 {publishedOn} · 기사 {dailyBriefing.articles.length}건 · 파이프라인 동기
        </span>
      </header>

      {/* 리드 기사 + 임팩트 넘버 세로 스택 */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 216px',
        gap: 26, alignItems: 'start',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Badge title={lead.titleKo} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              오늘의 리드
            </span>
          </div>
          <h3 style={{
            margin: '0 0 12px', fontSize: 'clamp(1.75rem, 2.6vw, 2.4rem)', fontWeight: 900,
            lineHeight: 1.16, letterSpacing: '-0.03em', color: 'var(--text-main)',
          }}>
            {lead.titleKo}
          </h3>
          <p style={{
            margin: 0, fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.75,
            color: 'var(--text-main)',
          }}>
            {lead.paragraphs[0]}
          </p>
          {open === -1 && lead.paragraphs.slice(1).map((paragraph, i) => (
            <p key={i} style={{ margin: '10px 0 0', fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--text-main)' }}>
              {paragraph}
            </p>
          ))}
          {lead.paragraphs.length > 1 && (
            <button
              type="button"
              onClick={() => setOpen(open === -1 ? null : -1)}
              style={{ marginTop: 10, padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary, #509ee3)' }}
            >
              {open === -1 ? '접기 ↑' : '계속 읽기 ↓'}
            </button>
          )}
        </div>

        <aside style={{ borderLeft: '1px solid var(--card-border, #e2e4e9)', paddingLeft: 20 }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
            letterSpacing: '0.04em', marginBottom: 10,
          }}>
            오늘의 수치
          </div>
          {impacts.map((impact, index) => (
            <div
              key={impact.label}
              style={{
                paddingTop: index === 0 ? 0 : 12,
                marginTop: index === 0 ? 0 : 12,
                borderTop: index === 0 ? 'none' : '1px solid var(--card-border, #e2e4e9)',
              }}
            >
              <div style={{
                fontSize: '1.7rem', fontWeight: 900, lineHeight: 1.15,
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
                color: 'var(--text-main)',
              }}>
                {impact.value}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {impact.label}
              </div>
            </div>
          ))}
        </aside>
      </section>

      {/* 나머지 기사 — 2단 컬럼, 제목 + 첫 문장 */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        marginTop: 20, borderTop: '1px solid var(--card-border, #e2e4e9)',
      }}>
        {rest.map((article, index) => {
          const isRight = index % 2 === 1;
          return (
            <article
              key={article.titleKo}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setOpen(open === index ? null : index)}
              style={{
                cursor: 'pointer',
                padding: isRight ? '14px 4px 14px 22px' : '14px 22px 14px 4px',
                borderLeft: isRight ? '1px solid var(--card-border, #e2e4e9)' : 'none',
                borderBottom: '1px solid var(--card-border, #e2e4e9)',
                background: hover === index ? 'rgba(80, 158, 227, 0.06)' : 'transparent',
                borderRadius: hover === index ? 8 : 0,
                transform: hover === index ? 'translateY(-2px)' : 'none',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <Badge title={article.titleKo} />
              </div>
              <h4 style={{
                margin: '0 0 5px', fontSize: '1rem', fontWeight: 700, lineHeight: 1.35,
                letterSpacing: '-0.01em', color: 'var(--text-main)',
              }}>
                {article.titleKo}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 400, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {open === index ? null : firstSentence(article.paragraphs[0])}
              </p>
              {open === index && article.paragraphs.map((paragraph, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0', fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--text-main)' }}>
                  {paragraph}
                </p>
              ))}
            </article>
          );
        })}
      </section>

      <p style={{ margin: '14px 0 0', fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
        기사 클릭 = 전문 펼침 · 수치는 기사 원문에서 그대로 뽑았다
      </p>
    </div>
  );
}
