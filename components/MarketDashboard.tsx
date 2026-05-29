'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Ship, Anchor, AlertTriangle, BarChart2,
  Newspaper, Globe, Activity, Search
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import atunaPrices from '../public/data/atuna_prices.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function MarketDashboard() {
  const [priceData, setPriceData] = useState<any[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  
  useEffect(() => {
    setPriceData(atunaPrices.filter((d: any) => d.date >= '2022-01-01'));
  }, []);

  // Measure container width with ResizeObserver (works even after display:none -> block toggle)
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setChartWidth(w);
    };
    
    // Initial measure
    measure();
    
    // Re-measure on resize or when KeepAlivePanel toggles visibility
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    
    return () => ro.disconnect();
  }, []);

  const [mgoData, setMgoData] = useState({ price: 1144, change: -521, date: '2026.05.28', loading: false });
  const [fxData, setFxData] = useState({ usd_krw: 1513, date: '2026.05.28', loading: false });
  const [atunaLatest, setAtunaLatest] = useState<{
    skjBkk: { price: number; date: string };
    yfSey: { price: number; date: string };
    latestDate: string | null;
    loading: boolean;
  }>({
    skjBkk: { price: 1850, date: '2026-05-22' },
    yfSey: { price: 2000, date: '2026-05-20' },
    latestDate: '2026-05-28',
    loading: false,
  });

  useEffect(() => {
    // Atuna 참치 도매가 latest 페치 (SKJ Bangkok + YF Seychelles)
    setAtunaLatest(prev => ({ ...prev, loading: true }));
    fetch('/api/atuna-prices')
      .then(res => res.json())
      .then(data => {
        const hub = data.latestByHub || {};
        setAtunaLatest({
          skjBkk: hub.skj_bkk || { price: 1850, date: '2026-05-22' },
          yfSey: hub.yf_sey || { price: 2000, date: '2026-05-20' },
          latestDate: data.latestDate,
          loading: false,
        });
      })
      .catch(() => setAtunaLatest(prev => ({ ...prev, loading: false })));

    // Fetch MGO live data
    setMgoData(prev => ({ ...prev, loading: true }));
    fetch('/api/mgo')
      .then(res => res.json())
      .then(data => {
        if (data.price) {
          setMgoData({ price: data.price, change: data.change, date: data.date, loading: false });
        }
      })
      .catch(() => setMgoData(prev => ({ ...prev, loading: false })));

    // Fetch FX live data
    setFxData(prev => ({ ...prev, loading: true }));
    fetch('/api/exchange')
      .then(res => res.json())
      .then(data => {
        if (data.usd_krw) {
          setFxData({ usd_krw: data.usd_krw, date: data.date, loading: false });
        }
      })
      .catch(() => setFxData(prev => ({ ...prev, loading: false })));
  }, []);

  const formatHubDate = (d?: string) => (d ? d.replace(/-/g, '.') : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ROW 1: CORE MACRO KPIs */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1 */}
        <div className="ds-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>SKJ 가다랑어 (방콕)</span>
            <Ship size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {atunaLatest.loading ? '...' : `$${atunaLatest.skjBkk.price.toLocaleString()}`} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-success)' }}>
            <TrendingDown size={14} />
            <span>Atuna API ({formatHubDate(atunaLatest.skjBkk.date)} 기준)</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="ds-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>YF 황다랑어 (세이셸)</span>
            <Anchor size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {atunaLatest.loading ? '...' : `$${atunaLatest.yfSey.price.toLocaleString()}`} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
            <TrendingUp size={14} />
            <span>Atuna API ({formatHubDate(atunaLatest.yfSey.date)} 기준)</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="ds-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>싱가포르 MGO 유가</span>
            <Activity size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {mgoData.loading ? '...' : `$${mgoData.price.toLocaleString()}`} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: mgoData.change >= 0 ? '#ef4444' : 'var(--accent-success)' }}>
            {mgoData.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>오늘자 API 연동 ({mgoData.date})</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="ds-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>달러·원 환율</span>
            <Globe size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {fxData.loading ? '...' : `₩${fxData.usd_krw.toLocaleString()}`} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/$</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
            <TrendingUp size={14} />
            <span>오늘자 API 연동 ({fxData.date})</span>
          </div>
        </div>
      </section>

      {/* ROW 2: TUNA PRICE TRENDS BY REGION */}
      <section className="ds-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <BarChart2 size={20} color="#38bdf8" />
          글로벌 참치 어가 추이 (SKJ & YF Regional Spread)
        </h3>
        <div ref={chartContainerRef} style={{ width: '100%', minHeight: '350px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          
          {/* LEFT: SKIPJACK (SKJ) */}
          {chartWidth > 0 && priceData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                Skipjack (SKJ)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={350} data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                
                <Line yAxisId="left" type="monotone" dataKey="skj_bkk" name="SKJ 방콕" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_mnt" name="SKJ 만타" stroke="#2dd4bf" strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_abj" name="SKJ 아비장" stroke="#f472b6" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_sey" name="SKJ 세이셸" stroke="#facc15" strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_vig" name="SKJ 비고" stroke="#fb923c" strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
              </LineChart>
            </div>
          )}

          {/* RIGHT: YELLOWFIN (YF) */}
          {chartWidth > 0 && priceData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                Yellowfin (YF)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={350} data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                
                <Line yAxisId="left" type="monotone" dataKey="yf_abj" name="YF 아비장" stroke="#818cf8" strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_sey" name="YF 세이셸" stroke="#c084fc" strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_vig" name="YF 비고" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
              </LineChart>
            </div>
          )}

        </div>
      </section>

      {/* ROW 3: ATUNA NEWS WEEKLY TOP 4 */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Newspaper size={20} color="#f59e0b" />
          Atuna Daily Digest: 5월 28일 시장을 움직이는 핵심 시그널 4선
        </h3>
        <div data-mobile-stack style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {/* News 1 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                어가 급변 / 공급
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.28</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "SKJ 만타 $2,025/t — EPO 공급 부족 속 고가 유지, YF와 가격 동조화"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              에콰도르 선단의 1~3월 스킵잭 어획량이 86,809톤으로 전년 대비 27% 급감, 원료 부족으로 만타 SKJ가 $2,025/t(+1.3% vs 5월 초)에 거래. EU 선주들은 더 높은 가격을 제시하나 통조림 공장은 방콕 하락세를 기대하며 거부. 옐로핀은 대형 개체(20kg+) 대량 입항으로 $2,050/t까지 하락하며 SKJ와 가격 동조화 발생. 에콰도르 연료비는 2월 대비 2배 이상 급등(프리미엄 디젤 $5.40/갤런, +14%).
            </p>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                무역 / 규제
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.28</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "Anfaco, EU-멕시코 무역 협정에 경고 — 참치 통조림 완전 자유화 우려"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              5/22 EU-멕시코 정상회담에서 체결된 MGA·iTA에 참치 통조림이 포함, 7년차부터 제로 관세 적용 전망. 스페인 통조림 협회 Anfaco는 멕시코의 통합 참치 산업(연 21.1만톤 어획, +14% YoY) 구조가 유럽 가공업체에 심각한 위협이라 경고. 멕시코 Grupomar·Grupo Pinsa 등의 EU 시장 침투 본격화 가능성. 유럽 위원회에 시장 모니터링 메커니즘 도입을 촉구.
            </p>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                환경 / 블루이코노미
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.28</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "PNG, 21.4만 헥타르 MPA 지정 — 블루카본 본드 시장 진출 및 VDS 영향"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              PNG 수산부 장관이 멜라네시아 해양정상회의에서 서부 마누스 해역 21.4만 헥타르 MPA 지정을 발표. 세이셸의 블루본드 모델을 벤치마킹, 보존 금융 확보 추진. 이 &apos;금어구&apos;가 PNG EEZ 내부에 위치해 VDS 수익에 직접 영향 불가피. 한편 비스마르크 해저 타이탄 리지 화산 활동이 5/16 이후 가속화되며 주요 참치 어장인 인근 해역의 선망 조업에 차질 우려 지속.
            </p>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                규제 / IUU 단속
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.28</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "미국, IUU 어업 관련 외국인 26명 비자 금지 + Bumble Bee 강제노동 소송 각하"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              미 국무부가 IUU 어업 관련 26명에 대한 비자 제한을 발동, 아르헨티나·멕시코 관련자 실명 공개. 트럼프 &apos;미국 수산업 경쟁력 복원&apos; 행정명령과 연계. 한편 캘리포니아 연방법원은 인도네시아 어부들의 Bumble Bee 강제노동 소송을 각하 — &quot;원고가 현재 진행 중인 피해를 입증하지 못했다&quot;고 판시. Greenpeace는 &quot;금전적 배상 가능성이 기업 관행 변화를 이끌 수 있다&quot;고 논평.
            </p>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          Forensic Intelligence: 5/28 참치 산업 구조 변화와 전략적 시사점
        </h3>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="EPO 공급 경색 + 방콕 역행 — SKJ 거래소별 양극화 심화"
            icon={Search}
            iconColor="#818cf8"
            pillar="S1"
            cardDesc="만타 $2,025(+1.3%) vs 방콕 $1,850(-6.3%) — EPO 원료 부족과 WCPO 풍어 병존"
            telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026.05.28' }}
            customBody={<></>}
            takeaway={{
              situation: "EPO 에콰도르 선단의 Q1 SKJ 어획량 86,809톤(-27% YoY), 2024년 기록적 풍어의 정상화 과정. 만타 SKJ $2,025/t(+1.3%), YF 대형 개체 대량 입항으로 $2,050/t까지 하락해 SKJ와 가격 동조화 발생. 반면 방콕 SKJ는 $1,850(-6.3%, 3주 연속 ↓), 세이셸 $1,490(-0.7%). EPO 연료비 2월 대비 2배 급등(프리미엄 디젤 $5.40/갤런). PNG MPA 21.4만ha 지정으로 VDS 어장 축소 + 화산 리스크 지속.",
              actionPlan: "**[Actionable Insight]** (1) 만타-방콕 스프레드(현재 $175/t)가 역사적 고점 — WCPO 현물 매수 가속(방콕 $1,850 구간). EPO 원료는 캐너리 경쟁 심화로 단기 프리미엄 유지 전망. (2) EU-멕시코 MGA 7년차 제로 관세 대비, 멕시코산 통조림의 EU 시장 침투에 선제 대응 — Grupomar/Pinsa 동향 모니터링 필수. (3) PNG MPA/화산으로 WCPO 조업일수 감소 시 SKJ 반등 가능성 → 현 시점 6개월 원료 비축 유효.",
              source: 'Atuna 2026.05.28 + CSV 어가 업데이트 2026.05.29',
            }}
          />

          <WidgetCard
            title="IUU 단속 글로벌 강화 + 멜라네시아 블루이코노미 부상"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="미국 비자 금지 26명 + PNG 블루카본 본드 시장 개척 — ESG 패러다임 전환"
            telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026.05.28' }}
            customBody={<></>}
            takeaway={{
              situation: "미국이 IUU 어업 관련 외국인 26명에 비자 제한 발동 — 트럼프 '수산업 경쟁력 복원' 행정명령, FISH Act 상원 통과, Section 301 조사 요청과 맞물린 다층적 규제 강화. Bumble Bee 강제노동 소송은 각하되었으나, TVPRA 공급망 소송 자체가 산업 전체의 ESG 리스크 인식을 높임. PNG는 블루카본 본드(세이셸 모델)로 보존 금융 확보 추진, MPA 지정이 VDS 기반 선망 조업 구조에 직접 영향.",
              actionPlan: "(1) 미국향 수출 시 IUU·TVPRA 컴플라이언스 체크리스트 강화 — 공급망 내 중국 연승선 원료 사용 여부 재점검 필수. (2) PNG VDS 일수 구매 전략 재검토: MPA 확대 + 화산 리스크로 유효 조업 해역 축소 → 단가 상승 전망. (3) 멜라네시아 블루본드 발행 시 참여 가능성 검토 — ESG 투자+조업권 확보를 결합한 '전략적 보존 투자' 모델. Anfaco의 EU-멕시코 경고는 한국 통조림 수출 전략에도 시사점.",
              source: 'Atuna 2026.05.28 (IUU Visa Ban / Bumble Bee / PNG MPA / Anfaco-Mexico)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
