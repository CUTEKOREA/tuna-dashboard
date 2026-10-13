# 발주 — Codex 리뷰 3건 수정 (Cursor composer-2.5, 이 worktree 안에서만)
1. P1 `scripts/market_regime/run_local.sh` (클론 검사·reset 부분): 실행 초기에 `unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR` 하고, reset 전에 `git rev-parse --show-toplevel`·`--absolute-git-dir`·`--git-common-dir` 이 모두 `~/market-regime-runner` 와 그 `.git` 안을 가리키는지 확인한다. 아니면 로그 남기고 종료코드 1.
2. P1 `components/market-understanding/MarketRegimeBand.tsx`·`lib/data/market-regime.ts`: `asof` 타입을 `string | null` 로 바꾸고, null 이면 기준일 칸을 「기준일 없음」으로. 테스트 `__tests__/market-regime-band.test.ts` 에 asof:null 지표가 렌더 오류 없이 「기준일 없음」을 그리는지 1건 추가.
3. P2 `run_local.sh`: 키 5개 중 미설정인 것은 빈 문자열로 둔다(`${(P)NAME:-}`), 수집기가 실제로 요구하는 NASS_API_KEY 만 없으면 종료.
완료 판정: `zsh -n scripts/market_regime/run_local.sh` · `npx vitest run` 실패 0 · `npx tsc --noEmit` 0.
Do NOT: 다른 파일 수정, 커밋, push. 스펙과 코드가 어긋나면 고치지 말고 보고.
