# 묵은 원격 브랜치 판정표 — 2026-10-05

읽기 전용 감사. 대상 브랜치에는 커밋·푸시·삭제를 하지 않았고, 이 파일 하나만 추가한다.

- 기준: `origin/main` = `8167b343` (2026-10-05, #1336)
- 요청 목록은 「11개」였지만 실제 이름은 **16개**였다. 16개 전부 판정했다.
- 「앞선 커밋」·「나이」는 요청서의 값이 아니라 이번에 잰 값이다
  (`git rev-list --count origin/main..origin/<b>`, 마지막 커밋 committer 날짜 기준 2026-10-05까지 일수).
  요청서와 다른 곳: `company-anatomy-xxxix` 3→**2**커밋, 21일.
- 「main 반영」은 PR 상태만 보지 않고 **파일 내용**으로 확인했다. 브랜치가 바꾼 파일마다
  브랜치 쪽 blob 이 지금 main 과 같은지, 다르면 main 이력 어딘가에 같은 blob 이 있는지
  (`git log origin/main --find-object=<blob>`) 를 봤다.
- 충돌은 `git merge-tree --write-tree origin/main origin/<b>` (git 2.43) 로 쟀다. 숫자는 충돌 파일 수.
  `--allow-unrelated-histories` 는 공통 조상이 없는 두 브랜치에만 의미가 있다.

## 판정표

| 브랜치 | 앞선 커밋 | 나이 | 무엇을 바꿨나(한 줄) | main 반영 여부(근거) | 충돌 | 판정 | 근거 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `company-anatomy-xxxix` | 2 | 21일 | 기업 해부 ⅩⅩⅩⅧ S.C.A + ⅩⅩⅩⅨ 가나 두 캐너리 | 반영됨 — #1056 `4254f14a`(ⅩⅩⅩⅧ), #1063 `5146b583`(ⅩⅩⅩⅨ). 이 브랜치의 PR #1062 는 **병합 없이 닫힘**(#1063 으로 대체) | 15파일 | 버릴 것 | #1063 은 같은 커밋을 main 위에 다시 얹고 후속 정정 `0a3732ca`(「카드가 발행본에 없는 값을 쓰던 자리를 고친다」)를 더한 것이다. 이 브랜치에만 남은 차이(`Cosmo_미상_지분_pct` 76.16, `설비칸_총` 등 3파일)는 그 정정 **이전** 값이다. 합치면 정정이 되돌아간다 |
| `codex/company-reports-upgrade-20260907` | — | — | (원격에 없음) | 확인 불가 — `git ls-remote origin` 에 이 이름이 없고, 이 head 로 연 PR 도 0건 | — | 판단 불가 | 원격에 브랜치가 없다. 이미 지워졌거나 로컬(다른 worktree)에만 있다. 로컬 사본을 가진 쪽에서 다시 재야 한다 |
| `codex/company-report-native-runtime-20260907` | — | — | (원격에 없음) | 확인 불가 — 원격 ref·PR 0건 | — | 판단 불가 | 위와 같음 |
| `claude/fcf-full-annex-20260908` | — | — | (원격에 없음) | 확인 불가 — 원격 ref·PR 0건 | — | 판단 불가 | 위와 같음. 참고로 main 의 FCF 관련 마지막 커밋은 #1092 `ac2f2bbd`(FCF 층 혼동 정정) |
| `codex/frinsa-native-adapter-20260907` | — | — | (원격에 없음) | 확인 불가 — 원격 ref·PR 0건 | — | 판단 불가 | 위와 같음. 원격에 남은 Frinsa 브랜치는 `cc/frinsa-anatomy`·`feat/company-frinsa` 뿐(이번 대상 아님) |
| `codex/frinsa-upgrade-20260907` | — | — | (원격에 없음) | 확인 불가 — 원격 ref·PR 0건 | — | 판단 불가 | 위와 같음 |
| `codex/company-flags-20260906` | 1,555* | 29일 | 국기 타일 문양·비율 수정 + 동원·사조 해부 + KPI 소수 둘째 자리 | 반영됨 — PR #931 squash 병합(2026-09-06). 바꾼 파일의 blob 다수가 현재 main 의 뿌리 커밋 `32f173f2` 에 그대로 있다(국기 SVG 8종·`CompanyGallery.*`·사조 그림·`company-sajo.ts`). 나머지는 그 뒤 main 에서 더 고쳐졌다 | 300파일* | 버릴 것 | *main 이력이 2026-09-09 `32f173f2` 를 뿌리로 다시 쓰여 공통 조상이 없다. 1,555는 옛 이력 전체를 센 숫자이고 충돌도 그 때문이다. 내용은 이미 main 에 있다 |
| `squid-ksl-korean-20260911` | 1 | 24일 | 오징어 KSL 한국계 경영 확인 반영 | 반영됨 — PR #1025 → `7f877fad` | 2파일 | 버릴 것 | 바꾼 6파일이 모두 main(`7f877fad` 또는 현재)과 같은 blob. 충돌은 그 뒤 main 이 같은 파일을 더 고친 탓 |
| `fix/bounty-ep-page-offset` | 1 | 15일 | ⅩⅬⅦ Bounty 유럽의회 Table 5 쪽수 「인쇄 52쪽」→「54쪽」 | 미반영 — PR #1179 **병합 없이 닫힘** | 없음 | 버릴 것 | 작성자가 #1179 에서 직접 기각: PDF 를 쪽마다 찍어 보니 「인쇄쪽 = PDF쪽 − 4」가 맞고 원래의 「52쪽」이 옳았다. 충돌은 없지만 합치면 **틀린 값이 들어간다** |
| `company-anatomy-xl` | 1 | 21일 | 기업 해부 ⅩⅬ 아소르스 다섯 캔공장 | 반영됨 — PR #1083 → `88b0908c` | 10파일 | 버릴 것 | 바꾼 22파일이 모두 `88b0908c` 또는 현재 main 과 같은 blob |
| `data/bangkok-2026-08-26` | 1,422* | 40일 | 방콕 주간보고 2026-08-26(289주) 반영 | 반영 후 대체됨 — PR #793 squash 병합(2026-08-26). 그 뒤 main 이 주간 데이터를 계속 갱신(최신 #1288 `7ccb3112`, 0930 보고서) | 678파일* | 버릴 것 | *`codex/company-flags-20260906` 과 같은 이력 재작성 전 브랜치. 데이터는 이미 다섯 주 넘게 새 값으로 덮였다 |
| `company-anatomy-xlvi` | 7 | 15일 | 기업 해부 ⅩⅬⅥ CAPSEN(세네갈) + ⅩⅬⅤ 포함 + 시점 표기 정정 3건 | 반영됨 — PR #1141 → `8daeae93`(정정 커밋 포함 squash) | 10파일 | 버릴 것 | 바꾼 19파일이 모두 `8daeae93` 또는 현재 main 과 같은 blob. 다른 것은 생성물 `docs/lineage/widget-lineage.*` 뿐이고 main 쪽이 더 새것 |
| `feat/chart-followups` | 1 | 24일 | /pork·코스모 차트 색 SERIES 화 + head 스크립트 hydration 경고 제거 | 반영됨 — PR #1029 → `b5ff5428` | 1파일 | 버릴 것 | 바꾼 6파일이 모두 `b5ff5428` 또는 현재 main 과 같은 blob |
| `company-anatomy-xlv` | 1 | 19일 | 기업 해부 ⅩⅬⅤ Kingfisher Holdings(태국) | 반영됨 — PR #1130 → `1b261e2a` | 11파일 | 버릴 것 | 생성물 lineage 2파일 말고 전부 `1b261e2a` 또는 현재 main 과 같은 blob |
| `company-anatomy-xlii` | 1 | 20일 | 기업 해부 ⅩⅬⅡ 모리셔스 | 반영됨 — PR #1109 → `7dbc3a71` | 11파일 | 버릴 것 | 바꾼 24파일이 모두 `7dbc3a71` 또는 현재 main 과 같은 blob |
| `company-anatomy-xli` | 1 | 21일 | 기업 해부 ⅩⅬⅠ TOG(코트디부아르) | 반영됨 — PR #1096 → `25166b7f` | 10파일 | 버릴 것 | 바꾼 22파일이 모두 `25166b7f` 또는 현재 main 과 같은 blob |

「충돌 있음」이 하나도 없는 이유: 충돌이 나는 브랜치는 모두 내용이 이미 main 에 들어간 뒤 main 이 같은
파일을 더 고친 경우라 「버릴 것」으로 판정했다. 충돌 수치는 참고용으로만 남긴다.

## 판정별 개수

| 판정 | 개수 |
| --- | --- |
| 병합할 것 | 0 |
| 버릴 것 | 11 |
| 충돌 있음 | 0 |
| 판단 불가 | 5 |
| **합계** | **16** |

「판단 불가」 5개는 원격에 없는 브랜치다. 로컬 사본이 있는 worktree 에서
`git log origin/main..<브랜치>` 를 다시 돌려야 판정할 수 있다.

## 「버릴 것」 삭제 명령 (실행하지 않았다)

되돌리기 어려운 작업이라 실행은 사람이 한다. 지우기 전에 혹시 몰라 tip SHA 를 적어 둔다
— 필요하면 `git push origin <sha>:refs/heads/<브랜치>` 로 되살린다.

```bash
git push origin --delete company-anatomy-xxxix              # 49d81a0e
git push origin --delete codex/company-flags-20260906       # 28ee375d
git push origin --delete squid-ksl-korean-20260911          # a98be4d9
git push origin --delete fix/bounty-ep-page-offset          # 785ad2c3
git push origin --delete company-anatomy-xl                 # 420c71b8
git push origin --delete data/bangkok-2026-08-26            # e7891912
git push origin --delete company-anatomy-xlvi               # c8a13b9a
git push origin --delete feat/chart-followups               # 061ef179
git push origin --delete company-anatomy-xlv                # c6feaf45
git push origin --delete company-anatomy-xlii               # 632644f1
git push origin --delete company-anatomy-xli                # e5a6d1de
```
