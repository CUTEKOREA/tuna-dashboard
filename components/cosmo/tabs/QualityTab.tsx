'use client'
import { SERIES } from '../palette'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import { checks, weeks, meta, usd, num, pct, latest, latestMonth, pastWeeks } from '@/lib/data/cosmo'

const SERIES_COLORS = SERIES
const isMt = (name: string) => name.includes('생산')
const k = (v: number) => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'k' : num(v, 0))

/** 검산 잔차의 단위는 검산 종류마다 다르다 — 금액 검산은 USD, 생산 브릿지는 MT */
const resid = (name: string, v: number) => (isMt(name) ? num(v, 2) + ' MT' : usd(v, 2))

/** 알려진 원본 데이터 이슈. 데이터가 아니라 추출 과정의 문서화이므로 여기에 직접 적는다. */
const ISSUES = [
  {
    area: '판매현황',
    issue: "2026 2주차까지 '판매' 블록에 '비중' 열이 있어 '누적' 블록이 한 칸 오른쪽으로 밀려 있음. 3주차부터 해당 열 제거.",
    fix: '열 위치를 고정하지 않고, 매 주차 머리행을 탐지해 블록별 열 인덱스를 다시 계산.',
  },
  {
    area: '품목 라벨',
    issue: "32주차부터 품목명이 RETAIL/CATERING 에서 리테일/캐터링 으로 바뀜.",
    fix: '별칭 매핑 테이블로 같은 품목 코드에 묶음. 코드(RETAIL·CATERING)를 기준으로 집계.',
  },
  {
    area: '머리글 표기',
    issue: "머리글에 자간 공백이 들어감 — '구 분', '판 매', '누 적'.",
    fix: '비교 전에 모든 공백을 제거한 문자열로 정규화한 뒤 머리행을 판정.',
  },
  {
    area: '판매 누적',
    issue: '1주차 누적값이 주간값과 맞지 않음. 전년(2025년) 누계가 이월된 잔존값.',
    fix: '1주차 누적은 주간값으로 재계산. 원본 이월값은 salesCumUsdRaw 필드에 그대로 보존.',
  },
  {
    area: '결측 주차',
    issue: meta.missingWeeks.length
      ? `원본 파일이 없는 주차 — 2026 ${meta.missingWeeks.join(', ')}주차, 2025 52주차.`
      : '2026년은 원본이 모두 확보돼 결측이 없다(16주차 후속 반영). 2025년은 52주차가 없다.',
    fix: '보간하지 않고 결측으로 표시. 직전 주를 참조하는 연결 검산(이월·브릿지)은 해당 주차를 검산에서 제외. 원본이 뒤늦게 들어오면 재추출만으로 자동 해소된다.',
  },
  {
    area: '파일명',
    issue: '파일명이 macOS NFD(자모 분리)로 저장되어 있고, 31주차 파일명은 끝에 공백이 붙어 있음.',
    fix: '파일명을 NFC 로 정규화하고 앞뒤 공백을 제거한 뒤 주차 번호를 파싱.',
  },
  {
    area: '영업현황',
    issue: '견적 블록의 행 수가 주차마다 다름(0~24행). 고정 범위로 읽으면 누락 또는 빈 행 혼입.',
    fix: '머리행을 탐지한 뒤 빈 행을 만날 때까지 순회. 그 결과가 견적 ' + meta.quoteCount + '건.',
  },
]

export default function Quality() {
  const names = [...new Set(checks.map((c) => c.name))]
  const fails = checks.filter((c) => !c.ok)
  const gaps = checks.filter((c) => c.gap)
  const byName = names.map((name) => {
    const all = checks.filter((c) => c.name === name)
    const judged = all.filter((c) => !c.gap)
    return {
      name,
      total: all.length,
      fail: all.filter((c) => !c.ok).length,
      skip: all.filter((c) => c.gap).length,
      max: judged.length ? Math.max(...judged.map((c) => Math.abs(c.residual))) : 0,
    }
  })
  const worst = [...fails].sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual))[0]
  const worstGap = [...gaps].sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual))[0]

  // 잔차 추이 — 검산 제외(gap) 건은 잔차가 커도 판정 대상이 아니므로 뺀다
  const weekList = [...new Set(checks.map((c) => c.week))].sort((a, b) => a - b)
  const trend = weekList.map((w) => {
    const row: Record<string, unknown> = { label: `${w}주` }
    names.forEach((name, i) => {
      const c = checks.find((x) => x.week === w && x.name === name && !x.gap)
      row[`c${i}`] = c ? Math.abs(c.residual) : null
    })
    return row
  })
  const serie = (name: string) => ({
    key: `c${names.indexOf(name)}`,
    name,
    color: SERIES_COLORS[names.indexOf(name) % SERIES_COLORS.length],
    fmt: (v: number) => resid(name, v),
  })
  const usdNames = names.filter((x) => !isMt(x))
  const mtNames = names.filter(isMt)

  const failWeeks = [...new Set(fails.map((c) => c.week))]
  const generated = meta.generated.slice(0, 16).replace('T', ' ')

  return (
    <>
      <PageHead
        title="데이터 품질"
        lead={`이 대시보드의 수치를 어디까지 믿을 수 있는지 보여주는 화면입니다. 원본 주간보고 ${meta.weekCount}개 파일에서 추출한 값에 ${meta.checkCount}건의 정합성 검산을 걸었고, 그중 ${meta.checkFailCount}건이 허용 잔차를 넘었습니다. 넘은 건을 지우지 않고 그대로 싣습니다.`}
        meta={[
          `검산 ${meta.checkCount}건 · 이상 ${meta.checkFailCount}건 (${pct(meta.checkFailCount / meta.checkCount, 1)})`,
          `원본 ${meta.weekCount}주차 (결측 ${meta.missingWeeks.join(',') || '없음'})`,
          `견적 ${meta.quoteCount}건`,
          `생성 ${generated}`,
        ]}
      />

      <SecHead>핵심 수치</SecHead>
      <div className="grid g3">
        <Card>
          <Kpi k="검산 총건수" v={num(meta.checkCount)} unit="건"
            d={`검산 ${names.length}종 × 주차별`} />
        </Card>
        <Card>
          <Kpi k="이상 건수" v={num(meta.checkFailCount)} unit="건"
            tone={meta.checkFailCount === 0 ? 'up' : 'down'}
            d={`전체의 ${pct(meta.checkFailCount / meta.checkCount, 1)} · ${failWeeks.length}개 주차에 분포`} />
        </Card>
        <Card>
          <Kpi k="검산 제외" v={num(gaps.length)} unit="건"
            tone="flat"
            d={meta.missingWeeks.length
              ? `직전 주 결측(${meta.missingWeeks.join(',')}주차)으로 연결 검산 불가`
              : '결측 없음 — 전 구간 연결 검산 성립'} />
        </Card>
        <Card>
          <Kpi k="결측 주차" v={meta.missingWeeks.length ? meta.missingWeeks.join(', ') : '없음'} unit={meta.missingWeeks.length ? '주차' : undefined}
            tone="flat" d="원본 파일 부재 · 보간하지 않음" />
        </Card>
        <Card>
          <Kpi k="원본 주차 수" v={num(meta.weekCount)} unit="개"
            d={`${meta.weekRange[0]}~${meta.weekRange[1]}주차 · 파일별 SHA-256 기록`} />
        </Card>
        <Card>
          <Kpi k="견적 건수" v={num(meta.quoteCount)} unit="건"
            d={`영업현황 시트에서 추출 · 추출 시각 ${generated}`} />
        </Card>
      </div>

      <SecHead id="sec-fail">이상 건</SecHead>
      <Card
        title={`허용 잔차를 넘은 ${fails.length}건`}
        sub="전체 검산 중 판정이 이상인 건만 추렸습니다. 아래 전체 표에도 같은 행이 붉게 표시됩니다."
        note={<>이상 {fails.length}건은 {failWeeks.length}개 주차에 흩어져 있고, 가장 큰 잔차는
          <b> {worst ? `${worst.week}주차 ${worst.name} ${resid(worst.name, worst.residual)}` : '—'}</b>입니다.
          {byName.filter((b) => b.fail > 0).map((b) => `${b.name} ${b.fail}건`).join(', ')} 순으로,
          <b> 원본 표 안에서 기초·이월값이 앞뒤 주차와 맞지 않는 유형</b>에 몰려 있습니다.
          이 건들은 값을 고치지 않고 원본 그대로 두었으므로, 해당 주차의 재고·판매 누적값은 주간값과 어긋날 수 있습니다.</>}
      >
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>주차</th>
                <th>검산명</th>
                <th className="n">잔차</th>
                <th>검산식</th>
              </tr>
            </thead>
            <tbody>
              {fails.map((c) => (
                <tr key={`${c.week}-${c.name}`} className="bad">
                  <td>{c.week}주</td>
                  <td>{c.name}</td>
                  <td className="n">{resid(c.name, c.residual)}</td>
                  <td>{c.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>검산명별 집계</SecHead>
      <Card
        title="검산 종류별 건수"
        sub="주차마다 같은 검산을 반복해 걸었습니다. 잔차 단위는 금액 검산 USD, 생산 브릿지 MT."
        note={<>재고·자금 항등식(같은 주 안에서 기초+입고−출고=잔액)은 거의 전부 통과합니다.
          이상은 <b>주차를 잇는 검산</b>(재고 이월·판매 누적 브릿지)에 몰려 있어,
          한 주차 안의 표는 정합하지만 <b>주차 간 연결이 원본 단계에서 끊긴다</b>는 뜻입니다.
          생산 누적 브릿지는 {byName.filter((b) => isMt(b.name)).reduce((a, b) => a + b.total, 0)}건 중
          {byName.filter((b) => isMt(b.name)).reduce((a, b) => a + b.fail, 0)}건만 어긋나 생산 수치의 연결은 신뢰할 만합니다.</>}
      >
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>검산명</th>
                <th className="n">총건수</th>
                <th className="n">이상 건수</th>
                <th className="n">이상률</th>
                <th className="n">검산 제외</th>
                <th className="n">최대 잔차</th>
              </tr>
            </thead>
            <tbody>
              {byName.map((b) => (
                <tr key={b.name} className={b.fail > 0 ? 'bad' : undefined}>
                  <td>{b.name}</td>
                  <td className="n">{num(b.total)}</td>
                  <td className="n">{num(b.fail)}</td>
                  <td className="n">{pct(b.fail / b.total, 1)}</td>
                  <td className="n">{b.skip ? num(b.skip) : '—'}</td>
                  <td className="n">{resid(b.name, b.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>잔차 추이</SecHead>
      <div className="grid g2">
        <Card
          title="금액 검산 잔차 (USD)"
          sub="주차별 잔차 절대값. 재고·자금·판매 검산. 검산 제외 주차는 선이 끊깁니다."
          note={<>{(() => {
            const t = byName.filter((b) => !isMt(b.name)).sort((a, b) => b.max - a.max)[0]
            return <>가장 큰 잔차는 <b>{t.name} {usd(t.max, 0)}</b>입니다. </>
          })()}
            이상이 특정 시점에 몰리기보다 연중 흩어져 있어, 한 번의 사고가 아니라
            <b> 원본 작성 관행에서 반복되는 어긋남</b>으로 읽힙니다. {meta.missingWeeks.join(',')}주차는 원본이 없어 값이 비어 있습니다.</>}
        >
          <Legend items={usdNames.map((x) => ({ name: x, color: SERIES_COLORS[names.indexOf(x) % SERIES_COLORS.length] }))} />
          <Chart
            data={trend} x="label" height={260} yFmt={k} xInterval={3}
            series={usdNames.map(serie)}
          />
        </Card>

        <Card
          title="생산 브릿지 잔차 (MT)"
          sub="CBU·FBU 누적 브릿지 — 전주누적 + 금주 − 금주누적."
          note={<>대부분 0에 붙어 있습니다. {(() => {
            const f = fails.filter((c) => isMt(c.name))
            return f.length
              ? <>어긋난 건은 <b>{f.map((c) => `${c.week}주차 ${c.name} ${resid(c.name, c.residual)}`).join(', ')}</b>로 반올림 수준입니다.</>
              : <>판정 대상 전 구간에서 이상이 없습니다.</>
          })()} 생산량 계열은 주차 간 연결이 끊기지 않아, 누적 원어처리량·수율 추이를 그대로 사용할 수 있습니다.</>}
        >
          <Legend items={mtNames.map((x) => ({ name: x, color: SERIES_COLORS[names.indexOf(x) % SERIES_COLORS.length] }))} />
          <Chart
            data={trend} x="label" height={260} yFmt={(v) => num(v, 2)} xInterval={3}
            series={mtNames.map(serie)}
          />
        </Card>
      </div>

      <SecHead>전체 검산 결과</SecHead>
      <Card
        title={`검산 ${checks.length}건 전체`}
        sub={gaps.length
          ? '붉은 행은 허용 잔차 초과, 노란 행은 직전 주 결측으로 검산에서 제외한 건.'
          : '붉은 행은 허용 잔차 초과. 결측이 없어 제외 처리된 건은 없다.'}
        note={<>제외 {gaps.length}건은 모두 {[...new Set(gaps.map((c) => c.week))].join(',')}주차로,
          {meta.missingWeeks.length
            ? <>직전 {meta.missingWeeks.join(',')}주차 원본이 없어 <b>전주 값을 참조할 수 없는 구조적 결측</b>입니다.</>
            : <>현재 결측 주차가 없어 <b>전 구간에서 연결 검산이 성립</b>합니다.</>}
          잔차 자체는 크게 잡히지만{worstGap ? ` (${worstGap.name} ${resid(worstGap.name, Math.abs(worstGap.residual))} 등)` : ''} 데이터 오류가 아니므로 이상 건에서 뺐습니다.</>}
      >
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>주차</th>
                <th>검산명</th>
                <th className="n">잔차</th>
                <th>판정</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={`${c.week}-${c.name}`} className={!c.ok ? 'bad' : c.gap ? 'warn' : undefined}>
                  <td>{c.week}주</td>
                  <td>{c.name}</td>
                  <td className="n">{resid(c.name, c.residual)}</td>
                  <td>
                    <span className={`pill ${!c.ok ? 'bad' : c.gap ? 'warn' : 'ok'}`}>
                      {!c.ok ? '이상' : c.gap ? '제외' : '정상'}
                    </span>
                  </td>
                  <td>{c.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>이 대시보드가 답하지 못하는 것</SecHead>
      <Card
        title="구조적 한계 4종"
        sub="데이터가 없어서 못 하는 것과, 데이터가 틀려서 못 하는 것은 다르다. 아래는 전자다."
        note={<>이 표의 항목은 <b>고치는 게 아니라 채워 넣어야</b> 해소된다. 특히 <b>판매 계획</b>은 원본의
          계획대비 칸이 {meta.weekCount}주 내내 0이라, 판매·수주 보드에는 계획 대비 개념이 아예 없다 —
          없는 것을 못 봤다고 오해하지 않도록 각 보드 상단에도 표기한다.</>}
      >
        <div className="tw">
          <table>
            <thead>
              <tr><th>한계</th><th>영향 받는 보드</th><th>해소 조건</th></tr>
            </thead>
            <tbody>
              <tr className="warn">
                <td><b>손익 {latestMonth.month}월 / 운영 {latest.week}주차</b><br />
                  <span style={{ color: 'var(--cosmo-muted)' }}>두 계층 사이 시차</span></td>
                <td>경영요약 · 손익·원가</td>
                <td>2026년 {latestMonth.month + 1}월 이후 월별 손익 입수 → <code>npm run data</code> 재실행만으로 반영</td>
              </tr>
              <tr className="bad">
                <td><b>판매 계획 부재</b><br />
                  <span style={{ color: 'var(--cosmo-muted)' }}>원본 계획대비 칸이 전 주차 0</span></td>
                <td>경영요약 · 판매·수주</td>
                <td>연간 사업계획의 판매 목표 확보. 그전까지는 전년 동기 대비로 대체</td>
              </tr>
              <tr>
                <td><b>{meta.missingWeeks.length
                  ? `${meta.missingWeeks.map((w) => `W${w}`).join(', ')} 결측`
                  : '2026년 결측 해소'}</b><br />
                  <span style={{ color: 'var(--cosmo-muted)' }}>
                    {meta.missingWeeks.length ? '보간하지 않고 비워 둠' : '2025년은 W52 미확보'}</span></td>
                <td>{meta.missingWeeks.length ? '전 보드 주간 계열' : '장기 추이(2025 비교)'}</td>
                <td>{meta.missingWeeks.length
                  ? '해당 주차 첨부파일 확보. 주간 연결 검산은 그 구간만 제외 처리 중'
                  : '2026년은 전 주차 확보돼 연결 검산이 전 구간 성립. 2025년 W52 확보 시 전년 비교가 완결'}</td>
              </tr>
              <tr>
                <td><b>2025 표본 {pastWeeks.length}주 확보</b><br />
                  <span style={{ color: 'var(--cosmo-muted)' }}>
                    {pastWeeks.length >= 45 ? '전년 동기 비교 가능' : '구간 제한'}</span></td>
                <td>생산 · 장기 추이</td>
                <td>{pastWeeks.length >= 45
                  ? '동일 주차 구간으로 계절성 통제된 비교가 성립. 2025 W24·W52만 미확보'
                  : '2025년 전주차 확보 시 전년 동기 비교가 연중 전체로 확장'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>알려진 데이터 이슈</SecHead>
      <Card
        title={`원본 처리 과정에서 확인한 ${ISSUES.length}건`}
        sub="원본 엑셀의 서식·표기가 주차마다 달라 생긴 문제와, 추출 단계에서 각각을 어떻게 처리했는지."
        note={<>모두 <b>추출 시점에 발견해 처리한</b> 항목입니다. 열 위치·라벨·파일명처럼 사람이 손으로 바꾼 부분은
          고정 좌표 대신 머리행 탐지와 정규화로 흡수했고, 결측과 이월값은 <b>추정으로 메우지 않고</b> 결측 표시 또는 원본 보존으로 두었습니다.
          이 표에 없는 유형의 서식 변경이 이후 주차에 생기면 추출값이 어긋날 수 있습니다.</>}
      >
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th className="n">#</th>
                <th>영역</th>
                <th>이슈</th>
                <th>처리 방식</th>
              </tr>
            </thead>
            <tbody>
              {ISSUES.map((it, i) => (
                <tr key={it.area + i}>
                  <td className="n">{i + 1}</td>
                  <td><span className="tag">{it.area}</span></td>
                  <td>{it.issue}</td>
                  <td>{it.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>데이터 출처</SecHead>
      <Card
        title={`원본 파일 ${weeks.length}개`}
        sub="주차별 원본 파일명과 SHA-256 해시 앞 16자. 해시가 같으면 같은 파일에서 읽은 값입니다."
        note={<>모든 수치는 이 파일들에서 <b>읽기 전용으로 추출했으며 원본은 수정하지 않았습니다</b>.
          해시를 함께 남긴 이유는 원본이 나중에 갱신되면 이 대시보드의 수치와 어긋날 수 있기 때문입니다.
          {meta.missingWeeks.join(',')}주차는 목록에 없습니다 — 파일 자체가 없습니다.
          추출 시각은 {generated}, 원본 위치는 {meta.sourceDir} 입니다.</>}
      >
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th className="n">주차</th>
                <th>원본 파일명</th>
                <th>SHA-256 (앞 16자)</th>
                <th>기간</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.week}>
                  <td className="n">{w.week}주</td>
                  <td>{w.source}</td>
                  <td className="n">{w.sha256.slice(0, 16)}</td>
                  <td className="n">{w.periodStart ?? '—'} ~ {w.periodEnd ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ marginTop: 18 }}>
        <Callout kind="warn" label="어디까지 믿을 수 있나">
          검산 {meta.checkCount}건 중 {meta.checkCount - meta.checkFailCount - gaps.length}건이 통과했습니다
          ({pct((meta.checkCount - meta.checkFailCount - gaps.length) / meta.checkCount, 1)}).
          <b> 생산 계열</b>은 원어처리량 누적이 {fails.filter((c) => c.name.includes('생산 누적')).length}건,
          <b>생산일수 누계가 {fails.filter((c) => c.name.includes('생산일수')).length}건</b>
          ({fails.filter((c) => c.name.includes('생산일수')).map((c) => `${c.week}주`).join('·') || '없음'}) 어긋납니다.
          생산일수가 틀어지면 <b>일 처리량(= 원어 ÷ 생산일)이 함께 틀어져</b> 생산 보드 차트에 실제보다 높은 값이
          찍힐 수 있으므로, 해당 주차 부근의 일 처리량은 단일 값으로 인용하지 말고 추세로 읽어야 합니다.
          <b> 재고·판매 누적</b>은 주차 간 이월에서 {fails.filter((c) => !isMt(c.name)).length}건이 어긋나므로,
          특정 주차의 누적값 하나를 근거로 결론을 내리지 말고 추세로 읽어야 합니다.
          {meta.missingWeeks.join(',')}주차는 원본이 없어 그 구간의 주간값은 존재하지 않으며 보간하지 않았습니다.
          견적 {meta.quoteCount}건은 사내 계산값이라 별도 검산 대상이 아닙니다.
          이 페이지의 모든 판정은 {generated} 기준 원본 {weeks.length}개 파일에서 나왔습니다.
        </Callout>
      </div>
    </>
  )
}
