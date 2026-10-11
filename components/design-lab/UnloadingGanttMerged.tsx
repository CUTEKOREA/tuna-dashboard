/**
 * 하역 채택본 미리보기 — 실페이지와 같은 병합(정적 원장 ∪ DB)으로 13척 전부 렌더
 * (r7 «누락분» 판정 해소). variants.tsx 에서 지연 로드하려고 파일을 분리했다 —
 * 정적 원장 데이터까지 /design-lab first-load 밖으로 나간다.
 */
'use client';

import React, { useEffect, useState } from 'react';
import UnloadingVoyageGantt from '../UnloadingVoyageGantt';
import { UNLOADING_STATIC_VESSELS } from '../../lib/data/unloading-static';

export default function UnloadingGanttMerged() {
  const [db, setDb] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    fetch('/api/unloading-db', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => setDb(json?.success && json.data ? json.data : {}))
      .catch(() => setDb({}));
  }, []);
  if (db === null) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>하역 데이터 수신 중…</p>;
  const merged = { ...UNLOADING_STATIC_VESSELS, ...(db as Record<string, never>) };
  return <UnloadingVoyageGantt vesselsById={merged as never} />;
}
