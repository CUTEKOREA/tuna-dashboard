# Quick Start for Agents (read this first)

당신이 이 저장소에 처음 들어왔다면 이 순서대로 5분 안에 자리잡으세요:

1. **`HANDOFF.md`** — 직전 세션의 완료/다음 단계. 무엇을 해야 하는지 여기에 있습니다.
2. **`CONTEXT.md`** — 이 프로젝트 고유 도메인 어휘 (위젯·대시보드·SIT·TAK·TelemetryBadge·5-Pillar 등). 용어를 표류시키지 마세요.
3. **`COMPREHENSIVE_RULEBOOK.md`** V4.1 — 종합 규칙서 (P/R/D/W/A/O/L 조항). 모든 작업의 정답.
4. **`UI_RULES.md`** — UI/UX 디자인 시스템 (Glassmorphism, 시그니처 그라디언트, 한글 7자, Recharts).
5. **`docs/adr/`** — 되돌리기 어려운 결정들(5-Pillar, Live API First, 일괄 리팩토링). 재논쟁 금지.

## 핵심 명령어

```bash
npm run dev                                           # 로컬 개발 서버
npm run build                                         # 배포 전 게이트 (L-03)
python scripts/check_s_grade.py <Dashboard.tsx> ...   # S-Grade UI 표준 검증
git log --oneline -10                                 # 최근 작업 흐름
```

## Universal 5-Pillar (모든 commodity 대시보드의 구조)

1. 🐟/🌾 **원료 수급** — 생산량·기후 리스크·산지 단가
2. 🏭 **가공·생산** — 가동률·수율·인건비
3. 🚢 **물류·통관** — 운송비·콜드체인·SPS
4. 📈 **판매·수요** — 점유율·소매가 전가·대체재
5. 🌱 **ESG·지속가능성** — 탄소·혼획·동물복지·바이오 업사이클링

## 알려진 함정 (피하세요)

- **영문 잔존**: 사용자 노출 문자열은 100% 한글. 약어(NVIDIA, WCPO 등)는 TermTooltip으로. (L-01)
- **TelemetryBadge 인라인 정의**: 10개 dashboard에 자기 복사본이 박혀있고 9개는 룰북 위반 타입(소문자). 새로 부착할 땐 단일 모듈을 추출하는 방향으로.
- **`truncateXAxis` 함수 복붙**: 30+ 파일에 복사돼 있고 7자 룰을 안 따르는 코드도 섞임. 한 곳으로 모으세요.
- **위젯이 JSON을 직접 import**: `import rawData from '../data/...'` 패턴은 Python 패치 스크립트 200+개의 원인. 새로 만들 때 가능하면 데이터 인테이크 모듈 경유.
- **Lint 꺼져 있음**: `package.json`의 `"lint": "echo 'Skipping lint'"`. 타입체크는 `tsc --noEmit`로 별도 수행 필요.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment Protocol
- 모든 수정 사항은 먼저 로컬 서버(`npm run dev`) 환경에만 우선 반영합니다.
- 임의로 프로덕션/라이브 채널에 배포하지 않습니다.
- 여러 수정 사항을 로컬에서 확인한 후, 사용자의 "배포", "라이브 배포" 등 명시적인 요청이 있을 때만 수정 사항을 모아서 Vercel 등의 라이브 채널에 반영합니다.

# 세션 진입·종료 규율 (Claude Code + Antigravity 병용)

이 프로젝트는 두 에이전트(Claude Code, Antigravity)를 50:50 병용합니다. 두 에이전트는 대화 컨텍스트를 공유하지 않으므로 **파일 시스템이 유일한 공유 진실**입니다.

## 세션 시작 시 (모든 에이전트)
1. **`HANDOFF.md`를 먼저 읽으세요** — 직전 세션의 완료/다음 단계가 적혀 있습니다.
2. `git log --oneline -10` 으로 최근 커밋 흐름을 확인합니다.
3. `CONTEXT.md` 와 `docs/adr/` 의 도메인 어휘·결정을 참조해 작업합니다.

## 세션 종료 시 (모든 에이전트)
1. 의미 있는 작업(파일 변경·결정·측정·분석)을 했다면 `HANDOFF.md` 의 "완료된 것" / "다음 단계" 섹션과 "마지막 업데이트" 타임스탬프를 갱신합니다.
2. 변경사항을 커밋합니다. 커밋 메시지 끝에 에이전트 식별자를 붙여 추적성을 확보합니다:
   - Claude Code 작업: `[CC]`
   - Antigravity 작업: `[AG]`
3. 큰 작업(파일 5개+ 수정, 새 모듈 추가, 룰 변경) 후에는 HANDOFF.md 갱신을 *반드시* 수행합니다.

## 동시 작업 금지
- 같은 브랜치에 두 에이전트가 동시 작업하지 않습니다. worktree 분리 또는 시간차 작업.
- 한 큰 작업당 worktree 1개를 권장합니다.

## 도구 의존 흔적 관리
- superpowers·grill-me 등 특정 에이전트 전용 도구의 호출 결과는 *결정 자체*만 HANDOFF.md에 남기고, 도구 호출 흔적은 남기지 않습니다 (다른 에이전트가 읽지 못함).

## 자동화 (참고)
- `.git/hooks/pre-commit` 이 의미 있는 파일 변경 시 HANDOFF.md 갱신 여부를 경고합니다 (차단은 안 함).
- Claude Code 세션은 메모리에 갱신 규율이 저장되어 있어 자발적으로 갱신을 제안합니다.
