# Design-to-Code 워크플로 — claude.ai/design ↔ 로컬 컴포넌트 동기화

> **작성**: Claude Code [CC] · 2026-06-27 · **상위**: [docs/2026_claude_design_proposal.md](../2026_claude_design_proposal.md)
> **전제**: 카탈로그 prebuild 완료 (`scratch/design-bundle/`, 37 카드 + index + manifest)

이 문서는 ① 이미 만든 카탈로그를 claude.ai/design에 **등재**하는 절차와 ② 신규 commodity 대시보드를 **시안→코드로 환원**하는 반복 워크플로를 규정합니다.

---

## 0. 사전 조건 — DesignSync 권한 (1회)

`DesignSync`는 claude.ai 로그인에 design-system scope가 필요합니다. 현재 비인터랙티브 환경에서는 차단됩니다.

**사용자 액션 (1회)**: 인터랙티브 Claude Code 터미널에서 재인증
```
/design-login        # 또는 claude.ai 재로그인 후 design scope 승인
```
인증 성공 후 `DesignSync list_projects`가 200을 반환하면 이후 단계 진행 가능.

---

## 1. 카탈로그 등재 시퀀스 (인증 직후 그대로 실행)

`scratch/design-bundle/`의 37개 카드를 claude.ai/design 프로젝트로 올리는 표준 순서.

```
# 1) 프로젝트 인벤토리
DesignSync list_projects
   → 기존 silla-tuna-design-system 있으면 그 projectId 사용, 없으면:
DesignSync create_project { name: "silla-tuna-design-system" }
   → projectId 획득

# 2) 기존 파일 구조 확인 (재업로드 시 diff용)
DesignSync list_files { projectId }

# 3) 쓰기 범위 잠금 (사용자 plan 승인 prompt 1회)
DesignSync finalize_plan {
  writes: [
    "foundations/*.html", "gradients/*.html", "components/*.html",
    "variants/*.html", "charts/*.html", "layouts/*.html",
    "index.html", "_ds_manifest.json"
  ],
  localDir: "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/scratch/design-bundle"
}
   → planId 획득

# 4) 업로드 (localPath로 디스크에서 직접 읽어 인코딩, 컨텍스트 미경유)
DesignSync write_files {
  planId,
  files: [ { path: "foundations/typography.html", localPath: "foundations/typography.html" }, … 37+2 ]
}

# 5) claude.ai/design Design System 패널에서 카드 렌더 확인
#    (@dsCard 마커가 그룹 인덱스를 자동 구성 — register_assets 불필요)
```

**규율 (proposal §2.1)**:
- incremental — 한 그룹씩 finalize_plan→write_files 가능. wholesale replace 금지.
- 코드가 진실 — 카탈로그는 거울. globals.css/컴포넌트가 바뀌면 해당 카드만 재생성 후 재업로드.

---

## 2. 신규 commodity 시안 → 코드 환원 워크플로 (반복)

신규 commodity(예: 갈치 강화, Pollock 보류분 44위젯)를 추가할 때:

```
[1] 시안 생성 (claude.ai/design 또는 로컬 prebuild)
    - SPEC.md의 토큰을 그대로 사용한 정적 HTML 카드로 위젯 시안 작성
    - 시그니처 그라디언트는 §4 매핑에서 선택 (없으면 신규 1개 추가 → RULEBOOK D-04 갱신)

[2] 시각 합의
    - claude.ai/design 카드로 올려 발주처·디자이너와 합의 (코드 작성 전)

[3] 코드 환원 (정적 HTML → TSX endpoint)
    - WidgetCard props로 매핑:
        제목 → title / 1줄 설명 → cardDesc / pillar → S1~S5
        차트 → Recharts JSX (정적 SVG 시안을 동형 Recharts로)
        SIT/TAK → takeaway.situation / takeaway.actionPlan (HTML 문자열 허용)
        데이터 신선도 → telemetry.status + syncDate (정직 라벨 L-09)
    - 컴포넌트는 components/<Commodity><Widget>.tsx 로 생성, 데이터는 인테이크 모듈 경유(가능 시)

[4] 게이트 통과 (배포 전 의무)
    - npm run build  (L-03)
    - rg 영문 잔여분 grep (L-01)
    - python scripts/check_s_grade.py <Dashboard>.tsx
    - Forensic Audit 4-Axis 평균 A등급(85+) (O-04)

[5] HANDOFF.md 갱신 + 커밋 [CC], 사용자 명시 시에만 라이브 배포 (Deployment Protocol)
```

핵심: **시안 단계가 코드 앞에 선다.** 곧장 TSX로 들어가 일관성이 흔들리던 기존 패턴(audit 누적 25건 함정)을 차단.

---

## 3. 카드 재생성 규칙 (코드 변경 시 카탈로그 동기화)

| 변경된 것 | 재생성할 카드 |
|---|---|
| globals.css 토큰 (색·폰트·spacing) | foundations/* 해당 카드 + 영향받는 전 카드 |
| WidgetCard / TakeawayBox / TelemetryBadge / TermTooltip | components/* 해당 카드 + variants/* |
| 시그니처 그라디언트 추가·변경 (D-04) | gradients/* 해당 카드 |
| 5-Pillar accent 매핑 | variants/* 전체 |

재생성 후 `_ds_manifest.json` 재빌드 → `index.html` 재빌드 → 변경 카드만 `write_files`.

---

## 4. 미결 결정 (사용자 승인 필요)

**색 토큰 단일화** — jewel-palette 카드가 표면화한 불일치:
- globals.css 런타임: `success #1ed760` / `warning #ffa42b` / `danger #f3727f` / `info #539df5` / `purple #b3b3b3`
- UI_RULES·5-Pillar accent: `emerald #10b981` / `amber #f59e0b` / `rose #ef4444` / `blue #3b82f6` / `violet #8b5cf6`

권고: **5-Pillar accent 세트(UI_RULES 계열)로 통일** — pillar accent bar가 이미 전 대시보드에서 그 색을 쓰므로 jewel palette를 거기에 맞추는 편이 변경 범위가 작고, `--color-purple #b3b3b3`(회색) 같은 명백한 오류를 제거. 단 globals.css 변경은 34개 대시보드 런타임 외관에 영향 → **사용자 승인 후 별도 PR**.
