# 클라우드 크레딧 소진 작업 — S-Grade 루프 + 수집기 복구 (2026-10-08)

1. 완료 조건: ① main에서 `python3 scripts/check_s_grade.py <14 entries> --strict` exit 0, data-freshness.yml이 같은 날 이슈를 중복 생성하지 않음 ② 수집기 squid·cocoa·garlic·carrot·cashew가 workflow_dispatch로 success + 산출 파일 행 수가 직전 커밋 대비 30% 넘게 줄지 않음
2. 분해: A tuna-dashboard S-Grade(클라우드 1세션) ∥ B squid 코드 버그(클라우드 1세션) ∥ C cocoa·garlic·carrot·cashew는 10-05 수정 존재 → 로컬 dispatch로 먼저 검증, 실패분만 세션 추가. tuna-data-collector는 GCP(Actions 없음) → 제외
3. 배치: 작성=클라우드 세션(PR만, 병합·이슈 close 금지) / 검증=메인(CI 결과·행 수 대조·PR diff 리뷰)
4. 검수 지점: PR 병합 직전, 이슈 100건 일괄 close 직전

## 진행
| leg | 상태 | 산출 | 비고 |
|---|---|---|---|
| A S-Grade | PR #1386(4커밋, 미병합) · 로컬 worktree(크레딧 미사용) · 테스트약화 0 · Codex 1차: 수정필요 2·4·6 → 254be71d 반영(P1 정규식→명시 6건, 연어 폴백 제거+source, per_page 100) · Codex 2차: 2(source prop 미렌더=죽은 prop) → 제거 커밋 cf87d8c6 · **CI 녹색**(lint·typecheck·test·build, run 37738725142) · 병합 대기(사람 검수 지점) | Agent remote(sgrade-cloud), 브랜치 fix/s-grade-loop-20261008 | 10-08 15:07 발주 |
| B squid | PR squid-data-collector#1(미병합, 643초·39턴) · Codex 1차: 수정필요 3(partial=exit0)·4(check_rows가 raw까지)·6(예외에 키 노출) → 2차 클라우드 세션 cse_016DbZzeFL2QAeXqVfpUyTT3 (234초·21턴) 커밋 e55c64a·963996f·8dced8f, pytest 42 passed, PR 본문 갱신 · 잔여: truncated 플래그를 세팅하는 수집기 없음 · Codex 2차: 1(preview 500 상한 truncated 미설정)·2(raw 제외 경로 정규화) → 메인 직접 0da8423·f45bce1, pytest 43 · **병합 대기(사람 검수 지점)** · 실제 exit1 원인=.gitignore · 키 노출(USDA 미회전) | 수동 run 06:15:58Z, 세션 cse_017uSK2z2iYYXt5qTTNskeUB (예약 발화는 5분 지나도 안 와서 수동, 중복 방지로 루틴 비활성) | trig_01Kcuomn2zKLZu7ANKsqRNTe, opus-5-5, 브랜치 fix/collector-recovery-20261008 | `claude --cloud`는 대화형 전용이라 RemoteTrigger 로 |
| C dispatch | 4/4 success + 데이터 커밋·행 수 확인(cocoa FAO 237K/Comtrade 1.25M/USDA 1.6K · garlic 85K/724K/8.5K · carrot 29K/739K/7K · cashew 40K/314K/2.4K, exit 0·failed 0) | cocoa 37735681441 · garlic 37735685431 · carrot 37735690600 · cashew 37735695005 | 10-08 15:2x 발주 |
| tuna-data-collector | 제외 | GCP(deploy.sh), Actions 없음 | 로컬 GCP 자격으로 별도 |
| C-2 green 5 재검증 | 06:33Z dispatch | mackerel 37738016342 · shrimp 37738022172 · pollock 37738026612 · salmon 37738031272 · seafood 37738036672 | 10-01 커밋이 −245K 줄 등 순삭제라 10-05 수정 뒤 행 수 복구 확인용 |

## 2단계 (사용자 「모두 진행」 06:55Z)
| 항목 | 상태 | 비고 |
|---|---|---|
| ① #1386 병합 | **차단** — auto-mode 분류기 「Merge Without Review」가 `gh pr merge` 거부 | 사용자가 직접 `gh pr merge 1386 --squash --delete-branch` 또는 권한 규칙 추가 |
| ② squid PR #1 병합·워크플로 활성 | 같은 이유로 보류 | 병합 뒤 `gh workflow enable` + dispatch 는 메인이 |
| ③ 자동 이슈 close | **차단** — 분류기 「External System Writes」 | 사용자 실행: `docs/run-log/cloud-credit-stage2-commands.sh 3` |
| ④ 노출 로그 삭제 | 사용자 실행: `cloud-credit-stage2-commands.sh 4` (삭제 전 목록은 아래) · USDA 키 재발급은 사용자(api.data.gov 계정) | 아래 |
| ⑤ #1337 | 루틴 trig_01Uoon427apinicipMp7evN2 → 세션 cse_01JLkAFtyreyiLMo5B1Z6piq (07:01:12Z) | opus-5-5, 루틴 비활성(중복 방지) |
| ⑥ #829 | 루틴 trig_01MyJrj24W1DXtLLK3PdKGKF → 세션 cse_01SjKDyWrHgHoN9ePcDX87Rp (07:01:12Z) | opus-5-5, 루틴 비활성 |

### ④ 노출 run 목록 (COMTRADE_API_KEY·USDA_API_KEY 가 step env 로 평문 출력, squid #10 로그에서 확인)
- squid: 36929342350,35016633296,33551153441,31897846925,30711415517,29438952978,28540694750,27573992509,26781406790,25934179419
- cocoa: 36929554837,35017146645,33551301561,31897985203,30711533110,29439289451,28540780910,27574108011,26781520250,25934313300
- garlic: 36929162952,35016558728,33551037600,31897710988,30711356653,29438830212,28540612116,27573910650,26781315715,25934082124
- carrot: 36929496077,35017134343,33551304805,31897955729,30711524882,29439226211,28540772600,27574104395,26781498266,25934277262
- cashew: 36928664225,35016275665,33550753986,31897509062,30711078520,29438744625,28540411156,27573728040,26781150367,25933945457
- mackerel: 36930077727,35017340968,33551434851,31898124174,30711608946,29439457875,28540843237,27574203057,26781593777,25934327502
- shrimp: 36929054288,35016428604,33550879088,31897595429,30711245810,29438764111,28540524816,27573874160,26781197302,25934005298
- pollock: 36929853219,35017260713,33551367592,31898068465,30711590218,29439384762,28540816711,27574202749,26781541058,25934321858
- salmon: 36929981181,35017273400,33551410700,31898093785,30711600954,29439405870,28540825752,27574217310,26781544594,25934335045
- seafood: 36929299262,35016587553,33551106465,31897797755,30711409951,29438875799,28540668678,27573942585,26781378192,25934101422
- cassava: 36929078395,35016436663,33550928401,31897612860,30711270261,29438770183,28540541802,27573882140,26781370924,25934007616

### C-2 발견 — pollock(06:54Z success 커밋)은 초록인데 FAO trade·trade_partners=error, USDA partial(실패 96). 10-05 수정이 종료 정책·FAO .str 을 안 건드린 레포가 있다 → squid PR 의 정책(실패=exit1·행 수 가드·_as_text) 이식 후보.

### 3단계 — 수산 수집기 5개 강화 이식 (클라우드 5세션, 07:10~07:11Z 발화, 루틴 전부 비활성)
| 레포 | 루틴 | 세션 |
|---|---|---|
| pollock | trig_01Jcyym8sg6fztbtc7ppkVkE | cse_0188kq5QUwmSbeueNkaKqMgD |
| mackerel | trig_01Tnpp36B7LrpzcsPrkZugFb | cse_01TtY4ALJaQmMWsN7i9Nu4sZ |
| shrimp | trig_01RA3sNXvnRa5PW1w29VxLhS | cse_01DtPxhz5Nsfgnnf9FjXQK5K |
| salmon | trig_01AurQzh2GeVKksR3nSMtkye | cse_01SiXJdxWDz6vWgUR8yeZdhB |
| seafood | trig_01GDhUCa4c4VXfFrSWJEtgs5 | cse_01YDZRFLbDhkX2NjoUShurmQ |
근거: 5개 전부 `fao_fishery.py` 에 `.str.contains` 1건, pollock·mackerel·shrimp·salmon 은 strict exit 없음(seafood 는 일부), check_rows 전무. 브랜치 `fix/collector-hardening-20261008`, PR 만.

### 07:21Z 재개 점검
- 사용자 스크립트 미실행(#1386·squid#1 OPEN, 이슈 654). 
- C-2 재실행: mackerel·shrimp·salmon success, seafood 진행 중. 셋 다 FAO 5개 success, Comtrade 162K/258K/154K, **USDA partial(실패 128·166·132건, 429)** 인데 success 커밋 → 느슨한 종료 정책 재확인. 동시 dispatch + 공유 키 = 429 → cron 충돌(12레포 1·15일 17:00) 분산 필요.
- **정정**: `.str` bool 오류가 실제 재현된 건 squid·pollock 둘뿐. mackerel·shrimp·seafood 는 `.astype(str)` 선행이라 안전(세션들이 스펙 불일치로 보고, 코드 안 바꾸고 회귀 테스트만). 내 grep(`.str.contains` 1건)이 결함 증거가 아니었다.
- 강화 PR: pollock#2 · mackerel#2 · shrimp#2 · seafood#4 열림, salmon 세션 진행 중. Codex 4병렬 리뷰 중(scratchpad/hard/).
- seafood 는 커밋 정책이 다름(exit 1 이어도 `!cancelled()` 로 커밋) — 기존 유지, 가드만 앞에.
- ⑥ #829 1차 세션(825초·38턴): main 병합 정리·verify 1,812 통과·build 통과했으나 PR 자체가 넣은 8-27 배포 해시 고정 테스트 1건 실패 → 지시대로 단언 안 바꾸고 **push 안 함**(샌드박스라 작업 소실). 판정: (a)(b)(c) 모두 PR 값 채택 권고, PANOFI MASTER 전장 64.7 vs 56.6 미결. → 2차 세션: 그 해시 테스트 기대값만 현재 main 값으로 갱신 허용 후 push.
- 강화 PR 4건 Codex 4병렬 리뷰: 전부 「수정 필요 — 2(partial exit 0)」 → 메인 판정 **기각**(partial 은 failed/truncated 동반일 때만 세팅됨을 diff 로 확인, seafood 는 failed_requests 스키마). 4건 병합 가능 → 스크립트 5단계 추가. 각 PR 에 리뷰 결과 코멘트.
- ⑤ #1337 세션 완료(cse_01JLkAFtyreyiLMo5B1Z6piq): 실패 원인은 lint/typecheck/test/build 가 아니라 같은 잡의 e2e `test:e2e:unloading-history` — Next 16.3.8 Turbopack 이 NetworkError 청크를 1회 재시도해 차단 횟수 기대값 1→2(`BLOCKED_CHUNK_ATTEMPTS`). 3커밋(main 병합 bc630c41 포함), CI 녹색 run 37742627376(head 33e89c23). 트레일러는 Opus 5.5 로 적음(세션 실제 모델). Codex 리뷰 중(e2e 단언 조정이 완화인지).
- salmon PR #2 열림 → Codex 리뷰 중.
- ⑥ #829 2차 세션(cse_01GpW3GNPH3cMK6RLKPwxCe9) push c429ad4b: 해시 테스트 d50fbd4b→216ae7aa(현 main detailSha256) 1건만 변경, 충돌 해소 1차와 동일. 메인 Python 대조: fleet_db 27,513행 중 전장 10,594건 정확히 /10, 다른 필드 0, _meta 동일. CI 진행 중 · Codex 코드 diff 리뷰 중(FleetRosterGrid 합침·LOAm 파서·계약 충돌).
- ⑤ #1337 Codex: 병합 가능(e2e 2회 차단 유지=격리 검증) → 스크립트 6단계. salmon#2 Codex: 1·2·6 → 기각(astype 선행·partial 조건·커밋 내 테스트) → 5단계에 추가.
- ⑥ #829 CI 녹색(run 37744096409) · Codex: 수정 필요 3(LOAm 파서 `1.234,5`→None) → **기각**(전장은 1,000 m 미만, 대조에서 None 신규 0) → 병합 가능, 스크립트 7단계. 미결: PANOFI MASTER 전장 64.7 vs 56.6.
- 클라우드 세션 합계 10개(squid 2·#1337 1·#829 2·강화 5). 모든 PR 검수 완료, 병합·이슈·로그 삭제는 사용자 스크립트 1~7단계.
- **① 완료(07:40Z, 사용자 실행)**: #1386 squash 6986af34 → main 의 Data Freshness Audit run 37744882726 **success**(위반 0, 새 이슈 0: 655→655) · Vercel production READY(dpl_D5uNJC3Biu613ufJHxgkcTCFNxvH).
- **② 완료(사용자 실행)**: squid#1 병합 b53f1b85 · 워크플로 active · 첫 실행 37745311542 진행 중.
- **⑤ 완료(사용자 실행)**: pollock 5a0331ed · mackerel 4f1cfa44 · shrimp 6c92f4b4 · seafood 753666c3 · salmon 321e943e 병합.
- ③ 이슈 close 진행 중(사용자 셸 백그라운드).
- cron 분산 PR 10건(메인 직접, 한 줄+YAML 확인): pollock#3 17:30 · mackerel#3 18:00 · shrimp#3 18:30 · salmon#3 19:00 · seafood#5 19:30 · cocoa#3 20:00 · garlic#3 20:30 · carrot#3 21:00 · cashew#3 21:30 · cassava#3 22:00 (squid 17:00 유지) → 스크립트 8단계.
- **squid 첫 실행(37745311542) success, exit 0, problems 0** — 05-05 이후 첫 데이터 커밋(08:10Z): FAO capture 26,811·global 26,888·aquaculture 487·trade 55·trade_partners 55(이전엔 .str 오류로 비어 있던 둘), Comtrade 50,163(failed 0·truncated 없음), USDA 1,345(failed 0).
- ③ 이슈 close: 489건에서 GitHub 2차 제한(addComment too quickly)로 중단, 166건 남음 → 스크립트 3단계를 코멘트 없이·재시도·1초 간격으로 고침(재실행하면 남은 것만 닫는다).
- **③ 완료**: 자동 이슈 0건(489+166 close, 두 번째 실행은 붙여넣기 사고로 중복 돌았으나 멱등). 3단계 재시도를 5회 상한으로 고침(닫힌 이슈 무한 재시도 방지).
- **⑥⑦⑧ 완료(08:2x Z, 메인 직접 — 이번엔 분류기가 허용)**: #1337 → 68d959fe · #829 → e372da16 · cron 분산 10건 병합(pollock d5a89efe · mackerel cea7d1d6 · shrimp 2575dde9 · salmon 83db7d91 · seafood 56b7a3f9 · cocoa db94c605 · garlic 654b22ad · carrot c214306a · cashew 1bbbb3bc · cassava f0522040).
- ④ 평문 키 로그 삭제 실행 중(11레포 × 10-05 이전 run).
- **④ 완료**: 11레포 × 10-05 이전 run 로그 110건 삭제(실패 0), API 404 확인(squid·pollock·cocoa 표본). `gh run view --log` 는 로컬 캐시라 여전히 보일 수 있음. 키 자체는 git 이력에 남아 있으므로 USDA 키 재발급은 여전히 필요.
- **배포 확인**: main CI(App Quality Gate·Data Freshness Audit) 68d959fe·e372da16 모두 success · Vercel production READY dpl_BTez9fiR7sDaByJy7ohhqyvRfWoL(#1337)·dpl_DaLdrNAGa3gFtQH9aDZ1wJb8ES78(#829).
- 미결(사용자/후속): USDA 키 재발급 + 12레포 시크릿 교체 · PANOFI MASTER 전장 64.7 vs 56.6 · seafood 커밋 정책(exit 1 이어도 커밋) 형제와 상이 · tuna-data-collector(GCP) 미점검 · seafood 옛 재실행 37738036672 결과.
