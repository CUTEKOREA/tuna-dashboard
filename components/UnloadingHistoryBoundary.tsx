'use client';

import React, {
  Component,
  lazy,
  Suspense,
  type ComponentType,
  type ErrorInfo,
  type LazyExoticComponent,
} from 'react';

type HistoryModule = { default: ComponentType };

export interface UnloadingHistoryBoundaryProps {
  loadHistory?: () => Promise<HistoryModule>;
  onRetry?: () => void;
}

export interface UnloadingHistoryBoundaryState {
  hasError: boolean;
}

const loadDefaultHistory = () => import('./UnloadingHistory');
const reloadPage = () => {
  if (typeof window !== 'undefined') window.location.reload();
};

export class UnloadingHistoryBoundary extends Component<
  UnloadingHistoryBoundaryProps,
  UnloadingHistoryBoundaryState
> {
  public state: UnloadingHistoryBoundaryState = {
    hasError: false,
  };

  private HistoryComponent: LazyExoticComponent<ComponentType>;

  public constructor(props: UnloadingHistoryBoundaryProps) {
    super(props);
    this.HistoryComponent = lazy(props.loadHistory ?? loadDefaultHistory);
  }

  public static getDerivedStateFromError(): Pick<UnloadingHistoryBoundaryState, 'hasError'> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('과거 실적 패널 렌더링 오류', error, errorInfo);
  }

  public retryHistory = (): void => {
    (this.props.onRetry ?? reloadPage)();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <section
          data-testid="unloading-history-boundary-error"
          role="alert"
          aria-labelledby="unloading-history-boundary-title"
          style={{
            marginTop: '20px',
            padding: '20px',
            border: '1px solid rgba(245, 158, 11, 0.32)',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.72)',
            color: 'var(--text-main)',
          }}
        >
          <h2 id="unloading-history-boundary-title" style={{ margin: '0 0 8px', fontSize: '1rem' }}>
            과거 실적 패널을 표시하지 못했습니다.
          </h2>
          <p style={{ margin: '0 0 14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            2026년 현재 하역 현황은 계속 이용할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={this.retryHistory}
            style={{
              minHeight: '44px',
              padding: '10px 16px',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              borderRadius: '9px',
              background: 'rgba(14, 165, 233, 0.16)',
              color: '#e2e8f0',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </section>
      );
    }

    const HistoryComponent = this.HistoryComponent;
    return (
      <Suspense
        fallback={(
          <div role="status" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            과거 실적 패널 로딩 중...
          </div>
        )}
      >
        <HistoryComponent />
      </Suspense>
    );
  }
}

export default UnloadingHistoryBoundary;
