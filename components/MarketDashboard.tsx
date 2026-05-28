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

  const [mgoData, setMgoData] = useState({ price: 1144, change: -521, date: '2026.05.25', loading: false });
  const [fxData, setFxData] = useState({ usd_krw: 1513, date: '2026.05.26', loading: false });
  const [atunaLatest, setAtunaLatest] = useState<{
    skjBkk: { price: number; date: string };
    yfSey: { price: number; date: string };
    latestDate: string | null;
    loading: boolean;
  }>({
    skjBkk: { price: 1850, date: '2026-05-22' },
    yfSey: { price: 2000, date: '2026-05-20' },
    latestDate: '2026-05-22',
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
          Atuna Weekly: 시장을 움직이는 핵심 시그널 4선
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
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.22</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "SKJ 방콕 $1,850/t — 3주 연속 하락, IO 퍼펙트 스톰 지속"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              방콕 스킵잭이 $2,100(4/22) → $1,975(5/6) → $1,850(5/22)로 3주 연속 하락(-11.9%). 인도양 선사 운영 중단 장기화로 IO CPUE 급락, WCPO 공급 증가와 맞물려 단가 하락세. 싱가포르 MGO는 $1,144/t로 급락하며 유류 부담은 완화되나, IO 선사들의 복귀 시점이 늦어지면서 인도양 공급 공백 구조화. 옐로핀 세이셸은 역으로 $2,000/t(+5.3%)으로 반등 — SKJ↓ vs YF↑ 디커플링 심화.
            </p>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                수요 / 무역
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.27</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "미국 1분기 참치 로인 수입 4% 증가 — 태국 선전, 베트남 고전"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              미국의 1분기 냉동 Pre-cooked 참치 로인 수입량이 9,796톤으로 전년 대비 4% 증가했으며, 수입 단가는 톤당 $5,295로 상승. 관세(35%)를 피해 수입되는 로인 시장에서 태국산(4,717톤, +1,704톤)이 크게 선전한 반면, 베트남산은 미국의 지식재산권 우선감시대상국 지정 우려 등과 겹치며 판매가 급감.
            </p>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                환율 / 매크로
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2026.05.26</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "USD/KRW ₩1,513 + MGO $1,144/t — 원화 약세 속 유가 급락"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              달러·원 환율 ₩1,513(개장 1,520.10)으로 원화 약세 지속. 수입 원가 부담 증가 요인이나, 싱가포르 MGO가 $1,144/t으로 4월 말 $2,000/t 대비 -43% 급락하며 선단 운영 비용은 대폭 완화. 연료비 절감 효과가 원화 약세 부담을 상쇄하는 구간. 참치 원료 달러 결제 단가가 하락 중이므로 원화 환산 매입가는 상대적으로 안정적.
            </p>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                규제 / 리스크
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.27</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "미국 환경단체, 에콰도르·대만 등 외국산 참치 수입 금지 소송"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              천연자원방어협의회(NRDC) 등 3개 단체가 해양포유류보호법(MMPA)을 근거로 에콰도르, 대만, 인도, 바누아투 등 8개국 참치의 수입 금지를 요구하며 미 정부(NMFS)를 제소. 해당국의 연승 및 자망 어업이 미국 수준의 돌고래 혼획 방지 규제를 충족하지 못한다고 주장. 판결 시 글로벌 참치 무역 장벽이 격화될 위험 상존.
            </p>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          Forensic Intelligence: 참치 산업 구조적 변화와 신라교역의 전략
        </h3>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="3대양 동시 공급 충격 — IO·EPO 부진 + WCPO 화산 리스크"
            icon={Search}
            iconColor="#818cf8"
            pillar="S1"
            cardDesc="이번 주 인도양·동부태평양·서태평양 3대양 모두 공급 위기 단서 표면화"
            telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026.05.18~21' }}
            customBody={<></>}
            takeaway={{
              situation: "SKJ 방콕 $1,850/t(3주 -11.9%), 만타 $2,000(보합), 세이셸 $1,490(-0.7%). YF 세이셸은 역으로 $2,000(+5.3%)으로 반등 — SKJ↓ vs YF↑ 디커플링 심화. MGO $1,144/t(-43% vs 4월), USD/KRW ₩1,513(약세 지속). IO 선사 정박 장기화, WCPO 풍어로 SKJ 하방 압력, PNG 화산 리스크(Risk) 지속.",
              actionPlan: "**[Actionable Insight]** SKJ 하락 구간에서 WCPO 현물 매수를 가속하되, YF는 IO 공급 공백 장기화로 추가 상승 가능성이 높아 선물 계약 체결을 권장합니다. MGO 급락($1,144)으로 선단 운영 BEP가 대폭 개선된 만큼, IO 선사 복귀 전 선제적 물량 확보가 핵심. 원화 약세(₩1,513)에도 SKJ 달러 단가 하락이 원화 환산가를 상쇄하므로, 현 시점이 6개월 원료 비축의 골든타임(Golden Window)입니다. (Conviction Buy)",
              source: 'Atuna 2026.05.22 + CSV 어가 업데이트 2026.05.26',
            }}
          />

          <WidgetCard
            title="MSC 미국 30% 점유 + 참치 부산물 펩타이드 USD 1.56B 시장"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="지속가능 인증 메인스트림화 + 폐기물 → 고부가 펩타이드 전환"
            telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026.05.20' }}
            customBody={<></>}
            takeaway={{
              situation: "MSC 인증 참치 수요가 급증하며 독일이 세계 1위 MSC 참치 소비국(판매량 20%↑)으로 등극. 미국 역시 지속가능 인증 제품의 점유율이 33%를 상회함. 한편 참치 부산물 펩타이드 시장은 USD 1.56B(2034 전망)로 성장 기대 — Thai Union이 USD 30M 투자로 콜라겐 펩타이드 양산 개시.",
              actionPlan: "(1) 세계 1~2위 MSC 소비국인 유럽 DACH(독일·오스트리아·스위스) 지역과 미국의 프리미엄 채널 진입을 가속. 한국 대형 마트 PB의 MSC 전환 선제안. (2) 참치 부산물(머리·껍질)을 콜라겐/펩타이드 영양제로 업사이클링하는 R&D 파이프라인 가동. 폐기물에서 고부가 가치를 창출하는 '제로 코스트 마진' 모델.",
              source: 'Atuna 2026.05.27 (DACH MSC Growth) / 2026.05.20 (Tuna Peptide Market)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
