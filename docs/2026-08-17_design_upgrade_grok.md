# 시장 이해 페이지 디자인 고도화 제안 — Grok 4.6 (2026-08-17)

밸류체인 학습 페이지의 현재 레이아웃·룰북을 먼저 확인한 뒤, 네 가지 문제마다 구현 가능한 레이아웃 개선안을 정리하겠습니다.현재 학습 페이지의 레이아웃·탭·사실표 구현을 확인한 뒤, 데이터 저널리즘에서 쓰는 읽기 흐름 패턴과 맞춰 보겠습니다.학습 페이지는 운영 대시보드와 분리된 별도 셸로 보입니다. 참치·오징어 산업 페이지의 실제 마크업을 찾겠습니다.핵심 셸은 `market-understanding`입니다. CSS와 단계 탭·사실표 마크업을 읽겠습니다.단계 본문·탭·사실표 렌더와 기존 분기도(`ValueChainSpine`)를 이어서 보겠습니다.내부 기획과 사실표 데이터 형태를 확인한 뒤, 저널리즘에서 검증된 레이아웃 패턴을 맞춰 보겠습니다.네 문제의 뿌리는 같습니다. 이 페이지는 **설명문**인데, 껍데기는 **운영 대시보드**입니다.

원래 기획(`docs/2026-08-16_tuna_market_understanding_plan.md`)은 “번호가 정보를 담고, 스크롤을 따라가면 한 마리의 경로가 된다”였습니다. 구현은 `PillTabs`로 단계를 갈아끼웁니다. 서술(`38rem`, `--mu-ink-soft`)은 무게가 없고, 차트·위젯은 글래스 카드 + 2열 + 높이 280이라 눈이 거기로 갑니다.

아래는 장식 없이, 지금 CSS 모듈에 바로 넣을 수 있는 안입니다. 데이터·문장·위젯 클레임은 건드리지 않습니다.

---

## 0. 페이지 골격을 이렇게 바꿉니다

```
히어로 KPI
30초 브리핑
[사슬 스테퍼 01—07]     ← 탭 대체. 선으로 연결
[횡단 축 A·B·C]         ← 사슬과 시각적으로 분리
──── sticky ────
단계 머리(번호·질문·리드)
핵심 수치 1개            ← 차트보다 먼저 읽히는 훅
서술 4~6문단             ┐
용어 칩                  │ 데스크톱: 왼쪽 38rem
사실 목록                │ 오른쪽: 근거 레일(차트 1~2)
──── 근거 ────           ┘
나머지 차트 (크롬 제거)
위젯 (접힌 「더 파고들기」)
이 단계가 넘기는 것 + 다음 →
출처와 한계
```

참치는 이미 `ValueChainSpine`이 있습니다. **내비는 스파인/스테퍼 하나만** 남기고 `PillTabs`는 이 페이지에서 뺍니다. 오징어는 갈래가 없으니 단일 레인 스테퍼를 새로 둡니다.

---

## 1. 읽는 순서 — 차트를 근거로 낮추고, 주장을 먼저 읽힌다

### 원인

`StageSection` 순서는 서술 → 사실표 → 차트 → 위젯이 맞습니다. 그런데 시각 무게가 반대입니다.

| | 서술 `.prose p` | 차트 `.catchFigure` |
|---|---|---|
| 폭 | `max-width: 38rem` | 부모 전체, 2열 |
| 표면 | 없음 | `--mu-surface` + 테두리 + `radius: 16` |
| 색 | `--mu-ink-soft` | 시리즈 원색 |
| 높이 | 문단 | 슬롯 ~280 |

나이엘슨 노먼의 스캔 패턴대로면 큰 색면이 문단보다 먼저 잡힙니다. 카이로(`The Functional Art`)의 원칙은 **차트는 주장의 증거**이지 주인공이 아니라는 것입니다.

### 검증된 패턴

- **Martini glass** (Segel & Heer, *Narrative Visualization*, IEEE TVCG 2010): 앞부분은 저자가 순서를 잡고, 증거 탐색은 뒤에 엽니다. 30초 브리핑 + 리드 + 핵심 수치가 줄기, 차트·위젯이 그릇입니다.
- **NYT Upshot / Reuters Graphics**: 주장 한 줄 → 그 주장을 증명하는 그림 하나 → 본문. 그림 제목은 대시보드 카드가 아니라 **캡션**입니다.
- **Tufte data-ink**: 차트 주변 글래스·이중 제목·배지를 줄이면 그림이 문단과 같은 계층이 됩니다.

### 추천 — 데스크톱 2열 + 차트 크롬 제거

**A안 (추천).** `≥1100px`에서 단계 본문을 주장 열 / 근거 레일로 나눕니다. 레일에는 **이 단계 질문이 가리키는 차트 1~2장만** 올립니다. 나머지 차트와 위젯은 본문 아래 「근거」로 내립니다.

```css
.stage {
  display: grid;
  grid-template-columns: minmax(0, 38rem) minmax(16rem, 1fr);
  column-gap: 2.5rem;
  row-gap: 1.25rem;
  align-items: start;
}

.stageHeader,
.lede,
.prose,
.termRow,
.factWrap { grid-column: 1; }

.evidenceRail {
  grid-column: 2;
  grid-row: 1 / span 6;
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 1099px) {
  .stage { grid-template-columns: minmax(0, 38rem); }
  .evidenceRail {
    grid-column: 1;
    grid-row: auto;
    position: static;
    /* 리드 직후, 본문 앞 */
    order: 0;
  }
}
```

차트는 카드가 아니라 캡션 달린 그림입니다.

```css
.catchFigure {
  margin: 0;
  padding: 0.75rem 0 0;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--mu-line);
  border-radius: 0;
}

.catchCaption {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.catchCaption strong {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--mu-ink); /* 제목이 아니라 한 줄 주장 */
}

.catchCaption span {
  font-size: 0.75rem;
  color: var(--mu-ink-muted);
}

/* 위젯 기본 280보다 낮게 — 문단보다 커지지 않게 */
.evidenceRail .catchFigure :global(.recharts-responsive-container) {
  max-height: 200px;
}
```

서술은 한 단계 올립니다. 지금 `--mu-ink-soft`는 “부가 설명” 색이라 본체가 부가처럼 보입니다.

```css
.lede {
  max-width: 38rem;
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--mu-ink);
  border-left: 3px solid var(--mu-accent);
  padding-left: 0.875rem;
}

.prose p {
  font-size: 1rem;          /* 0.9375 → 1 */
  line-height: 1.85;
  color: var(--mu-ink);     /* ink-soft 폐기 */
}

.prose p + p { margin-top: 0.875rem; }
```

리드 바로 아래 **핵심 수치 1개**를 사실표에서 뽑아 올립니다. 차트가 아니라 숫자가 훅입니다.

```css
.keyFact {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 0.75rem;
  max-width: 38rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--mu-line);
}

.keyFactValue {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--mu-ink);
}

.keyFactLabel {
  font-size: 0.8125rem;
  color: var(--mu-ink-muted);
}
```

위젯 격자는 기본 펼침을 접습니다. `<details>`의 요약은 「더 파고들기 · 위젯 n개」. 마트니 글라스의 그릇입니다.

**B안.** 문단 사이에 차트를 끼웁니다(Upshot식). 문단–차트 매핑을 콘텐츠에 넣어야 해서 이번 패스에는 과합니다.

**버린 안.** 차트를 `<details>`로 전부 접기 — 근거가 사라집니다. 스크롤 재킹 스토리텔링 — 10단계 × 문단+차트면 한 페이지가 감당하지 못합니다.

### 접근성

- `<figure>` / `<figcaption>`은 유지. 캡션 `id`를 문단 `aria-describedby`로 묶으면 “이 문장의 근거”가 스크린리더에도 남습니다.
- 단계가 바뀌면 포커스를 `h2#stage-{key}`로 옮깁니다(WCAG 2.4.3). 챕터 전체를 `aria-live`로 읽히지 않습니다.
- 차트 등장 애니메이션은 넣지 않습니다. 넣더라도 `transform`/`opacity`만, `prefers-reduced-motion: reduce`면 0ms.
- 위젯 `<details>`는 네이티브라 키보드·스크린리더가 무료로 따라옵니다.

---

## 2. 사실표 — 5열을 좁은 화면에서 카드로 바꾼다

### 원인

`.factWrap { overflow-x: auto }` + `th { min-width: 12rem }`이라 375px에서 표가 잘리고, 값·출처가 한 화면에 안 보입니다. `keep-all`이 긴 출처를 더 밀어냅니다.

### 검증된 패턴

- **Adrian Roselli** (*Tables, CSS Display Properties, And ARIA*, 2018; *Under-Engineered Responsive Tables*, 2020): `display: block`으로 표를 카드처럼 바꾸면 **일부 브라우저에서 표 의미가 붕괴**합니다. ARIA role을 되새기지 않을 거면 하지 마십시오.
- **GOV.UK Summary list**: 좁은 화면의 키–값은 `<dl>`/스택이지, 가로 스크롤 표가 아닙니다.
- **Smashing Magazine** (2022, 접근성 있는 반응형 표): 열 우선순위를 정하고, 숨긴 열은 호버가 아니라 **항상 보이는 보조 줄**에 둡니다. 터치는 호버가 없습니다.

### 추천 — 같은 데이터, 두 마크업

`≥721px`는 지금 5열 표를 유지합니다. `<720px`는 표를 `hidden`으로 두고 **별도 목록**을 렌더합니다. 표를 CSS로 접지 않습니다.

```tsx
<div className={styles.factDesktop}>
  <table className={styles.factTable}>{/* 기존 5열 */}</table>
</div>

<ul className={styles.factList}>
  {rows.map((row) => (
    <li key={row.label}>
      <div className={styles.factHead}>
        <span className={styles.factLabel}>{row.label}</span>
        <span className={styles.grade} data-grade={row.grade}>
          신뢰 {row.grade}
        </span>
      </div>
      <p className={styles.factValue}>{row.value}</p>
      <p className={styles.factMeta}>
        {row.asOf} · {row.source}
      </p>
      {row.note ? <p className={styles.factNote}>{row.note}</p> : null}
    </li>
  ))}
</ul>
```

```css
.factList { display: none; }

@media (max-width: 720px) {
  .factDesktop { display: none; }
  .factList {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--mu-line);
  }
  .factList > li {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--mu-line);
  }
  .factHead {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: baseline;
  }
  .factLabel { font-size: 0.8125rem; color: var(--mu-ink); font-weight: 600; }
  .factList .factValue {
    margin: 0.25rem 0 0;
    font-size: 1.125rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .factMeta {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: var(--mu-ink-muted);
  }
}
```

캡션(“등급 A는 기관 1차…”)은 표 밖 `<p>`로 빼 두 뷰가 공유합니다.

데스크톱 표도 열 폭만 고칩니다.

```css
.factTable { table-layout: fixed; }
.factTable th:nth-child(1) { width: 28%; }
.factTable th:nth-child(2) { width: 22%; }
.factTable th:nth-child(3) { width: 14%; }
.factTable th:nth-child(4) { width: 26%; }
.factTable th:nth-child(5) { width: 10%; }
.factTable tbody th { min-width: 0; } /* 12rem 강제 삭제 */
.factTable td:nth-child(4) { overflow-wrap: anywhere; } /* 출처만 예외 */
```

**버린 안.** 출처를 툴팁에만 두기(터치 불가). 가로 스크롤 + “밀어 보세요” 힌트(지금과 같은 답답함).

### 접근성

- 등급은 글자 `신뢰 A`를 같이 씁니다. 색만으로 의미를 주지 않습니다(WCAG 1.4.1).
- `.grade[data-grade='A']`의 `#6ee7b7` / 라이트 `#047857`은 본문 대비를 유지합니다. 글자 크기 `0.6875rem`은 대형 텍스트가 아니므로 **4.5:1**을 맞춥니다.
- 모바일 목록의 값·출처는 항상 노출. 접지 않습니다.

---

## 3. 10개 탭 — 필 탭을 스테퍼로 교체한다

### 원인

`PillTabs`는 5-Pillar용입니다(`width: fit-content; overflow-x: auto; white-space: nowrap`). 라벨이 `01 자원과 해역`처럼 길면 10개가 900px를 넘습니다. 참치는 스파인과 탭이 **이중**이고, 오징어는 탭만 있습니다.

가로 스크롤 내비는 현재 위치를 가리고, 사슬의 “앞/뒤”를 보여 주지 않습니다.

### 검증된 패턴

- **Material Stepper / Apple HIG 진행 표시**: 순서가 있는 작업은 숫자 + 연결선입니다. 탭은 서로 대체 가능한 보기용입니다.
- **하단 내비 ≤5** (Material): 10개 동급 탭은 패턴 위반입니다. 7+3으로 계층을 나눕니다.
- 원래 기획이 이미 **세로 사슬 7 + 가로 횡단 3**입니다. 한 줄에 섞은 것이 후퇴입니다.

### 추천 — 두 줄 스테퍼, 필 탭 제거

```css
.stageNav {
  position: sticky;
  top: 0;
  z-index: 4; /* 모달 아래, 본문 위 */
  padding: 0.75rem 0 0.5rem;
  background: color-mix(in srgb, var(--mu-surface) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--mu-line);
}

.chainTrack {
  display: grid;
  grid-template-columns: repeat(7, minmax(2.75rem, 1fr));
  position: relative;
}

.chainTrack::before {
  content: '';
  position: absolute;
  left: calc(100% / 14);
  right: calc(100% / 14);
  top: 1.125rem; /* 원 중심 */
  height: 2px;
  background: var(--mu-line);
  pointer-events: none;
}

.chainStep {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--mu-ink-muted);
  cursor: pointer;
}

.chainDot {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid var(--mu-line);
  background: var(--mu-surface);
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--mu-ink);
}

.chainStep[aria-current='step'] .chainDot {
  background: var(--mu-accent);
  border-color: var(--mu-accent);
  color: #0b1220; /* 흰 글자 + 시안 채움은 대비 실패 */
}

.chainStep[data-done='true'] + .chainStep { /* 선 색은 아래 fill로 */ }

.chainFill {
  position: absolute;
  left: calc(100% / 14);
  top: 1.125rem;
  height: 2px;
  width: calc((100% - 100% / 7) * var(--progress, 0));
  background: var(--mu-accent);
  opacity: 0.45;
  pointer-events: none;
}

.chainLabel {
  font-size: 0.6875rem;
  text-align: center;
  max-width: 4.6em; /* 한글 7자 */
  color: inherit;
}

.crossRow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.crossRowLabel {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--mu-ink-muted);
  align-self: center;
}

.crossChip {
  min-height: 36px;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px dashed var(--mu-line); /* 실선 원과 구분 — 순서가 아님 */
  background: transparent;
  color: var(--mu-ink-soft);
  font-size: 0.8125rem;
}

.crossChip[aria-current='true'] {
  border-style: solid;
  border-color: var(--mu-accent);
  color: var(--mu-ink);
}

@media (max-width: 720px) {
  .chainLabel {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    width: 1px;
    overflow: hidden;
    position: absolute;
  }
  .chainStep[aria-current='step'] .chainLabel {
    clip: auto;
    clip-path: none;
    height: auto;
    width: auto;
    position: static;
    overflow: visible;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .chainFill { transition: width 280ms cubic-bezier(0.16, 1, 0.3, 1); }
  .chainDot { transition: background-color 200ms ease, color 200ms ease; }
}
@media (prefers-reduced-motion: reduce) {
  .chainFill, .chainDot { transition: none; }
}
```

참치 분기도(`ValueChainSpine`)는 **01에서 갈라지는 설명 그림**으로 남깁니다. 오징어 02(어획) 자리에 해당합니다. 전 단계 내비와 역할을 나눕니다. `min-width: 900px` 가로 스크롤 SVG를 상시 내비로 쓰지 마십시오.

해시 `#s03`를 붙입니다. 새로고침·공유·뒤로 가기가 단계를 보존합니다.

**버린 안.** 셀렉트 + 이전/다음만(사슬이 안 보임). 가로 스크롤 유지 + 페이드 마스크(숨은 탭이 여전함). `PillTabs` 전역 개조(운영 화면 계약).

### 접근성

- `role="navigation"` + 사슬은 `ol`/`role="list"`. 현재 단계는 `aria-current="step"`.
- 로빙 탭인덱스 + ←/→/Home/End는 `PillTabs`에서 그대로 가져옵니다.
- 포커스 링: `outline: 2px solid var(--mu-accent); outline-offset: 3px` (스파인이 이미 이 값).
- 터치 영역 원 `36px` + 패딩으로 **44×44**를 맞춥니다. 라벨을 잘라도 `aria-label="01 자원과 해역"`은 남깁니다.
- **대비 버그**: `PillTabs` 활성 글자는 `#ffffff`, 채움은 `--accent-primary`. 시안 `#38bdf8` 위 흰색은 대략 **1.8:1**입니다. 스테퍼 점은 어두운 글자(`#0b1220`)로 바꿉니다.

---

## 4. 사슬 감각 — 탭이 아니라 장(chapter) + 인계

### 원인

탭은 “서로 다른 보기”입니다. 밸류체인은 “앞에서 뒤로 물건을 넘기는 과정”입니다. 지금 단계 푸터에 다음이 없고, 횡단 축이 08·09·10처럼 붙어 순서가 가짜가 됩니다.

### 검증된 패턴

- Segel & Heer의 **author-driven path**: 다음 장면을 저자가 지정합니다.
- 롱폼(NYT, The Pudding): 챕터 끝의 **“다음에 남는 질문”** 한 줄이 연결고리입니다. 스크롤 재킹이 아닙니다.
- 프로세스 스테퍼: