# 참치 위키 — Claude Code 검색 층

참치·수산 도메인의 기업·RFMO·어법·인증·제도 사실이 필요하면 `wiki/INDEX.md`를 먼저 읽고
해당 문서의 `## 사실`을 인용한다. 문서가 없거나 항목이 `## 미확인`에 있을 때만 원자료
(Drive `agri_data/01_수산물(Seafood)/tuna`)로 간다. 원자료에서 새 사실을 확인했으면
보고서에 쓰기 전에 위키 문서에 먼저 넣는다.

## 구조

- `INDEX.md` — 생성물. `python3 wiki/scripts/build_index.py`로 다시 만든다. 손으로 고치지 않는다.
- `companies/` `rfmo/` `gear/` `certs/` `regimes/` — 개체 한 장씩. `_template.md`에서 시작한다.
- `## 사실`의 모든 불릿은 `[출처 n]`으로 끝난다. 저장 시 훅이 검사한다.
- `## 관계`는 `[[파일명stem]]` 위키링크로만 쓴다.

## 갱신

`tunacompany` 스킬의 `## 5. wiki-update` 절을 따른다. 자동 갱신은 없다.

## 설계

`docs/superpowers/specs/2026-09-09-tuna-wiki-design.md`

## 훅

`~/.claude/harness/verify/verify_wiki.sh` (PostToolUse Write|Edit) 가 저장 시 `scripts/check_article.py`를 돌린다. 오류면 저장이 막힌다.
