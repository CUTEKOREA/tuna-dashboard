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

  const [mgoData, setMgoData] = useState({ price: 795, change: 45, date: '2026.05.11', loading: false });
  const [fxData, setFxData] = useState({ usd_krw: 1455, date: '2026.05.11', loading: false });

  const latestSkjBkk = priceData.length > 0 ? priceData[priceData.length - 1].skj_bkk || 1975 : 1975;
  const latestYfAbj = priceData.length > 0 ? priceData[priceData.length - 1].yf_abj || 2800 : 2800;

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
            <span style={{ fontWeight: 600 }}>SKJ Price (Bangkok)</span>
            <Ship size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ${latestSkjBkk.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-success)' }}>
            <TrendingDown size={14} />
            <span>수요 파괴로 전월 대비 -6%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="ds-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>YF Price (Abidjan)</span>
            <Anchor size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ${latestYfAbj.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
            <TrendingUp size={14} />
            <span>프리미엄 횟감 수요 탄탄 (+2%)</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="ds-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>Singapore MGO</span>
            <Activity size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ${mgoData.price.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: '#ef4444' }}>
            <TrendingUp size={14} />
            <span>호르무즈 긴장으로 +{mgoData.change} 급등</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="ds-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>USD / KRW 환율</span>
            <Globe size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ₩{fxData.usd_krw.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/$</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
            <TrendingUp size={14} />
            <span>고환율 수출 채산성 유리 방어</span>
          </div>
        </div>
      </section>

      {/* ROW 2: TUNA PRICE TRENDS BY REGION */}
      <section className="ds-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <BarChart2 size={20} color="#38bdf8" />
          글로벌 참치 어가 추이 (SKJ & YF Regional Spread)
        </h3>
        <div ref={chartContainerRef} style={{ width: '100%', minHeight: '350px' }}>
          {chartWidth > 0 && priceData.length > 0 && (
            <LineChart width={chartWidth - 10} height={350} data={priceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <Line yAxisId="left" type="monotone" dataKey="yf_abj" name="YF 아비장" stroke="#818cf8" strokeWidth={2} dot={false} connectNulls={true} />
              <Line yAxisId="left" type="monotone" dataKey="yf_sey" name="YF 세이셸" stroke="#c084fc" strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
            </LineChart>
          )}
        </div>
      </section>

      {/* ROW 3: ATUNA NEWS WEEKLY TOP 4 */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Newspaper size={20} color="#f59e0b" />
          Atuna Weekly: 시장을 움직이는 핵심 시그널 4선
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* News 1 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
              원자재 / 운임
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "원자재 가격 변동과 중동발 연료비 압박"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              중동발 유가 상승으로 해상 연료(MGO) 가격이 톤당 2,000달러를 돌파하며 선단 운영을 위협하고 있습니다. 반면 세계 최대 거래소인 방콕은 가공업체들의 저항에 부딪혀 최근 톤당 1,975달러로 하락해, 원가 상승분을 전가하기 어려운 밸류체인의 병목 현상을 시사합니다.
            </p>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
              기후 / 공급망
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "엘니뇨(El Niño)발 어획 지형 변화와 아시아 가공업계의 조달처 다변화"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              슈퍼 엘니뇨 영향으로 서중태평양(WCPO) 어군이 이동하면서 대만 등 주요 선단의 조업 실적이 급감했습니다. 이에 태국 가공업체들은 1분기 WCPO산 수입을 줄이고 인도양(IO)산 원어 수입을 전년 대비 106% 늘리며 글로벌 참치 무역 흐름을 근본적으로 재편하고 있습니다.
            </p>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
              규제 / 통상 리스크
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "글로벌 무역 규제 및 관세 리스크의 불확실성 증폭"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              미국 무역법원이 2월 도입된 10% 관세를 위법으로 판결했으나 미 재무부가 재부과 가능성을 시사해 시장 불안이 가중되고 있습니다. 한편 유럽에서는 디지털 추적 시스템 'EU CATCH'의 행정 과부하로 주요 항구 통관 지연이 심화되어 무역 둔화로 직결되고 있습니다.
            </p>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
              어획 할당량 / 외교
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              "IOTC 제30차 총회 개막 및 어획 할당량 쟁탈전"
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
              5월 몰디브에서 열린 인도양참치위원회(IOTC) 총회에서 어획 한도 등 핵심 조치가 논의 중입니다. 특히 인도네시아의 가다랑어 한도 독자 상향에 대해 EU가 강력히 반발하며 연안국과 원양 조업국 간의 자원 주도권 갈등이 한층 격화되는 양상입니다.
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>가격 스프레드 역전과 다변화 물류 차익거래</h4>
            <TakeawayBox 
              situation="방콕(BKK)행 하역 지연 및 방콕 SKJ 어가 하락이 동시에 발생하며, 남미 만타(MNT) 및 아프리카 아비장(ABJ) 지역의 단가 스프레드 역전 기회가 확대되고 있습니다."
              actionPlan="전통적인 방콕 쏠림 하역을 탈피해야 합니다. 운항 거리 손실을 감안하더라도, MGO 상승분 대비 만타/비고 항구의 프리미엄이 유리한 윈도우를 실시간으로 스캔하여 '이동식 해상 창고'로써의 선단 전배(Diversion) 마진을 극대화해야 합니다."
              source="Atuna Pricing Index (May 2026) 및 글로벌 운임 데이터"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>초양극화: 저가 SKJ와 하이엔드 YF의 타겟 디커플링</h4>
            <TakeawayBox 
              situation="글로벌 소비 침체로 인해 범용 통조림은 초저가 SKJ로 트레이드 다운되고 있으나, 반대로 고품질 초저온(Super Freezing) YF는 횟감 및 고급 식자재로서 수요가 견고하게 유지되고 있습니다."
              actionPlan="어획량 위주의 조업에서 탈피하여 '가치(Value) 중심'으로 조업 패러다임을 전환해야 합니다. MSC 인증을 확보한 프리미엄 YF 물량을 전략적으로 비축하여, 무관세 혜택이 예정된 한-UAE CEPA 등의 하이엔드 신규 시장으로 직수출하는 브랜딩 구축이 시급합니다."
              source="Atuna 2026 Consumption Trends & KITA Trade Data"
            />
          </div>

        </div>
      </section>

    </div>
  );
}
