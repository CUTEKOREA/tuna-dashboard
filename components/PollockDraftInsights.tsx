'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ComposedChart, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import WidgetCard from './WidgetCard';
import { Globe, ShieldCheck, Flag, TrendingUp, Navigation } from 'lucide-react';
import { ChartPatternDefs } from './ChartPatterns';

const countryMap: Record<string, string> = {
  'China': '중국',
  'Republic of Korea': '대한민국',
  'Thailand': '태국',
  'United Kingdom of Great Britain and Northern Ireland': '영국',
  'Netherlands (Kingdom of the)': '네덜란드',
  'Italy': '이탈리아',
  'Canada': '캐나다',
  'France': '프랑스',
  'Germany': '독일',
  'Japan': '일본',
  'Poland': '폴란드',
  'Spain': '스페인',
  'United States of America': '미국',
  'Russian Federation': '러시아',
  'Norway': '노르웨이',
  'Vietnam': '베트남',
  'Viet Nam': '베트남',
  'Belgium': '벨기에',
  'Indonesia': '인도네시아',
  'Denmark': '덴마크',
  'Belarus': '벨라루스',
  'Ecuador': '에콰도르',
  'Peru': '페루',
  'India': '인도',
  'Türkiye': '튀르키예',
  'Mexico': '멕시코',
  'Brazil': '브라질',
  'Argentina': '아르헨티나',
  'Chile': '칠레',
  'Philippines': '필리핀',
  'Chinese Taipei': '대만',
  'Malaysia': '말레이시아',
  'Morocco': '모로코',
  'Senegal': '세네갈',
  'Ghana': '가나',
  'South Africa': '남아공',
  'Sweden': '스웨덴',
  'Iceland': '아이슬란드',
  'Portugal': '포르투갈',
  'Ireland': '아일랜드',
  'Australia': '호주',
  'New Zealand': '뉴질랜드',
  'Papua New Guinea': '파푸아뉴기니',
  'Myanmar': '미얀마',
  'Nigeria': '나이지리아',
  'Mauritania': '모리타니아'
};

const tCountry = (name: string) => countryMap[name] || name;

export default function PollockDraftInsights() {
  const [megatrend, setMegatrend] = useState<any[]>([]);
  const [koreaCrisis, setKoreaCrisis] = useState<any[]>([]);
  const [blackhole, setBlackhole] = useState<any[]>([]);
  const [spread, setSpread] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/pollock_global_megatrend.json').then(r => r.json()).then(setMegatrend);
    fetch('/data/pollock_korea_crisis_v2.json').then(r => r.json()).then(setKoreaCrisis);
    fetch('/data/pollock_import_blackhole.json').then(r => r.json()).then(setBlackhole);
    fetch('/data/pollock_spread_winners.json').then(r => r.json()).then(data => setSpread(data.map((d: any) => ({...d, country: tCountry(d.country)}))));
    fetch('/data/pollock_price_tiers.json').then(r => r.json()).then(data => setTiers(data.map((d: any) => ({...d, country: tCountry(d.country)}))));
  }, []);

  if (!megatrend.length) return null;

  return (
    <>
      {/* 1. 글로벌 메가 트렌드 */}
            <WidgetCard
        title="전체 글로벌 메가 트렌드 (1950~2024년 생산량 추이)"
        icon={Globe}
        pillar="S1"
        telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
        cardDesc="지난 75년간 명태의 전 세계 생산량 변동 시계열"
        termTooltip={{ term: "Global Megatrend", description: "지난 75년간 명태의 전 세계 생산량 변동 시계열" }}
        chart={
<AreaChart data={megatrend} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M t`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a2442', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ fontWeight: 600 }}
                  formatter={(value: any) => [`${(Number(value)/1000).toFixed(1)}k tons`, '생산량']}
                  labelFormatter={(l) => `${l}년`}
                />
                <Area type="monotone" dataKey="val" name="Global Production" stroke="var(--color-info)" fillOpacity={1} fill="url(#colorProd)" />
              </AreaChart>
        }
        takeaway={{
          situation: "1980년대 정점 이후 장기 우하향하던 북태평양 명태 생물량이 최근 오호츠크해 및 베링해의 거시적 수온 이동(Thermal Shift)으로 인해 러시아 EEZ 내에서 폭발적으로 반등했습니다. 공급 패권이 다국적 분산 체제에서 '미국-러시아 복점(Duopoly)' 구조로 완전히 회귀하는 영구적 패러다임 시프트입니다.",
          actionPlan: "[Geopolitical Supply Hedging] 단일 어종 세계 최대 생산량(350만 톤)임에도 불구하고 공급망이 미국·러시아에 독점된 극도의 '병목(Bottleneck) 디스카운트' 상황입니다. 러-우 전쟁에 따른 서구권의 러시아산 해산물 금수 제재(Sanctions) 리스크 및 알래스카 쿼터 감축 쇼크에 대비, 아시아 제3국 경유 우회 물량의 70% 이상을 2~3년 장기 선도계약으로 즉시 락인하고, 12개월분 이상의 안전 재고 비축을 위한 창고 금융(Inventory Financing) 크레딧 라인을 즉각 확대.",
          source: "FAO 글로벌 어획생산량 DB (1950-2024)"
        }}
      />


      {/* 2. 대한민국 명태 자급률 vs 수입 의존도 */}
            <WidgetCard
        title="대한민국 명태 자급률 vs 수입 의존도 시계열 분석"
        icon={ShieldCheck}
        pillar="S1"
        telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
        cardDesc="국산 원양/연근해산 고갈 현상 및 100%에 달하는 수입 의존도 교차점 투영"
        termTooltip={{ term: "Self-Sufficiency vs Import", description: "국산 원양/연근해산 고갈 현상 및 100%에 달하는 수입 의존도 교차점 투영" }}
        chart={
<ComposedChart data={koreaCrisis.filter(d=> d.year>=1990)} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
  <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a2442', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value: any) => [`${(Number(value)/1000).toFixed(1)}k tons`, '']}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="import" name="수입량 (Import)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="catch" name="자체 어획량 (Catch)" stroke="var(--color-success)" strokeWidth={3} dot={false} />
              </ComposedChart>
        }
        takeaway={{
          situation: "국가 주도의 치어 방류 및 연근해 어장 복원 프로젝트(명태 살리기)가 생태학적 한계로 최종 실패하며, '국민 단백질'의 서플라이 체인이 100% 해외 수입에 의존하는 거시적 주권 상실(Sovereignty Crisis) 단계로 진입했습니다. 이제 국내 판매 단가는 철저히 러시아 어선단의 조업 쿼터 및 선가 네고(Pricing Power) 파워에 완전히 종속되었습니다.",
          actionPlan: "[Margin Defense & Premiumization] 자원 회복에 대한 환상을 폐기하고, 원자재 수입 의존형 비즈니스의 치명적 약점인 '수입 물가 폭등 쇼크'를 상쇄할 B2C 마진 방어(Margin Defense)에 전사적 자원을 집중하십시오. 매입원가 상승분(Inflation)을 소비자 판가로 즉시 전가(Pass-through)할 수 있도록, 기존의 저단가 탕거리/통마리 유통을 폐기하고 100% '초프리미엄 HMR(저염 명란, 영유아용 뼈없는 필레, 펫푸드 연육)' 중심으로 프로덕트 믹스(Product Mix)를 전면 강제 전환해야 합니다.",
          source: "해양수산부 수산정보포털 & 관세청 무역통계"
        }}
      />

      {/* 3. 최근 5개년 수입 블랙홀 국가 탐지 */}
            <WidgetCard
        title="최근 5개년 수입 블랙홀 국가 탐지 (2019-2023)"
        icon={Flag}
        pillar="S3"
        telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
        cardDesc="가장 공격적으로 명태 물량을 흡수하는 상위 국가들의 시계열 동향"
        termTooltip={{ term: "Import Blackholes", description: "가장 공격적으로 명태 물량을 흡수하는 상위 국가들의 시계열 동향" }}
        chart={
<LineChart data={blackhole} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v/1000).toFixed(0)}k t`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a2442', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value: any, name: any) => [`${(Number(value)/1000).toFixed(1)}k tons`, name]}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                {Object.keys(blackhole[0] || {}).filter(k=>k!=='year').map((k, i) => (
                  <Line key={k} type="monotone" dataKey={k} name={tCountry(k)} stroke={['#f43f5e', 'var(--color-info)', 'var(--color-success)', 'var(--color-warning)', '#8b5cf6'][i%5]} strokeWidth={3} dot={{r: 4}} />
                ))}
              </LineChart>
        }
        takeaway={{
          situation: "글로벌 H&G 무역 흐름에서 중국 다롄/칭다오 콤플렉스는 인건비 경쟁력과 가공 인프라로 전 세계 원물의 70% 이상을 흡수하는 '재가공 블랙홀' 지위를 굳혔습니다. 러시아산 블록을 더블프로즌(Double-frozen) 필레로 전환하여 서구권에 역수출하는 이 거대한 공급망의 재고 회전율(Inventory Turnover)이 글로벌 명태 선물 가격을 통제하는 핵심 인덱스입니다.",
          actionPlan: "[Dual-Hub Tolling Strategy] 단순 중간 무역상(Trader) 지위를 탈피하여, 중국 거대 가공 밸류체인에 직접 침투(Penetration)하십시오. 중국 현지 대형 가공장과의 독점적 톨링(Tolling, 위탁가공) 계약을 체결해 프라이빗 라벨 연육 및 필레 수출 물량을 락인함과 동시에, 거시적 '미중 디커플링(De-coupling) 관세 리스크' 폭발에 대비하여 베트남/인도네시아에 30%의 대체 가공 허브(Alt-Hub) 물량을 분산 배치하는 '투-트랙 리스크 헤징'을 즉각 이사회에 상정해야 합니다.",
          source: "FAO FishStatJ - Trade flow (Imports) Top 5 Countries"
        }}
      />

      {/* 4. 2차 가공 국가 Spread Winners */}
            <WidgetCard
        title="마진율(Spread) 1위 2차 가공 국가 부가가치 스캔"
        icon={TrendingUp}
        pillar="S2"
        telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
        cardDesc="수입 단가 대비 수출 단가의 차액을 극대화하여 2차 가공 이윤을 창출하는 승자 목록"
        termTooltip={{ term: "Spread Winners", description: "수입 단가 대비 수출 단가의 차액을 극대화하여 2차 가공 이윤을 창출하는 승자 목록" }}
        chart={
<BarChart data={spread} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
  <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} stroke="#94a3b8" />
                <YAxis dataKey="country" type="category" stroke="#94a3b8" width={80} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a2442', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value: any, name: any) => [`$${Number(value).toFixed(2)}/ton`, name === 'spread' ? '마진 차액(Spread)' : (name === 'import_price' ? '수입원가' : '수출원가')]}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="import_price" stackId="a" name="수입원가" fill="#64748b" />
                <Bar dataKey="spread" stackId="a" name="부가가치 (Spread)" fill="var(--color-info)" radius={[0, 4, 4, 0]} />
              </BarChart>
        }
        takeaway={{
          situation: "수입 대비 수출 단가 차액인 '가공 스프레드(Processing Margin Spread)' 스캐닝 결과, 독일·네덜란드 등 2차 가공 승자(Spread Winners)들은 자동화 설비를 통한 첨단 필레팅/수리미 추출로 원물 대비 톤당 $1,000~$2,500의 초과수익을 창출하고 있습니다. Bottom-line(순이익)의 핵심 축이 '1차 조업(Fishing)'에서 '수율 극대화 가공(High-Yield Processing)'으로 완전히 전이되었습니다.",
          actionPlan: "[Smart Factory Capex] 재래식 내수용 동태·코다리 유통 모델은 마진 한계에 봉착했습니다. 저숙련 인력 기반의 국내 영세 가공 인프라를 전면 폐기하고, Baader社 등 유럽형 초정밀 자동화 필레 머신 및 AI 광학 선별기 기반의 '하이엔드 스마트 팩토리' 건립을 위한 대규모 CAPEX를 승인하십시오. 가공 수율을 단 3%만 끌어올려도 B2B 더블프로즌 블록 수출 루트를 개척하여 부가가치를 서구 리테일 체인으로 전이시켜야 합니다.",
          source: "FAO FishStatJ - Imports/Exports Value & Volume (2023)"
        }}
      />

      {/* 5. 국가별 평균 수입 단가 등급별 시장 */}
            <WidgetCard
        title="국가별 평균 수입 단가 산출을 통한 등급별 시장 분석"
        icon={Navigation}
        pillar="S4"
        telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
        cardDesc="Top 15 수입국의 톤당 매입 단가를 분석하여 프리미엄 시장과 대중 매스 시장 분류"
        termTooltip={{ term: "Price Tiers by Country", description: "Top 15 수입국의 톤당 매입 단가를 분석하여 프리미엄 시장과 대중 매스 시장 분류" }}
        chart={
<ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" dataKey="import_price" name="수입 단가 ($)" tickFormatter={(v) => `$${v}`} stroke="#94a3b8" />
                <YAxis type="category" dataKey="country" name="국가" stroke="#94a3b8" width={80} />
                <ZAxis type="number" dataKey="import_vol" range={[50, 400]} name="수입 물량" />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1a2442', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value: any, name: any) => {
                    if (name === '수입 물량') return [`${(Number(value)/1000).toFixed(1)}k tons`, name];
                    if (name === '수입 단가 ($)') return [`$${Number(value).toFixed(2)}/ton`, name];
                    return [value, name];
                  }}
                />
                <Scatter name="국가별 통계(2023)" data={tiers} fill="var(--color-warning)" fillOpacity={0.7} />
              </ScatterChart>
        }
        takeaway={{
          situation: "글로벌 매입 단가 클러스터 분석 시, MSC 에코라벨에 프리미엄을 지불하는 서북유럽 최상위 그룹(Tier 1)과 단가 저항선에 극도로 민감한 아시아·중남미 볼륨 그룹(Tier 3) 간의 시장 양극화(Bifurcation)가 완성되었습니다. 전통적인 'One-size-fits-all' 가격 산정 모델의 붕괴를 의미합니다.",
          actionPlan: "[Bifurcated Allocation Tactical Execution] 전사적 물량 배정(Allocation) 시스템을 티어별 '분할 타겟팅(Segmented Targeting)'으로 즉각 이원화하십시오. 선상 동결(FAS, Frozen at Sea)된 싱글프로즌 최상급 필레 물량은 전량 유럽/미국 Tier 1 채널로 몰아넣어 초프리미엄 독점 마진을 추출(Skimming)하고, 육상에서 재가공된 더블프로즌(Double-frozen) 물량 및 부산물 연육은 아시아/아프리카 저개발 국가의 스팟 볼륨 마켓(Spot Volume Market)에 고도 회전율로 덤핑(Dumping)하여 워킹캐피탈(Working Capital) 유동성을 즉각 확보하는 바벨(Barbell) 전략을 실행해야 합니다.",
          source: "FAO FishStatJ - Imports Volume/Value Weighted Avg by Country"
        }}
      />
    </>
  );
}
