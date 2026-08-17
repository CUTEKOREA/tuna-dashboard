# 데이터 갱신 runbook (2026-08-17 제정)

시장 이해 5개 페이지·선단 DB 의 데이터는 전부 **정적 집계(SYNCED/STATIC)** 다.
가치가 신선도에 달려 있으므로 아래 주기로 갱신한다. 원칙:

- **수집 → 아카이브 → 재생성 → 검증 → 검토 → 배포.** 수집물은 반드시 Google Drive
  아카이브에 먼저 보존하고, 저장소의 빌드 스크립트가 아카이브를 읽어 재생성한다.
- 재생성은 `bash scripts/refresh_local.sh` 한 방 — 각 스크립트의 **합계 게이트가
  전사·수집 오류를 잡는다.** 실패하면 원자료부터 본다.
- 자동 커밋·자동 배포는 하지 않는다. `git diff` 검토 후 커밋, 배포는 push(pre-push
  빌드 게이트)로.

## 월간 (매월 초, ~30분)

| 대상 | 수집 | 소비자 |
| --- | --- | --- |
| 관세청 품목별 국가별 수출입실적 | `curl "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList?serviceKey=<키>&strtYymm=...&endYymm=...&hsSgn=160559"` → 아카이브 `whelk/…/KCS_품목별국가별/<날짜>/` (키: data.go.kr 마이페이지, **커밋 금지**) | `fix_whelk_legacy_series.py` (골뱅이 월별·분기 계열) |
| 시세 (Atuna) | 시장 동향 페이지 파이프라인이 별도 관리 — 이 runbook 밖 | — |

주의: 조회기간은 API 제약상 1년 이내 — 연도별로 나눠 받는다.

## 분기 (1·4·7·10월, ~2시간)

| 대상 | 수집 | 소비자 |
| --- | --- | --- |
| WCPFC 등록부 (선박별 상세 포함) | `scripts/fetch_wcpfc_owners.py` (공개 열람, 로그인 불요) → 아카이브 `tuna/…/RFMO_선박등록부/<날짜>/` | `build_tuna_ocean_operators.py` · `build_tuna_carrier_fleet.py` · `build_fleet_db.py` · `build_purse_seiner_data.py` |
| IATTC 등록부 | 목록은 in-page `RegionalVRClicked()` 경유, 상세는 `X-Requested-With: XMLHttpRequest` 헤더 필수 (아카이브 README 참조) | 위와 같음 |
| ICCAT (tsv) · IOTC (xlsx) | 각 기구 공개 다운로드 | 위와 같음 |
| SPRFMO 등록부 (오징어) | 공개 CSV — `sprfmo.org/rov/registry` | `build_squid_ocean_fleet.py` · `build_fleet_db.py` |
| CCSBT 승인선박 | 공개 CSV | `build_fleet_db.py` |

경로는 각 빌드 스크립트 상단 상수에 있다 — 새 날짜 폴더로 받았으면 상수의 날짜를
갱신하고, 그 변경 자체를 커밋에 남긴다(어느 스냅샷을 쓰는지가 코드에 보이게).

## 연간

| 대상 | 시점 | 절차 |
| --- | --- | --- |
| 원양산업 통계연보 (협회) | 신판 발간 시 (통상 9월) | 스캔본이면 페이지 직독 전사 — `build_kofa_fleet.py`(명부)·`build_kofa_insights.py`(생산성·입어료·선원)·`build_kofa_series.py`(수출·월별·어가)의 전사 데이터와 합계 게이트를 신판 수치로 갱신. **게이트를 먼저 신판 합계로 바꾸고 전사하라** — 그래야 전사 오류가 잡힌다 |
| FAO FishStat | 연 1회 (3~4월) | 아카이브 `FAO_FishStat/updates/<날짜>/` 갱신 → 관련 빌더 재실행 |
| ISSF 참치어업현황 | 연 2회 | 사실표 인용 수치(자원상태·선단) 원문 대조 갱신 |

## 재생성·검증·배포

```bash
bash scripts/refresh_local.sh   # 전 빌더 실행 + npm run verify
git diff --stat                 # 무엇이 변했는지 검토 — 예상 밖 변화면 멈추고 원인부터
git add -A && git commit        # HANDOFF.md 갱신 포함
git push                        # pre-push 빌드 게이트 → Vercel 배포
```

## 알려진 함정

- Google Drive 파일은 첫 접근 때 스트리밍이라 읽기가 실패할 수 있다 — 재시도.
- 등록부 표기는 흔들린다(한국만 5가지 표기). 새 표기가 나오면 빌더의 매핑 경고가
  찍힌다 — 경고를 무시하지 말고 매핑에 추가.
- 개인 소유주 익명화 규율: 법인 표지가 단어 경계로 안 잡히면 「개인 소유(추정)」.
  빌더가 이미 강제하지만, 새 수집 필드를 추가할 때 이 규율을 우회하지 마라.
