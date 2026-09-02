# 방콕 SKJ 3개월 시세 예측 — 오케스트레이션 run-log (2026-09-02)

| leg | 담당 | 상태 | 산출물 |
|---|---|---|---|
| A 문헌·정량관계 | Grok | 완료 (33주장, exit 0) | scratch orch/out_grok_A_literature.md |
| B 무료 데이터원 발굴 | Grok | 60분 무응답 → kill (archivist가 대체) | orch/out_grok_B_sources.md |
| C 실시간 시장·X | Grok | 완료 (21항목, Q4 컨센서스 «상승») | orch/out_grok_C_realtime.md |
| D 주간 하네스 반증 | Codex | 60분 무응답 → kill (중간보고: 재현 일치, A·8주만 기준선 상회) | orch/out_codex_D_review.md |
| E 월별 모델 독립 재구현 | Codex | 완료 — 197오리진 MAPE 14.671/15.468/15.559 재현, 누출 4항목 전부 반증(없음) | orch/out_codex_E_reimpl.md |
| F 하락 예측 반증(실시간) | Grok | 완료 — «상방 위험 큼, 반증 실패». 엘니뇨 해 2015·2023 8→11월 −33%·−17% | orch/out_grok_F_bearcase.md |
| 1차 시리즈 수집 | source-archivist(skj-sources) | 완료 5/6 — ONI(v5·v6·RONI 1950~) · WCPFC 선망 월별 5°셀 SKJ/YFT/BET 1967-12~2024-12 · 태국 HS030343 월별 2015-01~2023-01(46개월 공백) · 미국 HTS1604.14 월별 2015~2026-06 · USD/THB(BIS 월·Fed 일). 실패: FFA TIN 시세(Cloudflare 403·Wayback 404·PDF에 수치 없음) | orch/archive/README.md |
| 월별 결과 적대 리뷰 | adversarial-reviewer(skj-forecast-review) | 완료 — 판정 «수정»: 누출 없음, 우위 0.3~0.9pp 유의 안 함(DM p 0.17·블록부트 CI 0 포함), 계절기준선 약함(감쇠×0.5=15.01), MA24 항 기여 0, 추세 국면 구조적 열세 | 재실험 3개 반영 → 리포트 재생성 |
| 메인 | Claude Code | 월별 30년 백테스트·유의성·창 민감도·유사국면·TU 교차검증 완료 | docs/2026-09-02_skj_monthly_forecast_backtest.md |

재스폰 규칙: 벤더 leg 60분 무응답 시 kill 후 축소 브리프로 1회 재시도, 그래도 없으면 사람 에스컬레이션.
검수 지점: ① 데이터원 목록(Grok B + archivist 보고 후) ② 백테스트 점수(완료, 사용자 보고 예정). 화면 반영 없음.
| Fable 5.1 독립 재검증 | general-purpose(model=fable, fable-forecast-verify) | 완료 — 사양만으로 재구현, 전 수치 재현(MAPE·DM p·블록부트·밴드). 판정 «점선 조건부»: «예측» 라벨 불가, «8→11월 과거 같은 달 평균 변화(감쇠)» + 선행잔차 80% 밴드 + «최근 10년 하락 6/10» 병기일 때만. 엘니뇨 9개 해 8→11월 8회 하락(평균 −19%)이라 상방 아닌 하방 위험. 롤링 120개월 훈련창은 더 나쁨(14.36→14.61) | scratch verify_skj.py, verify_skj_extra.py |
