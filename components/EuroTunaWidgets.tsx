import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { ShieldCheck, TrendingUp, Anchor, Euro, ShoppingCart, Leaf, Factory, Globe, DollarSign } from 'lucide-react';

// ============================================================
// STYLE SYSTEM — 100% inline styles for guaranteed rendering
// ============================================================

const COLORS = {
  bg: '#0a0f1e',
  card: 'rgba(20, 28, 52, 0.85)',
  cardBorder: 'rgba(51, 65, 85, 0.45)',
  cardHover: 'rgba(30, 41, 59, 0.6)',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  accent: {
    blue: '#3b82f6',
    cyan: '#22d3ee',
    green: '#10b981',
    emerald: '#34d399',
    amber: '#f59e0b',
    purple: '#a78bfa',
    red: '#ef4444',
    pink: '#ec4899',
    indigo: '#818cf8',
    sky: '#38bdf8',
  },
};

const cardBase: React.CSSProperties = {
  background: COLORS.card,
  border: `1px solid ${COLORS.cardBorder}`,
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
};

const glowOrb = (color: string, top?: string, right?: string, bottom?: string, left?: string): React.CSSProperties => ({
  position: 'absolute',
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
  filter: 'blur(40px)',
  pointerEvents: 'none',
  top, right, bottom, left,
});

const badge = (color: string): React.CSSProperties => ({
  padding: '4px 12px',
  background: `${color}15`,
  color: color,
  fontSize: '10px',
  fontWeight: 700,
  borderRadius: '20px',
  border: `1px solid ${color}30`,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  boxShadow: `0 0 12px ${color}15`,
});

const sectionTitle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '1.1rem',
  fontWeight: 700,
  color: COLORS.text,
  margin: 0,
};

// --- DATA ---

const macroTradeDataFallback = [
  { name: '에콰도르', value: 36.2, fill: '#3b82f6' },
  { name: '중국', value: 9.0, fill: '#ef4444' },
  { name: '파푸아뉴기니', value: 9.0, fill: '#f59e0b' },
  { name: '필리핀', value: 8.2, fill: '#10b981' },
  { name: '모리셔스', value: 6.5, fill: '#8b5cf6' },
  { name: '세이셸', value: 5.0, fill: '#ec4899' },
  { name: '기타', value: 26.1, fill: '#475569' },
];

const retailKpiData = [
  { country: '이탈리아', code: 'IT', flag: '🇮🇹', marketValue: 'EUR 16.5억', solvent: '올리브유', plShare: '28%', msc: '캔 MSC 86%', mscGrowth: '+10.3% YoY' },
  { country: '스페인', code: 'ES', flag: '🇪🇸', marketValue: 'EUR 18.98억*', solvent: '올리브유 & 해바라기유', plShare: '80%', msc: '+32% 성장', mscGrowth: '+3.72% vol' },
  { country: '프랑스', code: 'FR', flag: '🇫🇷', marketValue: 'EUR 6.68억', solvent: '혼합 (염수/오일)', plShare: '32%', msc: '67.2% MSC', mscGrowth: '+119% (4yr)' },
  { country: '영국', code: 'UK', flag: '🇬🇧', marketValue: 'GBP 4.28억', solvent: '염수/물', plShare: '43%+', msc: '65% 물량', mscGrowth: '4%→49%' },
  { country: '독일', code: 'DE', flag: '🇩🇪', marketValue: '#1 MSC vol', solvent: '해바라기유 & 염수', plShare: '71%', msc: '~보편적', mscGrowth: '+55%' },
];

const esgBrandData = [
  { brand: 'Walmart (US PB)', target: 100, label: '자체브랜드 캔 참치 전체 MSC 인증', markets: '🇺🇸', color: '#22d3ee' },
  { brand: 'Princes (UK)', target: 100, label: '2026년 2월 100% MSC 전환 완료', markets: '🇬🇧', color: '#a78bfa' },
  { brand: 'Bolton (Rio Mare)', target: 99.7, label: '책임 어업 소싱 · IO 황다랑어 74% 감축', markets: '🇮🇹🇫🇷🇪🇸', color: '#10b981' },
  { brand: 'Thai Union (John West)', target: 98.9, label: 'MSC / FIP 연계 소싱 (+14% vs 2023)', markets: '🇬🇧🇫🇷🇮🇹🇳🇱', color: '#3b82f6' },
  { brand: 'Nauterra (Calvo)', target: 92.8, label: '로인 인증 >92% · EUR 7.27억 매출', markets: '🇪🇸🇮🇹', color: '#f59e0b' },
  { brand: 'Jealsa (Rianxeira)', target: 85, label: 'MSC 블루라벨 · ISSF 기반 소싱', markets: '🇪🇸', color: '#ef4444' },
];

const premiumData = [
  { label: 'MSC 인증', premium: 44.6, color: '#38bdf8' },
  { label: 'Dolphin-Safe', premium: 25.4, color: '#10b981' },
  { label: '이중 라벨 (MSC+D-S)', premium: 81.3, color: '#a78bfa' },
];

const valueChainStats = [
  { label: 'EU 캔참치 소비', value: '~760,000t', sub: 'USD 64.9억 → 89.3억 (2033)', icon: ShoppingCart, color: '#3b82f6' },
  { label: 'EU 어획', value: '385,000t', sub: '자급률 29% → 35% (2023)', icon: Anchor, color: '#22d3ee' },
  { label: '역외 수입 의존도', value: '66.5%', sub: '에콰도르·세이셸·필리핀·모리셔스', icon: Globe, color: '#f59e0b' },
  { label: 'ATQ 무관세 로인', value: '35,000t/yr', sub: 'MFN 24% → 0% (쿼터 내)', icon: Factory, color: '#10b981' },
];

// --- COMPONENTS ---

export function EuroMacroTradeWidget() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    fetch('/api/tuna-local?dataset=eurostat-flow')
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          const latestYear = Math.max(...json.data.filter((d:any)=>!isNaN(parseInt(String(d.year).trim()))).map((d: any) => parseInt(String(d.year).trim())));
          const importsExtra = json.data.filter((d: any) => parseInt(String(d.year).trim()) === latestYear && String(d.flow).trim() === 'Import' && String(d.intra_extra_EU).trim() === 'Extra EU');
          importsExtra.sort((a: any, b: any) => parseFloat(String(b.volume_kg).trim()) - parseFloat(String(a.volume_kg).trim()));
          const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#475569'];
          const top5 = importsExtra.slice(0, 5).map((d: any, i: number) => ({
            name: String(d.country).trim(),
            value: parseFloat(String(d.volume_kg).trim()) / 1000,
            fill: colors[i % colors.length]
          }));
          const othersVol = importsExtra.slice(5).reduce((sum: number, d: any) => sum + parseFloat(String(d.volume_kg).trim()), 0) / 1000;
          if (othersVol > 0) top5.push({ name: '기타', value: othersVol, fill: colors[6] });
          setData(top5);
          setIsSynced(true);
        } else { setData(macroTradeDataFallback); setIsSynced(false); }
        setLoading(false);
      })
      .catch(() => { setData(macroTradeDataFallback); setIsSynced(false); setLoading(false); });
  }, []);

  return (
    <div style={{ ...cardBase, gap: '16px' }}>
      <div style={glowOrb('#3b82f6', '-40px', '-40px')} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <h3 style={sectionTitle}>
          <Anchor style={{ width: 20, height: 20, color: COLORS.accent.blue }} />
          EU 역외 참치캔 최대 수입국
        </h3>
        <span style={badge(isSynced ? COLORS.accent.emerald : COLORS.accent.amber)}>
          {isSynced && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.accent.emerald, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          )}
          {isSynced ? 'SYNCED' : 'STATIC'}
        </span>
      </div>
      <p style={{ fontSize: '0.85rem', color: COLORS.textMuted, margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
        유럽연합 회원국 중 역외 국가로부터 가장 많은 참치캔 물량을 수입하는 국가 비중입니다. (최신 연도 Eurostat 기준)
      </p>
      <div style={{ position: 'relative', zIndex: 2 }}>
        {loading ? (
          <div style={{ width: '100%', height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--w-navy-900)', borderTop: '3px solid var(--w-blue-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: COLORS.textDim, fontSize: '0.85rem' }}>데이터 로딩 중...</span>
          </div>
        ) : data.length === 0 ? (
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textDim }}>데이터를 불러올 수 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <PieChart width={240} height={240}>
              <Pie data={data} cx={120} cy={120} innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none" isAnimationActive={true} animationDuration={1200}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.96)', borderColor: 'rgba(51,65,85,0.5)', borderRadius: '10px', color: '#f1f5f9', boxShadow: '0 12px 40px -8px rgba(0,0,0,0.6)', padding: '10px 14px' }}
                itemStyle={{ color: 'var(--w-slate-200)', fontWeight: 600 }}
                formatter={(value: any) => [`${Math.round(value).toLocaleString()} 톤`, '수입량']}
              />
            </PieChart>
            {/* Custom Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center' }}>
              {data.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '3px', background: entry.fill, display: 'inline-block', boxShadow: `0 0 6px ${entry.fill}40` }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)', fontWeight: 500 }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EuroESGTrackerWidget() {
  return (
    <div style={{ ...cardBase, gap: '20px' }}>
      <div style={glowOrb('#10b981', '-40px', '-40px')} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <h3 style={sectionTitle}>
          <Leaf style={{ width: 20, height: 20, color: COLORS.accent.green }} />
          글로벌 브랜드 MSC 소싱 스코어보드
        </h3>
        <span style={badge(COLORS.accent.green)}>6개사 추적</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', zIndex: 2 }}>
        {esgBrandData.map((item) => (
          <div key={item.brand} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: COLORS.text }}>{item.brand}</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(30,41,59,0.8)', borderRadius: '6px', color: COLORS.textMuted, border: '1px solid rgba(51,65,85,0.5)' }}>{item.markets}</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: item.color, textShadow: `0 0 12px ${item.color}50` }}>{item.target}%</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(30,41,59,0.7)', borderRadius: '8px', height: '8px', overflow: 'hidden', border: '1px solid rgba(51,65,85,0.4)' }}>
              <div style={{ height: '100%', borderRadius: '8px', width: `${item.target}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})`, boxShadow: `0 0 14px ${item.color}60`, transition: 'width 1.5s ease-out' }} />
            </div>
            <span style={{ fontSize: '0.68rem', color: COLORS.textDim, fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(51,65,85,0.4)', display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(30,41,59,0.3)', padding: '16px', borderRadius: '12px', position: 'relative', zIndex: 2 }}>
        <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', flexShrink: 0 }}>
          <ShieldCheck style={{ width: 22, height: 22, color: COLORS.accent.indigo }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-300)', lineHeight: 1.7 }}>
          상위 5대 브랜드 평균 MSC 소싱률 <strong style={{ color: COLORS.accent.emerald, padding: '1px 4px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px' }}>97%+</strong>.
          MSC 인증은 <strong style={{ color: COLORS.accent.cyan }}>+10% ~ +44.6%</strong> 프리미엄을 창출합니다. 비인증 원료의 유통 채널은 <strong style={{ color: COLORS.accent.amber }}>2027년 내 소멸</strong>될 전망입니다.
        </div>
      </div>
    </div>
  );
}

export function EuroValueChainWidget() {
  const nodes = [
    { emoji: '🐟', label: '원물', sub: '1.3M t', color: '#3b82f6' },
    { emoji: '⚓', label: 'EU 어획', sub: '35%', color: '#22d3ee' },
    { emoji: '📦', label: '역외수입', sub: '66.5%', color: '#f59e0b' },
    { emoji: '🏭', label: '가공', sub: '🇪🇸 65%+', color: '#10b981' },
    { emoji: '🛒', label: '소비', sub: '~760K t', color: '#a78bfa' },
  ];

  return (
    <div style={{ ...cardBase, gap: '20px' }}>
      <div style={glowOrb('#22d3ee', undefined, undefined, '-40px', '-40px')} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <h3 style={sectionTitle}>
          <Factory style={{ width: 20, height: 20, color: COLORS.accent.cyan }} />
          EU 캔참치 밸류체인 맵
        </h3>
        <span style={badge(COLORS.accent.cyan)}>Supply Flow</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', position: 'relative', zIndex: 2 }}>
        {valueChainStats.map((stat) => {
          const IconComp = stat.icon;
          return (
            <div key={stat.label} style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ padding: '3px', background: `${stat.color}15`, borderRadius: '6px', border: `1px solid ${stat.color}25` }}>
                  <IconComp style={{ width: 14, height: 14, color: stat.color }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: COLORS.textMuted, fontWeight: 600 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '0.63rem', color: COLORS.textDim, lineHeight: 1.4 }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Flow Diagram */}
      <div style={{ background: 'rgba(20, 28, 52, 0.6)', border: '1px solid rgba(51,65,85,0.3)', borderRadius: '12px', padding: '20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          {nodes.map((node, i) => (
            <React.Fragment key={node.label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${node.color}15`, border: `1px solid ${node.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: `0 0 16px ${node.color}20` }}>
                  {node.emoji}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: node.color }}>{node.label}</span>
                <span style={{ fontSize: '0.6rem', color: COLORS.textMuted }}>{node.sub}</span>
              </div>
              {i < nodes.length - 1 && (
                <span style={{ color: '#475569', fontSize: '1.1rem', flexShrink: 0, marginTop: '-20px' }}>{i === 1 ? '+' : '→'}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.63rem', color: COLORS.textDim, position: 'relative', zIndex: 2 }}>
        <span>출처: MSC Tuna Yearbook 2026, Eurostat</span>
        <span style={{ fontWeight: 700, color: COLORS.textMuted }}>CAGR 3.77%</span>
      </div>
    </div>
  );
}

export function EuroPremiumWidget() {
  return (
    <div style={{ ...cardBase, gap: '20px' }}>
      <div style={glowOrb('#f59e0b', undefined, undefined, '-40px', '-40px')} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <h3 style={sectionTitle}>
          <DollarSign style={{ width: 20, height: 20, color: COLORS.accent.amber }} />
          MSC 가격 프리미엄 실증 분석
        </h3>
        <span style={badge(COLORS.accent.amber)}>Hedonic 2025</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 2 }}>
        {premiumData.map((item) => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--w-slate-200)' }}>{item.label}</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color, textShadow: `0 0 18px ${item.color}50`, fontVariantNumeric: 'tabular-nums' }}>+{item.premium}%</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(30,41,59,0.7)', borderRadius: '8px', height: '10px', overflow: 'hidden', border: '1px solid rgba(51,65,85,0.4)' }}>
              <div style={{ width: `${item.premium}%`, height: '100%', borderRadius: '8px', background: `linear-gradient(90deg, ${item.color}40, ${item.color})`, boxShadow: `0 0 16px ${item.color}60`, transition: 'width 1.5s ease-out' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '12px', padding: '14px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-300)', lineHeight: 1.7 }}>
          <strong style={{ color: COLORS.accent.amber, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <TrendingUp style={{ width: 14, height: 14 }} /> 실증 논문 결론 (2025):
          </strong>
          MSC + Dolphin-Safe <strong style={{ color: COLORS.accent.purple }}>이중 라벨</strong> 부착 시 최대 <strong style={{ color: '#fff' }}>+81.3%</strong> 프리미엄 확보 가능. EU 유통사 네고 시에도 강력한 방어 논리로 작용합니다.
        </div>
      </div>
    </div>
  );
}

export function EuroRetailMatrixWidget() {
  const thStyle: React.CSSProperties = { padding: '14px 16px', fontSize: '0.68rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' };
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: '0.82rem', color: 'var(--w-slate-300)', borderBottom: '1px solid rgba(51,65,85,0.25)', fontWeight: 500 };

  return (
    <div style={{ ...cardBase, gap: '20px' }}>
      <div style={glowOrb('#818cf8', '-20px', undefined, undefined, '50%')} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <h3 style={sectionTitle}>
          <ShoppingCart style={{ width: 20, height: 20, color: COLORS.accent.indigo }} />
          유럽 Big 5 국가별 리테일 · MSC 매트릭스
        </h3>
        <span style={badge(COLORS.accent.indigo)}>MSC Yearbook 2026</span>
      </div>

      <div style={{ overflowX: 'auto', position: 'relative', zIndex: 2 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(30,41,59,0.6)', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
              <th style={{ ...thStyle, borderTopLeftRadius: '10px' }}>국가</th>
              <th style={thStyle}>시장 규모</th>
              <th style={thStyle}>주력 용매</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>PB 점유율</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>MSC 침투</th>
              <th style={{ ...thStyle, textAlign: 'right', borderTopRightRadius: '10px' }}>성장률</th>
            </tr>
          </thead>
          <tbody>
            {retailKpiData.map((row) => (
              <tr key={row.code} style={{ transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.4)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ ...tdStyle, fontWeight: 700, color: COLORS.text, whiteSpace: 'nowrap' }}>
                  <span style={{ marginRight: '6px', fontSize: '1.1rem' }}>{row.flag}</span>{row.country}
                </td>
                <td style={{ ...tdStyle, fontSize: '0.75rem', color: COLORS.textMuted }}>{row.marketValue}</td>
                <td style={{ ...tdStyle, fontSize: '0.75rem' }}>{row.solvent}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: parseInt(row.plShare) > 50 ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: parseInt(row.plShare) > 50 ? COLORS.accent.amber : COLORS.accent.blue, border: `1px solid ${parseInt(row.plShare) > 50 ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}` }}>
                    {row.plShare}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: COLORS.accent.emerald, border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 0 8px rgba(16,185,129,0.1)' }}>
                    {row.msc}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: COLORS.accent.green, fontSize: '0.8rem' }}>
                  {row.mscGrowth}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: 'rgba(30,41,59,0.4)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(51,65,85,0.3)', display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
        <span style={{ fontSize: '1.2rem' }}>💡</span>
        <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-300)', lineHeight: 1.7, fontWeight: 500 }}>
          독일·영국은 이미 <strong style={{ color: COLORS.accent.emerald }}>MSC 포화 시장</strong> — 인증 없이 매대 진입 불가. 이탈리아(+10.3%)·중앙유럽(+9.7%)은 고성장 구간으로 <strong style={{ color: COLORS.accent.blue }}>전략적 시장 진입 적기</strong>입니다.
        </div>
      </div>
    </div>
  );
}

// --- CSS Keyframes ---
const animationStyles = `
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default function EuropeanMarketDashboard() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', margin: '32px 0' }}>
      <style>{animationStyles}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <div style={{ padding: '10px', background: 'rgba(56,189,248,0.1)', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)' }}>
            <Euro style={{ width: 24, height: 24, color: COLORS.accent.sky }} />
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            유럽 다운스트림 마켓 인텔리전스
          </span>
        </h2>
        <p style={{ color: COLORS.textMuted, fontSize: '0.88rem', margin: 0, marginLeft: '56px', fontWeight: 500 }}>
          글로벌 최대 참치캔 소비 시장(~760,000t, USD 64.9억)의 무역 흐름 및 ESG 지표를 분석합니다.
          <span style={{ marginLeft: '8px', fontSize: '0.65rem', color: COLORS.accent.cyan, fontWeight: 600 }}>MSC Yearbook 2026 기반</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <EuroMacroTradeWidget />
        <EuroESGTrackerWidget />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <EuroValueChainWidget />
        <EuroPremiumWidget />
      </div>

      <EuroRetailMatrixWidget />
    </div>
  );
}
