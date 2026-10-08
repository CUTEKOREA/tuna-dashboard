# 참치 세력 지구본 — 인계문서 (2026-09-09)

이전 세션 id `96208f89-7a74-47ce-b311-1a8697ef785f` (Opus 5 · 1M).
`claude --resume 96208f89-7a74-47ce-b311-1a8697ef785f` 로 대화째 이어받거나,
이 문서만 읽고 새로 이어도 된다 — 작업물은 전부 디스크에 있다.

## 지금까지 끝난 것

### ⅩⅨ·ⅩⅩ 발행 (완료)
Century Pacific Food(필리핀) · Bolton Food S.p.A.(이탈리아) 두 편.
Artifact·Drive·대시보드·Vercel 프로덕션까지 반영됐고 **라이브 화면에서 20장 카드 전부 실측 확인**했다
(`leedonggun.co.kr/company-anatomy`, 2026-09-09). 계획서가 「내가 못 한다」고 남겨 둔 마지막 항목이 닫혔다.

남은 것: 감사가 낸 P1·P2 (ⅩⅨ P1 15·P2 16, ⅩⅩ P1 14·P2 11). 이번 범위 아님.

### 세력 지구본 위젯 (브랜치 `power-globe-20260909`, 미커밋)

| 파일 | 무엇 |
|---|---|
| `lib/data/company-geo.ts` | 좌표 원장 — 본사 20 · 공장 30 · 미확인 공장 · 기국 · 배 0척 7사 |
| `lib/data/company-relations.ts` | 관계 원장 — 지분 12 외 공급·등록·무역·금융. `strokeWeight()` · `isSolid()` |
| `components/market-understanding/TunaPowerGlobe.tsx` | 위젯 본체. 네 층(잡는 곳·만드는 곳·쥔 곳·우리) |
| `components/market-understanding/globe-cinematics.ts` | **연출 전용** — 별·림글로·블룸·톤매핑·카메라 안무 |
| `__tests__/tuna-power-globe.test.ts` | 관문 17개 |
| `public/textures/earth-dark.jpg` | 2048×1024 · sha256 `8b8f3a…76994`. `PacificGlobe.tsx` 가 unpkg 를 런타임에 치는 걸 피하려 로컬화 |

`CompanyAnatomyDashboard.tsx` 가 `dynamic(ssr:false)` 로 물고 `WidgetCard` 로 감싼다
(telemetry `STATIC` · syncDate `2026-09` — 하드코드 데이터에 `LIVE` 는 룰북 L-09 위반).

**지도로 그리면 거짓이 되는 다섯**을 코드와 테스트로 막았다. 주석에만 적으면 다음 사람이 깬다.
1. 본사 핀에 크기 없음 (`hasSize()` 가 `kind:'hq'` 를 거른다)
2. 선단을 점으로 안 찍음 — 20편에 모항 0건, 있는 건 기국뿐
3. 위치 미확인 공장은 지도에 없음 (`UNLOCATED_PLANTS` 는 개수만)
4. 국가를 칠하지 않음
5. 미확인 관계는 값이 있어도 고정폭 (`strokeWeight()`)

### 이번에 얹은 영상미 (사용자 요청 — 「영화같은·3D 게임 장면같은」)

전부 `globe-cinematics.ts` 안이다. **데이터를 건드리는 줄이 없다.**

- 절차생성 별 2,600개 — 지구보다 느리게 돌아 시차로 깊이가 생긴다
- 프레넬 림 셰이더 껍질 (BackSide·가산) — 게임 화면의 또렷한 지구 윤곽
- `UnrealBloomPass` 임계 0.28 — 선과 기둥만 번지고 지표면은 안 탄다
- ACES 필름 톤매핑 · 노출 1.12
- 지구 표면 `MeshPhongMaterial` 스페큘러 — 바다 반사광이 있어야 구로 읽힌다
- 키라이트를 옆으로 밀고 반대편에 강조색 림라이트
- 카메라 안무: 첫 진입은 고도 4.8 에서 2.6초 접근, 층 전환은 **뒤로 빠졌다 들어가는 2단**
- 점을 납작한 원에서 **솟은 기둥**으로 (본사는 높이 고정 — 규칙 1)
- 파동(rings) — **모든 점에 똑같이**, 주기만 어긋나게. 일부에만 걸면 밝기가 중요도를 말한다
- 겹판: 레터박스 · 타이틀 카드 · 비네트 · 필름 그레인 · HUD 모서리
- 점 클릭 시 그 자리로 하강 (고도 1.2)

**연출이 사실을 만들 뻔한 자리 하나**를 의식적으로 피했다 — 굵기(값)와 밝기(확정 여부)가
같은 축을 두 번 말하지 않도록 블룸 임계값을 높게 잡았다.

## 지금 상태

- `npx tsc --noEmit` rc=0
- `npm run verify` **rc=0** (로그 `/tmp/dv9.log`) — 175 파일 · 1,412 통과 · 2 skip
- 번들 예산 통과 (33 라우트, 최대 `/management` 1.22 MB)
- **실화면 실측 완료** — 네 층 전부 로컬 프로덕션에서 눈으로 봤다

### 렌더 조정에서 두 번 되돌린 것

1. **림 글로가 지구를 삼켰다.** `uGain 1.45` + 가산 블렌딩 + 블룸 임계 0.28 이 겹쳐
   흰 고리만 남고 지구가 사라졌다. → `uGain 0.40` · `uPower 4.6` · 블룸 `0.46/0.42/0.58`
2. **텍스처가 애초에 비어 있었다.** `earth-dark.jpg` 최대 휘도 40/255.
   조명을 아무리 올려도 대륙이 안 나온다 — `public/textures/README.md` 에 측정법을 적어 뒀다.
   → blue-marble + topology 범프 + water 스페큘러 3종으로 교체

그리고 **키라이트를 카메라에 물렸다.** 빛을 씬에 고정하면 층을 옮길 때마다
보고 있는 면이 밤이 돼 점이 통째로 사라진다(「쥔 곳」에서 실제로 그랬다).

## 다음 할 일

1. ~~화면 실측~~ — 끝났다. 다시 볼 일이 있으면 절차는 아래 그대로다.
   dev(Turbopack)는 `app/[category]/page.tsx` 의 `dynamic(() => import('../page'))` 가
   첫 컴파일에 몇 분씩 걸려 「대시보드 로딩 중…」에서 안 넘어간다. **프로덕션 빌드로 봐라**:
   ```
   npx next build
   DASHBOARD_E2E_MODE=local DASHBOARD_E2E_AUTH_SECRET=<32자+> VERCEL= VERCEL_ENV= npx next start -p 3111
   node /tmp/globeproxy.mjs        # 3112 → 3111, x-dashboard-e2e-secret 주입
   ```
   그다음 Aside `openTab('http://localhost:3112/company-anatomy')`.
   ⚠️ `.env.local` 을 복사해 오면 `VERCEL=1` 이 딸려와 우회가 무조건 거부된다(503).
2. ~~`npm run verify` 재실행~~ — rc=0 확인
3. 커밋 → PR → squash 머지 → Vercel. `env -u GH_TOKEN -u GITHUB_TOKEN` 를 붙여야 keyring 을 쓴다
4. `power-globe-audit` 워크플로(runId `wf_aa70d57e-605`)는 **산출 0** 으로 끝났다.
   저널도 안 남았다. 감사가 필요하면 다시 발주해야 한다 — 좌표·관계·금칙·누락 네 축
5. HANDOFF·STATE 에 Aside→Grok Imagine 표지 생성 절차 반영 (계획서 5번, 아직)

## 이 저장소에서 다시 밟지 말 것

- `locator.fill()` 은 Grok 에디터에서 입력 길이 0 이 된다 → `page.keyboard.insertText()`
- `next build` 중복 실행 시 락 충돌 → `pkill -f "next build"; rm -rf .next`
- `useMemo(fn, [])` 는 린트가 막는다 → `useMemo(() => fn(), [])`
- 대시보드 인테이크는 JSON 을 디스크에 놓는 것으로 끝나지 않는다 —
  `company-report-{prose,tables,figures}.ts` 세 로더에 등록해야 키가 산다
