# 디자인 랩 5라운드 시안 브리프 (에이전트 공용)

## 배경

- 히어로 루프는 4라운드에 수렴·채택 완료 (지휘형, 주식 컬러). 5라운드는 남은 두 위젯의 다변화.
- 뉴스 위젯 ★3 (지적: 기사 제목 정보량 — 미리보기 1줄로 이미 반영됨), 필터 바 ★3 (무코멘트 —
  다양화로 취향을 끌어내는 라운드).

## 공통 계약 (r3 브리프 승계 + 추가)

1. 파일 1개 = 시안 1개. `components/design-lab/r5/<이름>.tsx`, default export React 컴포넌트.
2. **실데이터 의무** — 뉴스 시안은 `../../../lib/data/daily-briefing`의 `dailyBriefing`·
   `buildBriefingImpactNumbers`·`categorizeBriefingTitle` 사용 (fetch 불필요, 정적 모듈).
   수치·기사 창작 금지. 필터 시안은 상호작용 UI라 자체 더미 상태 허용 —
   단 «시안 미리보기 — 더미 상태» 캡션 의무.
3. 주식 컨벤션 증감색은 전역 토큰: `var(--delta-up)` 상승, `var(--delta-down)` 하락.
4. 컨테이너 기본 `dsc-card` + inline style. 본문 `var(--text-main)`, 보조 `var(--text-muted)`,
   보더 `var(--card-border, #e2e4e9)`. 웨이트 400/700/900만. 한글 100%, 기준일 표기.
5. hover 인터랙션 환영 (카드 리프트 translateY(-2px), 취향 검증됨). recharts 쓰면 고정 width +
   `isAnimationActive={false}`. 신규 의존성·CSS 파일 금지.
6. TypeScript strict — `npx tsc --noEmit` 0 에러.

## 시안 정의 (담당별)

| 파일 | 컨셉 |
| --- | --- |
| NewsFrontPage.tsx | **신문 1면형** — 리드 기사 초대형 헤드라인(900)+첫 문단 2~3줄, 우측 임팩트 넘버 세로 스택, 아래 나머지 기사 2단 컬럼(제목+첫 문장). 접기 없이 전부 펼침(취향 ⑥) |
| NewsWire.tsx | **와이어형** — 임팩트 넘버 가로 스트립 상단, 기사 전체를 시간순 테이블(배지·제목·첫 문장 1줄)로. 행 hover 리프트. 밀도 지향 |
| FilterUnderline.tsx | **언더라인 탭형** — 기간·입도를 pill 대신 활성=액센트 굵은 언더라인 탭으로 (V3 스펙의 PillTabs 언더라인 변형 실물). 활성 900 웨이트 |
| FilterSegment.tsx | **세그먼트형** — 한 덩어리 트랙 안에서 활성 배경이 슬라이딩하는 세그먼트 컨트롤 (transition transform). 활성 = 흰 배경+잉크, 트랙 = 연회색 |

## 검수 기준

- 5초 가독. 실데이터(뉴스). 취향 7조 위반 없음. tsc 통과.
