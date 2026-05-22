# MackerelDashboard Forensic Audit Pilot Summary (2026-05-23)

> **Prototype evaluation by Claude Opus 4.7 (Claude Code 세션)** — schema 검증용.
> 본 평가의 quality benchmark. 전체 79 위젯은 Antigravity Opus 4.6 / Gemini 3.1 Pro로 OpenCode `ultrawork` 통해 진행 예정.

## 5 위젯 Pilot 결과

| Widget | Title | Score | Grade | Verdict |
|---|---|---:|:---:|:---:|
| w01 | 글로벌 고등어 어종별 어획량 추이 | 85 | A | approve |
| w02 | 상위 5개국 어획량 집중도 | **94** | **A** | approve |
| w03 | 어종별 어획 비중 구조 | 69 | **C** | **conditional** ⚠️ |
| w04 | 한·일 연근해 어획량 감소 | **96** | **A** | approve ⭐ |
| w05 | 양식 전환 가능성 평가 | 90 | A | approve |
| **평균** | | **86.8** | **B+** | |

**Grade 분포 (5 위젯)**:
- A (≥85): 4건 (80%)
- C (70-84): 1건 (20%)
- D/F (<70): 0건

## 4-Axis 통계

| Axis | 평균 | 가장 약한 위젯 | 패턴 |
|---|---|---|---|
| Source Reliability | 88 | w03 (60) | 1차 자료(FAO·정부) 우수, 상업 보고서(Easyfish·Tridge) 약함 |
| Data Freshness | 91 | w03 (80) | 대부분 1년 이내 — 양호 |
| Verifiability | 83 | w03 (55) | 공개 PDF·DB 우수, paid 상업 자료 약함 |
| Integration | 85 | w01 (75) | SIT 정량 구체성 우수, 일부 영문 잔존 |

## 발견된 패턴 (다른 dashboard에도 적용)

### ✅ 강점 (best practices)
1. **w04 모범**: 통계청 + RFMO + 국립수산과학원 = 3중 1차 자료 cross-reference
2. **w02 모범**: 정부간 협정 + EU 의회 = 정책 출처 패턴
3. **숫자 매우 구체적**: "84만톤 (53년 만에 최저)" 같은 명시 — Integration 만점

### ⚠️ 약점 (정정 권장)
1. **w03 issue**: 1차 자료 부재 → Easyfish/Tridge 상업 보고서 의존 → FAO Capture 데이터로 교체 권장
2. **L-01 잔존**: "Supply Shock", "Oligopoly", "Aquaculture" 등 영문 단독 표기 — 한글 단독 또는 병기 변환
3. **인용 세부 부족**: SOFIA "Chapter·Table 번호", EPRS "Brief 번호" 등 정확 reference 누락

## Antigravity 본격 sprint 명령 (사용자 OpenCode 세션)

본 prototype 5건의 quality·schema 검증 완료. 79 위젯 전수 평가:

```bash
cd /Users/idong-geon/연구자동화애이전트들/tuna-dashboard

ultrawork --agent sisyphus \
  --max-files 79 \
  "MackerelDashboard 위젯 신뢰도 4-Axis 평가 (Forensic Audit)
  
  대상: public/data/mackerel_real_data_v13.json 의 widgets[] 배열 79개
  Schema: artifacts/forensic_audit/2026-05-23/MackerelDashboard/w0[1-5]_*.json 참조
  출력: artifacts/forensic_audit/2026-05-23/MackerelDashboard/wXX_<slug>.json
  
  Pilot 평가에서 발견된 패턴 적용:
  - 1차 자료 우선 (FAO·NPFC·통계청·국립수산과학원)
  - 상업 보고서는 Source 60점 cap
  - SIT 정량 구체성 = Integration 가점
  - 영문 단독 잔존 = Integration 감점
  - 인용 reference 세부 (Table/Chapter) 누락 = Verifiability 감점
  
  NotebookLM 노트북 사용 가능 시 cross-check.
  Antigravity Opus 4.6 락 시 Gemini 3.1 Pro 자동 fallback.
  
  완료 후 _sprint_summary.md 생성 (전체 grade 분포 + 정정 큐)."
```

## 다음 액션

1. ✅ **5 위젯 Pilot 완료** — schema·grade·remediation 검증
2. ⏸️ **사용자 OpenCode `ultrawork` 호출** — 79 위젯 전수 평가 (~2h 추정)
3. **결과 review** — 이 세션이 grade 통계 + 정정 큐 commit
4. **w03 우선 정정** — 1차 자료 보완 (FAO Capture Atlantic vs Pacific 분류 데이터)
5. **다른 commodity로 확장** — Salmon → Squid → Pollock 순서 (위젯 多)
