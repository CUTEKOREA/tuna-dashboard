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
