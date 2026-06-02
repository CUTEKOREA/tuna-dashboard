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

  const [mgoData, setMgoData] = useState({ price: 1061, change: -333, date: '2026.06.02', loading: false });
  const [fxData, setFxData] = useState({ usd_krw: 1476, date: '2026.06.02', loading: false });
  const [atunaLatest, setAtunaLatest] = useState<{
    skjBkk: { price: number; date: string };
    yfSey: { price: number; date: string };
    latestDate: string | null;
    loading: boolean;
  }>({
    skjBkk: { price: 1850, date: '2026-06-01' },
    yfSey: { price: 2000, date: '2026-05-20' },
    latestDate: '2026-06-02',
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
          Atuna Daily Digest: 6월 시장을 움직이는 핵심 시그널
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
                원가 / 판가
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.06.01</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "원가와 판가의 엇박자: 서중태평양(WCPO) 선단의 '마진 스퀴즈'"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              글로벌 선박용 경유(MGO)는 톤당 1,061달러로 5월 중순 대비 약 16% 하락했으나 전년(605달러) 대비 여전히 치명적 수준. 반면 방콕 SKJ 원어가는 공급 증가로 6.3% 하락한 $1,850/t. 연료비, 환적비, PNA 입어료 등 고비용 구조 속 판매가 하락이 겹치며 선단들의 조업 중단(Tie-up) 리스크 지속.
            </p>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                규제 / 조업
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.06.01</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "10만 개의 FAD 추적: 동태평양과 서중태평양의 '부표 갈등'"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              IATTC 산하 과학자문위원회(SAC) 조사 결과, 동태평양에 투하된 수천 개의 집어장치(FAD)가 서중태평양수산위원회(WCPFC) 해역으로 무단 표류한 사실이 확인됨. 어린 참치 남획 및 타 해역 생태계 교란 문제로 두 거대 참치 기구 간 관할권 및 외교적 마찰로 비화될 가능성 고조.
            </p>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                시장 / 인프라
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.06.01</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "신흥국의 밸류체인 진입 시도와 인프라의 한계"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              인도네시아 비악(Biak) 섬이 참치 양식 벤처 추진 등 산업 부활을 시도. 인도는 2,108만 달러를 투입해 타밀나두에 참치 전용 항구를 야심 차게 개항했으나, 인프라 미비로 1년 넘게 방치. 신흥국의 자본 투입에도 불구, 규제 및 운영 인프라 한계로 기존 허브 중심의 공급망 편중 현상 지속 전망.
            </p>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                규제 / 지속가능성
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.06.01</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "IATTC, 2031년까지 100% 생분해성(Bio-based) FAD 전환 추진"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              IATTC는 해양 쓰레기 방지 및 생태계 보호를 위해 합성 소재를 퇴출하고 2031년까지 생분해성 FAD 전면 도입 일정을 논의 중. 어획 성능 유지와 무독성 분해 조건을 동시에 만족시키는 기술 전환이 과제.
            </p>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          Forensic Intelligence: 6월 초 참치 산업 구조 변화와 전략적 시사점
        </h3>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="WCPO 선망선 마진 스퀴즈 (Margin Squeeze) 심화"
            icon={Search}
            iconColor="#818cf8"
            pillar="S1"
            cardDesc="판가 하락 (방콕 $1,850/t) vs 고비용 구조 지속 (MGO 유가 및 부대비용)"
            telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026.06.01' }}
            customBody={<></>}
            takeaway={{
              situation: "싱가포르 MGO 가격은 톤당 1,061달러로 5월 중순 대비 소폭 하락했으나 전년(605달러) 대비 여전히 높음. 반면 방콕 SKJ는 어획량 증가로 $1,850/t까지 하락(-6.3%). 선망선들은 연료비 외에 환적비, PNA 입어료(VDS) 등 막대한 고정비를 부담해야 하므로, 현재 판가에서는 채산성 확보가 매우 어려움.",
              actionPlan: "**[Actionable Insight]** 채산성을 맞추지 못한 한계 선단들의 연쇄적인 조업 중단(Tie-up) 리스크 상존. 단기적 판가 하락을 기회로 삼아 캐너리(가공공장) 측면에서는 6개월 치 원료 선제적 비축(매수) 포지션 유효. 향후 공급 부족으로 인한 가격 급반등 가능성에 대비할 필요.",
              source: 'Atuna 2026.06.01 (MGO Price & SKJ Bangkok Trend)',
            }}
          />

          <WidgetCard
            title="기구 간 규제 갈등 및 신흥국 인프라 부재 리스크"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="IATTC-WCPFC FAD 표류 갈등 & 신흥국 가공 허브 진입 난항"
            telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026.06.01' }}
            customBody={<></>}
            takeaway={{
              situation: "동태평양(EPO) 투하 부표(FAD) 수천 개가 서중태평양(WCPFC)으로 표류하는 문제로, 생태계 교란 및 기구 간 외교적 마찰 우려. 인도(Tiruvottiyur) 항구는 완공 1년째 인프라 미비로 방치 중. 신흥국의 인프라 투자에도 실제 공급망 재편 속도는 지연.",
              actionPlan: "(1) FAD 무단 표류 문제로 인해 WCPFC 관할권 내 외국 선적 규제 및 모니터링이 강화될 소지가 있음. 보유 선단의 FAD 회수율 및 항적 관리 강화 필수. (2) 2031년 바이오 FAD 전면 도입에 대비해 관련 기술 투자 및 규제 모니터링 필요. (3) 태국/에콰도르 등 기존 주요 가공 허브의 시장 지배력은 중단기적으로 더욱 견고해질 전망.",
              source: 'Atuna 2026.06.01 (FAD Tracking & Emerging Markets)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
