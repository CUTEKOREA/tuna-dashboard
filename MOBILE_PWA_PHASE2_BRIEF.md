# Phase 2 위임 브리프 — 모바일 반응형 grid 일괄 변환

> **작성자**: Claude Code (Sisyphus 대행, 2026-05-22)
> **수신자**: Antigravity Hephaestus (`gemini-3-pro`)
> **선행 작업**: Phase 1 — PWA 인프라 완료 (`public/manifest.json`, `public/sw.js`, `public/icons/*`, `components/PWARegister.tsx`, `app/layout.tsx` 메타 추가). L-03 빌드 통과 확인됨.
> **연결 룰**: COMPREHENSIVE_RULEBOOK V4.1 L-07(스크립트 일괄 리팩토링), UI_RULES §4(2-column grid default), CONTEXT.md(Hephaestus 정의)

---

## 1. 목표

데스크탑 2-column grid를 깨지 않으면서, 모바일 (<768px)에서 모든 위젯이 1열로 stack되도록 한다. 사용자가 "참치왕국 모바일 접속 시 최적화" 요청.

## 2. 현황 분석 (Claude Code 사전 스캔)

`rg "gridTemplateColumns" components/ app/` 결과 — **인라인 style만 사용, Tailwind grid-cols-* 0건**:

| 패턴 | 빈도 | 모바일 대응 |
|---|---|---|
| `repeat(2, 1fr)` (4 syntax 변형) | 90 | **변환 대상** |
| `'1fr 1fr'` (2 변형) | 18 | **변환 대상** |
| `repeat(3, 1fr)` | 14 | **변환 대상** |
| `repeat(4|5|6, 1fr)` | 19 | **변환 대상** |
| `repeat(auto-fit, minmax(...))` | ~25 | **skip** (이미 반응형) |

총 ~141건 인라인 grid 선언, 48개 파일 분포. 수작업 금지 → L-07 일괄 변환기 필요.

## 3. 변환 전략 (CSS one-liner + JSX attribute codemod)

**왜 이 방법인가**: 인라인 `style={{}}`는 media query 불가. className 추가는 inline style 우선순위 때문에 안 먹힘. 따라서:

1. **CSS 룰 추가** (`app/globals.css` 하단 1줄):
   ```css
   @media (max-width: 767px) {
     [data-mobile-stack] { grid-template-columns: 1fr !important; }
   }
   ```
2. **Codemod**: 모든 `<elem style={{... gridTemplateColumns: 'repeat(N, 1fr)' | '1fr 1fr' | '1fr 1fr 1fr' ...}}>` (N≥2)에 `data-mobile-stack` 속성 부착.

`!important`는 인라인 style을 모바일에서만 override하기 위함. 데스크탑은 인라인 스타일 그대로.

## 4. 스크립트 스펙 — `scripts/fix_mobile_grid.py`

### 입력
- 탐색 루트: `components/`, `app/`
- 제외: `_archive/`, `node_modules/`, `.next/`
- 파일 패턴: `*.tsx`, `*.jsx`

### 매칭 규칙 (정규식 가이드 — 정확한 구현은 Hephaestus 판단)
타겟 패턴 (모두 변환):
```
gridTemplateColumns\s*:\s*['"`]repeat\(\s*([2-9]|[1-9]\d+)\s*,\s*1fr\s*\)['"`]
gridTemplateColumns\s*:\s*['"`](?:1fr\s+){1,9}1fr['"`]
```
**Skip 패턴 (절대 변환 금지)**:
```
auto-fit
auto-fill
minmax
gridTemplateColumns\s*:\s*['"`]repeat\(\s*1\s*,
```

### 변환 로직
1. style 객체를 포함하는 JSX 시작 태그를 찾는다 (예: `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>`)
2. 같은 태그에 `data-mobile-stack` 이미 있으면 **skip** (idempotent)
3. 태그 첫 attribute 직후에 ` data-mobile-stack` 삽입 (self-closing 여부 보존)

### 동작 모드
- `--dry-run` (기본): 변환 후보 파일·라인·diff 출력, 파일 미수정
- `--apply`: 실제 수정
- `--file <path>`: 단일 파일만 처리 (테스트용)

### 출력 리포트 (stdout)
```
[scan] 48 files matched
[skip] 25 files contain only auto-fit patterns
[target] 141 occurrences across 48 files
[file] components/MackerelWidgets.tsx — 12 sites
  L234:   gridTemplateColumns: 'repeat(2, 1fr)' → +data-mobile-stack
  ...
[summary] applied=N idempotent_skip=M warnings=K
```

## 5. CSS 룰 추가 위치

`app/globals.css` 파일 **맨 아래**에 추가 (기존 `:root` palette 영역 건드리지 말 것). 기존 미디어 쿼리 있으면 그 블록 안에 통합.

```css
/* === Mobile responsive grid (Phase 2, 2026-05-22) === */
@media (max-width: 767px) {
  [data-mobile-stack] { grid-template-columns: 1fr !important; }
}
```

## 6. 검증 (배포 전 게이트)

순서대로:
1. `python scripts/fix_mobile_grid.py --dry-run` — 리포트 확인, 예상치 ~141건 일치 확인
2. `python scripts/fix_mobile_grid.py --apply` — 실제 수정
3. `npm run build` — L-03 통과 의무
4. `npm run start` 후 Chrome DevTools → iPhone 12 Pro viewport (390×844)로 다음 페이지 시각 확인:
   - `/` (메인)
   - `/falkland`
   - `/financial-risk`
   - `/management`
   - 임의 commodity 1개 (예: `/tuna`)
5. 모든 위젯이 1열로 stack되는지 + 데스크탑(1440px)으로 돌리면 2열 복귀하는지 확인

## 7. 제약사항 (반드시 준수)

### ADR 0008 + Tuna closure 공지 (2026-05-21~2026-06-04)
HANDOFF.md L21: **"Tuna 33개 위젯 closure 동일 파일 작업 1~2주 일시 중단"**.

→ 이 codemod는 `data-mobile-stack` attribute만 추가 (위젯 로직·closure 무관)하므로 **충돌 안 함**. 다만 Tuna 파일 수정 시 git diff 확인 후 attribute 추가 외에 어떤 변경도 없는지 검증할 것.

### L-08 데이터 파일 금지
codemod는 `.tsx`/`.jsx`만 건드림. `data/`, `public/data/`, JSON, CSV 절대 수정 금지.

### 동시 작업 금지 (AGENTS.md)
이 작업 중 Claude Code는 같은 브랜치에 작업하지 않음. Hephaestus 작업 완료 후 HANDOFF.md 갱신 → Claude Code가 다음 phase 진입.

## 8. 부수 작업 (선택, 시간 남으면)

다음은 모바일 성능 개선이지만 Phase 2 스코프 외. 별도 PR 권장:

- **DeepOceanCreatures** ([components/DeepOceanCreatures.tsx](components/DeepOceanCreatures.tsx)) — 배경 애니메이션, 모바일 배터리·GPU 부담. 모바일에서 비활성화 또는 frame rate 감소.
- **HermesAgent** ([components/HermesAgent.tsx](components/HermesAgent.tsx)) — 떠있는 챗 위젯, 모바일에서 화면 점유율 큼. 모바일에서 축소 또는 슬라이드인.
- **차트 X축 라벨** — Phase 3 (Librarian audit)에서 처리 예정. 여기선 손대지 말 것.

## 9. 작업 완료 시

1. `scripts/fix_mobile_grid.py` 커밋 (스크립트 자체)
2. 일괄 변환 결과 단일 커밋 — message: `feat(mobile): add data-mobile-stack to NN inline grids [AG]` (`[AG]` 태그 필수, AGENTS.md §세션 종료)
3. `app/globals.css` 변경 같은 커밋에 포함
4. **HANDOFF.md 갱신** — "Phase 2 완료, 변환 N건, 다음은 Phase 3 (Librarian 차트 audit)"
5. 이 브리프 파일 (`MOBILE_PWA_PHASE2_BRIEF.md`)은 작업 완료 후 `_archive/handoffs/`로 이동

## 10. 막히면

- 정규식 매칭이 multiline JSX (`style={{` 다음 줄에 properties 있는 경우)에서 실패하면 → Python `re.DOTALL` + 더 보수적 매칭. 또는 `jscodeshift` 같은 AST 변환 도구 고려 (Hephaestus 판단).
- L-03 빌드 실패 시 → 변환을 되돌리고(`git restore`) 실패 파일 특정해 보고. 의심 파일: nested style 객체, spread 패턴 (`...baseStyle, gridTemplateColumns: ...`).
- 시각 검증에서 어떤 위젯이 모바일에서 깨지면 → 해당 위젯은 별개 이슈 (Phase 3 candidate). 일단 Phase 2 완료 보고.
