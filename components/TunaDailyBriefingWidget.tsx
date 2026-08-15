'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Newspaper } from 'lucide-react';
import {
  buildBriefingImpactNumbers,
  categorizeBriefingTitle,
  dailyBriefing,
} from '../lib/data/daily-briefing';
import WidgetCard from './WidgetCard';
import styles from './TunaDailyBriefingWidget.module.css';

function displayDate(value: string): string {
  return value.replaceAll('-', '.');
}

export default function TunaDailyBriefingWidget() {
  const impactNumbers = buildBriefingImpactNumbers(dailyBriefing);
  // 다이제스트 항목 클릭 → 대응 기사 펼침 (digest·articles는 파이프라인이 같은 순서로 산출)
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  const lead = dailyBriefing.digest[0];
  const briefs = dailyBriefing.digest.slice(1);

  return (
    <WidgetCard
      id="MKT-DAILY-BRIEFING"
      title={`오늘의 참치 뉴스 · ${displayDate(dailyBriefing.date)}`}
      icon={Newspaper}
      iconColor="#f59e0b"
      pillar="S4"
      telemetry={{ status: 'SYNCED', syncDate: dailyBriefing.date }}
      unit={`(기사 ${dailyBriefing.articles.length}건)`}
      customBody={(
        <div className={styles.body}>
          {/* 리드 — 1번 기사 대형 헤드라인 + 기사 속 수치 임팩트 넘버 (A안, 2026-08-15) */}
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

          {/* 브리프 — 나머지 헤드라인, 배지 + 클릭 시 해당 기사 펼침 */}
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
              {dailyBriefing.articles.map((article, index) => (
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
                    <span className={styles.articleTitle}>{article.titleKo}</span>
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
      )}
    />
  );
}
