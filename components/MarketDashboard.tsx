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

  const [mgoData, setMgoData] = useState({ price: 1665, change: -45, date: '2026.05.20', loading: false });
  const [fxData, setFxData] = useState({ usd_krw: 1455, date: '2026.05.22', loading: false });
  const [atunaLatest, setAtunaLatest] = useState<{
    skjBkk: { price: number; date: string };
    yfSey: { price: number; date: string };
    latestDate: string | null;
    loading: boolean;
  }>({
    skjBkk: { price: 1975, date: '2026-05-22' },
    yfSey: { price: 2320, date: '2026-05-22' },
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
          skjBkk: hub.skj_bkk || { price: 1975, date: '2026-05-22' },
          yfSey: hub.yf_sey || { price: 2320, date: '2026-05-22' },
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
                원자재 / 운임
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.20</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "IO 참치 '퍼펙트 스톰' — 인도양 선사 운영 중단 단행"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              인도양 어획 부진·고유가·저단가 삼중고로 다수 IO 선사가 자선을 항구에 정박시켰습니다. Port Victoria MGO는 4월 말 USD 2,000/t → 5월 현재 USD 1,665/t으로 하락했고, Seychelles 스킵잭 스팟가는 EUR 1,490(USD 1,728)/t으로 3주 전 EUR 1,500 대비 -1%. 옐로핀 YF10:SEY는 EUR 2,000/t까지 상승하며 코로나 팬데믹과 달리 단기 개선 전망이 없는 구조적 위기입니다.
            </p>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                기후 / 공급망
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.21</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "PNG 비스마르크해 해저화산 분출 — 핵심 WCPO 어장 위협"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              파푸아뉴기니 북쪽 Titan Ridge 해저화산이 5월 8일부터 분출을 가속화. 5월 16일 ash 3.6km 상승 + 4.3M 지진, 5월 18일 5.4M 추가. 비스마르크해는 대만·한국·일본·필리핀 원양 선망 선단의 주요 어장으로, 화산활동이 지속되면 참치는 산소가 풍부한 해역으로 이동하며 어장이 이전될 전망입니다. PNG 정부 VDS 입어료 수입 직접 타격 우려.
            </p>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                규제 / 통상 리스크
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.19~21</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "US Section 301 청원 + UK-몰디브 20% 관세 면제 양극화"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              미국 의회 20인 위원이 USTR에 태국·베트남·중국·인도네시아 등 17개국 대상 Section 301 unfair trade 조사를 요구. 한편 영국은 몰디브산 참치 20% 관세를 2028년까지 면제하며 풀앤라인 지속가능 참치에 시장을 개방. US 파우치 수입 Q1 25% 감소(MMPA + 관세 영향), 베트남은 1월부터 12개 어장 미국 수출 금지로 충격.
            </p>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
                어획 할당량 / 어장
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Atuna 2026.05.19~20</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "에콰도르 EPO 스킵잭 Q1 -35% + 스페인 IO 2026 쿼터 발표"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              에콰도르 선단 Q1 2026 스킵잭 53,966 M/T로 전년 동기 -35%, 2024 record 대비 절반 수준 — 2024년 이전 정상 레벨로 회귀. EU 가공업체 수요 압박 가속. 한편 스페인은 IO yellowfin 42,903 M/T + bigeye 14,792 M/T 2026 쿼터를 14개 Bermeo 기반 선망에 배분. Atuna 독자 투표 93%가 "더 많은 어선이 운영 중단할 것"이라 응답.
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
              situation: "IO는 어선들이 연료비 부담으로 항구 정박을 단행하며 'Perfect Storm' 진입(SJK 1,728 USD/t, MGO USD 1,665/t). EPO는 에콰도르 선단 Q1 스킵잭 -35%로 2024 이전 정상 레벨 회귀. WCPO는 PNG Bismarck Sea 해저화산 분출 가속화로 주요 선망 어장이 산소 결핍 위협을 받음.",
              actionPlan: "3대양 동시 공급 충격기에는 단일 원산지 노출을 즉시 축소하고, 몰디브(UK 0% 관세 신규 개방)·태평양 SIDS 직거래·인도네시아 풀앤라인 등 '대체 풀'을 다각화해야 합니다. 5~7월 IO 부진 + 6월 PNG 화산 정세 미정 구간을 대비해 6개월 raw material 비축을 사전 확보하고, 단가 상승분을 캐너리·바이어에 단계적으로 전가하는 가격 패스스루 협상 카드를 준비.",
              source: 'Atuna 2026.05.18~21 (IO Perfect Storm · EPO Skipjack · PNG Bismarck)',
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
              situation: "MSC 인증 참치 미국 판매량 5년 동안 +330% 급증, 75,000톤으로 全 MSC 인증 수산물 33% 점유. Walmart 100% MSC 자체 라벨 전환 완료(37 SKU), Bumble Bee 49 SKU. 한편 참치 부산물 펩타이드 시장 USD 1.56B (2034 전망, CAGR 4.8%) — Thai Union이 USD 30M 투자로 ThalaCol 콜라겐 펩타이드 양산 개시.",
              actionPlan: "(1) MSC 인증 + 풀앤라인 원료 비축으로 미국·UK 프리미엄 채널 진입을 가속. Walmart·Sainsbury's·Tesco 사례를 벤치마크로 한국 대형 마트 PB MSC 전환을 제안. (2) 참치 가공 부산물(머리·껍질)을 콜라겐/펩타이드/항산화 영양제로 업사이클링하는 R&D 파이프라인을 2027 출시 목표로 즉시 가동. 폐기물에서 톤당 수천 달러의 고부가 가치를 확보할 수 있는 '제로 코스트 마진' 모델.",
              source: 'Atuna 2026.05.20 (MSC US Sustainable Market · Tuna Peptide Market)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
