'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import WidgetCard from './WidgetCard';

interface CatchEntry {
  year: string;
  가다랑어: number;
  황다랑어: number;
  눈다랑어: number;
}

export default function TunaCatchBySpeciesLive() {
  const [data, setData] = useState<CatchEntry[]>([]);

  useEffect(() => {
    fetch('/data/tuna/catch_by_species.json')
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error('Failed to load tuna catch data:', err));
  }, []);

  return (
    <WidgetCard
      title="참치 어종별 글로벌 어획량 추이 (Live)"
      pillar="S1"
      unit="(톤, live weight)"
      cardDesc="FAO FishStat 2015-2022 Capture Quantity (Q_tlw, 톤 live weight) 기반 3대 참치 어종 어획량 시계열"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      termTooltip={{
        term: 'FishStat · Q_tlw',
        description: 'FishStat는 FAO의 수산물 생산 통계 데이터베이스. Q_tlw는 살아있는 무게 환산 톤 단위 어획량.'
      }}
      chart={
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="year" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v / 1000000).toFixed(1) + 'M'}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc', fontSize: '13px' }}
            formatter={(value: number, name: string) => [`${value.toLocaleString()}톤`, name]}
            labelFormatter={(label) => `${label}년`}
            labelStyle={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="가다랑어" name="가다랑어" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="황다랑어" name="황다랑어" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="눈다랑어" name="눈다랑어" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      }
      takeaway={{
        situation: '2022년 기준 가다랑어 3,061,304톤(전 어종 61%) · 황다랑어 1,563,619톤(31%) · 눈다랑어 357,628톤(7%) — 가다랑어가 양적 압도. 2015-2022 8년간 가다랑어는 ~3M톤 박스권 안정, 황다랑어는 1.4-1.6M톤 점진 증가, 눈다랑어는 자원 회복 우려로 0.35M톤 박스권.',
        actionPlan: '가다랑어 의존도 60%+ = ENSO·라니냐 한 사건이 글로벌 공급 60% 직격. 황다랑어 비중 30%대를 35%+로 끌어올리는 *어획권 다변화* 전략이 단기 수익성보다 *장기 공급 안정성*에 결정적. 신라교역 차원에서 황다랑어 어획권 보유 선사와 5년 장기 공급 계약 검토.',
        source: 'FAO FishStat Capture Statistics 2015-2022 (Q_tlw, 자료수집 매뉴얼 v28.4 §2 FishStat 3 zip)'
      }}
    />
  );
}
