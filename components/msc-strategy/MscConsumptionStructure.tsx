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
  return (
    <WidgetCard
      title="W-MSC06. 유럽 참치 소비 구조 맵"
      icon={LayoutGrid}
      iconColor="#f59e0b"
      pillar="S5"
      cardDesc="유럽 참치캔 소비를 포맷(캔/유리병/파우치) × 용매(염수/올리브유/해바라기유) × 어종별로 구조화한 비중 맵"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={
        <div style={{ padding: '0 20px 20px' }}>
          {/* Treemap-style proportional blocks */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              borderRadius: 10,
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.06)',
              minHeight: 260,
            }}
          >
            {treeData.map((item) => {
              const pct = (item.size / totalSize) * 100;
              // large items get a wider flex basis
              const isLarge = item.size >= 15;
              return (
                <div
                  key={item.name}
                  style={{
                    flex: isLarge ? `1 1 ${Math.max(pct * 1.2, 30)}%` : `1 1 ${Math.max(pct * 1.5, 20)}%`,
                    minWidth: isLarge ? 180 : 120,
                    background: `${item.fill}15`,
                    border: `1px solid ${item.fill}40`,
                    borderRadius: 8,
                    padding: '16px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    margin: 2,
                  }}
                >
                  {/* Background percentage watermark */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 10,
                      fontSize: '2.2rem',
                      fontWeight: 900,
                      color: item.fill,
                      opacity: 0.12,
                      lineHeight: 1,
                    }}
                  >
                    {item.size}%
                  </div>

                  {/* Content */}
                  <div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#e2e8f0',
                        marginBottom: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.desc}</div>
                  </div>

                  {/* Bottom bar + percentage */}
                  <div>
                    <div
                      style={{
                        height: 6,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 3,
                        overflow: 'hidden',
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: item.fill,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: item.fill,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.size}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 12,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            <span>🔵 북유럽형 <span style={{ color: '#38bdf8', fontWeight: 700 }}>캔+염수+가다랑어</span> 35%</span>
            <span>🟡 남유럽형 <span style={{ color: '#f59e0b', fontWeight: 700 }}>캔+올리브유+황다랑어</span> 28%</span>
            <span>합계 63% — 양대 축</span>
          </div>
        </div>
      }
      takeaway={{
        situation: "유럽 참치캔 소비는 크게 '북유럽형(캔+염수+가다랑어)'과 '남유럽형(캔+올리브유+황다랑어)'으로 양분. 영국·독일은 가다랑어 염수캔(35%)이 주류이고, 이탈리아·스페인은 황다랑어 올리브유캔(28%)이 시장을 주도.",
        actionPlan: "수출 제품 기획 시 타겟 시장별 제품 포맷 차별화 필수. 이탈리아 진출 시 올리브유+유리병 프리미엄 라인, 영국 진출 시 염수+파우치 편의형 라인을 우선 개발.",
        source: "MSC Country Market Analysis 2024-2026 (IT/ES/UK/FR)",
      }}
    />
  );
}
