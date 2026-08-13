'use client';

import { useState } from 'react';
import { AlertTriangle, BarChart3, Database, Search, Ship } from 'lucide-react';

import {
  fisheryKeys,
  fisheryLabels,
  fleetProduction2025,
  fleetProductionDisplayFisheryTotals,
  fleetProductionReconciliation,
  getCompanyProduction,
  rankCompaniesByProduction,
  sumCatch,
  type CompanyProduction2025,
  type FisheryKey,
} from '@/lib/fleet-production-2025';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';

const formatMt = (value: number) => `${value.toLocaleString('ko-KR')} M/T`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const topFishery = (company: CompanyProduction2025) => {
  const [key, value] = fisheryKeys.reduce<[FisheryKey, number]>(
    (largest, key) => company.catchMt[key] > largest[1]
      ? [key, company.catchMt[key]]
      : largest,
    [fisheryKeys[0], company.catchMt[fisheryKeys[0]]],
  );

  return value > 0 ? `${fisheryLabels[key]} ${formatMt(value)}` : '-';
};

export default function FleetProduction2025() {
  const [query, setQuery] = useState('');
  const rankedCompanies = rankCompaniesByProduction();
  const silla = getCompanyProduction('신라교역');
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
  const filteredCompanies = normalizedQuery
    ? rankedCompanies.filter((company) => (
      company.companyKo.toLocaleLowerCase('ko-KR').includes(normalizedQuery)
      || company.companyEn.toLocaleLowerCase('en-US').includes(normalizedQuery)
    ))
    : rankedCompanies;

  if (!silla) return null;

  const sillaShare = silla.reportedTotalMt / fleetProduction2025.reportedGrandTotalMt * 100;
  const sillaPurseSeineMix = silla.catchMt.tunaPurseSeine / silla.reportedTotalMt * 100;
  const purseSeineShare = silla.catchMt.tunaPurseSeine / fleetProduction2025.reportedFisheryTotalsMt.tunaPurseSeine! * 100;
  const topFiveTotal = rankedCompanies.slice(0, 5).reduce((total, company) => total + company.reportedTotalMt, 0);

  return (
    <section aria-labelledby="fleet-production-2025-title" style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div>
          <h3 id="fleet-production-2025-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '1.35rem' }}>
            <Database size={22} style={{ color: '#22d3ee' }} /> 2025년 선사별 원양어업 생산실적
          </h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.58)', fontSize: '0.84rem' }}>
            회사별 36개사 · 업종별 10개 항목 · 단위 M/T · 원문 112~115쪽
          </p>
        </div>
        <TelemetryBadge status="STATIC" syncDate="2026-08-12" label="첨부 원문" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {[
          { icon: <BarChart3 size={17} />, label: '원문 총 생산량', value: formatMt(fleetProduction2025.reportedGrandTotalMt), note: '표 하단 합계', color: '#38bdf8' },
          { icon: <Ship size={17} />, label: '신라교역 생산량', value: formatMt(silla.reportedTotalMt), note: `전체 ${formatPercent(sillaShare)} · 2위`, color: '#34d399' },
          { icon: <BarChart3 size={17} />, label: '신라교역 참치선망', value: formatMt(silla.catchMt.tunaPurseSeine), note: `자사 생산의 ${formatPercent(sillaPurseSeineMix)}`, color: '#fbbf24' },
          { icon: <BarChart3 size={17} />, label: '상위 5개사 집중도', value: formatPercent(topFiveTotal / fleetProduction2025.reportedGrandTotalMt * 100), note: `${formatMt(topFiveTotal)} 합산`, color: '#a78bfa' },
        ].map((item) => (
          <div key={item.label} style={{ background: 'rgba(15, 23, 42, 0.48)', border: `1px solid ${item.color}33`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: item.color, fontSize: '0.76rem', marginBottom: '8px' }}>{item.icon}{item.label}</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: 800 }}>{item.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.46)', fontSize: '0.72rem', marginTop: '4px' }}>{item.note}</div>
          </div>
        ))}
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.48)', border: '1px solid rgba(34, 211, 238, 0.18)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 14px', color: '#67e8f9', fontSize: '0.95rem' }}>업종별 생산량 구성</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {fisheryKeys
              .map((key) => ({ key, value: fleetProductionDisplayFisheryTotals[key] }))
              .filter(({ value }) => value > 0)
              .sort((a, b) => b.value - a.value)
              .map(({ key, value }) => {
                const share = value / fleetProduction2025.reportedGrandTotalMt * 100;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: 'rgba(255,255,255,0.72)', fontSize: '0.74rem', marginBottom: '4px' }}>
                      <span>{fisheryLabels[key]}</span>
                      <span>{value.toLocaleString('ko-KR')} M/T · {formatPercent(share)}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(148,163,184,0.12)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${share}%`, minWidth: '3px', borderRadius: '999px', background: key === 'tunaPurseSeine' ? '#22d3ee' : '#64748b' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.48)', border: '1px solid rgba(52, 211, 153, 0.18)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 14px', color: '#6ee7b7', fontSize: '0.95rem' }}>생산량 상위 5개사</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rankedCompanies.slice(0, 5).map((company, index) => {
              const share = company.reportedTotalMt / fleetProduction2025.reportedGrandTotalMt * 100;
              const isSilla = company.companyKo === '신라교역';
              return (
                <div key={company.companyKo} style={{ display: 'grid', gridTemplateColumns: '22px minmax(82px, 0.8fr) 2fr auto', gap: '8px', alignItems: 'center', fontSize: '0.76rem' }}>
                  <span style={{ color: isSilla ? '#34d399' : 'rgba(255,255,255,0.42)', fontWeight: 700 }}>{index + 1}</span>
                  <span style={{ color: isSilla ? '#6ee7b7' : 'rgba(255,255,255,0.78)', fontWeight: isSilla ? 700 : 500 }}>{company.companyKo}</span>
                  <div style={{ height: '8px', background: 'rgba(148,163,184,0.12)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${company.reportedTotalMt / rankedCompanies[0].reportedTotalMt * 100}%`, borderRadius: '999px', background: isSilla ? '#34d399' : '#475569' }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.68)', textAlign: 'right' }}>{company.reportedTotalMt.toLocaleString('ko-KR')} · {formatPercent(share)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '16px', padding: '11px 12px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.07)', color: '#a7f3d0', fontSize: '0.76rem', lineHeight: 1.55 }}>
            신라교역은 전체 생산량 2위이며, 참치선망 생산량 54,803 M/T는 원문 업종 총계의 {formatPercent(purseSeineShare)}입니다.
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.48)', border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.96rem' }}>회사별 생산실적 전수표</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(2,6,23,0.36)' }}>
            <Search size={14} style={{ color: '#94a3b8' }} />
            <span className="sr-only">회사 검색</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="회사명 검색"
              style={{ width: '150px', border: 0, outline: 0, background: 'transparent', color: 'var(--text-primary)', fontSize: '0.78rem' }}
            />
          </label>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: '#111827' }}>
              <tr style={{ color: 'rgba(255,255,255,0.52)', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>순위</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>회사명</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>원문 합계</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>최대 업종</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>업종 합산</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => {
                const calculatedTotal = sumCatch(company.catchMt);
                const isSilla = company.companyKo === '신라교역';
                const hasDifference = calculatedTotal !== company.reportedTotalMt;
                return (
                  <tr key={company.no} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)', background: isSilla ? 'rgba(52,211,153,0.07)' : 'transparent' }}>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.42)' }}>{rankedCompanies.indexOf(company) + 1}</td>
                    <td style={{ padding: '9px 8px' }}>
                      <div style={{ color: isSilla ? '#6ee7b7' : 'rgba(255,255,255,0.82)', fontWeight: isSilla ? 700 : 500 }}>{company.companyKo}</div>
                      <div style={{ color: 'rgba(255,255,255,0.34)', fontSize: '0.65rem', marginTop: '2px' }}>{company.companyEn}</div>
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>{company.reportedTotalMt.toLocaleString('ko-KR')} M/T</td>
                    <td style={{ padding: '9px 8px', color: 'rgba(255,255,255,0.62)' }}>{topFishery(company)}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', color: hasDifference ? '#fbbf24' : 'rgba(255,255,255,0.46)' }}>
                      {calculatedTotal.toLocaleString('ko-KR')} M/T{hasDifference ? ' *' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', padding: '12px 14px', border: '1px solid rgba(245,158,11,0.22)', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', color: '#fde68a', fontSize: '0.73rem', lineHeight: 1.55, marginBottom: '16px' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          원문 검산: 회사별 합계 {fleetProductionReconciliation.reportedCompanyTotalMt.toLocaleString('ko-KR')} M/T, 업종별 행 합산 {fleetProductionReconciliation.calculatedFisheryTotalMt.toLocaleString('ko-KR')} M/T, 표 하단 총계 {fleetProduction2025.reportedGrandTotalMt.toLocaleString('ko-KR')} M/T입니다. 씨맥스피셔리·정일산업·홍진실업은 원문 행 합계와 업종 합산이 각각 1 M/T 차이이며, 해외트롤 하단 합계는 원문에 미표기되어 행 합산값 62,675 M/T를 사용했습니다. 수치를 임의 보정하지 않았습니다.
        </span>
      </div>

      <TakeawayBox
        source="25년도 선사별 업종별 원양어업 생산량 자료, 112~115쪽 (STATIC · 사용자 제공 원문)"
        situation={`2025년 원문 총 생산량은 ${formatMt(fleetProduction2025.reportedGrandTotalMt)}입니다. 신라교역은 ${formatMt(silla.reportedTotalMt)}으로 36개사 중 2위이며 전체의 ${formatPercent(sillaShare)}를 차지합니다. 신라교역 생산량의 ${formatPercent(sillaPurseSeineMix)}가 참치선망에 집중되어 있습니다.`}
        actionPlan={`신라교역은 전체 생산량 2위라는 규모를 유지하되, 참치선망 편중도를 월별 어획량·입어료·어가와 함께 모니터링해야 합니다. 2025년 기준 선망 생산 ${formatMt(silla.catchMt.tunaPurseSeine)}과 연승 ${formatMt(silla.catchMt.tunaLongline)}을 별도 손익 축으로 관리해 수익성 차이를 추적하십시오.`}
      />
    </section>
  );
}
