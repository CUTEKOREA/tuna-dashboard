'use client';

import React from 'react';
import styles from './StrategyIntel.module.css';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell 
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import TradeRouteSankey from './TradeRouteSankey';
import CategoryPortfolio from './CategoryPortfolio';
import TermTooltip from './TermTooltip';
const scatterData = [
  { name: 'Dongwon', x: 40, y: 95, z: 200, fill: '#fbbf24', desc: '강력한 선단 장악력, 저마진 구조 탈피 중' },
  { name: 'Thai Union', x: 95, y: 10, z: 200, fill: '#38bdf8', desc: '선단 무보유. 펫푸드/기능성 최고 마진' },
  { name: 'Bolton', x: 80, y: 65, z: 200, fill: '#34d399', desc: 'TriMarine 인수 수직계열화 및 프리미엄 장악' },
  { name: 'FCF', x: 30, y: 25, z: 200, fill: '#f43f5e', desc: '거대 무역망. PNG 등 오프쇼어 리스크 안음' },
];

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#0F172A', border: `1px solid ${data.fill}`, padding: '12px', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: data.fill }}>{data.name}</p>
        <p style={{ margin: '4px 0', fontSize: '11px', color: '#94a3b8' }}>부가가치/프리미엄: <strong style={{ color: 'var(--text-primary)'}}>{data.x}</strong></p>
        <p style={{ margin: '4px 0', fontSize: '11px', color: '#94a3b8' }}>선단 장악력: <strong style={{ color: 'var(--text-primary)'}}>{data.y}</strong></p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#cbd5e1', maxWidth: '200px' }}>{data.desc}</p>
      </div>
    );
  }
  return null;
};

export default function StrategyIntel({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <div className={styles.container}>
      {!hideHeader && (
        <div className={styles.header}>
          <Target size={24} style={{ color: '#38bdf8' }} />
          <TermTooltip term="글로벌 Big 4 경쟁사 동향 (Competitor Intelligence)" description="세계를 주름잡는 4대 거대 참치 기업(Thai Union, Dongwon, Bolton, FCF)의 시장 지위와 기업별 핵심 전략을 비교 분석하는 인텔리전스 맵입니다." />
        </div>
      )}

      <div className={styles.row}>
        
        <div className={styles.gridRow}>
          {/* Scatter Plot Matrix */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <Target size={18} color="#fbbf24" />
              <TermTooltip term="Big 4 가치사슬 포지셔닝 맵 (Value Matrix)" description="각 기업이 어느 단계에서 이익을 내는지 보여줍니다. x축은 부가가치 창출 능력(단순 캔 vs 기능성/펫푸드), y축은 선단 장악력(스스로 고기를 잡을 수 있는 어선 직영 유무)을 나타냅니다." />
            </div>
            <div style={{ width: '100%', height: '320px', marginTop: '10px' }}>
              <SafeResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" dataKey="x" name="프리미엄/고부가가치" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '일반 캔 ◀ 부가가치 혁신 ▶ 펫푸드/RTE', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -10 }} />
                  <YAxis type="number" dataKey="y" name="선단 장악력" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '트레이딩 ◀ 선단장악력 ▶ 어망/선대보유', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="z" range={[100, 300]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} content={<CustomScatterTooltip />} />
                  <Scatter name="Big 4" data={scatterData}>
                    {scatterData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </SafeResponsiveContainer>
            </div>
            <div className={styles.descText}>
              X축은 제품의 부가가치(펫 케어, 조리 간편식 등)를, Y축은 원물 공급망의 수직계열화(자체 선단 보유 등)를 의미합니다. 같은 참치 기업이라도 이익 창출 지점이 완전히 다릅니다.
            </div>
          </div>

        </div>

        {/* Dynamic Trade Route Simulator */}
        <TradeRouteSankey />

        {/* 3D Flip Cards (Big 4 Profiles) */}
        <div>
          <div className={styles.header} style={{ fontSize: '16px', color: '#e2e8f0', marginTop: '8px' }}>
            Big 4 다이나믹 프로필 (마우스 오버)
          </div>
          <div className={styles.flipCardsContainer}>
            
            {/* Thai Union */}
            <div className={styles.flipCard}>
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <div className={styles.brandLogo}>Thai Union 🇹🇭</div>
                  <div className={styles.brandTagline}>Strategy 2030 & Nutrition 캐시카우</div>
                  <div className={styles.brandStat}>
                    <span>영업이익률 탑랭크 (펫케어 28.5%)</span>
                    <span>세계 최고 수준 ESG 인프라</span>
                  </div>
                </div>
                <div className={styles.flipCardBack}>
                  <div className={styles.backTitle}>상세 리포트</div>
                  <div className={styles.backItem}><Zap className={styles.backIcon} size={14}/> <span>치킨 오브더 씨 소유, 최대 가공업체</span></div>
                  <div className={styles.backItem}><TrendingDown className={styles.backIcon} size={14} color="var(--color-danger)"/> <span>자체 어선단 부재로 원가 리스크 노출</span></div>
                  <div className={styles.backItem}><TrendingUp className={styles.backIcon} size={14}/> <span>미국 매출 둔화를 펫/기능성 소재로 상쇄 중</span></div>
                </div>
              </div>
            </div>

            {/* Dongwon */}
            <div className={styles.flipCard}>
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <div className={styles.brandLogo}>Dongwon 🇰🇷</div>
                  <div className={styles.brandTagline}>막강한 자체 원어 장악 및 스마트 조업</div>
                  <div className={styles.brandStat}>
                    <span>19척 대형 선망어선 보유 (국내 1위)</span>
                    <span>북미 통조림 점유율 1위 (StarKist)</span>
                  </div>
                </div>
                <div className={styles.flipCardBack}>
                  <div className={styles.backTitle}>상세 리포트</div>
                  <div className={styles.backItem}><Zap className={styles.backIcon} size={14}/> <span>드론 및 저유황 연료선 스마트 교체 투입</span></div>
                  <div className={styles.backItem}><TrendingDown className={styles.backIcon} size={14} color="var(--color-danger)"/> <span>순이익률 3%대 (원어가격 하방경직성 압박)</span></div>
                  <div className={styles.backItem}><TrendingUp className={styles.backIcon} size={14}/> <span>수직계열화 재무구조 통합, 파우치 혁신 투자</span></div>
                </div>
              </div>
            </div>

            {/* Bolton */}
            <div className={styles.flipCard}>
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <div className={styles.brandLogo}>Bolton 🇮🇹</div>
                  <div className={styles.brandTagline}>극강의 ESG 리더십과 유럽 마켓 지배</div>
                  <div className={styles.brandStat}>
                    <span>이탈리아 시장 점유율 40% (Rio Mare)</span>
                    <span>Tri Marine 인수로 수직계열화 완성</span>
                  </div>
                </div>
                <div className={styles.flipCardBack}>
                  <div className={styles.backTitle}>상세 리포트</div>
                  <div className={styles.backItem}><Zap className={styles.backIcon} size={14}/> <span>WWF/Oxfam 제휴 등 투명한 공급망 추구</span></div>
                  <div className={styles.backItem}><TrendingDown className={styles.backIcon} size={14} color="var(--color-danger)"/> <span>저성장 유럽 시장 편중 및 마트 PB 압박 심화</span></div>
                  <div className={styles.backItem}><TrendingUp className={styles.backIcon} size={14}/> <span>미국 Wild Planet 인수로 친환경 하이엔드 집중</span></div>
                </div>
              </div>
            </div>

            {/* FCF */}
            <div className={styles.flipCard}>
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <div className={styles.brandLogo}>FCF 🇹🇼</div>
                  <div className={styles.brandTagline}>거대 무역망 기반 오프쇼어 파이프라인</div>
                  <div className={styles.brandStat}>
                    <span>세계 최대 참치 원물 트레이더</span>
                    <span>미국 3대 브랜드 Bumble Bee 파산 인수</span>
                  </div>
                </div>
                <div className={styles.flipCardBack}>
                  <div className={styles.backTitle}>상세 리포트</div>
                  <div className={styles.backItem}><Zap className={styles.backIcon} size={14}/> <span>대만 선단 유대 및 PNG 공단 무관세 인프라</span></div>
                  <div className={styles.backItem}><TrendingDown className={styles.backIcon} size={14} color="var(--color-danger)"/> <span>PNG 현지 전력/인프라 부족발 비용 압박 극심</span></div>
                  <div className={styles.backItem}><TrendingUp className={styles.backIcon} size={14}/> <span>대체육(Plant-based) 참치 라인 등 트렌드 대응</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Product Category Portfolio Tracker */}
        <CategoryPortfolio />

      </div>
    </div>
  );
}
