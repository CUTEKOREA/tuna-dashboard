'use client';

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const treeData = [
  { name: '캔+염수+가다랑어', size: 35, fill: '#38bdf8', desc: '영국·독일 주력' },
  { name: '캔+올리브유+황다랑어', size: 28, fill: '#f59e0b', desc: '이탈리아·스페인 주력' },
  { name: '캔+해바라기유+가다랑어', size: 15, fill: '#10b981', desc: '프랑스 주력' },
  { name: '유리병+올리브유+황다랑어', size: 10, fill: '#a78bfa', desc: '이탈리아 프리미엄' },
  { name: '파우치+염수+날개다랑어', size: 7, fill: '#22d3ee', desc: '영국 편의형' },
  { name: '기타', size: 5, fill: '#64748b', desc: '냉동·신선 등' },
];

const totalSize = treeData.reduce((acc, d) => acc + d.size, 0);

export default function MscConsumptionStructure() {
  const body = (
    <div>
      {/* Treemap-style proportional blocks */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(30,41,59,0.3)',
        border: '1px solid rgba(255,255,255,0.04)',
        padding: '4px',
        minHeight: '260px',
      }}>
        {treeData.map((item) => {
          const pct = (item.size / totalSize) * 100;
          const isLarge = item.size >= 15;
          return (
            <div
              key={item.name}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                borderRadius: 8,
                padding: '16px',
                flex: isLarge ? `1 1 ${Math.max(pct * 1.2, 30)}%` : `1 1 ${Math.max(pct * 1.5, 20)}%`,
                minWidth: isLarge ? 180 : 120,
                backgroundColor: `${item.fill}15`,
                border: `1px solid ${item.fill}40`,
              }}
            >
              {/* Background percentage watermark */}
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: '2rem',
                fontWeight: 800,
                lineHeight: 1,
                opacity: 0.1,
                color: item.fill,
                pointerEvents: 'none',
              }}>
                {item.size}%
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px', lineHeight: 1.3 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{item.desc}</div>
              </div>

              {/* Bottom bar + percentage */}
              <div style={{ position: 'relative', zIndex: 1, marginTop: '16px' }}>
                <div style={{
                  height: 6,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: '6px',
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 3,
                    width: `${pct}%`,
                    backgroundColor: item.fill,
                  }} />
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: item.fill,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {item.size}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        padding: '12px',
        background: 'rgba(30,41,59,0.5)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 8,
        fontSize: '0.75rem',
        fontWeight: 500,
        color: '#94a3b8',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span>🔵 북유럽형 <span style={{ fontWeight: 700, color: '#38bdf8', marginLeft: '4px' }}>캔+염수+가다랑어 (35%)</span></span>
        <span>🟡 남유럽형 <span style={{ fontWeight: 700, color: '#f59e0b', marginLeft: '4px' }}>캔+올리브유+황다랑어 (28%)</span></span>
        <span style={{ fontWeight: 700, color: '#cbd5e1', marginLeft: '8px' }}>합계 63% (양대 축)</span>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="유럽 참치 소비 구조 맵"
      icon={LayoutGrid}
      iconColor="#f59e0b"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="포맷(캔/파우치) × 용매 × 어종 비중 트리맵 · B2C 소비 선호도"
      customBody={body}
      takeaway={{
        situation: "유럽 참치캔 소비는 북유럽의 '캔+염수+가다랑어(35%)'와 남유럽의 '캔+올리브유+황다랑어(28%)' 포맷으로 크게 양분됩니다. 이 두 가지가 전체 시장의 63%를 차지하는 양대 축입니다.",
        actionPlan: "타겟 시장별로 제품 포맷 차별화가 필수적입니다. 이탈리아 진출 시 올리브유 베이스의 황다랑어 프리미엄 라인을, 영국 진출 시 가다랑어 염수 및 파우치 편의형 라인을 우선 개발하세요.",
        source: "MSC Country Market Analysis 2024-2026",
      }}
    />
  );
}
