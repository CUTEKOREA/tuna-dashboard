'use client';

import React, { useEffect, useState } from 'react';
import styles from './EmbeddedDashboardFrame.module.css';

const BANGKOK_REPORT_URL = '/reports/bangkok_weekly_2020_2026.html';
const FRAME_LOAD_TIMEOUT_MS = 8_000;

type EmbeddedFrameStatus = 'loading' | 'loaded' | 'unavailable';

export interface EmbeddedDashboardFrameViewProps {
  status: EmbeddedFrameStatus;
  src: string;
  title: string;
  loadingLabel: string;
  unavailableMessage: string;
  externalLinkLabel: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function EmbeddedDashboardFrameView({
  status,
  src,
  title,
  loadingLabel,
  unavailableMessage,
  externalLinkLabel,
  onLoad,
  onError,
}: EmbeddedDashboardFrameViewProps) {
  const showFrame = status === 'loading' || status === 'loaded';
  const showLoading = status === 'loading';

  return (
    <section className={styles.frameShell} aria-label={`${title} 영역`}>
      {showFrame && (
        <iframe
          className={styles.frame}
          src={src}
          title={title}
          loading="eager"
          onLoad={onLoad}
          onError={onError}
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      )}

      {showLoading && (
        <div className={styles.stateOverlay} aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <p>{loadingLabel}</p>
        </div>
      )}

      {status === 'unavailable' && (
        <div className={styles.stateOverlay} role="alert">
          <div className={styles.unavailablePanel}>
            <p>{unavailableMessage}</p>
            <a href={src} target="_blank" rel="noopener" className={styles.externalLink}>
              {externalLinkLabel}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

interface EmbeddedDashboardFrameProps {
  src: string;
  title: string;
  loadingLabel: string;
  unavailableMessage: string;
  externalLinkLabel: string;
}

function EmbeddedDashboardFrame({
  src,
  title,
  loadingLabel,
  unavailableMessage,
  externalLinkLabel,
}: EmbeddedDashboardFrameProps) {
  const [status, setStatus] = useState<EmbeddedFrameStatus>('loading');

  useEffect(() => {
    if (status !== 'loading') return;

    const timeoutId = window.setTimeout(() => {
      setStatus('unavailable');
    }, FRAME_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [status]);

  return (
    <EmbeddedDashboardFrameView
      status={status}
      src={src}
      title={title}
      loadingLabel={loadingLabel}
      unavailableMessage={unavailableMessage}
      externalLinkLabel={externalLinkLabel}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('unavailable')}
    />
  );
}

export function BangkokOfficeDashboard() {
  return (
    <EmbeddedDashboardFrame
      src={BANGKOK_REPORT_URL}
      title="방콕사무소 주간보고"
      loadingLabel="방콕사무소 주간보고 불러오는 중..."
      unavailableMessage="방콕사무소 주간보고를 불러올 수 없습니다."
      externalLinkLabel="새 탭에서 열기"
    />
  );
}
