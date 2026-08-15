'use client';

import React from 'react';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import WidgetCard from '../WidgetCard';

const bftImports = [
  { country: '🇹🇷 터키', value: 20.5, type: '축양', color: '#ef4444' },
  { country: '🇮🇹 이탈리아', value: 19.6, type: '축양', color: '#f59e0b' },
  { country: '🇫🇷 프랑스', value: 15.2, type: '축양', color: '#38bdf8' },
  { country: '🇪🇸 스페인', value: 14.6, type: '축양', color: '#10b981' },
  { country: '🇲🇦 모로코', value: 13.5, type: '축양', color: '#a78bfa' },
  { country: '🇹🇳 튀니지', value: 10.8, type: '축양', color: '#22d3ee' },
  { country: '🇱🇾 리비아', value: 6.2, type: '축양', color: '#64748b' },
  { country: '🇲🇹 몰타', value: 3.8, type: '축양', color: '#64748b' },
  { country: '🇭🇷 크로아티아', value: 0.9, type: '축양', color: '#64748b' },
];

export default function SasKoreaMedBftImports() {
  return (
    <WidgetCard
      id="W-SAS17"
      title="한국의 지중해 BFT 수입 지도"
      description="2024년 한국 참다랑어(혼마구로) 국가별 수입액 ($M)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="한국의 지중해 축양 참다랑어(BFT) 국가별 수입액 수평 막대 차트 (UN Comtrade 기준)"
      takeaway={{
        situation: "한국은 지중해 축양 참다랑어(혼마구로)를 $109M 규모로 수입하며, 터키($20.5M), 이탈리아($19.6M), 프랑스($15.2M) 순입니다. 평균 수입단가는 $18.79/kg으로, 이는 일본·미국과 동일한 지중해 축양 공급망에서 조달하는 구조입니다.",
        actionPlan: "한국은 '자체 어획(황다랑/눈다랑) + 지중해 수입(혼마구로)'의 이중 원료 구조입니다. ICCAT 쿼터 증가(+19.3%)로 수입 원가 안정화가 예상되며, 고급 사시미 시장 확대 기회입니다.",
        source: 'kr_tuna_imports_by_partner_2024.csv, UN Comtrade',
      }}
      customBody={
        <div>
          {/* ── 콜아웃 배너 ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a5f, var(--w-navy-900))',
              border: '1px solid #38bdf833',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--w-slate-400)', marginBottom: '2px' }}>
                총 수입액 (냉동 필렛 기준)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--w-sky-400)' }}>
                ~$109M
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--w-slate-400)', marginBottom: '2px' }}>
                평균 수입단가
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--w-amber-500)' }}>
                $18.79/kg
              </div>
            </div>
          </div>

          {/* ── 강조 문구 ── */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#facc15',
              background: '#facc1510',
              border: '1px solid #facc1522',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '14px',
            }}
          >
            한국 = 일본·미국에 이은 제4의 지중해 BFT 구매국
          </div>

          {/* ── 수평 막대 차트 ── */}
          <div style={{ height: '320px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bftImports}
                layout="vertical"
                margin={{ top: 4, right: 40, left: 10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.15} />
                <XAxis
                  type="number"
                  domain={[0, 24]}
                  tick={{ fontSize: 11, fill: 'var(--w-slate-400)' }}
                  axisLine={false}
                  tickLine={false}
                  unit="M"
                />
                <YAxis
                  dataKey="country"
                  type="category"
                  width={110}
                  tick={{ fontSize: 12, fill: 'var(--w-slate-300)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    background: 'var(--w-navy-900)',
                    color: 'var(--w-slate-200)',
                    fontSize: '0.8rem',
                  }}
                  formatter={(value: unknown) => [`$${value}M`, '수입액']}
                />
                <Bar dataKey="value" barSize={22} radius={[0, 6, 6, 0]} isAnimationActive={false}>
                  {bftImports.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </div>
      }
    />
  );
}
