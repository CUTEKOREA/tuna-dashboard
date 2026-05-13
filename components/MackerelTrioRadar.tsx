'use client';

import React from 'react';
import { RadarChart, Radar as ReRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import styles from './MackerelStrategy.module.css';
import { Target } from 'lucide-react';
import rawData from '../data/mackerel_trio.json';
import TakeawayBox from './TakeawayBox';

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

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
          <Target size={20} /> 조업 vs 가공 vs 소비 트리오 분석
          
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
          2023 주요국 생태계 포지션 — 조업·가공·소비 밸런스 진단
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
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
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ &amp; 해양수산부 수산정보포털"
          situation="글로벌 주요 국가의 밸류체인을 '조업-수입-수출' 3축으로 분석하면, 노르웨이(압도적 조업국), 칠레(조업/수입 기반 가공 허브), 한국(자급률 붕괴로 98% 수입 의존형 소비국)의 명확한 포지션이 드러납니다. 특히 한국은 자력 조업 기반을 사실상 상실한 채 아프리카/개도국행 재수출 유통 허브 역할에만 머무르는 '기형적 소비-중계국'으로 전락했습니다. 이는 환율 변동과 노르웨이 수출 정책에 국가 식량 안보가 직접적으로 노출된 최약체 포지션입니다."
          actionPlan="한국의 '기형적 소비-중계' 모델에서 완전히 탈피하여, 칠레의 '가공 산업(Processing)' 포지션으로 전환해야 합니다. 노르웨이산 H&G를 대량 보세 수입하여 영남권(부산/감포) 단지에 집중 투입하고, 고부가가치 순살/양념 제품으로 전환한 뒤 내수 방어 및 글로벌 C/S 채널(미국 한인마트, 아시안 슈퍼)에 역수출(Export)하여 수출 축 레이더를 인위적으로 비대화시키는 수익 모델을 강제 가동하십시오."
        />
      </div>
    </div>
  );
}
