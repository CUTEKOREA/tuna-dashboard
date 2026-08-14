'use client'

import { useCosmoNavigation } from '../CosmoNavigation'

/**
 * 공개 소개 페이지.
 *
 * 대시보드 본체는 전부 Basic Auth 뒤에 있어서 링크를 공유해도 크롤러가 401 을 받아
 * 미리보기 카드가 만들어지지 않는다. 이 페이지만 인증 밖에 두어 카드가 뜨게 한다.
 *
 * ⚠️ 여기에는 **경영 수치를 한 줄도 넣지 않는다.** 공개 페이지이므로
 *    제목·용도·접근 안내까지만 담는다. 지표·금액·거래처명은 금지.
 */

const TITLE = 'COSMO 경영 대시보드'
const BOARDS = [
  ['경영요약', '이상 신호와 핵심 수치'],
  ['손익 · 원가', '월별 손익과 원가 구조'],
  ['판매 · 수주', '품목별 매출과 견적 마진'],
  ['생산', '계획대비 갭의 요인 분해'],
  ['구매 · 재고', '원어 단가와 자재 소진'],
  ['자금', '현금흐름과 통화 노출'],
  ['시장 · 바이어', '수출 시장 구조와 단가 포지션'],
  ['장기 추이', '연간 실적 대비 현재 위치'],
  ['데이터 품질', '정합성 검산과 한계'],
]

export default function Share() {
  const navigate = useCosmoNavigation()

  return (
    <div className="sharewrap">
      <div className="sharecard">
        <div className="brand"><span className="bar" /><span>COSMO</span></div>
        <h1>{TITLE}</h1>
        <p className="lead">
          가나 COSMO 참치캔공장의 <b>주간 운영 · 월별 손익 · 수출 시장</b>을 한 화면에서 봅니다.
          주간보고 원본에서 읽기 전용으로 추출하고, 원본과 대조 검증을 거친 수치만 싣습니다.
        </p>

        <div className="sharegrid">
          {BOARDS.map(([n, d]) => (
            <div className="shareitem" key={n}>
              <span className="n">{n}</span>
              <span className="d">{d}</span>
            </div>
          ))}
        </div>

        <div className="sharenote">
          <b>열람에는 참치왕국 세션 접근 확인이 필요합니다.</b> 대외비 자료이므로 접근 번호는 담당자에게 문의하십시오.
        </div>

        <button type="button" className="sharebtn" onClick={() => navigate('home')}>
          대시보드 열기 →
        </button>

        <div className="sharefoot">
          미경1팀 · 대외비 · 검색엔진 색인 차단
        </div>
      </div>
    </div>
  )
}
