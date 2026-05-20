'use client';

import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import styles from './MackerelStrategy.module.css';
import { Globe } from 'lucide-react';
import rawData from '../data/mackerel_unit_price.json';
import TakeawayBox from './TakeawayBox';

export default function MackerelUnitPrice() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setChartWidth(Math.floor(w)); };
    measure();
    const t = setTimeout(measure, 300);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);

  const data = (rawData as any[]).slice(0, 15);
  const maxPrice = Math.max(...data.map((d: any) => d.unit_price_usd));

  const PriceTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(245, 158, 11, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '200px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#fbbf24' }}>{d.country}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💰 수입 단가</span><span style={{ fontWeight: 700, color: '#fbbf24' }}>${Math.round(d.unit_price_usd).toLocaleString()}/t</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📦 수입량</span><span>{d.import_vol_t?.toLocaleString()}톤</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💵 수입액</span><span>${d.import_val_usd_k?.toLocaleString()}K</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
          <Globe size={20} /> 글로벌 단위 단가 랭킹: 프리미엄 타겟 시장
          
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
          2023년 가장 비싸게 고등어를 사가는 국가 Top 15 — 프리미엄 판로 배분 전략
        </p>
      </div>

      <div ref={chartRef} style={{ width: '100%' }}>
        {chartWidth > 0 && (
          <BarChart width={chartWidth} height={450} data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <YAxis type="category" dataKey="country" width={110} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
            <Tooltip content={<PriceTooltip />} />
            <Bar dataKey="unit_price_usd" name="수입 단가 ($/t)" radius={[0, 4, 4, 0]}>
              {data.map((d: any, i: number) => (
                <Cell key={i} fill={`rgba(245, 158, 11, ${0.3 + (d.unit_price_usd / maxPrice) * 0.7})`} />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ - Trade by Partner (2023)"
          situation="룩셈부르크($7,479/t), 오스트리아($7,321/t) 등 최상위 수입 단가를 시현하는 주요 유럽 및 특수 국가들은 단순 원물이 아닌 철저한 고부가가치 완제품, 즉 '건강/프리미엄' 이미지를 갖춘 패키징 상품을 수용합니다. 한국의 주력 조업 타겟인 아프리카향 단가($1,500/t 전후) 선단의 벌크 물량에 의존하기보다, 물량은 적지만 단가수익률이 5배 이상 높은 프리미엄 틈새 캐시카우 시장의 특징을 잘 보여줍니다."
          actionPlan="**[Actionable Insight]** 프리미엄 수입 단가 Top 15 시장 대부분은 오직 'MSC/ASC 유기농 인증' 패스 없이는 진입조차 불가능합니다. 기존 저가 물량의 출혈 경쟁에서 벗어나, 자체 조업망의 MSC 인증 획득 비용 투자를 최우선으로 단행하십시오. 인증이 지연될 경우, 이미 인증을 획득한 아이슬란드/노르웨이 산지 파트너사 물량을 국내에서 특수 고부가 가공(OEM)하여 선진국 메이저 리테일로 재수출하는 라인을 신설하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)"
        />
      </div>
    </div>
  );
}
