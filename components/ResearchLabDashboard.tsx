// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend } from 'recharts';
import { Microscope, Atom, TrendingUp, Fish, Recycle, HeartPulse, ChevronDown, ChevronUp, Star, ArrowRight, Target, Briefcase, Factory, Gem, Sparkles, FlaskConical } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';

const B2B_PILLAR_META: Record<string, {name:string, color:string, icon:any}> = {
  collagen: { name: '뷰티/콜라겐 원료', color: '#f472b6', icon: Sparkles },
  peptide: { name: '단백질/펩타이드 소재', color: '#818cf8', icon: Atom },
  byproduct: { name: '펫푸드/어분 소재', color: '#34d399', icon: Recycle },
  omega3: { name: '오메가3/제약 원료', color: '#fbbf24', icon: Fish },
  medical: { name: '바이오/의료용 소재', color: '#22d3ee', icon: HeartPulse },
  market: { name: 'B2B 시장·트렌드', color: '#94a3b8', icon: TrendingUp },
};

const B2B_MODELS = [
  {
    id: 'petfood',
    title: '프리미엄 펫푸드 소재 (High-Yield Pet Nutrition)',
    source: '적색육(Dark Muscle), 가공 잔여물',
    profitability: 'High Margin (GPM 25%+)',
    difficulty: 'Low Tech (하)',
    target: '글로벌 Tier-1 펫케어 브랜드',
    color: '#f43f5e',
    icon: Gem,
    desc: '식용 불가 판정을 받은 적색육(Dark Muscle)을 초저온 냉동 블록화하여 글로벌 사료 벤더에 대량 납품. CAPEX 투입을 최소화하면서 즉각적인 Free Cash Flow를 창출하는 구조적 캐시카우. (글로벌 피어 T사 펫케어 부문 Gross Margin 28% 도달).'
  },
  {
    id: 'collagen',
    title: '마린 콜라겐 펩타이드 (Marine Collagen Peptides)',
    source: '어피 (Tuna Skin)',
    profitability: 'Premium Margin (GPM 40%+)',
    difficulty: 'Mid-High Tech (중상)',
    target: '글로벌 더마코스메틱 & 이너뷰티 기업',
    color: '#f472b6',
    icon: Sparkles,
    desc: '폐기되는 어피(Skin)를 바이오테크 JV를 통해 효소 가수분해(Enzymatic Hydrolysis) 처리. 아미노산 단위의 초저분자 펩타이드로 정제하여 글로벌 하이엔드 뷰티/건기식 벤더 대상 독점적(Exclusive) B2B 원료 파이프라인 구축.'
  },
  {
    id: 'omega3',
    title: '고순도 EPA/DHA 추출물 (rTG Omega-3 API)',
    source: '두부, 안와지방, 부산물 내장',
    profitability: 'Value-Added Premium',
    difficulty: 'Mid Tech (중)',
    target: '글로벌 제약사(API) 및 메디컬 뉴트리션',
    color: '#fbbf24',
    icon: Fish,
    desc: '1차 추출 조어유(Crude Fish Oil)를 글로벌 정제(Refining) 파트너십을 통해 초임계 추출 및 초고순도 탈취. 마진 스프레드가 극대화되는 원료의약품(API) 및 영유아 프리미엄 조제분유 시장으로 직결되는 락인 밸류체인.'
  },
  {
    id: 'fishmeal',
    title: '고단백 어분 및 바이오 비료 (Aqua-feed & Bio-fertilizer)',
    source: '경골(Bone), 지느러미, 잔여 내장',
    profitability: 'Steady Cash Generator',
    difficulty: 'Lowest Tech (최하)',
    target: '글로벌 아쿠아컬처(연어/새우) 사료 벤더',
    color: '#34d399',
    icon: Factory,
    desc: '매립/소각에 따른 환경 비용(OPEX)을 제로(0)화하고, 뼈와 내장을 렌더링(Rendering)하여 양식용 고단백 어분으로 전환. 어족 자원 고갈 메가트렌드 속에서 안정적 단가 방어가 가능한 리스크 헷징(Risk Hedging) 자산.'
  }
];

const TRL_COLORS = ['#94a3b8','#818cf8','#34d399','#fbbf24'];
const PIE_COLORS = ['#38bdf8','#f472b6','#fbbf24','#34d399'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#1a1a2e',border:'1px solid #2a2a4a',borderRadius:8,padding:'10px 14px',fontSize:'0.8rem'}}>
      <p style={{color:'#e2e8f0',fontWeight:600,marginBottom:4}}>{label}</p>
      {payload.map((e:any,i:number) => (
        <div key={i} style={{color:e.color,display:'flex',gap:6}}><span>■ {e.name}</span><strong>{e.value}</strong></div>
      ))}
    </div>
  );
};

export default function ResearchLabDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePillar, setActivePillar] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string|null>(null);
  const [liveDataStatus, setLiveDataStatus] = useState<string>('loading');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const localRes = await fetch('/data/research_materials.json');
        const localData = await localRes.json();
        
        try {
          const liveRes = await fetch('/api/research');
          const liveData = await liveRes.json();
          if (liveData.success && liveData.livePapers) {
            localData.papers = [...liveData.livePapers, ...localData.papers];
            setLiveDataStatus('success');
          } else {
            setLiveDataStatus('failed');
          }
        } catch (e) {
          console.error("Live API fetch error:", e);
          setLiveDataStatus('failed');
        }

        setData(localData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAllData();
  }, []);

  if (!data) return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh',flexDirection:'column',gap:'1rem'}}>
      <Briefcase size={32} style={{color:'#8b5cf6',animation:'bounce 2s infinite'}} />
      <p style={{color:'#94a3b8'}}>Loading B2B Business Intelligence & Live APIs...</p>
    </div>
  );

  const { papers, pillars, trlDistribution, speciesDistribution } = data;
  const filteredPapers = activePillar === 'all' ? papers : papers.filter((p:any) => p.pillar === activePillar);

  return (
    <div style={{padding:'0 1.5rem 3rem',color:'var(--text-primary)',minHeight:'100vh',fontFamily:"'CircularSp','Inter',sans-serif",backgroundColor:'var(--bg-color)'}}>
      
      {/* Header */}
      <header style={{marginBottom:'2rem',paddingTop:'0.5rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 20px rgba(139,92,246,0.3)'}}>
              <Briefcase size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{margin:0,fontSize:'1.5rem',fontWeight:700,letterSpacing:'-0.5px'}}>B2B 신사업 인텔리전스</h1>
              <p style={{margin:0,fontSize:'0.88rem',color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:6}}>
                원양 조업사 특화 부산물 기반 고부가가치 비즈니스 파이프라인 (Value-Add Pipeline)
                {liveDataStatus === 'success' && (
                  <span style={{background:'#22c55e20', color:'#22c55e', padding:'2px 6px', borderRadius:4, fontSize:'0.7rem', fontWeight:600, display:'flex', alignItems:'center', gap:4}}>
                    <span style={{width:6,height:6,background:'#22c55e',borderRadius:'50%',animation:'pulse 2s infinite'}}></span>
                    Live API Sync
                  </span>
                )}
              </p>
            </div>
          </div>
          <div style={{fontSize:'0.88rem',padding:'8px 16px',background:'#181818',borderRadius:500,color:'var(--text-secondary)',fontWeight:600,display:'flex',alignItems:'center',gap:8,boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <Microscope size={16} color="#8b5cf6" />
            <span>학술/특허 인텔리전스 {papers.length}건 교차 검증 완료 (Validated)</span>
          </div>
        </div>
      </header>

      {/* Hero: Top 4 B2B Models */}
      <div style={{marginBottom:'3rem'}}>
        <h2 style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:8}}>
          <Target size={22} color="#8b5cf6" /> 조업사 마진 극대화 Top 4 비즈니스 파이프라인 (Margin-Maximized Top 4 Pipelines)
        </h2>
        <div style={{display:'grid',gridTemplateColumns: 'repeat(2, 1fr)',gap:'1.2rem'}}>
          {B2B_MODELS.map((model, idx) => {
            const Icon = model.icon;
            return (
              <div key={idx} style={{background:'#181818',borderRadius:12,padding:'1.5rem',boxShadow:'rgba(0,0,0,0.4) 0px 8px 16px',borderLeft:`4px solid ${model.color}`,position:'relative',overflow:'hidden',transition:'transform 0.2s'}}
                   onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';}}
                   onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{position:'absolute',top:-20,right:-20,opacity:0.05}}>
                  <Icon size={100} color={model.color} />
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{padding:8,background:`${model.color}20`,borderRadius:8}}>
                    <Icon size={24} color={model.color} />
                  </div>
                  <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700,color:'#fff'}}>{model.title}</h3>
                </div>
                
                {/* Metrics */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem',marginBottom:16}}>
                  <div style={{background:'var(--surface-2)',padding:'0.6rem',borderRadius:6}}>
                    <div style={{fontSize:'0.7rem',color:'var(--text-secondary)',marginBottom:2}}>수익성 (Margin)</div>
                    <div style={{fontSize:'0.85rem',fontWeight:700,color:model.color}}>{model.profitability}</div>
                  </div>
                  <div style={{background:'var(--surface-2)',padding:'0.6rem',borderRadius:6}}>
                    <div style={{fontSize:'0.7rem',color:'var(--text-secondary)',marginBottom:2}}>기술/실현 난이도</div>
                    <div style={{fontSize:'0.85rem',fontWeight:700,color:'#e2e8f0'}}>{model.difficulty}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:'0.85rem'}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                    <span style={{color:'var(--text-secondary)',width:60,flexShrink:0}}>원료소스:</span>
                    <strong style={{color:'#fff'}}>{model.source}</strong>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                    <span style={{color:'var(--text-secondary)',width:60,flexShrink:0}}>타겟시장:</span>
                    <strong style={{color:'#fff'}}>{model.target}</strong>
                  </div>
                </div>
                
                <p style={{margin:'1rem 0 0 0',fontSize:'0.8rem',color:'var(--text-secondary)',lineHeight:1.6,borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'1rem'}}>
                  {model.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* R&D Evidences */}
      <h2 style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:8}}>
        <Atom size={22} color="#8b5cf6" /> 사업화 타당성(Feasibility) 검증용 R&D 및 특허 딥다이브
      </h2>
      
      {/* Pillar Tabs */}
      <div style={{display:'flex',gap:8,marginBottom:'1.5rem',flexWrap:'wrap'}}>
        <button onClick={()=>setActivePillar('all')} style={{padding:'8px 16px',borderRadius:500,border:'none',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,background:activePillar==='all'?'#8b5cf6':'#181818',color:activePillar==='all'?'#fff':'var(--text-secondary)',transition:'all 0.2s',boxShadow:'rgba(0,0,0,0.2) 0px 4px 8px'}}>
          전체 보기 ({papers.length})
        </button>
        {pillars.map((p:any) => {
          const meta = B2B_PILLAR_META[p.id] || { name: p.name, color: '#94a3b8', icon: FlaskConical };
          const isActive = activePillar === p.id;
          return (
            <button key={p.id} onClick={()=>setActivePillar(p.id)} style={{padding:'8px 16px',borderRadius:500,border:'none',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,background:isActive?meta.color:'#181818',color:isActive?'#fff':'var(--text-secondary)',transition:'all 0.2s',boxShadow:'rgba(0,0,0,0.2) 0px 4px 8px',display:'flex',alignItems:'center',gap:6}}>
              {meta.name} ({p.count})
            </button>
          );
        })}
      </div>

      {/* Research Cards Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,480px),1fr))',gap:'1.5rem',marginBottom:'2.5rem'}}>
        {filteredPapers.map((p:any) => {
          const meta = B2B_PILLAR_META[p.pillar] || B2B_PILLAR_META['market'];
          const isExpanded = expandedCard === p.id;
          const IconComp = meta?.icon || FlaskConical;
          return (
            <div key={p.id} style={{background:'#181818',borderRadius:8,boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px',overflow:'hidden',transition:'all 0.2s',borderLeft:`3px solid ${meta?.color||'#8b5cf6'}`}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='rgba(0,0,0,0.5) 0px 8px 24px';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='rgba(0,0,0,0.3) 0px 8px 8px';}}>
              <div style={{padding:'1.2rem 1.5rem',cursor:'pointer'}} onClick={()=>setExpandedCard(isExpanded?null:p.id)}>
                {/* Title Row */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
                  <h3 style={{margin:0,fontSize:'1rem',fontWeight:700,lineHeight:1.4,flex:1,paddingRight:12,display:'flex',alignItems:'center',gap:8}}>
                    <IconComp size={18} color={meta?.color} style={{flexShrink:0}} />
                    {p.title}
                  </h3>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                </div>
                {/* Badges */}
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                  <span style={{fontSize:'0.66rem',fontWeight:600,padding:'2px 8px',borderRadius:500,background:`${meta?.color}20`,color:meta?.color}}>{meta?.name}</span>
                  <span style={{fontSize:'0.66rem',fontWeight:600,padding:'2px 8px',borderRadius:500,background:'var(--surface-2)',color:'var(--text-secondary)'}}>{p.species}</span>
                  <span style={{fontSize:'0.66rem',fontWeight:600,padding:'2px 8px',borderRadius:500,background:'var(--surface-2)',color:'var(--text-secondary)'}}>🦴 {p.byproduct}</span>
                  <span style={{fontSize:'0.66rem',fontWeight:600,padding:'2px 8px',borderRadius:500,background:p.source==='특허'?'#fbbf2420':p.source==='정부보고서'?'#22d3ee20':'#818cf820',color:p.source==='특허'?'#fbbf24':p.source==='정부보고서'?'#22d3ee':'#818cf8'}}>{p.source}</span>
                </div>
                {/* Key Finding */}
                <p style={{margin:0,fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.6}}>{p.keyFinding}</p>
              </div>
              {/* Expanded Details */}
              {isExpanded && (
                <div style={{padding:'0 1.5rem 1.2rem',borderTop:'1px solid #272727',paddingTop:'1rem',animation:'fadeIn 0.3s ease-out'}}>
                  {p.details && p.details.length > 0 && (
                    <div style={{marginBottom:'1.2rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                      {p.details.map((detail:string, idx:number) => (
                        <div key={idx} style={{fontSize:'0.85rem', color:'var(--text-primary)', display:'flex', alignItems:'flex-start', gap:'0.5rem', lineHeight:1.5}}>
                          <span style={{color:meta?.color || '#8b5cf6', fontSize:'1rem', lineHeight:1, flexShrink:0}}>•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'0.8rem'}}>
                    <div style={{background:'var(--surface-2)',borderRadius:6,padding:'0.8rem'}}>
                      <div style={{fontSize:'0.75rem',color:'var(--text-secondary)',marginBottom:4}}>상용화 기술성숙도 (TRL)</div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{flex:1,height:6,background:'#272727',borderRadius:3,overflow:'hidden'}}>
                          <div style={{width:`${(p.trl/9)*100}%`,height:'100%',background:p.trl>=6?'#34d399':p.trl>=4?'#818cf8':'#94a3b8',borderRadius:3,transition:'width 0.5s'}} />
                        </div>
                        <span style={{fontSize:'0.85rem',fontWeight:700,color:p.trl>=6?'#34d399':p.trl>=4?'#818cf8':'#94a3b8'}}>TRL {p.trl}</span>
                      </div>
                    </div>
                    <div style={{background:'var(--surface-2)',borderRadius:6,padding:'0.8rem'}}>
                      <div style={{fontSize:'0.75rem',color:'var(--text-secondary)',marginBottom:4}}>TAM 확장 매력도 (Commercial Viability)</div>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={16} fill={s<=p.commercialScore?'#fbbf24':'transparent'} color={s<=p.commercialScore?'#fbbf24':'#4a4a4a'} />
                        ))}
                        <span style={{fontSize:'0.8rem',fontWeight:600,color:'#fbbf24',marginLeft:4}}>{p.commercialScore}/5</span>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {p.tags.map((t:string,i:number) => (
                      <span key={i} style={{fontSize:'0.7rem',padding:'3px 8px',borderRadius:4,background:'var(--surface-2)',color:'#8b5cf6',fontWeight:500}}>#{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Analytics */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,480px),1fr))',gap:'1.5rem',marginBottom:'2.5rem'}}>
        {/* TRL Distribution */}
        <div style={{background:'#181818',borderRadius:8,padding:'1.5rem',boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px'}}>
          <h3 style={{margin:'0 0 1rem',fontSize:'1.13rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
            <Target size={20} color="#8b5cf6" /> 기술성숙도(TRL) 포트폴리오 분포
          </h3>
          <div style={{height:250}}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={trlDistribution} layout="vertical" margin={{left:20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{fontSize:11}} />
                <YAxis dataKey="level" type="category" stroke="#64748b" tick={{fontSize:10}} width={130} />
                <RTooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="연구/특허 수" radius={[0,6,6,0]}>
                  {trlDistribution.map((e:any,i:number) => <Cell key={i} fill={TRL_COLORS[i]} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </div>

        {/* Species Distribution */}
        <div style={{background:'#181818',borderRadius:8,padding:'1.5rem',boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px'}}>
          <h3 style={{margin:'0 0 1rem',fontSize:'1.13rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
            <Fish size={20} color="#8b5cf6" /> 타겟 어종별 상용화 집중도 (Species Concentration)
          </h3>
          <div style={{height:250}}>
            <SafeResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={speciesDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                  label={({name,value,percent}:any) => percent>0.05 ? `${name} ${value}건` : ''} labelLine={false} fontSize={10}>
                  {speciesDistribution.map((_:any,i:number) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <RTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'11px'}} />
              </PieChart>
            </SafeResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

