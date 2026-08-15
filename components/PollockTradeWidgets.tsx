import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, ShieldCheck, DollarSign, Activity } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

export function Widget5_Importers() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_top_importers.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="명태 최종 소비시장: 독일·일본 수입 쌍두마차"
      icon={Globe}
      iconColor="#38bdf8"
      pillar="S3"
      telemetry={{ status: 'SYNCED', syncDate: '2026-06-06' }}
      cardDesc="UN Comtrade 2024 기준 명태(HS 0302·0304·0305·160420) 국가별 수입 물동량 랭킹"
      takeaway={{
        situation: "2024년 명태(필렛·연육·건제품 포함) 글로벌 수입 물동량 1위는 독일(약 34.9만 톤)이며, 일본(13.3만 톤)·프랑스(11.0만 톤)·미국(7.6만 톤)이 뒤를 잇습니다. 대한민국은 7.0만 톤으로 5위, 중국은 6.6만 톤으로 6위(자기보고 기준)입니다. 중국의 막대한 러시아산 원물 재가공 물량은 원산지 러시아가 통관 미보고국이라 수입국 자기보고 통계에는 부분만 잡힙니다.",
        actionPlan: "최대 소비처가 중국 내수가 아니라 독일·일본 EU·동아시아 완제품 시장임이 확인됩니다. 독일 함부르크·브레머하펜 콜드체인 거점을 우회하는 직판 루트를 확보하고, 러시아산 원물의 중국 경유 재가공 의존도를 베트남·동남아 가공 벨트로 분산해 원산지 리스크를 헤지해야 합니다.",
        source: "UN Comtrade 2024 via agri_data (수입국 자기보고, 톤 기준)"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{left:20}}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis dataKey="country" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} tickMargin={5} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
              <Bar dataKey="volume" name="수입물동량(톤)" radius={[0,4,4,0]}>
                {data.map((entry: any, idx: number) => <Cell key={idx} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}

export function Widget6_UnitPrice() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_unit_price.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="마진 압착: 수출가 대 소비국 판가 단가 격차 축소선"
      icon={Activity}
      iconColor="var(--color-danger)"
      pillar="S3"
      telemetry={{ status: 'SYNCED', syncDate: '2026-06-06' }}
      cardDesc="러시아 수출 단가(통관 미보고 → 교역상대국 미러 통계)와 한국·독일 수입 CIF 단가 추이 ($/kg)"
      takeaway={{
        situation: "러시아 원물 수출 단가(2024년 약 $2.51/kg, 통관 미보고로 상대국 미러 통계 산출)와 한국($3.61/kg)·독일($2.94/kg) 수입 단가를 겹쳤습니다. 2024년 들어 한국 수입 단가가 독일을 추월하며 역전됐는데, 이는 한국의 건명태·연육 등 고부가 품목 비중과 환율 부담이 동시에 작용한 결과로 마진 여유폭이 더 좁아졌음을 시사합니다.",
        actionPlan: "원물 수입에 머무는 단순 트레이딩(매구입) 기능을 점진적으로 축소하거나 철회하십시오. 마진 공간이 허락되는 유일한 구명조끼는 소비자 직접 판매(온라인 몰·직영 리테일) 브랜드를 만들어 최종 소비자 가격 재량권을 갖는 방안뿐입니다.",
        source: "UN Comtrade 2024 via agri_data (러시아=미러, 한국·독일=수입 CIF 단가)"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
              <Bar dataKey="수출_러시아단가" fill="var(--w-slate-500)" name="러시아산 원물 수출 단가 (미러)" radius={[4,4,0,0]} />
              <Line type="monotone" dataKey="수입_한국단가" stroke="var(--color-info)" strokeWidth={3} name="한국 수입 단가 (CIF)" dot={{r:3}} />
              <Line type="monotone" dataKey="수입_독일단가" stroke="var(--w-amber-400)" strokeWidth={3} name="독일 수입 단가 (CIF)" dot={{r:3}} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}

export function Widget7_SankeyRoute() {
  return (
    <WidgetCard
      title="이중 동결: 제재 우회와 품질 훼손의 딜레마"
      icon={ShieldCheck}
      iconColor="var(--color-warning)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="원물 국적 세탁을 위한 2번의 동결 프로세스가 수반하는 근본적 공급망 위험"
      takeaway={{
        situation: "서방의 러시아 제재로 인해, 러시아산 물량을 중국으로 넘겨 가공(해동)한 뒤 다시 재동결(이중 동결)하여 중국산으로 원산지를 바꿔 유럽에 우회 수출하는 거대 음성 파이프라인이 굳어지고 있습니다.",
        actionPlan: "언제 터질지 모르는 서방(미/EU) 관세국의 중국산 전수 조사 및 블라인드 수입 규제 리스크가 병목 지점의 암관입니다. 당장 공급망의 30%를 중국이 아닌 베트남, 인도네시아 등 제3 미규제 동남아 가공 벨트로 할당해 우회 플랜B를 즉시 성립시켜야 합니다.",
        source: "SeafoodSource 글로벌 무역 추적 보고서 / 자체 추정 (공급망 흐름도)"
      }}
      customBody={
        <div style={{ height: 280, display: 'flex', flexDirection: 'column', padding: '15px' }}>
          <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom:'20px', alignItems:'center' }}>
            <div style={{background:'rgba(239, 68, 68, 0.2)', padding:'15px', borderRadius: '8px', width:'30%', textAlign:'center', border:'1px solid rgba(239, 68, 68, 0.5)'}}>
               <span style={{fontWeight: 700, fontSize: '1rem', color:'var(--w-slate-50)'}}>🇷🇺/🇺🇸 원물 하역</span><br/>
               <span style={{fontSize: '0.8rem', color:'var(--color-danger)'}}>[1차 선상 동결]</span>
            </div>
            <div style={{display:'flex', alignItems:'center', color:'var(--color-warning)', fontSize:'0.9rem', fontWeight: 600, letterSpacing:'1px'}}>➪ 이중 동결 ➪</div>
            <div style={{background:'rgba(245, 158, 11, 0.2)', padding:'15px', borderRadius: '8px', width:'30%', textAlign:'center', border:'1px solid rgba(245, 158, 11, 0.5)'}}>
               <span style={{fontWeight: 700, fontSize: '1rem', color:'var(--w-slate-50)'}}>🇨🇳 중국 랴오닝 가공</span><br/>
               <span style={{fontSize: '0.8rem', color:'var(--color-warning)'}}>[해동/뼈제거/재동결]</span>
            </div>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{width:'30%'}}></div>
            <div style={{display:'flex', alignItems:'center', color:'var(--color-info)', fontSize:'0.9rem', fontWeight: 600, letterSpacing:'1px'}}>➪ 필레 우회 수출 ➪</div>
            <div style={{background:'rgba(59, 130, 246, 0.2)', padding:'15px', borderRadius: '8px', width:'30%', textAlign:'center', border:'1px solid rgba(59, 130, 246, 0.5)'}}>
               <span style={{fontWeight: 700, fontSize: '1rem', color:'var(--w-slate-50)'}}>🇪🇺 유럽연합 기업간 시장</span><br/>
               <span style={{fontSize: '0.8rem', color:'var(--color-info)'}}>[제재 회피형 2차 유통]</span>
            </div>
          </div>
        </div>
      }
    />
  );
}

export function Widget8_KoreaDeficit() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_korea_trade.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="대한민국 수산계 무역 수지 적자 늪"
      icon={DollarSign}
      iconColor="var(--color-danger)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="막대한 외화 결제 유출 속, 미미한 재가공 수출이 빚어낸 국부 유출의 민낯"
      takeaway={{
        situation: "우리나라 기업들이 명태를 사 오기 위해 벌어들인 무역 수출액 대비, 원물 수입 결제로 해외 송금한 역대급 적자 규모를 시각화했습니다. 현금성 외화 유출 폭탄 리스크가 심화되고 있습니다.",
        actionPlan: "단순 내수용 황태나 동태탕 베이스의 가공을 전부 파기하십시오. 현금 흐름을 방어하기 위해 한국 식품(K-Food) 붐에 승차할 수 있는 튀김 밀키트, 프리미엄 명란 스낵 등 글로벌 지향형 아이템에 연구개발(R&D) 예산을 즉각 재편성하여 역수출 볼륨을 올려야 합니다.",
        source: "한국무역협회(KITA) & 관세청 수출입 통계"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => `$${v}M`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
              <Area type="monotone" dataKey="수입액" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} name="원물 블록 수입 유출 자본금" />
              <Area type="monotone" dataKey="수출액" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.8} name="가공식품 자체 역수출 회수금" />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
