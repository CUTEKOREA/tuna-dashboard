import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, Treemap } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, TrendingUp, Anchor, ShieldCheck, Ship, DollarSign, Database, Rocket, AlertTriangle, Crosshair, BarChart2, Activity, Zap } from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

const glassContainerStyle = {
  background: 'rgba(0, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px', display: 'flex', flexDirection: 'column' as const, height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', position: 'relative' as const
};


export function Widget5_Importers() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_top_importers.json').then(r => r.json()).then(setData); }, []);
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Globe size={20} color="#38bdf8" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>
          무역의 블랙홀: 중국향 가공 쏠림 현상
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        전 세계를 상대로 수입 볼륨 1위를 기록하는 중국의 하청 재가공 베이스캠프 전락 리스크
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{left:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis dataKey="country" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} tickMargin={5} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="volume" name="수입물동량(톤)" radius={[0,4,4,0]}>
              {data.map((entry: any, idx: number) => <Cell key={idx} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="명태 전 세계 수입국의 랭킹을 도식화했습니다. 중국이 1위로 나타나지만, 이는 중국인의 내수 소비가 목적이 아니라 노동집약적인 수작업 공정(뼈 발라내기 등)을 거쳐 전 세계로 비싸게 우회 수출하기 위한 거대 베이스캠프 역할 때문입니다."
          actionPlan="가공의 권력을 쥔 중국 벤더에 대한 협상력 상실은 자사 제품의 매입원가 통제력 붕괴로 직결됩니다. 중국 다롄이나 칭다오 항구 소재의 가공 팩토리(Factory) 일부에 합작 지분을 꽂아 넣어 투명한 임가공비 내역을 상시 보고받을 수 있는 지위에 편입해야 합니다."
          source="FAO FishStatJ / Global Customs Import Statistics"
        />
      </div>
    </div>
  );
}

export function Widget6_UnitPrice() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_unit_price.json').then(r => r.json()).then(setData); }, []);
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Activity size={20} color="var(--color-danger)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-danger)', margin: 0 }}>
          마진 스퀴즈: 수출가 vs 소비국 판가 단가 갭 축소선
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        원산지(러시아)의 원물 폭등을 따라가지 못해 압사당하는 B2B 중간상인(한국향) 이익 구조
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="수출_러시아단가" fill="#64748b" name="러시아산 원물 항구 수출 단가" radius={[4,4,0,0]} />
            <Line type="monotone" dataKey="수입_한국단가" stroke="var(--color-info)" strokeWidth={3} name="한국 내수 B2B 도매 단가" dot={{r:3}} />
            <Line type="monotone" dataKey="수입_독일단가" stroke="#fbbf24" strokeWidth={3} name="독일 리테일(판매가) 단가" dot={{r:3}} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="최하단 바텀(러시아 원물가)과 최상단 천장(독일·한국 소비재 판가) 단가 트렌드를 겹쳐 마진 룸(Margin Room)을 도출했습니다. 원물 공급상이 가격을 무자비하게 올려도, 급식/식자재 중간 상인들의 판가가 이를 전가시키지 못해 영업마진이 박살 나고 있습니다."
          actionPlan="원물 수입에 머무는 단순 트레이딩(매구입) 기능을 점진적으로 축소하거나 철회하십시오. 마진 공간이 허락되는 유일한 구명조끼는 직접 B2C (이커머스/온라인 리테일) 브랜드를 만들어 최종 소비자 가격 재량권을 갖는 방안뿐입니다."
          source="Undercurrent News Price Indices Analytics"
        />
      </div>
    </div>
  );
}

export function Widget7_SankeyRoute() {
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <ShieldCheck size={20} color="var(--color-warning)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-warning)', margin: 0 }}>
          Double-Frozen: 제재 우회와 품질 훼손의 딜레마
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        원물 국적 세탁을 위한 2번의 동결 프로세스가 수반하는 근본적 공급망 위험
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280, display: 'flex', flexDirection: 'column', padding: '15px' }}>
        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom:'20px', alignItems:'center' }}>
          <div style={{background:'rgba(239, 68, 68, 0.2)', padding:'15px', borderRadius: '8px', width:'30%', textAlign:'center', border:'1px solid rgba(239, 68, 68, 0.5)'}}>
             <span style={{fontWeight: 700, fontSize: '1rem', color:'#f8fafc'}}>🇷🇺/🇺🇸 원물 하역</span><br/>
             <span style={{fontSize: '0.8rem', color:'var(--color-danger)'}}>[1차 선상 동결]</span>
          </div>
          <div style={{display:'flex', alignItems:'center', color:'var(--color-warning)', fontSize:'0.9rem', fontWeight: 600, letterSpacing:'1px'}}>➪ Double Frozen ➪</div>
          <div style={{background:'rgba(245, 158, 11, 0.2)', padding:'15px', borderRadius: '8px', width:'30%', textAlign:'center', border:'1px solid rgba(245, 158, 11, 0.5)'}}>
             <span style={{fontWeight: 700, fontSize: '1rem', color:'#f8fafc'}}>🇨🇳 중국 랴오닝 가공</span><br/>
             <span style={{fontSize: '0.8rem', color:'var(--color-warning)'}}>[해동/뼈제거/재동결]</span>
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{width:'30%'}}></div>
          <div style={{display:'flex', alignItems:'center', color:'var(--color-info)', fontSize:'0.9rem', fontWeight: 600, letterSpacing:'1px'}}>➪ Fillet 우회 수출 ➪</div>
          <div style={{background:'rgba(59, 130, 246, 0.2)', padding:'15px', borderRadius: '8px', width:'30%', textAlign:'center', border:'1px solid rgba(59, 130, 246, 0.5)'}}>
             <span style={{fontWeight: 700, fontSize: '1rem', color:'#f8fafc'}}>🇪🇺 EU / B2B 시장</span><br/>
             <span style={{fontSize: '0.8rem', color:'var(--color-info)'}}>[제재 회피형 2차 유통]</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="서방의 러시아 제재로 인해, 러시아산 물량을 중국으로 넘겨 가공(해동)한 뒤 다시 재동결(Double-Frozen)하여 '메이드 인 차이나'로 유럽에 우회 수출하는 거대 음성 파이프라인이 굳어지고 있습니다."
          actionPlan="언제 터질지 모르는 서방(미/EU) 관세국의 중국산 전수 조사 및 블라인드 수입 규제 리스크가 병목 지점의 암관입니다. 당장 공급망의 30%를 중국이 아닌 베트남, 인도네시아 등 제3 미규제 동남아 가공 벨트로 할당해 우회 플랜B를 즉시 성립시켜야 합니다."
          source="SeafoodSource Global Trade Tracking Report"
        />
      </div>
    </div>
  );
}

export function Widget8_KoreaDeficit() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_korea_trade.json').then(r => r.json()).then(setData); }, []);
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <DollarSign size={20} color="var(--color-danger)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-danger)', margin: 0 }}>
          대한민국 수산계 무역 수지 적자 늪 (Deficit Gap)
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        막대한 외화 결제 유출 속, 미미한 재가공 수출이 빚어낸 국부 유출의 민낯
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => `$${v}M`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Area type="monotone" dataKey="수입액" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} name="원물 블록 수입 유출 자본금" />
            <Area type="monotone" dataKey="수출액" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.8} name="가공식품 자체 역수출 회수금" />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="우리나라 기업들이 명태를 사 오기 위해 벌어들인 무역 수출액 대비, 원물 수입 결제로 해외 송금한 역대급 적자(Deficit Gap) 넓이를 시각화했습니다. 현금성 외화 유출 폭탄 리스크가 심화되고 있습니다."
          actionPlan="단순 내수용 황태나 동태탕 베이스의 가공을 전부 파기하십시오. 현금 캐시플로우를 방어하기 위해 K-푸드 붐에 승차할 수 있는 튀김 밀키트, 프리미엄 K-명란 스낵 등 '글로벌 지향형 아이템'에 R&D 예산을 즉각 재편성하여 역수출 볼륨을 올려야 합니다."
          source="한국무역협회(KITA) & 관세청 수출입 통계"
        />
      </div>
    </div>
  );
}
