import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ShieldCheck, TrendingUp, Anchor, Euro, ShoppingCart, Leaf, Factory, Globe, DollarSign } from 'lucide-react';

// --- DATA ---

const macroTradeData = [
  { name: '에콰도르 (Ecuador)', value: 36.2, fill: '#3b82f6' },
  { name: '중국 (China)', value: 9.0, fill: '#ef4444' },
  { name: '파푸아뉴기니 (PNG)', value: 9.0, fill: '#f59e0b' },
  { name: '필리핀 (Philippines)', value: 8.2, fill: '#10b981' },
  { name: '모리셔스 (Mauritius)', value: 6.5, fill: '#8b5cf6' },
  { name: '세이셸 (Seychelles)', value: 5.0, fill: '#ec4899' },
  { name: '기타 (Others)', value: 26.1, fill: '#64748b' },
];

const retailKpiData = [
  {
    country: '이탈리아',
    code: 'IT',
    flag: '🇮🇹',
    consumption: '2.36kg (2024)',
    marketValue: 'EUR 16.5억',
    solvent: '올리브유 (Olive Oil)',
    plShare: '28%',
    msc: '캔 MSC 86%',
    mscGrowth: '+10.3% YoY',
    mscVolume: '—',
    keyInsight: 'EU 최대 캔참치 소비국. 가구 96% 침투. Rio Mare(Bolton) 99.7% 책임소싱.',
  },
  {
    country: '스페인',
    code: 'ES',
    flag: '🇪🇸',
    consumption: '1.95kg (2024)',
    marketValue: 'EUR 18.98억*',
    solvent: '올리브유 & 해바라기유',
    plShare: '80%',
    msc: '+32% 성장',
    mscGrowth: '+3.72% vol',
    mscVolume: '308,306t 생산',
    keyInsight: 'EU 최대 생산국(>65%). PB 80%+. 프리미엄 전략=올리브유+MSC.',
  },
  {
    country: '프랑스',
    code: 'FR',
    flag: '🇫🇷',
    consumption: '65,832t (2023)',
    marketValue: 'EUR 6.68억',
    solvent: '혼합 (염수/오일)',
    plShare: '32%',
    msc: '67.2% MSC비율',
    mscGrowth: '+119% (4년)',
    mscVolume: '32,683t',
    keyInsight: '비캔 비율 EU 최고(33%). 수은 보고서 후 매출 10-20% 급락 경험.',
  },
  {
    country: '영국',
    code: 'UK',
    flag: '🇬🇧',
    consumption: '61,904t',
    marketValue: 'GBP 4.28억',
    solvent: '염수/물 (Brine/Water)',
    plShare: '43%+',
    msc: '65% 물량 / 49% 제품',
    mscGrowth: '2021 4% → 2026 49%',
    mscVolume: '>45,000t',
    keyInsight: 'Princes 2026.2 100% MSC 전환. 참치가 MSC #1 어종.',
  },
  {
    country: '독일',
    code: 'DE',
    flag: '🇩🇪',
    consumption: '87,862t MSC',
    marketValue: '세계 1위 MSC vol',
    solvent: '해바라기유 & 염수',
    plShare: '71%',
    msc: '~보편적',
    mscGrowth: '+55% (중앙유럽)',
    mscVolume: '87,862t',
    keyInsight: '세계 1위 MSC 참치 소비국. 참치 = 독일 수산물 #2(연어 다음).',
  },
];

const esgBrandData = [
  { brand: 'Walmart (US PB)', target: 100, label: '자체브랜드 캔 참치 전체 MSC 인증', markets: '🇺🇸', color: '#22d3ee' },
  { brand: 'Princes (UK)', target: 100, label: '2026년 2월 100% MSC 전환 완료', markets: '🇬🇧', color: '#a78bfa' },
  { brand: 'Bolton (Rio Mare)', target: 99.7, label: '책임 어업 소싱 · IO 황다랑어 74% 감축', markets: '🇮🇹🇫🇷🇪🇸', color: '#10b981' },
  { brand: 'Thai Union (John West)', target: 98.9, label: 'MSC / FIP 연계 소싱 (+14% vs 2023)', markets: '🇬🇧🇫🇷🇮🇹🇳🇱', color: '#3b82f6' },
  { brand: 'Nauterra (Calvo)', target: 92.8, label: '로인 인증 >92% · EUR 7.27억 매출', markets: '🇪🇸🇮🇹', color: '#f59e0b' },
  { brand: 'Jealsa (Rianxeira)', target: 85, label: 'MSC 블루라벨 · ISSF 기반 소싱', markets: '🇪🇸', color: '#ef4444' },
];

// MSC 가격 프리미엄 데이터 (Hedonic Model 2025)
const premiumData = [
  { label: 'MSC 인증', premium: 44.6, color: '#38bdf8' },
  { label: 'Dolphin-Safe', premium: 25.4, color: '#10b981' },
  { label: '이중 라벨\n(MSC+D-S)', premium: 81.3, color: '#a78bfa' },
];

// EU 캔참치 밸류체인 데이터
const valueChainStats = [
  { label: 'EU 캔참치 소비', value: '~760,000t', sub: 'USD 64.9억 → 89.3억 (2033)', icon: ShoppingCart },
  { label: 'EU 어획', value: '385,000t', sub: '자급률 29% → 35% (2023)', icon: Anchor },
  { label: '역외 수입 의존도', value: '66.5%', sub: '에콰도르·세이셸·필리핀·모리셔스', icon: Globe },
  { label: 'ATQ 무관세 로인', value: '35,000t/yr', sub: 'MFN 24% → 0% (쿼터 내)', icon: Factory },
];

// --- COMPONENTS ---

export function EuroMacroTradeWidget() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <Anchor className="w-5 h-5 text-blue-400" />
          EU 역외 참치캔 수입 의존도 (Top Suppliers)
        </h3>
        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-md border border-blue-500/20">
          수입 의존도 66.5%
        </span>
      </div>
      <p className="text-sm text-slate-400 line-clamp-2">
        유럽연합은 연간 약 76만 톤의 참치캔을 소비하며, EU 어획(38.5만t) 대비 자급률은 35%에 불과. 66.5%가 에콰도르, 중국, 필리핀 등 역외 국가로부터 유입됩니다.
      </p>
      <div className="h-[250px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={macroTradeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {macroTradeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [`${value}%`, '점유율']}
            />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function EuroRetailMatrixWidget() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <ShoppingCart className="w-5 h-5 text-emerald-400" />
          유럽 Big 5 국가별 리테일 · MSC 매트릭스
        </h3>
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20 uppercase tracking-wider">
          MSC Yearbook 2026
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-3 py-3 rounded-tl-lg">국가</th>
              <th className="px-3 py-3">시장 규모</th>
              <th className="px-3 py-3">주력 용매</th>
              <th className="px-3 py-3">PB 점유</th>
              <th className="px-3 py-3">MSC 침투</th>
              <th className="px-3 py-3">MSC 물량</th>
              <th className="px-3 py-3 rounded-tr-lg">성장률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {retailKpiData.map((row) => (
              <tr key={row.code} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-3 py-3 font-semibold text-slate-200 whitespace-nowrap">
                  <span className="mr-1">{row.flag}</span>{row.country}
                </td>
                <td className="px-3 py-3 text-xs text-slate-400">{row.marketValue}</td>
                <td className="px-3 py-3 text-xs">{row.solvent}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${parseInt(row.plShare) > 50 ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {row.plShare}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                    {row.msc}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-cyan-400 font-medium">{row.mscVolume}</td>
                <td className="px-3 py-3 text-xs text-green-400 font-medium">{row.mscGrowth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 text-xs text-slate-400 mt-2 space-y-1">
        <div>
          <span className="font-semibold text-slate-300">💡 핵심 시사점:</span> 독일(~보편적)과 영국(65%)은 이미 MSC 포화 시장에 근접 — <strong className="text-emerald-400">인증 없이 매대 진입 불가</strong>.
          이탈리아(+10.3%)·폴란드(+15.7%)·중앙유럽(+9.7%)은 아직 고성장 중.
        </div>
        <div className="text-[10px] text-slate-500">
          * 스페인은 전체 캔 수산물 기준. 출처: MSC Tuna Yearbook 2026, MSC Country Market Analysis 2025-2026
        </div>
      </div>
    </div>
  );
}

export function EuroESGTrackerWidget() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <Leaf className="w-5 h-5 text-green-400" />
          글로벌 브랜드 MSC 소싱 스코어보드
        </h3>
        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20 uppercase tracking-wider">
          6개사 추적
        </span>
      </div>
      
      <div className="flex flex-col gap-3.5">
        {esgBrandData.map((item) => (
          <div key={item.brand} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">{item.brand}</span>
                <span className="text-xs text-slate-500">{item.markets}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: item.color }}>{item.target}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500" 
                style={{ width: `${item.target}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-4 border-t border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
        <div className="text-xs text-slate-400 leading-relaxed">
          상위 5대 글로벌 참치 브랜드 평균 MSC 소싱률 <strong className="text-emerald-400">97%+</strong>.
          <strong className="text-slate-300"> Dolphin-Safe</strong>는 기본 입장권이며,
          <strong className="text-slate-300"> MSC 인증</strong>은 <strong className="text-cyan-400">+10% ~ +44.6%</strong> 가격 프리미엄을 창출하는 핵심 차별화 요소.
          비인증 원료의 유통 채널이 <strong className="text-orange-400">2027년까지 사실상 소멸</strong> 전망.
        </div>
      </div>
    </div>
  );
}

export function EuroValueChainWidget() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <Factory className="w-5 h-5 text-cyan-400" />
          EU 캔참치 밸류체인 구조
        </h3>
        <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded border border-cyan-500/20 uppercase tracking-wider">
          공급 구조
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {valueChainStats.map((stat) => {
          const IconComp = stat.icon;
          return (
            <div key={stat.label} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <IconComp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
              </div>
              <div className="text-lg font-bold text-slate-100">{stat.value}</div>
              <div className="text-[10px] text-slate-500 leading-snug">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Value Chain Flow Diagram */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 mt-1">
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <span className="text-lg">🐟</span>
            </div>
            <span className="text-center font-medium">원물</span>
            <span className="text-slate-500">1.3M t 필요</span>
          </div>
          <span className="text-slate-600 text-lg">→</span>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <span className="text-lg">⚓</span>
            </div>
            <span className="text-center font-medium">EU 어획</span>
            <span className="text-slate-500">385K t (35%)</span>
          </div>
          <span className="text-slate-600 text-lg">+</span>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <span className="text-lg">📦</span>
            </div>
            <span className="text-center font-medium">역외 수입</span>
            <span className="text-slate-500">66.5%</span>
          </div>
          <span className="text-slate-600 text-lg">→</span>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-lg">🏭</span>
            </div>
            <span className="text-center font-medium">가공</span>
            <span className="text-slate-500">🇪🇸 65%+</span>
          </div>
          <span className="text-slate-600 text-lg">→</span>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <span className="text-lg">🛒</span>
            </div>
            <span className="text-center font-medium">소비</span>
            <span className="text-slate-500">~760K t</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 mt-1">
        출처: MSC Tuna Yearbook 2026, Eurostat, EUMOFA. 시장 규모: USD 64.9억(2024) → USD 89.3억(2033), CAGR 3.77%
      </div>
    </div>
  );
}

export function EuroPremiumWidget() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <DollarSign className="w-5 h-5 text-amber-400" />
          MSC 가격 프리미엄 실증 분석
        </h3>
        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded border border-amber-500/20 uppercase tracking-wider">
          Hedonic 2025
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {premiumData.map((item) => (
          <div key={item.label} className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-semibold text-slate-200 whitespace-pre-line">{item.label}</span>
              <span className="text-2xl font-black" style={{ color: item.color }}>+{item.premium}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${(item.premium / 100) * 100}%`, 
                  background: `linear-gradient(90deg, ${item.color}40, ${item.color})`,
                  boxShadow: `0 0 12px ${item.color}30`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mt-1">
        <div className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-amber-400">💰 헤도닉 가격 모델 (Banguning Asgha et al., 2025):</strong>{' '}
          MSC + Dolphin-Safe <strong className="text-purple-400">이중 라벨</strong> 전략 시 최대{' '}
          <strong className="text-white">81.3%</strong> 프리미엄 확보 가능.
          EU 시장 실무에서는 +10% ~ +14.2% 수렴 (유통사 네고 반영).
        </div>
      </div>
      <div className="text-[10px] text-slate-500">
        출처: Banguning Asgha et al. 2025 (Hedonic Price Model), MSC Annual Reports, EU-specific MSC literature
      </div>
    </div>
  );
}

export default function EuropeanMarketDashboard() {
  return (
    <div className="w-full flex flex-col gap-6 my-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Euro className="w-6 h-6 text-sky-400" />
          유럽 다운스트림 마켓 인텔리전스
        </h2>
        <p className="text-slate-400 text-sm">
          글로벌 최대 참치캔 소비 시장(~760,000t, USD 64.9억)의 거시 무역, 리테일 점유율, ESG·MSC 침투율을 모니터링합니다.
          <span className="ml-2 text-[10px] text-cyan-500 font-medium">MSC Yearbook 2026 기반</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EuroMacroTradeWidget />
        <EuroESGTrackerWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EuroValueChainWidget />
        <EuroPremiumWidget />
      </div>
      
      <EuroRetailMatrixWidget />
    </div>
  );
}
