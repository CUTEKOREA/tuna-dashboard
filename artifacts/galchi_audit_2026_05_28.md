# 갈치(Hairtail) 페이지 위젯 신뢰도·유효성 감사

> 2026-05-28 Claude Code · Multi-Agent (Antigravity Flash + Codex + WebSearch × 2) · 비용 $0

## Executive Summary
- **JSON 28 위젯 · TSX GalchiDashboard 1개 (모두 JSON 기반)**
- **4-Axis 평균: 77.6 / B등급** (A 1 / B 19 / C 8 / D 0)
- **API 라우트 14개** (역대 최대)

### P0 6건 (즉시 정정 완료)
6개 API 라우트 모두 `isLive: true` 하드코딩 (참치/고등어/오징어 패턴 재현 — 4번째 commodity에도 발견):
- comtrade, kosis, mfds, oec, ofac, wto → `isLive: false /* Mock */`로 일괄 정정
- 시스템적 함정: 4-commodity 누적 17건의 동일 패턴

### P1 2건 (Codex 검증 EDIT)
- **w05** 중국 95% 의존 → "HS 0303899060 냉동 갈치 중국 비중 95.9%"로 범위 명시 (전체 수입은 오만·세네갈·서아프리카 다변화)
- **w19** TAC 소진율 → 1차 출처 "해양수산부 + 통계청/해수부 위판통계"로 승격, USDA GAIN은 보조 배경

### 검증 통과 8건
- hsping, importyeti, kcs, noaa, osh, tariffs (API) — 라이브 호출 정상
- 나머지 위젯 — 도메인 정합성 양호

## 신규 인프라
- [docs/2026_galchi_industry_sources.md](../docs/2026_galchi_industry_sources.md) — 14건 (WebSearch × 2 + 도메인 지식)
- [scripts/extract_galchi_widgets.py](../scripts/extract_galchi_widgets.py)
- [artifacts/galchi_combined_audit_antigravity.md](./galchi_combined_audit_antigravity.md)
- [artifacts/galchi_4axis_scores.csv](./galchi_4axis_scores.csv)

## Multi-Agent ($0)
- Antigravity Flash medium variant → P0/P1 발견 (foreground 호출 필요했음, background hang 재발)
- Codex GPT-5.5 → 3건 모두 EDIT 정당
- WebSearch × 2 → 글로벌·한국 갈치 데이터
- Grok CLI → 무응답 (1바이트, 환경 이슈 의심)

## 5 commodity 누적 (4-commodity audit + galchi)
- 동일 함정 패턴 17건 (isLive 허위 라이브) — **시스템적**: 향후 audit skill에 자동 검색 추가 권장
