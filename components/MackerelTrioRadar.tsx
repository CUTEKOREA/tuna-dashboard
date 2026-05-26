'use client';

import React from 'react';
import { RadarChart, Radar as ReRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Target } from 'lucide-react';
import rawData from '../data/mackerel_trio.json';
import WidgetCard from './WidgetCard';

const COLORS = ['var(--color-info)','var(--color-danger)','var(--color-success)','var(--color-warning)','#8b5cf6','#06b6d4','#ec4899','#f97316'];

export default function MackerelTrioRadar() {
  const data = rawData as any[];

  // Normalize for radar (0-100 scale)
  const maxCatch = Math.max(...data.map((d: any) => d.catch_t));
  const maxImport = Math.max(...data.map((d: any) => d.import_t));
  const maxExport = Math.max(...data.map((d: any) => d.export_t));

  const getProfile = (d: any) => {
    const total = d.catch_t + d.import_t + d.export_t;
    const catchPct = d.catch_t / total * 100;
    const impPct = d.import_t / total * 100;
    const expPct = d.export_t / total * 100;
    if (catchPct > 60) return { label: '조업 강국', color: 'var(--color-info)' };
    if (impPct > 50) return { label: '소비 대국', color: 'var(--color-danger)' };
    if (expPct > 40) return { label: '가공 허브', color: 'var(--color-success)' };
    return { label: '복합형', color: 'var(--color-warning)' };
  };

  const customBody = (
    <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
      {data.map((d: any, i: number) => {
        const profile = getProfile(d);
        const radarData = [
          { axis: '어획', value: (d.catch_t / maxCatch) * 100 },
          { axis: '수입', value: (d.import_t / maxImport) * 100 },
          { axis: '수출', value: (d.export_t / maxExport) * 100 },
        ];
        return (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '10px 4px', textAlign: 'center'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: COLORS[i % COLORS.length], marginBottom: '4px' }}>{d.country}</div>
            <div style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600,
              background: `${profile.color}20`, color: profile.color, border: `1px solid ${profile.color}40`, marginBottom: '4px'
            }}>{profile.label}</div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <RadarChart width={140} height={120} cx={70} cy={60} outerRadius={40} data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <ReRadar dataKey="value" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)' }}>
              <span>🐟 {Math.round(d.catch_t).toLocaleString()}</span>
              <span>📦 {Math.round(d.import_t).toLocaleString()}</span>
              <span>📤 {Math.round(d.export_t).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <WidgetCard
      title="조업 vs 가공 vs 소비 트리오 분석"
      icon={Target}
      iconColor="#818cf8"
      pillar="S1"
      cardDesc="2023 주요국 생태계 포지션 — 조업·가공·소비 밸런스 진단"
      telemetry={{ status: 'STATIC' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>"조업-수입-수출 3축 레이더"는 글로벌 주요국의 밸류체인 포지션 비교.</p>
<p>국가별: <strong>노르웨이(조업국) · 칠레(가공 허브) · 한국(98% 수입 의존 소비국)</strong>. 한국은 자력 조업 사실상 상실 + 아프리카·개도국 재수출 중계국으로 전락. <strong>환율·노르웨이 수출 정책에 식량 안보 100% 노출</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: "기형적 소비-중계" 모델 탈피. <strong>"칠레형 가공 산업 포지션"</strong>으로 전환.</p>
<p><strong>3단계</strong>: ① 노르웨이산 H&amp;G 대량 보세 수입 — 부산·감포 단지 집중 ② 순살·양념 고부가 제품 전환 ③ 글로벌 C/S 채널(미국 한인마트·아시안 슈퍼) 역수출.</p>
</div>`,
        source: "FAO FishStatJ & 해양수산부 수산정보포털"
      }}
    />
  );
}
