# 참치 위키 (Claude Code 검색 층) — 설계

> 2026-09-09 [CC] · 근거: graphify 실측 3회(노드 중복 15%·커뮤니티 73% 조각·밀도 0.73)와
> 통합프로필 7편의 구조 분석. Karpathy식 LLM 위키 패턴을 개체 단위 문서로 구현한다.
> **설계만 확정 — 구현은 소유자 승인 후.** 브레인스토밍 세션에서 A(Claude Code가 읽는 검색 층),
> 도메인 참치·수산, 접근 B(위키 층 신설), 저장 위치 로컬 git으로 확정됐다.

## 문제

참치·수산 도메인의 사실은 Drive `agri_data/…/tuna` 아래 원자료 수만 건과 통합프로필 7편에
흩어져 있다. Claude Code가 기업 해부 10편째나 대본을 쓸 때 신라교역·IATTC·어가 같은 것을
매번 원자료에서 다시 찾는다. 프로필이 이미 7편 있는데도 `CLAUDE.md`·`CONTEXT.md` 어디에도
「프로필을 먼저 읽어라」는 규칙이 없어 Claude Code는 그 존재를 모른다.

`docs/evidence/company-*`는 20개 폴더인데 통합프로필은 7편뿐이다. 그리고 프로필들을
가로지르며 반복되는 개체 — 선망 59회, MSC 38회, ICCAT 18회, IATTC 10회, WCPFC 8회 — 는
자기 문서가 하나도 없다. 「IATTC 등록 선사가 누구인가」를 알려면 프로필 7편을 다 열어야 한다.

graphify로 같은 문제를 풀어봤으나 노드 ID가 `{파일경로}_{개체}`라 같은 실체가 파일마다
다른 노드가 되고(중복 15%), 커뮤니티 109개 중 80개가 노드 1~2개짜리 조각으로 나왔다.
문서를 파일 단위로 쪼개는 방식은 이 코퍼스에 맞지 않는다. 개체 단위 문서가 답이다.

## 원칙

- **개체 하나에 문서 하나.** 회사·RFMO·어법·인증·제도가 각각 한 장. 파일 수가 늘어도
  개체 수는 늘지 않으니 중복과 조각이 구조적으로 생기지 않는다.
- **출처 없는 문장은 위키에 못 들어간다.** `## 사실`의 모든 불릿은 `[출처 n]`으로 끝난다.
  훅이 막는다. graphify에서 노드 68개가 출처 없이 남았던 구멍을 구조로 닫는다.
- **Drive는 원본, 위키는 검색 층.** 프로필 164줄을 복사하지 않는다. 위키 문서는 요약과
  핵심 사실만 갖고 프로필을 출처 [1]로 가리킨다.
- **자동 쓰기 없음.** 갱신은 사람이 부르고 LLM이 제안하고 사람이 승인한다. writer≠reviewer.
- **write-through.** 보고서를 쓰다 원자료에서 새 사실을 확인하면 보고서에 넣기 전에 위키에
  먼저 넣는다. 위키는 보고서 집필의 부수 효과로 자란다. 이것이 자동화 없이 살아 있는 이유다.
- **결정적 산술은 스크립트로.** INDEX.md는 프론트매터에서 생성한다. 손으로 쓰지 않는다.

## 1. 위치·구조

```
~/tuna-dashboard/wiki/
  INDEX.md                    ← Claude Code가 먼저 읽는 단 한 장. scripts/build_index.py 가 생성
  _template.md
  companies/                  20장
  rfmo/                        4장   IATTC WCPFC IOTC ICCAT
  gear/                        2장   선망 연승
  certs/                       2장   MSC Dolphin_Safe
  regimes/                     3장   IUU FAD EEZ
  scripts/build_index.py
```

파일명은 통합프로필 제목의 정식 표기를 쓰고 공백은 `_`로 바꾼다 (`동원산업.md`, `Thai_Union.md`).
위키링크 `[[이름]]`은 파일명 stem으로 건다. 별칭은 프론트매터 `aliases`에 둔다.

위키는 `tuna-dashboard` 저장소 안에 둔다. 증거 폴더와 CLAUDE.md가 이미 여기 있고,
훅을 저장소 단위로 걸 수 있다. Drive에 두면 훅이 돌지 않는다.

## 2. 문서 스키마

```markdown
---
type: company | rfmo | gear | cert | regime
name: 동원산업
aliases: [Dongwon Industries, 동원]
country: KR                      # company 에만
last_verified: 2026-09-09
confidence: A | B | C            # A 1차출처 직접 확인 · B 독립 2곳 일치 · C 단일 2차 출처
profile: <Drive 통합프로필 경로>  # 있는 경우만
---
# 동원산업

## 요약
5줄 이내. Claude Code가 이것만 읽고 다음으로 넘어갈 수 있는 밀도로 쓴다.

## 사실
- 주장 하나가 불릿 하나. 불릿은 반드시 `[출처 n]`으로 끝난다.
- IATTC 등록 선망선 12척 (2026-06 기준) [출처 2]

## 관계
- [[IATTC]] 등록 · [[선망]] 주력 · [[MSC]] 인증 3건 · 경쟁 [[사조그룹]]
  위키링크로만 적는다. 이 절이 Obsidian 그래프의 엣지가 된다.

## 미확인
통합프로필 §12를 계승한다. 항목마다 「다음에 뚫을 경로」를 적는다.

## 출처
[1] Drive …/03_통합/10_동원산업_통합프로필.md (2026-08-30 확보)
[2] …/tuna_whitepaper_원자료_20260806/RFMO등록부/IATTC_2026-06.csv

## 정정 이력
- 2026-09-09 초기 이관 (프로필 ⅩⅡ 기준)
```

`confidence`는 문서 전체의 대표 등급이다. 불릿 단위 등급이 필요해지면 그때 `[출처 n, B]`
형태로 확장한다 — 지금은 넣지 않는다.

## 3. 개체 31장

| 유형 | 수 | 목록 |
|---|---|---|
| company | 20 | 동원산업 사조그룹 신라교역 Albacora Bolton_Food Bumble_Bee Century_Pacific FCF Frabelle Frinsa ITOCHU JAIS Jealsa Kyokuyo Nauterra Nissui SeaValue StarKist Thai_Union Umios |
| rfmo | 4 | IATTC WCPFC IOTC ICCAT |
| gear | 2 | 선망 연승 |
| cert | 2 | MSC Dolphin_Safe |
| regime | 3 | IUU FAD EEZ |

`docs/evidence/`의 `company-bolton`과 `company-boltonfood`는 같은 회사이므로 한 장이다.
신라교역은 증거 폴더가 없지만 이 대시보드의 주체이자 관계의 허브라 넣는다.
`CONTEXT.md`와 대시보드 데이터에서 시드한다.

통합프로필이 있는 7곳(동원·사조·Jealsa·StarKist·Century_Pacific·Nauterra·Bolton_Food)은
내용이 찬 문서로, 나머지 13곳은 `## 요약`과 `## 미확인` 위주의 뼈대로 시작한다.
개체 11장은 짧다 — 「누가 여기에 걸려 있는가」가 본문이다.

## 4. INDEX.md와 검색 규칙

`INDEX.md`는 유형별 표다. 열은 `이름 | 별칭 | 요약 1줄 | last_verified | confidence`.
35행 안팎. `scripts/build_index.py`가 각 문서의 프론트매터와 `## 요약` 첫 줄에서 생성한다.

검색 규칙은 다음 문장을 `tuna-dashboard/CLAUDE.md`와 `~/.claude/skills/tunacompany/SKILL.md`
두 곳에 같은 내용으로 넣는다.

> 참치·수산 도메인의 기업·RFMO·어법·인증·제도 사실이 필요하면 `wiki/INDEX.md`를 먼저 읽고
> 해당 문서의 `## 사실`을 인용한다. 문서가 없거나 항목이 `## 미확인`에 있을 때만 원자료
> (Drive `agri_data/01_수산물(Seafood)/tuna`)로 간다. 원자료에서 새 사실을 확인했으면
> 보고서에 쓰기 전에 위키 문서에 먼저 넣는다.

## 5. 갱신 흐름

CLI를 만들지 않는다. `tunacompany/SKILL.md`에 절 하나를 추가한다.

**`wiki-update <개체> <새 원자료 경로…>`** — 사람이 부른다.

1. 해당 문서와 새 원자료를 읽는다.
2. 추가할 사실과 바뀐 사실을 diff 형태로 **제안만** 한다. 불릿마다 출처를 붙인다.
3. 사용자가 승인한다.
4. 적용하고 `## 정정 이력`에 한 줄 남기고 `last_verified`를 올린다.
5. 훅 통과를 확인한다.

트리거는 셋이고 전부 수동이다 — tunacompany 발행 직후, Atuna 일일 브리핑에서 개체가
걸렸을 때, 사용자가 문서가 낡았다고 판단할 때. 자동 쓰기는 없다.

승격 경로: Atuna 일일 잡이 「건드린 개체 목록」만 출력하게 한다. 쓰기는 시키지 않는다.
이것은 B가 굴러간 뒤에 판단할 일이고 이 스펙의 범위 밖이다.

## 6. 검증 훅

`~/.claude/harness/verify/verify_wiki.sh` — PostToolUse `Write|Edit`, 경로가
`wiki/**/*.md`일 때만 반응한다. 2026-09-08에 만든 `verify_bc_script.sh`와 같은 골격이다.

검사 네 가지:

1. 프론트매터에 `type` `name` `last_verified` `confidence`가 있는가.
2. `## 사실` 아래 모든 불릿이 `[출처 \d+]`로 끝나는가.
3. 본문의 `[출처 n]`이 전부 `## 출처`에 정의돼 있는가.
4. `[[링크]]`가 `wiki/` 안의 실제 파일로 풀리는가 — 깨지면 경고만 하고 막지 않는다.

1~3 위반은 `decision: block`과 사유를 돌려준다. 파이프 테스트 세 케이스(통과·무관 파일·위반)
뒤에 Write 도구로 실제 발화를 확인한다.

## 7. 시드 순서

값어치가 먼저 나오는 순서로 간다.

```
1  기업 7장   통합프로필 → 문서. writer=메인,
              reviewer=adversarial-reviewer 가 사실 불릿마다 프로필 원문과 대조
2  INDEX      build_index.py 로 생성
3  규칙·훅    CLAUDE.md + SKILL.md 문장 삽입, verify_wiki.sh 배선   ← 여기서 값어치 발생
4  개체 11장  7장의 ## 관계 와 RFMO 원자료(tuna_whitepaper_원자료_20260806)에서
5  기업 13장  docs/evidence/company-*/보고서.html → 요약 + 미확인 위주
```

3까지 끝나면 Claude Code는 그 7개 회사를 다시 뒤지지 않는다. 4와 5는 그 뒤에 붙는다.

## 8. 완료 조건

- `wiki/INDEX.md`가 스크립트로 생성되고 31행 이상이다.
- 문서 31장이 전부 훅을 통과한다 (`verify_wiki.sh`를 전 파일에 일괄 실행해 실패 0건).
- 검색 규칙 문장이 `CLAUDE.md`와 `tunacompany/SKILL.md` 두 곳에 있다.
- 실사용 테스트 1회: 새 세션에서 「동원산업 IATTC 등록 선박 몇 척」을 묻고, 도구 호출
  기록에서 `wiki/` 읽기가 먼저 나오고 Drive 접근이 없음을 확인한다.

## 범위 밖

- graphify — 쓰지 않는다. 개체 단위 문서에 위키링크면 그래프는 Obsidian이 그린다.
  31장이 완성된 뒤 놓친 교차 링크를 찾는 1회용으로 쓸 수는 있다.
- Obsidian 설정 — 위키링크 문법만 지킨다. 볼트로 열지 여부는 별개다.
- 자동 갱신 — 위 §5 승격 경로 참조. 이 스펙에서는 하지 않는다.
- 벡터 검색 — 31장은 INDEX 한 장으로 찾는다.
- 다른 도메인(품목 6종·한국기업흥망사) — 같은 템플릿으로 나중에. 이 스펙은 참치만 다룬다.

## 열린 질문

없음. 위 8절은 2026-09-09 세션에서 절별로 확인받았다.
