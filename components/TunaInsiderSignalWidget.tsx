'use client';
import { useEffect, useMemo, useState } from 'react';
import { Fingerprint, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WidgetCard from './WidgetCard';

/**
 * A-3 DART 내부자 시그널 — 참치 상장사 내부자 지분 시그널 (Pillar S5 지배구조)
 *
 * /api/tuna/insider-signal 을 fetch하여
 *  1) 회사별 최근 90일 지분 순증 요약 테이블 (신라교역 행 하이라이트)
 *  2) 최근 이벤트 타임라인 (클릭 시 DART 원문 새 탭)
 *  3) 월별 보고 빈도 스파크 바 차트 (경량)
 * 를 렌더링. '순매수' 표현 금지 — API에 취득 사유 필드 없음 → '지분 순증'.
 */

type InsiderEvent = {
  company: string;
  date: string;
  type: '임원보고' | '5%보고';
  reporter: string;
  position: string | null;
  changeShares: number | null;
  holdShares: number | null;
  holdRatio: number | null;
  reason: string | null;
  rcept_no: string;
};

type CompanySummary = {
  company: string;
  netChange90d: number;
  eventCount90d: number;
  eventCount180d: number;
};

type ApiData = {
  isLive: boolean;
  source: string;
  lastUpdated: string | null;
  windowDays: number;
  netWindowDays: number;
  events: InsiderEvent[];
  summary: CompanySummary[];
};

const MAX_TIMELINE = 8;

const fmtShares = (n: number | null): string => {
  if (n === null) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString()}`;
};

const changeColor = (n: number | null): string =>
  n === null || n === 0 ? '#94a3b8' : n > 0 ? '#10b981' : '#f43f5e';

const SparkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '6px 10px' }}>
      <p style={{ color: '#f8fafc', margin: 0, fontSize: '0.78rem', fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#22d3ee', margin: '2px 0 0 0', fontSize: '0.76rem' }}>
        보고 {Number(payload[0].value).toLocaleString()}건
      </p>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  padding: '7px 10px',
  fontSize: '0.8rem',
  color: '#e2e8f0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const TunaInsiderSignalWidget = () => {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch('/api/tuna/insider-signal')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: ApiData) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const isLive = data?.isLive === true;
  const events = data?.events ?? [];
  const summary = data?.summary ?? [];
  const isEmpty = !loading && !error && isLive && events.length === 0;
  const syncDate = new Date().toISOString().slice(0, 10);

  // 월별 보고 빈도 스파크 (최근 6개월)
  const monthlyFreq = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({ key, label: `${d.getMonth() + 1}월`, count: 0 });
    }
    for (const e of events) {
      const b = buckets.find((x) => e.date.startsWith(x.key));
      if (b) b.count += 1;
    }
    return buckets;
  }, [events]);

  // SIT 동적 구성 (숫자 포함 2~3문장)
  const situation = useMemo(() => {
    if (!data || !isLive || events.length === 0) {
      return '최근 180일 참치 4사(동원산업·사조산업·사조씨푸드·신라교역)의 임원·주요주주 지분 보고를 실시간 집계합니다. 경쟁사 오너·임원의 지분 순증 클러스터는 업황 바닥 인식의 선행 신호이고, 5% 대량보유 보고는 M&A(인수합병)·경영권 이벤트의 조기경보입니다.';
    }
    const sorted = [...summary].sort((a, b) => b.netChange90d - a.netChange90d);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    return `최근 180일 참치 4사 임원·주요주주 지분 보고는 총 ${events.length}건입니다. 90일 지분 순증 기준 최대는 ${top.company}(${fmtShares(top.netChange90d)}주), 최소는 ${bottom.company}(${fmtShares(bottom.netChange90d)}주)로 집계됩니다. 오너·임원의 지분 순증 클러스터는 업황 바닥 인식의 선행 신호이고, 5% 보고 급증은 M&A(인수합병)·경영권 이벤트의 조기경보입니다.`;
  }, [data, isLive, events, summary]);

  // ─── 본문 3상태 (Harness: Loading / Error / Empty) ───
  let body: React.ReactNode;
  if (loading) {
    body = (
      <div style={{ padding: '32px 12px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, animation: 'pulse 1.5s ease-in-out infinite' }}>
          전자공시 임원·주요주주 보고 조회 중…
        </p>
      </div>
    );
  } else if (error || (!isLive && events.length === 0)) {
    body = (
      <div style={{ padding: '28px 12px', textAlign: 'center' }}>
        <p style={{ color: '#f43f5e', fontSize: '0.85rem', margin: '0 0 10px 0' }}>
          전자공시 실시간 조회에 실패했습니다.
        </p>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          style={{
            background: 'rgba(34,211,238,0.1)',
            border: '1px solid rgba(34,211,238,0.35)',
            color: '#22d3ee',
            borderRadius: 6,
            padding: '5px 14px',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          다시 조회
        </button>
      </div>
    );
  } else if (isEmpty) {
    body = (
      <div style={{ padding: '28px 12px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
          최근 180일 임원·주요주주 보고 없음 (4사 전체)
        </p>
      </div>
    );
  } else {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 회사별 90일 지분 순증 요약 테이블 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['회사', '90일 지분 순증 (주)', '90일 보고 (건)', '180일 보고 (건)'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      ...cellStyle,
                      color: '#94a3b8',
                      fontWeight: 600,
                      fontSize: '0.74rem',
                      textAlign: i === 0 ? 'left' : 'right',
                      borderBottom: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => {
                const isSilla = s.company === '신라교역';
                return (
                  <tr
                    key={s.company}
                    style={
                      isSilla
                        ? { background: 'rgba(34,211,238,0.08)', boxShadow: 'inset 3px 0 0 #22d3ee' }
                        : undefined
                    }
                  >
                    <td style={{ ...cellStyle, fontWeight: isSilla ? 700 : 500, color: isSilla ? '#22d3ee' : '#e2e8f0' }}>
                      {s.company}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600, color: changeColor(s.netChange90d) }}>
                      {fmtShares(s.netChange90d)}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{s.eventCount90d.toLocaleString()}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{s.eventCount180d.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 최근 이벤트 타임라인 — 클릭 시 DART 원문 새 탭 */}
        <div>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            최근 보고 타임라인 (최신 {Math.min(events.length, MAX_TIMELINE)}건 · 클릭 시 전자공시 원문)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {events.slice(0, MAX_TIMELINE).map((e) => (
              <a
                key={`${e.rcept_no}-${e.type}-${e.reporter}`}
                href={`https://dart.fss.or.kr/dsaf001/main.do?rcptNo=${e.rcept_no}`}
                target="_blank"
                rel="noopener noreferrer"
                title={e.reason ?? undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.background = 'rgba(34,211,238,0.07)';
                  ev.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  ev.currentTarget.style.transform = 'none';
                }}
              >
                <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>{e.date}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: e.company === '신라교역' ? '#22d3ee' : '#cbd5e1',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.company}
                </span>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    color: e.type === '5%보고' ? '#f59e0b' : '#8b5cf6',
                    background: e.type === '5%보고' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)',
                  }}
                >
                  {e.type}
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#e2e8f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {e.reporter}
                  {e.position ? ` · ${e.position}` : ''}
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: changeColor(e.changeShares), whiteSpace: 'nowrap' }}>
                  {fmtShares(e.changeShares)}주
                </span>
                <ExternalLink size={11} color="#64748b" style={{ flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showChart = !loading && !error && isLive && events.length > 0;

  return (
    <WidgetCard
      title="참치 상장사 내부자 지분 시그널"
      icon={Fingerprint}
      iconColor="#22d3ee"
      pillar="S5"
      termTooltip={{
        term: 'DART',
        description:
          '금융감독원 전자공시시스템(Data Analysis, Retrieval and Transfer System). 임원·주요주주 소유보고와 5% 대량보유 보고가 게시되는 법정 공시 채널.',
      }}
      cardDesc="금융감독원 전자공시(DART) 임원·주요주주 소유보고 + 5% 대량보유 보고 — 참치 4사 최근 180일 실시간 집계"
      unit="(단위: 주)"
      telemetry={{ status: isLive ? 'LIVE' : 'STATIC', syncDate }}
      chartHeight={showChart ? 130 : 0}
      chart={
        showChart ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFreq} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
              <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
              <Tooltip content={<SparkTooltip />} cursor={{ fill: 'rgba(34,211,238,0.06)' }} />
              <Bar dataKey="count" name="보고 건수" fill="#22d3ee" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : undefined
      }
      customBody={body}
      takeaway={{
        situation,
        actionPlan:
          '경쟁사 오너·임원의 지분 순증 클러스터가 감지되면 해당사 저평가·업황 반전 가설을 세워 IR(기업설명회) 미팅에서 검증한다. 5% 보고 발생 시 지배구조·경영권 이벤트가 원료 조달·가공 계약망에 미칠 파장을 선제 점검한다.',
        source: '금융감독원 전자공시 DART 임원·주요주주 소유보고(elestock) + 5% 대량보유 보고(majorstock) 실시간',
      }}
    />
  );
};

export default TunaInsiderSignalWidget;
