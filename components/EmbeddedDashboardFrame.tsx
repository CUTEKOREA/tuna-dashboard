'use client';

import React, { useEffect, useState } from 'react';
import styles from './EmbeddedDashboardFrame.module.css';

const COSMO_DASHBOARD_URL = 'https://cosmo-dashboard-cutekorea-3280s-projects.vercel.app/';
const BANGKOK_REPORT_URL = '/reports/bangkok_weekly_2020_2026.html';
const FRAME_LOAD_TIMEOUT_MS = 8_000;

type EmbeddedFrameStatus = 'checking' | 'loading' | 'loaded' | 'unavailable';

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
  const showLoading = status === 'checking' || status === 'loading';

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
  availabilityUrl?: string;
}

function EmbeddedDashboardFrame({
  src,
  title,
  loadingLabel,
  unavailableMessage,
  externalLinkLabel,
  availabilityUrl,
}: EmbeddedDashboardFrameProps) {
  const [status, setStatus] = useState<EmbeddedFrameStatus>(availabilityUrl ? 'checking' : 'loading');

  useEffect(() => {
    if (!availabilityUrl) return;

    const controller = new AbortController();
    let active = true;

    const checkAvailability = async () => {
      try {
        const response = await fetch(availabilityUrl, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = response.ok ? await response.json() as { available?: unknown } : null;
        if (active) setStatus(payload?.available === true ? 'loading' : 'unavailable');
      } catch {
        if (active) setStatus('unavailable');
      }
    };

    void checkAvailability();

    return () => {
      active = false;
      controller.abort();
    };
  }, [availabilityUrl]);

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

export function CosmoDashboard() {
  return (
    <EmbeddedDashboardFrame
      src={COSMO_DASHBOARD_URL}
      title="코스모 대시보드"
      loadingLabel="코스모 대시보드 연결 중..."
      unavailableMessage="코스모 대시보드에 연결할 수 없습니다. Vercel 배포 보호 설정을 확인하세요."
      externalLinkLabel="새 탭에서 열기"
      availabilityUrl="/api/cosmo-health"
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
