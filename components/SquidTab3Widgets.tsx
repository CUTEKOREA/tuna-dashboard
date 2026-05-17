import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

const glassContainerStyle = {
  background: 'rgba(0, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
  padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px', height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' as const
};

// 21. 한국 수급 데드크로스
export function Widget21_SupplyDeadCross() {
  const data = [
    { year: '2010', domestic: 150, import: 50 },
    { year: '2015', domestic: 120, import: 80 },
    { year: '2020', domestic: 50, import: 150 },
    { year: '2023', domestic: 20, import: 200 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>21. 한국 연근해 수급 절벽 데드크로스 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="domestic" name="한국 연안 어획량" stroke="#f43f5e" strokeWidth={3} />
            <Line type="monotone" dataKey="import" name="글로벌 수입 의존도" stroke="var(--color-info)" strokeWidth={3} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[안보 붕괴]</strong> 2018년을 기점으로 자급률 곡선이 폭락하며 수입 의존도가 90%에 육박하는 식량 안보 데드크로스 발생.
      </div>
    </div>
  );
}

// 22. HHI 다변화 지수
export function Widget22_ImportHHI() {
  const data = [
    { year: '2010', hhi: 4500, status: '위험' },
    { year: '2015', hhi: 3200, status: '투과' },
    { year: '2020', hhi: 2800, status: '경계' },
    { year: '2023', hhi: 1800, status: '안정' },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>22. 원산지 다변화 허핀달-허쉬만 지수(HHI) </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis domain={[0, 5000]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="hhi" name="집중도 지수(HHI)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.hhi > 3000 ? 'var(--color-danger)' : 'var(--color-success)'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[리스크 분산]</strong> 포클랜드 1국 의존도 60% 이상이던 과거 대비, 페루/칠레/오만/인도로 Sourcing을 강제 다변화하며 독점 지수 하락.
      </div>
    </div>
  );
}

// 23. 수입산 시장 지배력 고착화
export function Widget23_MarketShareFixation() {
  const data = [
    { decade: '2000년대', imported: 20, domestic: 80 },
    { decade: '2010년대', imported: 45, domestic: 55 },
    { decade: '2020년대', imported: 88, domestic: 12 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>23. 글로벌 수입산 시장 점유율 고착화 궤적 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="decade" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(tick) => `${tick}%`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Area type="monotone" dataKey="imported" stackId="1" fill="var(--color-warning)" stroke="var(--color-warning)" name="수입산 소비율" />
            <Area type="monotone" dataKey="domestic" stackId="1" fill="var(--color-info)" stroke="var(--color-info)" name="국산 소비율" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[입맛의 체념]</strong> 국산 '생' 오징어는 최고가 오마카세나 산지 횟집으로 밀려나고, 일반 밥상과 짬뽕은 90% 페루/아르헨산 냉동이 영구 점령.
      </div>
    </div>
  );
}

// 24. 출항-입항 리드타임 분산 (Box Plot Proxy using Composed Chart ranges)
export function Widget24_LeadTime() {
  const data = [
    { origin: '중국(가공)', min: 3, avg: 5, max: 10 },
    { origin: '베트남', min: 7, avg: 10, max: 15 },
    { origin: '칠레/페루', min: 28, avg: 35, max: 45 },
    { origin: '아르헨티나', min: 40, avg: 55, max: 70 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>24. 거점별 냉동 컨테이너 리드타임 편차 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis dataKey="origin" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="avg" name="평균 소요 일수(Days)" fill="#8b5cf6" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[Cash Flow 빙하기]</strong> 남미(아르헨티나) 원물 계약금 지불 후 실제 창고 입고(판매가능)까지 최장 70일의 엄청난 자금 경색(Cash Lock) 구간 발생.
      </div>
    </div>
  );
}

// 25. 창고 체화 vs 소비량 갭
export function Widget25_WarehouseGap() {
  const data = [
    { month: '7월', 입고량: 500, 출고소비: 450 },
    { month: '8월', 입고량: 550, 출고소비: 400 },
    { month: '9월', 입고량: 600, 출고소비: 350 },
    { month: '10월', 입고량: 400, 출고소비: 650 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>25. 콜드체인 창고 체화량 vs 실제 소비 갭 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="입고량" fill="var(--color-info)" fillOpacity={0.6} />
            <Line type="monotone" dataKey="출고소비" stroke="#fcd34d" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[눈치 게임]</strong> 조업 성수기 대량 입고 후, 가격 상승을 기대하며 창고에 쌓아두는 물량이 늘어나 소비 곡선과 크로스됨.
      </div>
    </div>
  );
}

// 26. 위생 통관 딜레이
export function Widget26_CustomsDelay() {
    const data = [
      { cause: '방사능 우려 검사', days: 12 },
      { cause: '중금속 정밀 (페루)', days: 15 },
      { cause: '서류 표기/라벨링', days: 7 },
      { cause: '일반 서류 검사', days: 2 },
    ];
    return (
      <div style={glassContainerStyle}>
        <h3 className={styles.widgetTitle}>26. 식약처 통관 비관세 장벽 딜레이 리스크 </h3>
        <div style={{ height: 250 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <YAxis dataKey="cause" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={110} />
              <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
              <Bar dataKey="days" name="추가 통관 지연(일)" fill="var(--color-danger)" />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.takeawayBox}>
          <strong>[보이지 않는 장벽]</strong> 정밀 검사 대상 지정 시 부두 창고에서 최대 15일 대기. 지체료(Demurrage) 폭탄이 영업 이익률을 1% 포인트 하락시킴.
        </div>
      </div>
    );
}

// 27. B2B 벤더 점유율
export function Widget27_VendorDominance() {
    const data = [
      { vendor: '사조ซี푸드 (메이저)', share: 30 },
      { vendor: '동원 (메이저)', share: 22 },
      { vendor: '신라교역 등 (메이저)', share: 18 },
      { vendor: '기타 (중소수입상)', share: 30 },
    ];
    return (
      <div style={glassContainerStyle}>
        <h3 className={styles.widgetTitle}>27. 상위 수입사(B2B Vendor) 카르텔 지배력 </h3>
        <div style={{ height: 250 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="vendor" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
              <Bar dataKey="share" name="시장 점유율(%)" fill="#6366f1" />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.takeawayBox}>
          <strong>[자본의 독식]</strong> 가격 급등과 통관 리스크 여파로 자금줄이 마른 개미 수입상들은 멸종. 상위 대기업 3사가 시장 물량의 70% 통제.
        </div>
      </div>
    );
}

// 28. 수요 파괴 저항선
export function Widget28_DemandDestruction() {
    const data = [
      { price: '3천원 (평활)', volume: 100 },
      { price: '5천원 (인상)', volume: 85 },
      { price: '7천원 (위기)', volume: 60 },
      { price: '9천원 (파괴)', volume: 15 },
    ];
    return (
      <div style={glassContainerStyle}>
        <h3 className={styles.widgetTitle}>28. B2B 수요 파괴(Demand Destruction) 임계점 </h3>
        <div style={{ height: 250 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="price" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
              <Line type="monotone" dataKey="volume" name="발주 잔존율(%)" stroke="#ec4899" strokeWidth={3} />
            </LineChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.takeawayBox}>
          <strong>[메뉴 삭제]</strong> 도매단가 Kg당 7천원 돌파 시 짬뽕집 사장님들이 레시피에서 오징어를 빼거나 돼지고기로 전량 교체하는 절벽 발생.
        </div>
      </div>
    );
}

// 29. 물가 지수 비교
export function Widget29_InflationIndex() {
    const data = [
      { year: '2019', squid: 100, pork: 100, chicken: 100 },
      { year: '2021', squid: 130, pork: 105, chicken: 110 },
      { year: '2023', squid: 210, pork: 115, chicken: 125 },
    ];
    return (
      <div style={glassContainerStyle}>
        <h3 className={styles.widgetTitle}>29. 오징어 수산물가 지수 vs 돈/계육 인플레 </h3>
        <div style={{ height: 250 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
              <Line type="monotone" dataKey="squid" name="오징어 폭등 궤도" stroke="var(--color-danger)" strokeWidth={3} />
              <Line type="monotone" dataKey="pork" name="돈육 지수" stroke="var(--color-success)" />
              <Line type="monotone" dataKey="chicken" name="계육 지수" stroke="#fcd34d" />
            </LineChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.takeawayBox}>
          <strong>[금징어 쇼크]</strong> 타 단백질(돼지, 닭) 대비 4년간 인플레이션 스택이 5배 가파르게 쌓이며 서민 식재료의 지위 완전 상실.
        </div>
      </div>
    );
}

// 30. 소비 채널 믹스 이동
export function Widget30_ChannelMix() {
    const data = [
      { year: '2015', b2c_mart: 60, b2b_franchise: 30, online: 10 },
      { year: '2023', b2c_mart: 25, b2b_franchise: 45, online: 30 },
    ];
    return (
      <div style={glassContainerStyle}>
        <h3 className={styles.widgetTitle}>30. 엔드유저 유통 채널(Channel Mix) 이탈 </h3>
        <div style={{ height: 250 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" stackOffset="expand">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t*100}%`}/>
              <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
              <Bar dataKey="b2c_mart" stackId="a" name="전통/대형마트 원물" fill="#06b6d4" />
              <Bar dataKey="b2b_franchise" stackId="a" name="외식/반찬 B2B 가공품" fill="var(--color-warning)" />
              <Bar dataKey="online" stackId="a" name="밀키트 등 HMR" fill="var(--color-info)" />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.takeawayBox}>
          <strong>[가공품 지배]</strong> 원물을 사서 요리하는 오프라인 주부 수요가 증발하고, 공장 가공을 거친 냉동 링/비닐팩 밀키트 형태가 장악.
        </div>
      </div>
    );
}
