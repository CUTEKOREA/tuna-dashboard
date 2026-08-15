'use client';

import React, { useState } from 'react';
import styles from './MackerelStrategy.module.css'; // Reusing an existing module for glassmorphism
import { Ship, Anchor, AlertTriangle, Target, ArrowLeft, Users, Package, TrendingUp, Globe, DollarSign, Activity } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import CompanyVesselStatus from './CompanyVesselStatus';
import FleetProduction2025 from './FleetProduction2025';

// Mock detailed data as fallback while loading
const fallbackVesselDetails: Record<string, any[]> = {
  '참치 (원양선망)': [], '참치 (원양연승)': [], '명태 (북양트롤)': [], '남빙양트롤 (크릴)': [], '대서양트롤': [], '오징어 (채낚기)': [], '꽁치봉수망 (겸업)': [], '저연승 (이빨고기)': [], '통발·저연승 겸업': []
};

const matrixData = [
  { type: '참치 (원양선망)', company: '동원산업(14), 신라교역(6), 사조산업(5) 등 5개사', tonnage: '606 ~ 2,060톤', age: '20.0년', factor: '초저온(-60℃) 급속냉동, 삼대양 광역 조업', risk: '1척 300~500억 CAPEX 및 PNA 쿼터 규제', color: '#38bdf8', vessels: 27, revenue: '5,784억', perVessel: '214억/척', unitPrice: '1,910원/kg', insight: '27척(13.6%)이 전체 매출의 37.9%를 창출. 척당 214억 원 — 원양 최고 효율' },
  { type: '참치 (원양연승)', company: '사조산업(27), 동원계열(25), 신라교역(9) 등 14개사', tonnage: '199 ~ 488톤', age: '36.5년', factor: '횟감용 고급 참치(초저온) 어획', risk: '68%가 80년대 건조. 초고령화 + 선원난', color: '#60a5fa', vessels: 105, revenue: '3,134억', perVessel: '29.8억/척', unitPrice: '6,722원/kg', insight: '105척(53%)으로 최대 선단이나, 척당 매출은 선망의 1/7. M&A 최우선 타깃' },
  { type: '명태 (북양트롤)', company: '한성기업(1), 사조오양(1), 남북수산(1)', tonnage: '1,703 ~ 5,549톤', age: '51.7년', factor: '대량 어획 + 선상 가공(F/V)', risk: '70년대 진수. 러시아 지정학 리스크', color: 'var(--color-success)', vessels: 3, revenue: '438억', perVessel: '146억/척', unitPrice: '1,512원/kg', insight: '평균 51.7년 — 원양산업 최고령. 3척이 2.9만 톤(척당 9,666톤) 물량' },
  { type: '남빙양트롤 (크릴)', company: '동원산업 (1척 독점)', tonnage: '7,765톤 (초대형)', age: '36.0년', factor: '남극크릴 선상 가공 독점. 크릴오일 원료', risk: '단일 선박 리스크. 대체선 건조 시 1,000억+', color: '#fb7185', vessels: 1, revenue: '114억', perVessel: '114억/척', unitPrice: '753원/kg', insight: '단가 753원이나 크릴오일 가공 시 10만원+/kg. 원료→최종재 마진 133배' },
  { type: '대서양트롤', company: '아그네스(2), 정일산업(2), 사조오양(2) 등 7개사', tonnage: '276 ~ 3,012톤', age: '42.4년', factor: '포클랜드·서아프리카 대량 조업', risk: '극단적 양극화 (최신 3년 vs 최고령 56년)', color: '#a78bfa', vessels: 11, revenue: '2,074억', perVessel: '189억/척', unitPrice: '3,293원/kg', insight: '11척이 6.3만 톤 생산. 포클랜드 입어료만 879만 달러(120억)' },
  { type: '오징어 (채낚기)', company: '아그네스수산(6), 정일산업(4) 등 10개사', tonnage: '313 ~ 661톤', age: '38.5년', factor: '태평양/대서양 겸용 교차 조업', risk: '어획량 급감 + 중국 공해 대규모 진출', color: 'var(--color-warning)', vessels: 20, revenue: '3,995억', perVessel: '200억/척', unitPrice: '6,326원/kg', insight: '단가 6,326원은 명태의 4.2배. 척당 200억으로 선망에 버금가는 숨은 캐시카우' },
  { type: '꽁치봉수망 (겸업)', company: '동원해사랑(3), 정일산업(2) 등 13개사', tonnage: '281 ~ 1,037톤', age: '33.3년', factor: '집어등 야간 조업. 오징어 겸업 다수', risk: 'NPFC 쿼터 축소 + 선박 노후화', color: '#fde047', vessels: 18, revenue: '283억', perVessel: '15.7억/척', unitPrice: '4,822원/kg', insight: '13개사·18척으로 가장 영세. 척당 15.7억으로 유가 상승 시 가장 먼저 도태' },
  { type: '저연승 (이빨고기)', company: '사조대림(2), 홍진실업(1), TNS(1)', tonnage: '423 ~ 684톤', age: '33.5년', factor: 'kg당 21,336원 — 원양 최고 단가 어종', risk: '전 세계 수십 척만 조업 가능한 초희소 쿼터', color: '#fcd34d', vessels: 4, revenue: '827억', perVessel: '207억/척', unitPrice: '21,336원/kg', insight: '4척이 827억. 단가가 명태의 14.1배, 가다랑어의 11.2배. 원양의 에르메스' },
  { type: '통발·저연승 겸업', company: '정일산업(3), TNS(3), 홍진실업(2), 신지수산(1)', tonnage: '60 ~ 836톤', age: '32.8년', factor: '통발+저연승 겸업 조업 유연성', risk: '특수 수역 접근 제한 + 선대 노후화', color: '#f472b6', vessels: 9, revenue: '53억', perVessel: '5.9억/척', unitPrice: '6,443원/kg', insight: '저연승 4척과 합치면 이빨고기 선단 13척이 초고수익 틈새를 지배' }
];

export default function FleetStrategyMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vesselDetails, setVesselDetails] = useState<Record<string, any[]>>(fallbackVesselDetails);
  const [fishingFees, setFishingFees] = useState<Record<string, any>>({});

  React.useEffect(() => {
    fetch('/data/vessel_master.json')
      .then(res => res.json())
      .then(data => {
        // vessel_master.json 키 → matrixData 키 매핑
        const mappedData = { ...data };
        // 키 매핑: vessel_master → UI 표시명
        const keyMap: Record<string, string> = {
          '저연승': '저연승 (이빨고기)',
          '남빙양트롤': '남빙양트롤 (크릴)',
          '오징어 (원양채낚기)': '오징어 (채낚기)',
          '꽁치봉수망 (오징어꽁치겸업)': '꽁치봉수망 (겸업)',
          '꽁치봉수망': '꽁치봉수망 (겸업)',
          '통발저연승겸업': '통발·저연승 겸업',
        };
        Object.entries(keyMap).forEach(([oldKey, newKey]) => {
          if (mappedData[oldKey] && !mappedData[newKey]) {
            mappedData[newKey] = mappedData[oldKey];
          }
        });
        setVesselDetails(mappedData);
      })
      .catch(err => console.error("Failed to load vessel data:", err));

    fetch('/data/fishing_fee_master.json')
      .then(res => res.json())
      .then(data => setFishingFees(data.fees_by_category))
      .catch(err => console.error("Failed to load fishing fee data:", err));
  }, []);

  const statsData: Record<string, { vessels: string | number, crew: string, production: string, export: string, price: string }> = {
    '참치 (원양선망)': { vessels: 27, crew: '201명 (선장월급 5,546만원)', production: '288,742 톤', export: '5,784 억 원', price: '1,910 원/kg' },
    '참치 (원양연승)': { vessels: 105, crew: '549명 (선장월급 1,763만원)', production: '46,619 톤', export: '3,134 억 원', price: '6,722 원/kg' },
    '명태 (북양트롤)': { vessels: 3, crew: '145명 (선장월급 5,532만원)', production: '28,999 톤', export: '438 억 원', price: '1,512 원/kg' },
    '남빙양트롤 (크릴)': { vessels: 1, crew: '145명 (트롤 통합)', production: '15,105 톤 (크릴)', export: '114 억 원', price: '753 원/kg' },
    '대서양트롤': { vessels: 11, crew: '145명 (트롤 통합)', production: '62,992 톤', export: '2,074 억 원', price: '3,293 원/kg' },
    '오징어 (채낚기)': { vessels: 20, crew: '172명 (선장월급 4,133만원)', production: '63,156 톤', export: '3,995 억 원', price: '6,326 원/kg' },
    '꽁치봉수망 (겸업)': { vessels: 18, crew: '22명 (선장월급 1,467만원)', production: '5,866 톤', export: '283 억 원', price: '4,822 원/kg' },
    '저연승 (이빨고기)': { vessels: 4, crew: '약 120명 (전문 선원)', production: '3,878 톤', export: '827 억 원', price: '21,336 원/kg' },
    '통발·저연승 겸업': { vessels: 9, crew: '약 200명 (겸업 선원)', production: '822 톤', export: '53 억 원', price: '6,443 원/kg' }
  };

  // matrixData에서 현재 선택된 카테고리의 풍부한 데이터 매칭
  const matchedMatrix = matrixData.find(m => m.type === selectedCategory) || matrixData.find(m => selectedCategory?.includes(m.type.split(' ')[0]));

  if (selectedCategory) {
    const details = vesselDetails[selectedCategory] || [];
    const currentStats = statsData[selectedCategory] || { vessels: '데이터 대기중', crew: '데이터 대기중', production: '데이터 대기중', export: '데이터 대기중', price: '데이터 대기중' };
    const CURRENT_YEAR = new Date().getFullYear();
    const hasRoster = details.length > 0;

    // 선령 분포 계산 — 진수일이 실재하는 선박만 집계 (빈값을 임의 연도로 대체하지 않음)
    const ages = details
      .map((s: any) => parseInt((s.launchDate || '').split('-')[0], 10))
      .filter((y: number) => Number.isFinite(y) && y > 1900)
      .map((y: number) => CURRENT_YEAR - y);
    const hasAges = ages.length > 0;
    const avgAge = hasAges ? (ages.reduce((a: number, b: number) => a + b, 0) / ages.length).toFixed(1) : null;
    const oldCount = ages.filter((a: number) => a >= 30).length;
    const newCount = ages.filter((a: number) => a < 15).length;
    const companies = [...new Set(details.map((s: any) => s.company))];
    const tonnages = details.map((s: any) => s.tonnage).filter((t: any) => typeof t === 'number' && t > 0);
    const avgTonnage = tonnages.length > 0 ? Math.round(tonnages.reduce((a: number, b: number) => a + b, 0) / tonnages.length) : null;
    // 명부에서 선령 산출이 불가하면 통계연보 집계 평균(matrixData.age)을 표기용으로 사용
    const yearbookAge = matchedMatrix?.age;
    const ageDisplay = hasAges ? `${avgAge}년` : (yearbookAge ? `${yearbookAge} (연보)` : '미수집');
    const ageForColor = hasAges ? Number(avgAge) : parseFloat(yearbookAge || '');

    return (
      <div className={styles.glassCard} style={{ borderColor: matchedMatrix?.color || 'rgba(59, 130, 246, 0.3)', marginTop: '20px', animation: 'fadeIn 0.3s ease-out' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setSelectedCategory(null)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ArrowLeft size={16} /> 전체 현황판으로 복귀
          </button>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: matchedMatrix?.color || 'var(--text-primary)', margin: 0, fontWeight: 700, fontSize: '1.3rem' }}>
              <Ship size={22} /> {selectedCategory}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              {hasRoster
                ? `상세 명부 ${details.length}척 · ${companies.length}개사${avgTonnage ? ` · 평균톤수 ${avgTonnage}톤` : ''}`
                : '상세 선박 명부 미수집 — 아래 지표는 2025 원양산업 통계연보 집계 기준'}
            </p>
          </div>
        </div>

        {/* KPI Grid — 7종 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: <Ship size={20} />, label: '가동 어선', value: `${currentStats.vessels}척`, color: '#38bdf8' },
            { icon: <Package size={20} />, label: '연간 생산량', value: currentStats.production, color: 'var(--color-warning)' },
            { icon: <DollarSign size={20} />, label: '생산 금액', value: currentStats.export, color: '#a78bfa' },
            { icon: <TrendingUp size={20} />, label: '단가', value: currentStats.price, color: '#fb7185' },
            { icon: <Activity size={20} />, label: '척당 매출', value: (matchedMatrix as any)?.perVessel || '-', color: '#fbbf24' },
            { icon: <Users size={20} />, label: '승선 인력', value: currentStats.crew, color: '#34d399' },
            { icon: <AlertTriangle size={20} />, label: '평균 선령', value: ageDisplay, color: !Number.isFinite(ageForColor) ? '#94a3b8' : ageForColor >= 30 ? 'var(--color-danger)' : '#34d399' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${kpi.color}22`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ color: kpi.color, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{kpi.icon}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{kpi.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'keep-all' }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* 입어료 및 관세감면 (OPEX & Policy) 위젯 - 데이터가 있는 경우에만 표시 */}
        {fishingFees[selectedCategory] && (
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
            <h5 style={{ color: '#f43f5e', margin: '0 0 16px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} /> 글로벌 입어료(OPEX) 및 정책 리스크 분석 <span style={{ fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.2)', padding: '2px 8px', borderRadius: '10px' }}>2024년 기준</span>
            </h5>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #f43f5e' }}>
                  <div style={{ fontSize: '0.8rem', color: '#fda4af', marginBottom: '4px' }}>연간 총 입어료 지불액</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${(fishingFees[selectedCategory]['2024_total_usd'] / 10000).toFixed(0)}만
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: '8px' }}>
                      (약 {((fishingFees[selectedCategory]['2024_total_usd'] * 1350) / 100000000).toFixed(0)}억 원)
                    </span>
                  </div>
                </div>
                <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--w-amber-400)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#fde68a', marginBottom: '4px' }}>척당 평균 입어료 부담</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${(fishingFees[selectedCategory]['avg_fee_per_vessel_usd'] / 10000).toFixed(0)}만
                  </div>
                </div>
                {fishingFees[selectedCategory]['tariff_exemption_ton'] && (
                  <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--w-emerald-400)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#6ee7b7', marginBottom: '4px' }}>해외합작수산물 관세감면 혜택</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {fishingFees[selectedCategory]['tariff_exemption_ton'].toLocaleString()} 톤
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>주요 지불 대상국 (조업 수역 의존도)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {fishingFees[selectedCategory]['key_countries'].map((c: any, i: number) => (
                      <div key={i} style={{ background: 'rgba(140,170,255,0.10)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--w-sky-400)', fontWeight: 600 }}>{c.name}</span>
                        <span style={{ opacity: 0.6 }}>${(c.amount / 10000).toFixed(0)}만</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '12px 16px', borderRadius: '8px', borderLeft: '2px solid var(--w-sky-400)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--w-sky-400)', marginBottom: '4px', fontWeight: 600 }}>전략적 시사점 (OPEX 헤징)</div>
                  <div style={{ fontSize: '0.85rem', color: '#e0f2fe', lineHeight: 1.5 }}>
                    {fishingFees[selectedCategory]['insight']}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 선령 분포 + 강점/리스크/인사이트 */}
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* 선령 분포 분석 */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '10px', padding: '16px' }}>
            <h5 style={{ color: 'var(--w-amber-400)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>⏳ 선령 분포 분석</h5>
            {hasAges ? (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-danger)' }}>{oldCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>30년 이상 (위험)</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(251,191,36,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--w-amber-400)' }}>{ages.length - oldCount - newCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#fde68a' }}>15~29년 (주의)</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(52,211,153,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--w-emerald-400)' }}>{newCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>15년 미만 (건전)</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  최고령: <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{Math.max(...ages)}년</span> ·
                  최신조: <span style={{ color: 'var(--w-emerald-400)', fontWeight: 600 }}>{Math.min(...ages)}년</span> ·
                  노후화율: <span style={{ color: oldCount / ages.length > 0.5 ? 'var(--color-danger)' : 'var(--w-amber-400)', fontWeight: 600 }}>{(oldCount / ages.length * 100).toFixed(0)}%</span>
                  {ages.length < details.length && (
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}> · 진수일 미수집 {details.length - ages.length}척 제외</span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, padding: '8px 0' }}>
                상세 명부에 진수일 정보가 미수집되어 선령 분포를 산출할 수 없습니다.
                {yearbookAge && <> 통계연보 집계 평균 선령: <span style={{ color: 'var(--w-amber-400)', fontWeight: 600 }}>{yearbookAge}</span></>}
              </div>
            )}
          </div>

          {/* 강점 / 리스크 / 인사이트 */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h5 style={{ color: '#60a5fa', margin: 0, fontSize: '0.9rem' }}>📋 전략 요약</h5>
            {matchedMatrix && (
              <>
                <div style={{ background: 'rgba(52,211,153,0.05)', padding: '8px', borderRadius: '6px', borderLeft: '2px solid var(--w-emerald-400)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--w-emerald-400)', marginBottom: '2px' }}>강점</div>
                  <div style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>{matchedMatrix.factor}</div>
                </div>
                <div style={{ background: 'rgba(248,113,113,0.05)', padding: '8px', borderRadius: '6px', borderLeft: '2px solid #f87171' }}>
                  <div style={{ fontSize: '0.7rem', color: '#fca5a5', marginBottom: '2px' }}>리스크</div>
                  <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>{matchedMatrix.risk}</div>
                </div>
                {(matchedMatrix as any).insight && (
                  <div style={{ background: 'rgba(56,189,248,0.05)', padding: '8px', borderRadius: '6px', borderLeft: '2px solid var(--w-sky-400)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--w-sky-400)', marginBottom: '2px' }}>핵심 인사이트</div>
                    <div style={{ fontSize: '0.8rem', color: '#93c5fd', lineHeight: 1.4 }}>{(matchedMatrix as any).insight}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Vessel Table */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '12px', overflow: 'auto', marginBottom: '24px', maxHeight: '500px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)', zIndex: 10 }}>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>선명</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>소속사</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>조업수역</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>톤수</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>진수일 (선령)</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {details.length > 0 ? details.map((ship: any, idx: number) => {
                const launchYear = parseInt((ship.launchDate || '').split('-')[0], 10);
                const hasLaunch = Number.isFinite(launchYear) && launchYear > 1900;
                const age = hasLaunch ? CURRENT_YEAR - launchYear : null;
                const isSilla = (ship.company || '').includes('신라');
                const status = !hasLaunch ? '미수집' : age! >= 35 ? '⛔ 교체시급' : age! >= 25 ? '⚠️ 노후' : age! >= 15 ? '🟡 주의' : '✅ 건전';
                const statusColor = !hasLaunch ? 'rgba(255,255,255,0.4)' : age! >= 35 ? 'var(--color-danger)' : age! >= 25 ? 'var(--color-warning)' : age! >= 15 ? '#fbbf24' : '#34d399';
                return (
                  <tr key={idx} style={{ borderBottom: idx !== details.length - 1 ? '1px solid rgba(140,170,255,0.10)' : 'none', background: isSilla ? 'rgba(56, 189, 248, 0.06)' : 'transparent' }}>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{ship.name}</td>
                    <td style={{ padding: '10px 16px', color: isSilla ? 'var(--w-sky-400)' : 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: isSilla ? 700 : 400 }}>{ship.company}</td>
                    <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{ship.area || '-'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--w-emerald-400)', fontSize: '0.8rem', fontWeight: 600 }}>{typeof ship.tonnage === 'number' && ship.tonnage > 0 ? `${ship.tonnage}톤` : '-'}</td>
                    <td style={{ padding: '10px 16px', color: hasLaunch && age! >= 25 ? 'var(--color-danger)' : 'var(--w-slate-200)', fontSize: '0.8rem' }}>
                      {hasLaunch ? (<>{ship.launchDate} <span style={{ opacity: 0.6 }}>({age}년)</span></>) : (<span style={{ color: 'rgba(255,255,255,0.4)' }}>정보 미수집</span>)}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '0.8rem', color: statusColor, fontWeight: 600 }}>{status}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>상세 선박 명부가 아직 수집되지 않았습니다. 위 지표는 2025 원양산업 통계연보 집계값입니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <TakeawayBox
          source={hasRoster ? `2025 원양산업 통계연보 · ${selectedCategory} 상세 명부 ${details.length}척` : '2025 원양산업 통계연보 (상세 선박 명부 미수집)'}
          situation={`[${selectedCategory}] ${currentStats.vessels}척이 연간 ${currentStats.production}을 생산하여 ${currentStats.export}을 창출. 단가 ${currentStats.price}, 척당 매출 ${(matchedMatrix as any)?.perVessel || '-'}. ${hasAges
            ? `명부 기준 평균 선령 ${avgAge}년, 30년 이상 노후선 ${oldCount}척(${(oldCount / ages.length * 100).toFixed(0)}%).`
            : `평균 선령은 통계연보 집계 기준 ${yearbookAge || '미수집'}이며, 상세 명부의 진수일 정보는 미수집 상태.`}`}
          actionPlan={`${(matchedMatrix as any)?.insight || '해당 선단의 수익성과 선령 위험도를 종합적으로 고려한 포트폴리오 재편이 필요합니다.'} ${hasRoster
            ? `신라교역은 이 선단 명부에서 ${details.filter((s: any) => s.company?.includes('신라')).length}척을 보유 중이며, 경쟁사 노후선 스크랩 시 M&A 기회를 선점해야 합니다.`
            : '경쟁사 노후선 스크랩 시 M&A 기회를 선점해야 합니다.'}`}
        />
      </div>
    );
  }

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(59, 130, 246, 0.3)', marginTop: '20px' }}>
      <FleetProduction2025 />
      
      {/* 0. Macro Industry Overview — 전수조사 교정 완료 */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700, fontSize: '1.4rem' }}>
          <Globe size={24} style={{ color: '#60a5fa' }} /> 대한민국 원양산업 거시 경제 현황 (2024년 결산)
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '16px' }}>
          『2025 원양산업 통계연보 p120』 전수조사 교정 데이터 기반
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--w-sky-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} /> 총 생산량
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>47.9<span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>만 톤</span></div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>479,398 MT (p120 검증 ✓)</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#a78bfa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} /> 총 생산금액
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>1.53<span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>조 원</span></div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>1,525,790백만 원 (p120 검증 ✓)</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--w-emerald-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ship size={16} /> 운영 어선 (38개사)
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>198<span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>척</span></div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>company_vessel_status 전수 합산 ✓</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--w-amber-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} /> 3대 어종 생산량 점유율
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>79.4<span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>%</span></div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>참치(60.2%)+오징어(13.2%)+명태(6.0%)</div>
          </div>
        </div>
      </div>

      {/* 1. Dashboard Metrics (Risk & Capability) */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600 }}>핵심 리스크 및 선대 역량 지표</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Metric 1: Macro Fleet Aging */}
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} /> 대한민국 원양연승 평균 선령
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-danger)', marginBottom: '12px' }}>36.5년</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
              <span>80년대 건조 선박 비율</span><span style={{ color: '#fca5a5', fontWeight: 600 }}>68%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <span>교체 한계 도달 (CAPEX 위기)</span><span style={{ color: 'var(--color-danger)' }}>Critical</span>
            </div>
          </div>

          {/* Metric 2: Silla Co Advantage */}
          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--w-emerald-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Anchor size={14} /> 신라교역 선망 선대 건전성
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '12px' }}>최우수</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
              <span>경쟁사 평균 노후화율</span><span style={{ color: '#fca5a5' }}>42%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <span>신라교역 노후화율</span><span style={{ color: 'var(--w-emerald-400)', fontWeight: 600 }}>21%</span>
            </div>
          </div>

          {/* Metric 3: Niche Fleet Penetration */}
          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--w-sky-400)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={14} /> 특수 목적 선대 (남빙/대서양)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--w-sky-400)', marginBottom: '12px' }}>독과점</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
              <span>이빨고기/크릴 조업선</span><span style={{ color: 'var(--w-sky-400)', fontWeight: 600 }}>극소수 정예</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <span>진입장벽 (어획 쿼터)</span><span style={{ color: 'var(--w-slate-200)' }}>매우 높음</span>
            </div>
          </div>

          {/* Metric 4: Industry Consolidation Risk */}
          <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#fcd34d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} /> 영세 조업사 통폐합 리스크
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-warning)', marginBottom: '12px' }}>High</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
              <span>오징어/꽁치 채낚기 유휴율</span><span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>24.1%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <span>유가 및 인건비 타격</span><span style={{ color: 'var(--color-warning)' }}>심각</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Matrix Table */}
      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--w-sky-400)', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>
          <Target size={20} /> 조업 방식별 선대 포트폴리오 (어종 클릭 시 상세 명부 및 실적 출력)
        </h4>

        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {matrixData.map((row, idx) => {
            const isOld = parseInt(row.age) >= 25;
            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(140,170,255,0.10)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderTop: `4px solid ${row.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(140,170,255,0.10)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedCategory(row.type)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 style={{ color: row.color, margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{row.type}</h5>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: isOld ? 'rgba(239, 68, 68, 0.1)' : 'rgba(226, 232, 240, 0.1)', color: isOld ? '#fca5a5' : 'var(--w-slate-200)', fontWeight: 600 }}>
                    {row.age}
                  </span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* 재무 KPI 행 */}
                  <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>매출</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--w-emerald-400)' }}>{(row as any).revenue || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>척당</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--w-amber-400)' }}>{(row as any).perVessel || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>단가</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa' }}>{(row as any).unitPrice || '-'}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>주요 조업사 ({(row as any).vessels || '?'}척)</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{row.company}</div>
                  </div>
                  <div style={{ background: 'rgba(52, 211, 153, 0.05)', padding: '8px', borderRadius: '6px', borderLeft: '2px solid rgba(52, 211, 153, 0.5)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--w-emerald-400)', opacity: 0.8, marginBottom: '2px' }}>강점</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--w-emerald-400)', fontWeight: 500 }}>{row.factor}</div>
                  </div>
                  <div style={{ background: 'rgba(248, 113, 113, 0.05)', padding: '8px', borderRadius: '6px', borderLeft: '2px solid rgba(248, 113, 113, 0.5)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fca5a5', opacity: 0.8, marginBottom: '2px' }}>리스크</div>
                    <div style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 500 }}>{row.risk}</div>
                  </div>
                  {/* 핵심 인사이트 */}
                  {(row as any).insight && (
                    <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '8px', borderRadius: '6px', borderLeft: '2px solid rgba(56, 189, 248, 0.5)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--w-sky-400)', opacity: 0.8, marginBottom: '2px' }}>Insight</div>
                      <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 500, lineHeight: 1.4 }}>{(row as any).insight}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Company Vessel Status */}
      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>국내 주요 원양선사 선대 지배력 현황 (Top 38)</h4>
        <CompanyVesselStatus />
      </div>

      {/* 4. Strategic Insight Widgets — 놀라운 인사이트 3종 */}
      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--w-amber-400)', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 700 }}>
          <TrendingUp size={20} /> 전략적 인사이트 — "이 데이터를 보면 놀랍습니다"
        </h4>

        {/* Insight 1: 척당 매출 랭킹 */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <h5 style={{ color: 'var(--w-emerald-400)', marginBottom: '4px', fontSize: '1rem' }}>📊 척당 매출(Revenue/Vessel) 랭킹 — "척수가 아닌 효율이 승부"</h5>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '16px' }}>같은 1척이라도 선망은 214억, 꽁치는 15.7억. 14배 격차의 숨겨진 구조</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: '참치 선망', value: 214, vessels: 27, color: '#38bdf8' },
              { name: '이빨고기 저연승', value: 207, vessels: 4, color: '#fcd34d' },
              { name: '오징어 채낚기', value: 200, vessels: 20, color: 'var(--color-warning)' },
              { name: '대서양트롤', value: 189, vessels: 11, color: '#a78bfa' },
              { name: '명태 북양트롤', value: 146, vessels: 3, color: 'var(--color-success)' },
              { name: '남빙양 크릴', value: 114, vessels: 1, color: '#fb7185' },
              { name: '참치 연승', value: 29.8, vessels: 105, color: '#60a5fa' },
              { name: '꽁치봉수망', value: 15.7, vessels: 18, color: '#fde047' },
              { name: '통발겸업', value: 5.9, vessels: 9, color: '#f472b6' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '120px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textAlign: 'right', flexShrink: 0 }}>{item.name}</div>
                <div style={{ flex: 1, background: 'rgba(140,170,255,0.10)', borderRadius: '4px', height: '28px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((item.value / 214) * 100, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${item.color}33, ${item.color}88)`, borderRadius: '4px', transition: 'width 1s ease' }} />
                  <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.value}억/척 ({item.vessels}척)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(251, 191, 36, 0.05)', borderLeft: '3px solid var(--w-amber-400)', borderRadius: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#fde68a' }}><b>핵심:</b> 연승 105척(53%)은 척당 29.8억으로 선망(214억)의 <b>1/7</b>. 이빨고기 4척이 연승 7척과 같은 매출 창출. "몇 척이냐"가 아니라 "무엇을 잡느냐"가 수익의 본질.</span>
          </div>
        </div>

        {/* Insight 2: 재벌 지배력 분석 */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <h5 style={{ color: '#60a5fa', marginBottom: '4px', fontSize: '1rem' }}>🏢 3대 그룹 지배력 분석 — "198척 중 103척(52%)을 3개 그룹이 지배"</h5>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '16px' }}>동원·사조 각 44척, 신라 15척. 나머지 35개사가 95척을 영세 분할</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { name: '동원그룹', vessels: 44, pct: 22.2, detail: '산업(26)+수산(14)+해사랑(4)', color: '#38bdf8', strength: '선망 14척(52% 지배) + 남빙양 독점', badge: '선망 왕좌' },
              { name: '사조그룹', vessels: 44, pct: 22.2, detail: '산업(32)+오양(7)+씨푸드(3)+대림(2)', color: '#a78bfa', strength: '연승 30척(29%) + 이빨고기 2척', badge: '연승 최다' },
              { name: '신라교역', vessels: 15, pct: 7.6, detail: '선망(6)+연승(9)', color: '#34d399', strength: '선대 건전성 최우수. 평균선령 업계 최저', badge: '효율 최강' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${g.color}33`, borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: g.color, fontWeight: 700, fontSize: '1.1rem' }}>{g.name}</span>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: `${g.color}22`, color: g.color, borderRadius: '10px', fontWeight: 600 }}>{g.badge}</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{g.vessels}<span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>척 ({g.pct}%)</span></div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{g.detail}</div>
                {/* Share bar */}
                <div style={{ background: 'rgba(140,170,255,0.10)', borderRadius: '4px', height: '6px', marginBottom: '8px' }}>
                  <div style={{ width: `${g.pct * 4.5}%`, height: '100%', background: g.color, borderRadius: '4px' }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: g.color }}>{g.strength}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(96, 165, 250, 0.05)', borderLeft: '3px solid #60a5fa', borderRadius: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}><b>핵심:</b> 동원·사조가 각각 44척(22.2%)으로 <b>강한 균형 대치</b>. 신라(15척)는 양강 사이에서 "Quality over Quantity" — 척당 마진 밀도로 승부해야 하는 전략적 포지션.</span>
          </div>
        </div>

        {/* Insight 3: 단가 배수 비교 */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <h5 style={{ color: '#a78bfa', marginBottom: '4px', fontSize: '1rem' }}>💎 어종별 단가 배수(Price Multiplier) — "같은 바다에서 14배 차이"</h5>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '16px' }}>가다랑어 1,910원/kg 대비 이빨고기 21,336원/kg — 동일 해역에서 11.2배 마진 격차</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { species: '이빨고기', price: 21336, mult: '14.1x', emoji: '💎', vs: 'vs 명태' },
              { species: '눈다랑어', price: 7013, mult: '3.7x', emoji: '🍣', vs: 'vs 가다랑어' },
              { species: '참치연승混', price: 6722, mult: '4.4x', emoji: '🎣', vs: 'vs 명태' },
              { species: '오징어류', price: 6326, mult: '4.2x', emoji: '🦑', vs: 'vs 명태' },
              { species: '꽁치', price: 4822, mult: '3.2x', emoji: '🐟', vs: 'vs 명태' },
              { species: '대서양混', price: 3293, mult: '2.2x', emoji: '🌊', vs: 'vs 명태' },
              { species: '가다랑어', price: 1910, mult: '1.0x', emoji: '🐠', vs: '기준' },
              { species: '명태', price: 1512, mult: '0.8x', emoji: '🧊', vs: '최저' },
              { species: '남극크릴', price: 753, mult: '0.4x', emoji: '🦐', vs: '원료' },
            ].map((item, i) => (
              <div key={i} style={{ background: i === 0 ? 'rgba(252, 211, 77, 0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 0 ? 'rgba(252, 211, 77, 0.3)' : 'rgba(140,170,255,0.10)'}`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.emoji}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>{item.species}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: i === 0 ? '#fcd34d' : 'var(--text-primary)' }}>{item.price.toLocaleString()}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>원/kg</div>
                <div style={{ marginTop: '4px', fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? '#fcd34d' : i < 3 ? 'var(--w-emerald-400)' : 'rgba(255,255,255,0.5)' }}>{item.mult}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(167, 139, 250, 0.05)', borderLeft: '3px solid #a78bfa', borderRadius: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#c4b5fd' }}><b>핵심:</b> 이빨고기 1kg = 명태 <b>14.1kg</b> = 가다랑어 <b>11.2kg</b>. 크릴은 원료 753원이나 오메가3 가공 시 <b>10만원+</b>로 133배 마진. "무엇을 잡느냐"뿐 아니라 <b>"어떻게 가공하느냐"</b>가 마진의 핵심.</span>
          </div>
        </div>
      </div>

      {/* 5. Takeaways */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <TakeawayBox
          source="2025 원양산업 통계연보 (업종별 생산금액 및 단가 종합 분석)"
          situation="2024년 총 1.53조 원(198척·38개사) 중 선망 27척(13.6%)이 5,784억(37.9%)을 창출하여 척당 214억으로 1위. 반면 오징어 채낚기 20척은 3,995억(척당 200억)으로 숨은 캐시카우이며, 이빨고기 저연승 4척은 827억(척당 207억, 단가 21,336원/kg)으로 원양의 에르메스. 연승 105척은 53%의 선대를 보유하나 척당 매출은 29.8억에 불과 — 선망의 1/7 수준."
          actionPlan="[전략적 포트폴리오 재편] 신라교역(15척)은 선망 6척(22%)으로 규모의 경제를 수성하면서, 연승 105척의 초고령화(평균 36.5년, 68% 80년대 건조)로 발생할 스크랩 M&A 기회를 포착해야 합니다. 이빨고기(21,336원/kg) + 오징어(6,326원/kg) 등 고단가 쿼터 확보가 ROIC 극대화의 핵심. 동원(44척)·사조(44척) 양강 체제에서 15척으로 차별화하려면 '마진 밀도(Revenue/Vessel)' 최적화 전략이 필수."
        />
        
        <TakeawayBox
          source="2025 원양산업 통계연보 (연도별/국가별 입어료 지불 현황)"
          situation="2024년 원양산업 전체가 지불한 입어료(Fishing Rights Fee)는 약 8,969만 달러(약 1,200억 원)에 달합니다. 특히 참치 선망의 경우 파푸아뉴기니(2,226만 불), 키리바시(1,991만 불) 등 태평양 도서국(PNA)에만 약 6,600만 달러(900억 원)를 지불하고 있어 최우선 원가(OPEX) 부담으로 작용합니다. 명태는 러시아에 1,129만 불, 오징어는 포클랜드에 879만 불을 지불하며 특정 연안국에 대한 극단적 의존도(Exposure)를 보이고 있습니다."
          actionPlan="[VDS(조업일수제도) 헤징 및 매입원가 통제 전략] 연간 1,200억 원의 입어료는 어획 여부와 무관한 매몰 비용(Sunk Cost) 성격을 지닙니다. 따라서 타사의 유휴 쿼터를 인수하여 우리 측의 '척당 어획 효율(CPUE)'을 극대화하는 통폐합(Consolidation)이 유일한 매입원가 절감 돌파구입니다. 향후 기후변화(엘니뇨/라니냐)로 인한 어군 이동에 대비해 입어 수역을 다변화하는 헷징 플랜이 동반되어야 합니다."
        />
      </div>
    </div>
  );
}
