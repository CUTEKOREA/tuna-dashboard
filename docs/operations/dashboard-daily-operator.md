# 참치왕국 반복 갱신 운영자

`scripts/dashboard_daily_operator.py`는 페이지별 기존 인테이크를 다시 만들지 않고 순서·상태·배포 경계만 통합한다.

## 관리 범위

| ID | 페이지 | 주기 | 기존 인테이크 |
| --- | --- | --- | --- |
| `market-briefing` | `/market` 데일리 기사 | 매일 | `sync_daily_briefing.py` |
| `fleet-daily` | `/fleet` 일일 업무보고 | 매일 | `sync_fleet_daily_reports.py` |
| `unloading-daily` | `/unloading` 하역 | 하역일 | `silla-unloading-daily-report` 스킬 |
| `bangkok-weekly` | `/bangkok-office` | 매주 | `sync_bangkok_report.sh` |
| `gmts-weekly` | `/gmts` | 매주 | `build_gmts_dashboard.py` |
| `logistics-weekly` | `/logistics` | 매주 | 원문 교차 대조 수동 어댑터 |

실행 정의의 정본은 `config/dashboard-daily-pages.json`이다. 비정기 시장이해 페이지와 런타임 메일 페이지는 자동 실행 대상이 아니다.

## 일상 명령

```bash
npm run ops:scan
python3 scripts/dashboard_daily_operator.py prepare --page market-briefing --source '/절대/경로/참치뉴스_게시판용_YYYY-MM-DD.html'
python3 scripts/dashboard_daily_operator.py verify --page market-briefing
npm run ops:report
```

상태는 `artifacts/dashboard-daily-operator/state.json`에 원자적으로 저장되며 Git에서 제외된다. `scan`과 `--dry-run`은 상태 파일을 만들지 않는다.

단계는 `source_acquired → normalized → rendered → page_prepared → verified → release_approved → deployed → live_verified` 순서다. 앞 단계가 없으면 뒤 단계를 기록할 수 없으므로 실패한 지점부터 안전하게 재개할 수 있다.

## 스킬·수동 페이지

`unloading-daily`와 `logistics-weekly`는 운영자 CLI가 내용을 생성하지 않는다. 전용 스킬 또는 원문 대조가 끝난 후 `record-stage`로 각 단계의 경로·검산·테스트 근거를 기록한다. 비밀번호·쿠키·보호 상세값은 근거에 넣지 않는다.

## 배포 경계

이 CLI에는 push·PR·Vercel 배포 기능이 없다. `record-release`는 사용자의 명시적 배포 승인, 실제 배포 SHA와 URL, 라이브 QA 결과를 상태에 남길 뿐이다. 따라서 launchd나 cron이 이 CLI를 호출해도 자동으로 `main`을 변경하지 않는다.

활성 `$HOME/silla-tuna-daily/run_briefing.sh`도 아래 경계로 전환했다. 운영자 커밋이 `main`에 반영되기 전에는 기존 briefing sync와 같은 집중 테스트를 실행하고, 반영된 뒤에는 이 CLI를 호출한다.

1. 기존 HTML이 있어도 대시보드 준비부터 재개한다.
2. 전용 worktree가 dirty면 중단하고 알린다.
3. `prepare`와 `verify`까지만 무인 실행한다.
4. 커밋·PR·배포는 사용자의 별도 배포 요청에서 수행한다.
5. 배포 후 프로덕션 데이터 기준일과 데스크톱·390px 화면을 확인한 뒤 `record-release --live-verified`를 기록한다.
