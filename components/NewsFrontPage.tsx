/**
 * 이번주 참치 뉴스 — 신문 1면형. 디자인 랩 5라운드 최종 채택본 (r5-A ★4, 2026-08-17).
 * 리드 초대형 헤드라인 + 첫 문단, 우측 임팩트 넘버 스택, 나머지 2단 컬럼(제목+첫 문장 상시).
 * 승격 시 추가: 기사 클릭 = 그 자리 전문 펼침 (시안은 첫 문장뿐이라 전문 접근이 후퇴했었음).
 * 임팩트 넘버에 증감색 없음은 의도 — 수준값에 상승색을 붙이면 없는 주장이 생긴다 (SOUL ④).
 */
'use client';

import { useMemo, useState } from 'react';
import {
  buildBriefingImpactNumbers,
  categorizeBriefingTitle,
  weeklyBriefing,
  type BriefingCategory,
  type DailyBriefing,
} from '../lib/data/daily-briefing';
import { NEWS_CATEGORY_ID } from '@/lib/chart-palette';

/* 분류 배지 — 선단 DB 정체성 겹(C). 연한 아웃라인 대신 단색 필 + 흰 글자 */
const CATEGORY_COLOR: Record<BriefingCategory, string> = NEWS_CATEGORY_ID;

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

function shortMd(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${month}/${day}`;
}

function dayTabLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  const weekday = WEEKDAY_KO[parsed.getUTCDay()];
  return `${weekday} ${shortMd(isoDate)}`;
}

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

function DayFrontPage({
  briefing,
  open,
  setOpen,
  hover,
  setHover,
}: {
  briefing: DailyBriefing;
  open: number | null;
  setOpen: (value: number | null) => void;
  hover: number | null;
  setHover: (value: number | null) => void;
}) {
  const impacts = buildBriefingImpactNumbers(briefing);
  const [lead, ...rest] = briefing.articles;

  return (
    <>
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
    </>
  );
}

export default function NewsFrontPage() {
  const { weekStart, weekEnd, days } = weeklyBriefing;
  const latestDate = days[days.length - 1].date;
  const [selectedDate, setSelectedDate] = useState(latestDate);
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? days[days.length - 1],
    [days, selectedDate],
  );

  const totalArticles = days.reduce((sum, day) => sum + day.articles.length, 0);

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
          이번주 참치 뉴스
        </h2>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {shortMd(weekStart)}~{shortMd(weekEnd)} · 기사 {totalArticles}건 · 파이프라인 동기
        </span>
      </header>

      {/* 선택 상태를 색으로만 알리면 스크린리더가 못 읽는다 — role/aria-selected 로 알린다.
          tabIndex 로빙은 넣지 않았다: 화살표 키 처리 없이 비활성 탭을 -1 로 두면
          키보드로 다른 날짜에 닿을 수 없어 지금보다 나빠진다. 모든 탭을 Tab 으로 짚는다. */}
      <div
        role="tablist"
        aria-label="요일 선택"
        style={{
          display: 'flex', gap: 8, overflowX: 'auto', flexWrap: 'nowrap',
          marginBottom: 18, paddingBottom: 4,
        }}
      >
        {days.map((day) => {
          const active = day.date === selectedDay.date;
          return (
            <button
              key={day.date}
              type="button"
              role="tab"
              id={`briefing-tab-${day.date}`}
              aria-selected={active}
              aria-controls="briefing-tabpanel"
              onClick={() => {
                setSelectedDate(day.date);
                setOpen(null);
              }}
              style={{
                flex: '0 0 auto',
                padding: '6px 14px',
                borderRadius: 6,
                border: active ? '2px solid var(--text-main)' : '1px solid var(--card-border, #e2e4e9)',
                background: active ? 'var(--text-main)' : 'transparent',
                color: active ? '#fff' : 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {dayTabLabel(day.date)}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="briefing-tabpanel"
        aria-labelledby={`briefing-tab-${selectedDay.date}`}
      >
        <DayFrontPage
          briefing={selectedDay}
          open={open}
          setOpen={setOpen}
          hover={hover}
          setHover={setHover}
        />
      </div>

      <p style={{ margin: '14px 0 0', fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
        기사 클릭 = 전문 펼침 · 수치는 기사 원문에서 그대로 뽑았다
      </p>
    </div>
  );
}
