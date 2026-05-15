import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import styles from './TunaExtractDashboard.module.css';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const data = [
  { name: '한국 (Korea)', rate: 19.5 },
  { name: '글로벌 평균', rate: 40.0 },
  { name: '아이슬란드', rate: 95.0 },
  { name: '노르웨이', rate: 99.0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p style={{ color: payload[0].payload.rate < 50 ? 'var(--color-danger)' : 'var(--color-success)', margin: '0.25rem 0', fontSize: '0.8rem' }}>
          업사이클링 비율: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export default function TunaBioUpcyclingGap() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}><ArrowUpRight size={18} className={styles.cardIcon} color="#8b5cf6"/> W13. 수산 부산물 업사이클링 격차</h3>
      </div>
      <div className={styles.cardBody}>
        <SafeResponsiveContainer height={280}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickMargin={10}  angle={-25} textAnchor="end" height={60} tickFormatter={truncateXAxis}/>
            <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.rate > 90 ? '#8b5cf6' : entry.rate < 30 ? 'var(--color-danger)' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
        <TakeawayBox 
          situation="FAO 통계 및 수산과학원 조사에 따르면, 한국의 수산 부산물 업사이클링 비율은 19.5%로 글로벌 평균(40%)의 절반에도 못 미치며, 아이슬란드(95%)·노르웨이(99%)와는 5배 이상의 격차가 존재합니다. 참고로 2020년 기준 글로벌 어분 생산의 27%, 어유 생산의 48%가 이미 어획 부산물로부터 생산되고 있습니다. 참치 원물의 약 50%(내장 12~18%, 뼈 9~15%, 머리 9~12% 등)가 폐기물로 버려지고 있어, 역으로 막대한 '미회수 가치(Unrealized Value)'가 잠재해 있는 블루오션입니다. EU는 CFP(공동어로정책)의 '하역 의무화(Landing Obligation)'로 해상 투기를 전면 금지하여, 부산물 자원화가 규제적 의무로 전환되고 있습니다." 
          actionPlan="1) 아이슬란드의 'Nothing is Waste' 모델을 벤치마킹하여, 참치 가공 공장의 부산물 전량을 제약/건기식/펫푸드 B2B 원료로 전환하는 전사적 '제로 웨이스트 로드맵'을 수립해야 합니다. 2) 단기적으로는 자숙액→액젓(19.5%→40% 수준)을, 중장기적으로는 심장·뼈→기능성 추출물/칼슘보충제(40%→80%+ 수준)로 업사이클링 비율을 단계적으로 끌어올리는 것이 목표입니다. 3) EU 하역 의무화 정책을 활용한 '규제 준수 + 순환경제' 이중 가치 마케팅으로 유럽 시장 진출 시 프리미엄을 확보할 수 있습니다." 
          source="FAO SOFIA 2022 (The State of World Fisheries and Aquaculture) / 수산과학원 부산물 재활용 동향 리포트 / 아이슬란드 Ocean Cluster 사례 연구 / A third assessment of global marine fisheries discards / EU CFP Landing Obligation" 
        />
      </div>
    </div>
  );
}
