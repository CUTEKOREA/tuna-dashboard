'use client';

import React from 'react';
import { ChevronDown, Newspaper } from 'lucide-react';
import {
  buildDailyBriefingTakeaways,
  dailyBriefing,
} from '../lib/data/daily-briefing';
import WidgetCard from './WidgetCard';
import styles from './TunaDailyBriefingWidget.module.css';

function displayDate(value: string): string {
  return value.replaceAll('-', '.');
}

export default function TunaDailyBriefingWidget() {
  const takeaways = buildDailyBriefingTakeaways(dailyBriefing);

  return (
    <WidgetCard
      id="MKT-DAILY-BRIEFING"
      title={`오늘의 참치 뉴스 · ${displayDate(dailyBriefing.date)}`}
      icon={Newspaper}
      iconColor="#f59e0b"
      pillar="S4"
      cardDesc="Atuna 일일 뉴스 → 사내 브리핑 파이프라인 산출 · 게시판 원문과 동일 소스"
      telemetry={{ status: 'SYNCED', syncDate: dailyBriefing.date }}
      unit={`(기사 ${dailyBriefing.articles.length}건)`}
      customBody={(
        <div className={styles.body}>
          <section className={styles.section} aria-labelledby="daily-briefing-digest-title">
            <h4 id="daily-briefing-digest-title" className={styles.sectionTitle}>
              다이제스트 헤드라인
            </h4>
            <ol className={styles.digestList}>
              {dailyBriefing.digest.map((item, index) => (
                <li
                  key={item.title}
                  className={styles.digestItem}
                  data-testid="daily-briefing-digest-item"
                >
                  <span className={styles.digestNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{item.title}</span>
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
              {dailyBriefing.articles.map((article) => (
                <details
                  key={article.titleKo}
                  className={styles.article}
                  data-testid="daily-briefing-article"
                >
                  <summary>
                    <span className={styles.articleTitle}>{article.titleKo}</span>
                    <ChevronDown className={styles.chevron} size={17} aria-hidden="true" />
                  </summary>
                  <div className={styles.paragraphs}>
                    {article.paragraphs.map((paragraph, index) => (
                      <p key={`${article.titleKo}-${index}`} className={styles.paragraph}>
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
      takeaway={{
        situation: (
          <span data-testid="daily-briefing-sit">{takeaways.situation}</span>
        ),
        actionPlan: (
          <span data-testid="daily-briefing-tak">{takeaways.actionPlan}</span>
        ),
        source: `사내 게시판용 참치 뉴스 브리핑 (${dailyBriefing.date})`,
      }}
    />
  );
}
