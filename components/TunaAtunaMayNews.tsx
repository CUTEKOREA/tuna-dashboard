import React from 'react';
import WidgetCard from './WidgetCard';
import { Anchor, DollarSign, TrendingDown, Ship } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartPatternDefs } from './ChartPatterns';

const mockPriceDropData = [
  { 지역: '미국 (매입가)', 단가: 1500 },
  { 지역: '방콕 (현재)', 단가: 1850 },
  { 지역: '방콕 (고점)', 단가: 1975 },
];

export const AtunaIoPerfectStormWidget = () => (
  <WidgetCard
    title="IO 선망선단 퍼펙트 스톰"
    icon={Ship}
    iconColor="#f43f5e"
    pillar="S1"
    cardDesc="인도양(IO) 연료비 폭등 및 어획 부진으로 인한 선단 조업 중단 사태"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-27 Atuna' }}
    termTooltip={{ term: '퍼펙트 스톰', description: '연료비 상승과 어획 부진이 동시에 겹치면서 조업을 포기하고 항구로 회항하는 최악의 경영 환경을 의미합니다.' }}
    kpiPanel={[{ label: '긴급 지원금 (프랑스)', value: '€13M', sub: 'EU EC 승인' }]}
    takeaway={{
      situation: `<div>
<p>지난 10일간 가장 큰 충격은 <strong>인도양(IO) 선망선단의 조업 중단 사태</strong>입니다. 연료비 폭등과 계절적 어획 부진이 겹치면서 선주들이 손실을 줄이기 위해 조업을 포기하고 항구(세이셸, 모리셔스)로 배를 회항시키고 있습니다.</p>
<p>이에 유럽연합(EC)은 연료비 위기에 처한 프랑스 참치 선단 등에 <strong>1,300만 유로의 긴급 지원(METSAF)</strong>을 승인할 정도로 상황이 심각합니다.</p>
</div>`,
      actionPlan: `<div>
<p><strong>인도양 소싱 리스크 메모</strong></p>
<p>이는 단순한 휴어기가 아니라 펀더멘털 붕괴입니다. 인도양 원물 공급망이 차질을 빚으면서 EU로 향하는 캔참치 생산(세이셸, 모리셔스 공장)에 병목이 발생할 것입니다. 즉시 태평양(WCPO) 물량 또는 대서양 물량으로 선제적 소싱 전환이 필요합니다.</p>
</div>`,
      source: 'Atuna News (2026-05-20, 26)'
    }}
  />
);

export const AtunaBangkokPriceWidget = () => (
  <WidgetCard
    title="방콕 원어가 하락과 미국 통제력"
    icon={DollarSign}
    iconColor="#3b82f6"
    pillar="S4"
    cardDesc="2026-05-27 Atuna 보도 기준 방콕 WCPO 가다랑어 산지가 $1,850/t (2025-08 고점 $1,845 대비 5월 회복 추세). 미국 소매업계는 $1,500/t 통제선 압박 — 출처: Atuna News (2026-05-20, 2026-05-26)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-27 Atuna' }}
    kpiPanel={[{ label: '방콕 가다랑어', value: '$1,850/t', sub: '2025-08 고점 $1,845 회복 추세' }]}
    chartHeight={200}
    chart={
      <BarChart data={mockPriceDropData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(140,170,255,0.12)" />
        <XAxis type="number" stroke="#94a3b8" />
        <YAxis dataKey="지역" type="category" stroke="#94a3b8" width={100} />
        <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: 'none', borderRadius: '8px' }} />
        <Bar dataKey="단가" fill="#3b82f6" radius={[0, 4, 4, 0]} name="톤당 단가 ($)" />
      </BarChart>
    }
    takeaway={{
      situation: `<div>
<p>최근 방콕 가다랑어 원어 가격이 <strong>톤당 $1,850</strong>로 하락했습니다. 운반선들이 몰리며 공급이 일시적으로 완화된 덕분입니다. 그러나 업계의 시선은 미국으로 쏠리고 있습니다.</p>
<p>글로벌 선단은 유가 폭등에 시달리지만, 미국 소매업계는 지난 수십 년간 매입가를 $1,500 선으로 통제하며 비용 전가를 막아왔습니다. 설상가상으로 미국 의회는 태국, 베트남 등 수출국을 상대로 <strong>무역법 301조 조사</strong>를 촉구하고 있습니다.</p>
</div>`,
      actionPlan: `<div>
<p><strong>대체 시장 전환 메모</strong></p>
<p>미국의 강력한 가격 통제력과 301조 무역 장벽은 아시아 가공업체들의 이익을 극도로 압박할 것입니다. 대미 수출 의존도를 낮추고, EU 무관세 채널이나 신흥국(중동, 아프리카) 파우치 시장으로 신속하게 판로를 다변화해야 합니다.</p>
</div>`,
      source: 'Atuna News (2026-05-19, 21, 22)'
    }}
  />
);

export const AtunaEpoCatchDropWidget = () => (
  <WidgetCard
    title="EPO 어획 급감 및 미 파우치 지각변동"
    icon={TrendingDown}
    iconColor="#f59e0b"
    pillar="S1"
    cardDesc="에콰도르 동태평양(EPO) 1분기 가다랑어 어획량 -28% 급감"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-27 Atuna' }}
    kpiPanel={[{ label: 'EPO 1분기 어획', value: '-28%', sub: '전년 동기 대비 급감', trendColor: '#f43f5e' }]}
    takeaway={{
      situation: `<div>
<p>에콰도르 선단이 주로 조업하는 <strong>동태평양(EPO)의 1분기 가다랑어 어획량이 전년 동기 대비 28%나 급감</strong>했습니다. 2023년 이전 수준으로 회귀한 셈입니다.</p>
<p>이로 인해 에콰도르의 대미 파우치 수출이 22% 감소했고, 베트남은 해양포유류보호법(MMPA) 요건 미달로 수출이 89%나 폭락했습니다.</p>
</div>`,
      actionPlan: `<div>
<p><strong>원물 확보 리스크 메모</strong></p>
<p>지난 2년간 에콰도르가 누리던 '원어 풍요'가 막을 내렸습니다. EU 시장을 우선시하던 에콰도르가 다른 해역 원어를 비싸게 수입해야 하는 상황이 되었습니다. 글로벌 원물 확보 경쟁이 심화될 것이므로, 중서태평양(WCPO) 장기 공급 계약을 즉시 락업(Lock-up)해야 합니다.</p>
</div>`,
      source: 'Atuna News (2026-05-19)'
    }}
  />
);

export const AtunaEuCatchSystemWidget = () => (
  <WidgetCard
    title="EU CATCH 물류 병목 현실화"
    icon={Anchor}
    iconColor="#8b5cf6"
    pillar="S3"
    cardDesc="디지털 이력 추적(EU CATCH) 시스템 오류로 인한 최대 50% 수입 거절 리스크"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-27 Atuna' }}
    kpiPanel={[{ label: '서류 오류 거절률', value: '25~50%', sub: '수입 인증 지연' }]}
    takeaway={{
      situation: `<div>
<p>지난 1월부터 도입된 유럽의 디지털 이력 추적 시스템 <strong>'EU CATCH'가 심각한 물류 지연과 병목 현상</strong>을 일으키고 있습니다.</p>
<p>바르셀로나 유럽 참치 컨퍼런스(ETC)에서는 행정 서류 오류로 인한 수입 거절 확률이 25%에서 최대 50%에 달할 것으로 예상하며 시스템 부작용을 경고했습니다. 반면, 영국은 몰디브산 참치에 20% 관세를 철폐해 무역 장벽을 낮췄습니다.</p>
</div>`,
      actionPlan: `<div>
<p><strong>통관 프로세스 개선 메모</strong></p>
<p>서류 오류 하나가 항구 물류 마비와 냉동 창고 체류 비용 폭탄으로 직결됩니다. 투명성과 이력 추적은 단순한 ESG 지표가 아닌 '물류 리스크'로 격상되었습니다. 즉시 블록체인 기반의 자동화된 서류 검증 시스템을 도입하여 EU 통관 리드타임을 방어해야 합니다.</p>
</div>`,
      source: 'Atuna News (2026-05-21, 26)'
    }}
  />
);
