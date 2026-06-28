'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { ShoppingBag } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const mscGrowthData = [
  { year: '2020/21', share: 7.5, volume: 4700 },
  { year: '2021/22', share: 15, volume: 9400 },
  { year: '2022/23', share: 24, volume: 15200 },
  { year: '2023/24', share: 38, volume: 23500 },
  { year: '2024/25E', share: 45, volume: 40000 },
];

const ukKpis = [
  { label: 'MSC 지출', value: '£1.5B', sub: '+12% YoY (최대 증가폭)', color: '#10b981' },
  { label: '참치 MSC 비율', value: '38%', sub: '2020/21 7.5% → 5배 성장', color: '#38bdf8' },
  { label: '수산물 리테일', value: '£4.36B', sub: '387,463t (+2.5% vol)', color: '#a78bfa' },
  { label: '소비자 MSC 인지', value: '54%', sub: '2016년 43%에서 상승', color: '#f59e0b' },
];

const ukInsights = [
  { title: '스시 = 英 수산물 최고 성장 세그먼트', desc: '10대 수산물 카테고리 중 가치·물량 모두 최고 성장률 기록', color: '#10b981' },
  { title: 'Korea-UK FTA', desc: '냉동필렛 HS0304.87 MFN 18% → 0%, 동남아 대비 결정적 우위', color: '#38bdf8' },
  { title: '외식 MSC 3.55%', desc: '리테일 61% 대비 극히 낮아 → 대형 성장 기회', color: '#f59e0b' },
  { title: '고물가 → 냉동/보존 전환', desc: '소비자가 신선→냉동·캔·RTE로 이동 중', color: '#a78bfa' },
];

export default function SasUkMarket() {
  return (
    <WidgetCard
      id="W-SAS26"
      title="🇬🇧 영국 — MSC 주도 참치 시장 & FTA 우위"
      icon={ShoppingBag}
      iconColor="#38bdf8"
      pillar="S1"
      cardDesc="MSC 참치 38%(7.5%→5배), 스시=최고성장, Korea-UK FTA 18%→0% 관세 우위"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "영국 소비자는 수산물에 £4.36B를 지출하며, MSC 인증 제품이 가치의 61%를 차지합니다. 참치 MSC 비율은 7.5%(2020/21) → 38%(2023/24)로 5배 급증했으며, 2024/25에는 40,000t+으로 확대 전망됩니다. 스시는 영국 수산물 10대 카테고리 중 가치·물량 모두 최고 성장률을 기록했습니다.",
        actionPlan: "Korea-UK FTA로 냉동참치필렛 관세 18%→0%는 동남아(태국·베트남) 대비 결정적 가격 우위입니다. 외식 MSC 비율(3.55%)이 리테일(61%) 대비 극히 낮아, NESI·Taiko Foods 등 외식 공급망 진입이 블루오션입니다. 고물가로 냉동·캔 전환이 가속되어 한국산 냉동 saku/steak 수요 확대가 예상됩니다.",
        source: "MSC UK Market Report 2024, UK Packaged Tuna Outlook 2030, Seafish 2024",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {ukKpis.map((k) => (
              <div key={k.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px',
                border: '1px solid rgba(140,170,255,0.12)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
                <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '1px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* MSC Tuna Share Growth Chart */}
          <div style={{ height: 180, width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={mscGrowthData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: '#e2e8f0' }}
                  formatter={(value: number, name: string) => [name === 'share' ? `${value}%` : `${value.toLocaleString()}t`, name === 'share' ? 'MSC 비율' : '물량']}
                />
                <Bar dataKey="share" name="share" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                  {mscGrowthData.map((_, i) => (
                    <Cell key={i} fill={i === mscGrowthData.length - 1 ? '#f59e0b' : '#38bdf8'} opacity={0.4 + i * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#64748b', marginTop: '-8px' }}>
            영국 슈퍼마켓 참치 중 MSC 비율 (%, 2024/25E는 예상치)
          </div>

          {/* Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {ukInsights.map((ins) => (
              <div key={ins.title} style={{
                padding: '8px 10px', borderRadius: '8px',
                background: `${ins.color}08`, border: `1px solid ${ins.color}15`,
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: ins.color }}>{ins.title}</div>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '2px' }}>{ins.desc}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
