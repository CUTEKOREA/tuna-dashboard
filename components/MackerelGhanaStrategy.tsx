'use client';

import React from 'react';
import { Target, Ship, Anchor } from 'lucide-react';
import WidgetCard from './WidgetCard';

export default function MackerelGhanaStrategy() {
  const customBody = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        {/* Cost */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>수입 원가 (제품+운송)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '12px' }}>$34,482</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
            <span>단가 200/300g (16kg)</span><span>$20.97</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            <span>단가 150/250g (20kg)</span><span>$25.78</span>
          </div>
        </div>

        {/* Tax */}
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span> 가나 관세 및 제세금
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-danger)', marginBottom: '12px' }}>$23,278</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fca5a5', marginBottom: '4px' }}>
            <span>관세 (Duty Etc)</span><span>$11,216</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fca5a5' }}>
            <span>부가세 등 (20%)</span><span>$12,062</span>
          </div>
        </div>

        {/* Revenue */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>총 매출액</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>$60,311</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
            <span>200/300g 판매가</span><span>$45.66 (500₵)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            <span>150/250g 판매가</span><span>$44.75 (490₵)</span>
          </div>
        </div>

        {/* Margin */}
        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>최종 순수익 (마진율)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '12px' }}>6.21%</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#34d399', marginBottom: '4px' }}>
            <span>전체 순수익</span><span>$2,550</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-success)' }}>
            <span>2019년 수입판매 수익</span><span>1.93%</span>
          </div>
        </div>

      </div>

      {/* 2. Timeline */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>
          <Ship size={18} /> 운송 및 통관 프로세스 타임라인 (S. japonicus 1,328 카톤)
        </h4>
        <div style={{ 
          background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '24px',
          position: 'relative'
        }}>
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '50%', left: '40px', right: '40px', height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #10b981)', zIndex: 0 }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', textAlign: 'center', color: '#e2e8f0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', margin: '0 auto 8px auto' }}></div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>출항 (부산항)</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>2026.02.04</div>
            </div>
            
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', textAlign: 'center', color: '#e2e8f0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', margin: '0 auto 8px auto' }}></div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>입항 (테마항)</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>2026.03.20</div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', textAlign: 'center', color: '#e2e8f0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)', margin: '0 auto 8px auto' }}></div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>통관 (FDA검사)</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>2026.03.25</div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', textAlign: 'center', color: '#e2e8f0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', margin: '0 auto 8px auto' }}></div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>입고 (GGL 2번 창고)</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>2026.03.26</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monthly Roadmap */}
      <div style={{ marginTop: '32px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>
          <Anchor size={18} /> 정규 월별 수출 마스터플랜 (2026.05 ~ 12)
        </h4>

        <div style={{ 
          background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', 
          overflow: 'hidden' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>계획 월별</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>수출 선적 (출항)</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>테마항 입항 (도착)</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>총 비용</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>예상 총매출액</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>예상 순수익 (마진)</th>
                <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>운영 포커스 및 마일스톤</th>
              </tr>
            </thead>
            <tbody>
              {[
                { month: '2026. 05', ship: '5월 2주차 (1x20ft)', arrive: '6월 4주차', cost: '~$57,760', rev: '$60,300', profit: '$2,540 (4.2%)', note: '하절기 온도 관리 집중 점검' },
                { month: '2026. 06', ship: '6월 2주차 (1x20ft)', arrive: '7월 4주차', cost: '~$57,760', rev: '$60,900', profit: '$3,140 (5.1%)', note: '직납 바이어 영업망 추가발굴' },
                { month: '2026. 07', ship: '7월 2주차 (1x20ft)', arrive: '8월 4주차', cost: '~$57,760', rev: '$61,500', profit: '$3,740 (6.0%)', note: '세금 공제 관련 프라이싱 검토' },
                { month: '2026. 08', ship: '8월 2주차 (1x20ft)', arrive: '9월 4주차', cost: '~$57,760', rev: '$62,000', profit: '$4,240 (6.8%)', note: '누적 대금 회수(ROI) 중간 점검' },
                { month: '2026. 09', ship: '9월 2주차 (1x20ft)', arrive: '10월 4주차', cost: '~$57,760', rev: '$61,500', profit: '$3,740 (6.0%)', note: '가나 어시장 대체재 동향 점검' },
                { month: '2026. 10', ship: '10월 2주차 (1x20ft)', arrive: '11월 4주차', cost: '~$57,200', rev: '$61,500', profit: '$4,300 (7.0%)', note: '현지 냉동보관 체류단가 협상' },
                { month: '2026. 11', ship: '11월 2주차 (1x20ft)', arrive: '12월 4주차', cost: '~$57,200', rev: '$63,000', profit: '$5,800 (9.2%)', note: '연말 시즌 특수 프리미엄가 반영' },
                { month: '2026. 12', ship: '12월 2주차 (1x20ft)', arrive: '\'27. 1월 4주차', cost: '~$57,200', rev: '$63,500', profit: '$6,300 (9.9%)', note: '2026 결산 및 2027 물량 협의' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx !== 7 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>{row.month}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{row.ship}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{row.arrive}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-danger)', fontSize: '0.85rem' }}>{row.cost}</td>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: '0.85rem' }}>{row.rev}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.85rem' }}>{row.profit}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
          <span>*물동량 원칙: 매월 20ft 냉동 컨테이너 1대 고정 출하</span>
          <span>*기준: 수입원가 $34,482 + 세금 $23,278 달러 베이스라인 적용</span>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="한국 태평양고등어 가나 수출 전략 (테스트 성과 보고)"
      icon={Target}
      iconColor="var(--text-primary)"
      pillar="S5"
      cardDesc="실측치: 2026.02 1x20ft 컨테이너 수출 원가·세금·매출 실기록 / 관세청 수출통계·aT 수출정보 기반 추정 (자체추정·illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>"Sub-Sahara Pelagic Protein Gap"이란 서아프리카(가나·나이지리아 등)의 단백질 결핍을 채우는 펠라직(원양·연안 표층어) 단백질 수입 의존 시장. 러시아·노르웨이 공급 cliff가 한국산 소형어의 신흥 수익원으로 전환.</p>
<p>실측: <strong>국내 사료용 폐기되던 300g 미만 소형 고등어가 가나/나이지리아 프리미엄 단백질로 부상 — 관세청 수출통계 기준 14.4만 톤 수출(연간 추정). 이번 테스트 선적 1컨테이너 매출 $60,311, 마진 6.21%</strong>. 지정학적 windfall과 잉여 자원 monetization이 결합한 구조.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 가나 수출은 단순 dumping 아닌 서아프리카 단백질 수입 시장의 장기 거점 확보 기회. 러시아 공급 공백 지속 기간 내 브랜드·인프라 구축이 선결 과제.</p>
<p><strong>3단계</strong>: ① 가나 테마항 콜드체인 물류망 자체 구축 + 현지 합작 가공 공장 검토 (중장기) ② 냉동 원물 수출 → "Korea Pacific Mackerel" 브랜드 직납 모델로 전환 검토 ③ ODA 연계 비즈니스 가능성 탐색 — 러시아 공급 재개 시 가격 경쟁력 유지 방안 사전 검토 필요.</p>
</div>`,
        source: "고등어 마스터 인덱스 · 관세청 수출통계 · aT 수출정보",
      }}
    />
  );
}
