'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Newspaper } from 'lucide-react';
import {
  buildBriefingImpactNumbers,
  categorizeBriefingTitle,
  weeklyBriefing,
  type DailyBriefing,
} from '../lib/data/daily-briefing';
import WidgetCard from './WidgetCard';
import styles from './TunaDailyBriefingWidget.module.css';

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

function DayBriefingBody({
  briefing,
  openArticle,
  setOpenArticle,
}: {
  briefing: DailyBriefing;
  openArticle: number | null;
  setOpenArticle: (value: number | null) => void;
}) {
  const impactNumbers = buildBriefingImpactNumbers(briefing);
  const lead = briefing.digest[0];
  const briefs = briefing.digest.slice(1);

  return (
    <div className={styles.body}>
      <section className={styles.lead} aria-labelledby="daily-briefing-lead-title">
        <div className={styles.leadKicker}>
          <span className={styles.badge} data-category={categorizeBriefingTitle(lead.title)}>
            {categorizeBriefingTitle(lead.title)}
          </span>
          오늘의 리드
        </div>
        <button
          id="daily-briefing-lead-title"
          type="button"
          className={styles.leadHeadline}
          data-testid="daily-briefing-lead"
          onClick={() => setOpenArticle(openArticle === 0 ? null : 0)}
        >
          {lead.title}
        </button>
        {impactNumbers.length > 0 && (
          <div className={styles.impactRow} data-testid="daily-briefing-impact">
            {impactNumbers.map((impact) => (
              <div key={impact.label} className={styles.impact}>
                <span className={styles.impactValue}>{impact.value}</span>
                <span className={styles.impactLabel}>{impact.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="daily-briefing-digest-title">
        <h4 id="daily-briefing-digest-title" className={styles.sectionTitle}>
          다이제스트 헤드라인
        </h4>
        <ol className={styles.digestList}>
          {briefs.map((item, index) => (
            <li key={item.title} data-testid="daily-briefing-digest-item">
              <button
                type="button"
                className={styles.digestItem}
                onClick={() => setOpenArticle(openArticle === index + 1 ? null : index + 1)}
              >
                <span className={styles.badge} data-category={categorizeBriefingTitle(item.title)}>
                  {categorizeBriefingTitle(item.title)}
                </span>
                <span className={styles.digestText}>{item.title}</span>
                <ChevronRight className={styles.digestArrow} size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={styles.section}
        aria-labelledby="daily-briefing-articles-title"
        data-testid="daily-briefing-articles"
      >
        <h4 id="daily-briefing-articles-title" className={styles.sectionTitle}>
          기사 상세
        </h4>
        <div className={styles.articleList}>
          {briefing.articles.map((article, index) => (
            <details
              key={article.titleKo}
              className={styles.article}
              data-testid="daily-briefing-article"
              open={openArticle === index}
              onToggle={(event) => {
                const isOpen = (event.target as HTMLDetailsElement).open;
                if (isOpen) setOpenArticle(index);
                else if (openArticle === index) setOpenArticle(null);
              }}
            >
              <summary>
                <span className={styles.articleTitle}>
                  {article.titleKo}
                  {article.paragraphs[0] && (
                    <span className={styles.articlePreview}>{article.paragraphs[0]}</span>
                  )}
                </span>
                <ChevronDown className={styles.chevron} size={17} aria-hidden="true" />
              </summary>
              <div className={styles.paragraphs}>
                {article.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${article.titleKo}-${paragraphIndex}`} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function TunaDailyBriefingWidget() {
  const { weekStart, weekEnd, days } = weeklyBriefing;
  const latestDate = days[days.length - 1].date;
  const [selectedDate, setSelectedDate] = useState(latestDate);
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? days[days.length - 1],
    [days, selectedDate],
  );

  const totalArticles = days.reduce((sum, day) => sum + day.articles.length, 0);

  return (
    <WidgetCard
      id="MKT-DAILY-BRIEFING"
      title={`이번주 참치 뉴스 · ${shortMd(weekStart)}~${shortMd(weekEnd)}`}
      icon={Newspaper}
      iconColor="#f59e0b"
      pillar="S4"
      telemetry={{ status: 'SYNCED', syncDate: selectedDay.date }}
      unit={`(기사 ${totalArticles}건)`}
      customBody={(
        <>
          <nav
            aria-label="요일 선택"
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              flexWrap: 'nowrap',
              marginBottom: 12,
              padding: '0 4px 4px',
            }}
          >
            {days.map((day) => {
              const active = day.date === selectedDay.date;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setOpenArticle(null);
                  }}
                  style={{
                    flex: '0 0 auto',
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: active ? '2px solid var(--text-main, #1a1a1a)' : '1px solid #e2e4e9',
                    background: active ? 'var(--text-main, #1a1a1a)' : 'transparent',
                    color: active ? '#fff' : 'inherit',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {dayTabLabel(day.date)}
                </button>
              );
            })}
          </nav>
          <DayBriefingBody
            briefing={selectedDay}
            openArticle={openArticle}
            setOpenArticle={setOpenArticle}
          />
        </>
      )}
    />
  );
}
