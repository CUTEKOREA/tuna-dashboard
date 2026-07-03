/**
 * 참다랑어 양식 블랙홀 수입국 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 99줄 → After 60줄 (-39%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import data from '../data/tuna_import_blackhole.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>총 수입량: </span>
          <strong>{Number(entry.value).toLocaleString()} 톤</strong>
        </p>
      ))}
    </div>
  );
};

const getBarColor = (country: string) => {
  if (country === '일본') return '#ef4444';
  if (country === '한국') return '#3b82f6';
  return '#64748b';
};

const TunaImportBlackhole = () => (
  <WidgetCard
    title="참다랑어 양식 블랙홀 수입국 분석"
    icon={Anchor}
    iconColor="#ef4444"
    pillar="S4"
    cardDesc="FAO FishStatJ 양자 무역 데이터로 세계 10대 참다랑어 양식국 발 \'양식 오리진\' 수입 물량을 합산 — 2019~2023 일본 블랙홀 구조 분석"
    telemetry={{ status: 'STATIC', syncDate: '2023-12-31' }}
    chartHeight={380}
    chart={
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
        <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="Country" width={140} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Volume" radius={[0, 6, 6, 0]} barSize={22}>
          {(data as any[]).map((entry, i) => <Cell key={i} fill={getBarColor(entry.Country)} />)}
        </Bar>
      </BarChart>
    }
    takeaway={{
      situation: `<div>
<p>"블랙홀"이란 모든 것을 빨아들이고 빠져나오지 못하게 하는 구조. 글로벌 양식 참다랑어 시장에서 일본이 정확히 그 역할.</p>
<p>구조: <strong>전 세계 양식 참다랑어 수입의 과반(50%+)을 일본 단독으로 빨아들임</strong>. 모든 양식장(호주·스페인·몰타·튀르키예·멕시코)의 1순위 수요처가 일본이며, 다른 국가는 일본 수입 후 잔량을 받는 후순위 위치.</p>
<p>왜 일본이 이렇게 지배? ① 도쿄 토요스 경매가 글로벌 기준가 형성 ② 일본 미슐랭·스시 문화의 뚜렷한 소비 ③ 양식장과의 장기 거래 관계 ④ 일본 종합상사(미쓰비시·미쓰이)의 자본 기반.</p>
<p>의미: 한국·중국·중동이 양식 참다랑어 시장에 접근하려면 <strong>일본 도쿄 경매 우회가 필수</strong>. 도쿄 경매 가격에 묶이는 한 마진의 50~60%가 일본 상사에 흡수됨.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 일본 블랙홀 구조 탈피는 단순 채널 확보가 아닌 <strong>"글로벌 고급 수산물 시장의 권력 구조 재편 시도"</strong>. 한국이 선도적으로 직거래 채널을 구축하면 아시아 고급 수산물 유통 거점으로 성장할 여지가 있다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>호주·지중해 양식장 산지 직거래 개통</strong>: Cleanseas Tuna(호주)·Balfegó(스페인)·Malta Fish Farming Co. 등 중소형 양식장 5~7곳과 직접 계약. 중간 유통마진 200~400bp 회수.</li>
<li style="margin-bottom: 8px;"><strong>한국발 미국·EU 직수출 프리미엄 브랜드 론칭</strong>: 일본 토요스 평균 판매가 대비 -15~20% 가격 경쟁력. LA·뉴욕·런던·파리 미슐랭 스시 레스토랑 직납.</li>
<li><strong>아시아 고급 수산물 거점 진화</strong>: 인천·부산을 일본 토요스의 대체 거점으로 정착. 5년 후 두 번째 글로벌 경매 거점 형성(업계 추정).</li>
</ol>
</div>`,
      source: 'FAO FishStatJ Farmed Bluefin Import Volume',
    }}
  />
);

export default TunaImportBlackhole;
