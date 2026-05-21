'use client';
import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Scatter, ReferenceLine } from 'recharts';
import { ShieldAlert, Crosshair, FileCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';

// 8. HSK 병목 타격 지수
const hskData = [
  { subject: '관세 신고 지연율', 통마리: 80, 필레: 30, 연육: 20, 명란: 90 },
  { subject: 'MFDS 방사능 검사 빈도', 통마리: 100, 필레: 40, 연육: 15, 명란: 85 },
  { subject: '원산지 심층 소명 규제', 통마리: 90, 필레: 75, 연육: 40, 명란: 60 },
  { subject: '물류창고 폐기/반송률', 통마리: 70, 필레: 10, 연육: 5, 명란: 45 },
  { subject: '전담 인력 리소스 소모', 통마리: 85, 필레: 50, 연육: 30, 명란: 95 },
];

export function WidgetHSKBottleneck() {
  return (
    <WidgetCard
      title="HSK 2026 규격 세분화 병목 지수"
      icon={ShieldAlert}
      iconColor="#cbd5e1"
      pillar="S3"
      cardDesc="2026년 4대 HSK 분류에 따른 세관 통관 및 식약처(MFDS) 행정 지연율의 파이프라인 부하 수치"
      termTooltip={{ term: "HSK Micro-bottleneck Score", description: "2026년 4대 HSK 분류에 따른 세관 통관 및 식약처(MFDS) 행정 지연율의 파이프라인 부하 수치" }}
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={hskData}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Radar name="통마리 (0303.67)" dataKey="통마리" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
          <Radar name="필레 (0304.75)" dataKey="필레" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.5} />
        </RadarChart>
      }
      takeaway={{
        source: "식약처 수입식품 방사능 검사 동향 및 세관 규제 패치안",
        situation: "2026년 HSK 세분화 이후 통마리(0303.67)와 1604(비조제 명란) 코드에 행정력과 방사능 표적 검사가 집중되며 병목(Bottleneck) 타격이 최대치에 도달합니다. 반면, 1차 가공된 필레와 연육은 리스크가 절반 이하로 떨어집니다.",
        actionPlan: "원물 그대로 수입하는 통마리의 비중을 극단적으로 축소하십시오. 방사능 전수 검사로 보세구역에 컨테이너가 묶이는 즉시 재고 조달(Lead Time)이 무너집니다. 규제 마찰력이 적은 가공품(필레/연육) 중심으로 HSK 통관 코드를 우회 집중하는 것이 수급 방어의 핵심입니다."
      }}
    />
  );
}

// 9. 보세창고 정밀투하 지수
const wareHouseData = [
  { month: '1월', inventory: 12000, price: 2100, demandIndex: 90 }, // 설 명절
  { month: '3월', inventory: 8000, price: 1900, demandIndex: 50 },
  { month: '6월', inventory: 15000, price: 2000, demandIndex: 60 }, // 금어기 해제 직후 물량 입고
  { month: '9월', inventory: 6000, price: 2600, demandIndex: 95 }, // 추석 + 수급 붕괴
  { month: '11월', inventory: 5000, price: 2800, demandIndex: 85 }, // 정부 비축 방출 회피 기간
];

export function WidgetWarehouseSniping() {
  return (
    <WidgetCard
      title="보세창고 정밀투하 지수"
      icon={Crosshair}
      iconColor="#cbd5e1"
      pillar="S3"
      cardDesc="냉동 보세 창고에 비축된 재고를 언제 시장에 방출(Release)할지 결정하는 수익 극대화 스나이핑 지표"
      termTooltip={{ term: "Precision Warehousing", description: "냉동 보세 창고에 비축된 재고를 언제 시장에 방출(Release)할지 결정하는 수익 극대화 스나이핑 지표" }}
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <ComposedChart data={wareHouseData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={12} tickFormatter={(v)=>`${v}t`} domain={[0, 16000]} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={12} tickFormatter={(v)=>`₩${v}`} domain={[1500, 3000]} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Bar yAxisId="left" dataKey="inventory" name="보세창고 재고량 (톤)" fill="#475569" opacity={0.7} />
          <Line yAxisId="right" type="monotone" dataKey="price" name="시장 평균 도매가" stroke="var(--color-success)" strokeWidth={3} />
          <Scatter yAxisId="right" dataKey="demandIndex" fill="var(--color-warning)" name="명절/금어기 타겟 수요 지수" />
          <ReferenceLine yAxisId="left" y={10000} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '재고 보관료 마진 임계선', fill: '#f43f5e', fontSize: 10 }} />
        </ComposedChart>
      }
      takeaway={{
        source: "보세구역 물류센터 입출고 데이터 시뮬레이션",
        situation: "명절 직전이나 금어기 막바지에는 시장 수요가 치솟으며 도매가격이 수직 상승합니다. 반면, 정부가 물가 통제를 위해 비축 명태 방출이나 한시적 할당관세를 내릴 경우 시장가가 국지적으로 박살납니다.",
        actionPlan: "매입한 물량을 들어오는 대로 단순 유통(Flow)시키지 마십시오. 정부의 명절 비축물 방출 1주일 전까지는 재고를 창고에 묶어놓고(Hold) 품귀 프리미엄을 먹고, 방출 직전에 재고를 전량 투하(Sniping)하여 정부 물가 하락장 펀치를 완벽히 빗겨가야 합니다."
      }}
    />
  );
}

// 10. 선상 VDS 무결성 지표
const vdsData = [
  { name: '승인(Pre-pass)', value: 82, fill: 'var(--color-success)' },
  { name: '보류(추가 소명)', value: 12, fill: 'var(--color-warning)' },
  { name: '불량(반려/거절)', value: 6, fill: 'var(--color-danger)' },
];

export function WidgetVDSIntegrity() {
  return (
    <WidgetCard
      title="선상 VDS 검증 무결성 지표"
      icon={FileCheck}
      iconColor="#cbd5e1"
      pillar="S3"
      cardDesc="선적지 현지에서 생산된 Single-frozen Lot별 VDS 정보의 식약처 통관 프리패스(Pre-pass) 확률"
      termTooltip={{ term: "Virtual Docking System Integrity", description: "선적지 현지에서 생산된 Single-frozen Lot별 VDS 정보의 식약처 통관 프리패스(Pre-pass) 확률" }}
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={220}
      chart={
        <div style={{ display: 'flex', width: '100%', height: '80%', alignItems: 'flex-end', gap: '8px' }}>
          {vdsData.map((item, idx) => (
            <div key={idx} style={{ flex: item.value, background: item.fill, height: '100%', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ position: 'absolute', top: '-25px', color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold' }}>{item.value}%</span>
              <span style={{ color: '#000', fontSize: '11px', fontWeight: 'bold', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{item.name}</span>
            </div>
          ))}
        </div>
      }
      takeaway={{
        source: "식약처(MFDS) 전자 통관 및 IUU 어획 증명 DB",
        situation: "러시아산 및 알래스카산 원물 수입 시, 불법/비보고 조업 및 방사능 오염 우려로 인해 통관 세관의 현장 실사가 극도로 까다로워졌습니다. 사전에 전자적으로 증명된 VDS 무결성이 부족하면 전량 반송됩니다.",
        actionPlan: "당사의 구매 파트너 명단에서 VDS 데이터 무결성 지표가 90% 미만인 러시아 선사는 즉시 블랙리스트(Black-list) 처리하여 입찰에서 배제하십시오. 1차 선상 동결(Single-frozen) 후 바로 블록체인 기반의 VDS 원산지 정보가 박히는 프리미엄 선단에게만 오더를 줘야 리드타임 붕괴를 막습니다."
      }}
    />
  );
}