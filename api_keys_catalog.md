# 🔑 API Keys Catalog — Silla Co. Intelligence Dashboard

> **최종 업데이트**: 2026-05-13  
> **관리 원칙**: API-First Integration Protocol에 따라 모든 데이터 위젯은 Live API를 1순위로 사용합니다.  
> **환경변수 파일**: `.env.local`

---

## 📋 목차

- [현재 활성 API (등록 완료)](#현재-활성-api-등록-완료)
- [신규 등록: 글로벌 무역 인텔리전스 (무료)](#신규-등록-글로벌-무역-인텔리전스-무료)
- [신규 등록: HS 코드 & 관세 특화 (무료/Freemium)](#신규-등록-hs-코드--관세-특화-무료freemium)
- [신규 등록: 바이어/공급업체 발굴 (무료)](#신규-등록-바이어공급업체-발굴-무료)
- [신규 등록: 제재 & 컴플라이언스 (무료)](#신규-등록-제재--컴플라이언스-무료)
- [유료 후보 (미등록)](#유료-후보-미등록)
- [API 등록 체크리스트](#api-등록-체크리스트)

---

## 현재 활성 API (등록 완료)

### 🇰🇷 한국 공공데이터 API

| # | API 이름 | 환경변수 | 용도 | 상태 |
|:-:|:---------|:---------|:-----|:----:|
| 1 | **관세청 (KCS)** — 수출입무역통계 | `KCS_API_KEY` | 품목별/국가별 수출입 실적 (GW) | ✅ 활성 |
| 2 | **KAMIS** — 농산물유통정보 | `KAMIS_API_KEY` | 실시간 농산물 도매/소매 가격 | ✅ 활성 |
| 3 | **KOSIS** — 통계청 | `KOSIS_API_KEY` | 국가통계 (인구, 경제, 산업) | ✅ 활성 |
| 4 | **식약처 (MFDS)** | `MFDS_API_KEY` | 식품 안전/인허가 정보 | ✅ 활성 |
| 5 | **공공데이터포털 (통합 API)** | `PUBLIC_DATA_API_KEY` | KOTRA, 해수부, aT, 축평원 등 통합 접속 | ✅ 활성 |

**통합 공공데이터 API Key (`PUBLIC_DATA_API_KEY`):** `fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c`

**참고 엔드포인트 (주요 활용):**
- **[KOTRA]** `DS00000145` (UNComtrade 기준 수출신고 통계), `DS00000146` (수입신고 통계), `priceInfoByNatn` (국가별 물가정보), `overseasMarketNews` (해외시장뉴스), `cmmrcFraudCase` (무역사기사례), `entryStrategy` (진출전략) 등 19개 핵심 글로벌 데이터 API
- **[관세청 KCS]** `Newtrade` (수출입총괄), `nationtrade` (국가별 수출입실적), `nitemtrade` (품목별 국가별 수출입실적), `seaimextrnpcst` (해상수출입 운송비용)
- **[해양수산부]** `select0040List` (위판장별 위탁판매), `select0070List` (수산물 품목별 수출입), `select0180List` (어업생산통계) 등 12개 연동 API
- **[aT/축평원]** `katRealTime2` (실시간 경매정보), `grade` (축산물경락가격)
- 조회 형식: XML/JSON, 인증: API Key (ServiceKey)

### 🌐 해외 경제/금융 API

| # | API 이름 | 환경변수 | 용도 | 상태 |
|:-:|:---------|:---------|:-----|:----:|
| 5 | **FRED** — Federal Reserve | `FRED_API_KEY` | 미국 경제지표 (금리, CPI, 환율) | ✅ 활성 |
| 6 | **한국은행 ECOS** | `ECOS_API_KEY` | 한국 경제통계 (환율, 금리, GDP) | ✅ 활성 |

### 🤖 AI / 인프라

| # | API 이름 | 환경변수 | 용도 | 상태 |
|:-:|:---------|:---------|:-----|:----:|
| 7 | **Gemini API** | `GEMINI_API_KEY` | AI 분석/요약 엔진 | ✅ 활성 |
| 8 | **Supabase** | `NEXT_PUBLIC_SUPABASE_*` | 데이터베이스/인증 | ✅ 활성 |
| 9 | **GitHub PAT** | `GITHUB_PAT` | CI/CD, 레포 접근 | ✅ 활성 |

---

## 신규 등록: 글로벌 무역 인텔리전스 (무료)

### 10. UN Comtrade API ⭐⭐⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | `COMTRADE_API_KEY` |
| **Base URL** | `https://comtradeapi.un.org/data/v1/get/C/M` |
| **Docs** | https://comtradeplus.un.org/TradeFlow |
| **가격** | 🆓 무료 (일일 호출 제한 있음, Premium 벌크 유료) |
| **인증** | API Key (무료 등록) |
| **데이터** | 200+ 국가, 99% 상품 무역 커버, HS 2/4/6 자리 |
| **응답 형식** | JSON |
| **호출 제한** | 쿼리당 50,000건, 분당 제한 있음 |
| **대시보드 활용** | 글로벌 교역량/가액 위젯, 국가간 무역 흐름 |
| **Python 패키지** | `pip install comtradeapicall` |
| **등록 URL** | https://comtradeplus.un.org/ → Sign Up |
| **등록 상태** | ✅ **API Key 발급 및 연동 완료** |

```bash
# .env.local에 추가
COMTRADE_API_KEY="61063fe9f1d2483ea97a9e526daf20a6"
```

```python
# 사용 예시: 한국의 참치(HS 0302) 수입 데이터
import comtradeapicall
df = comtradeapicall.getFinalData(
    subscription_key="YOUR_KEY",
    typeCode='C', freqCode='M', clCode='HS',
    period='202401', reporterCode='410',
    cmdCode='0302', flowCode='M'
)
```

---

### 11. World Bank WITS API ⭐⭐⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | `WITS_API_KEY` (API Key 불필요, 오픈 접근) |
| **Base URL** | `https://wits.worldbank.org/API/V1/` |
| **Docs** | https://wits.worldbank.org/witsapi/Default.aspx |
| **가격** | 🆓 **완전 무료** |
| **인증** | 불필요 (오픈 API) |
| **데이터** | UN Comtrade + UNCTAD TRAINS + WTO 통합 |
| **핵심 기능** | **관세(Tariff) + 비관세장벽(NTM) 데이터 포함** |
| **응답 형식** | XML / JSON |
| **대시보드 활용** | 관세율 위젯, FTA 영향 분석, 착지원가 추정 |
| **등록 상태** | ✅ **파이프라인 구축 완료** |
| **API Route** | `POST /api/wits` — 관세+교역량 통합 조회 |
| **Collector** | `scripts/fetch_wits_data.py` — 배치 수집 |
| **Fallback 데이터** | `data/wits/` — 15개 품목 JSON 캐시 |

```bash
# API Key 불필요 — 바로 호출 가능
# 파이프라인 테스트:
# curl -X POST http://localhost:3000/api/wits -H "Content-Type: application/json" -d '{"commodity":"참치","reporter":"한국"}'
# python3 scripts/fetch_wits_data.py --all
```

```python
# 사용 예시: 한국→오스트리아 HS 0302 관세율 조회
import requests
url = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/tradestats-tariff/reporter/410/partner/040/product/030212/indicator/AHS-WGHTD-AVRG"
resp = requests.get(url)
```

---

### 12. FAOSTAT API ⭐⭐⭐ (수산물 특화)

| 항목 | 내용 |
|------|------|
| **환경변수** | (불필요 — 오픈 접근) |
| **Base URL** | `https://www.fao.org/faostat/en/#data/` |
| **Bulk Download** | https://www.fao.org/faostat/en/#data/TCL |
| **FishStatJ** | https://www.fao.org/fishery/en/topic/166235 |
| **가격** | 🆓 **완전 무료 (Open Access)** |
| **인증** | 불필요 |
| **데이터** | 글로벌 수산물 생산량/교역량/양식, 종(species)별 세분화 |
| **응답 형식** | CSV / Bulk Download |
| **대시보드 활용** | 수산물 종별 글로벌 생산/교역 위젯, FishStatJ 데이터 |
| **등록 상태** | ✅ **이미 사용 중** (fishstatj_*.json 존재) |

---

### 13. ITC Trade Map ⭐⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | (웹 기반 — API 별도 문의) |
| **URL** | https://www.trademap.org/ |
| **가격** | 🆓 개발도상국 + EU 무료 / ⚠️ 한국은 제한적 |
| **인증** | 웹 계정 등록 |
| **데이터** | 220+ 국가, 5,300+ 상품, 바이어/공급업체 디렉토리 |
| **대시보드 활용** | 시장 분석 참조, 바이어/공급업체 탐색 |
| **등록 상태** | 🔵 **참조용 (API 직접 연동은 제한적)** |

---

### 14. OEC (Observatory of Economic Complexity) ⭐⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | (웹 기반 — Pro 구독 시 API) |
| **URL** | https://oec.world/ |
| **가격** | 🆓 기본 무료 Tier / Pro 유료 (벌크 다운로드) |
| **인증** | 계정 등록 (무료) |
| **데이터** | HS/SITC 기반 글로벌 교역 흐름, 경제 복잡성 지수 |
| **대시보드 활용** | 시각화 벤치마크, 교역 흐름 트리맵 참조 |
| **등록 상태** | ✅ **파이프라인 구축 완료** |
| **API Route** | `POST /api/oec` — 글로벌 교역 벤치마크 조회 |
| **Fallback** | 6개 HS4 그룹 Top 수출/수입국 랭킹 내장 |

---

### 15. WTO Data Portal ⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | (불필요 — 오픈 접근) |
| **Base URL** | `https://apiportal.wto.org/` |
| **Docs** | https://apiportal.wto.org/docs/services |
| **가격** | 🆓 **완전 무료** |
| **인증** | API Key (무료 등록) |
| **데이터** | 공식 관세 스케줄, 무역 정책, 분쟁 데이터 |
| **응답 형식** | JSON |
| **대시보드 활용** | 관세 정책 변동 모니터링, FTA 영향 분석 |
| **등록 URL** | https://apiportal.wto.org/ → Subscribe |
| **등록 상태** | ✅ **API Key 발급 및 연동 완료** |
| **API Route** | `POST /api/wto` — 글로벌 관세/분쟁 프로필 조회 |

```bash
# .env.local에 추가
WTO_API_KEY="9c11cd0e1f954c34865c8c427eb07174"
```

---

### 16. U.S. Census Bureau International Trade API ⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | `USCENSUS_API_KEY` |
| **Base URL** | `https://api.census.gov/data/timeseries/intltrade/` |
| **Docs** | https://www.census.gov/data/developers/data-sets/international-trade.html |
| **가격** | 🆓 **완전 무료** |
| **인증** | API Key (무료 등록) |
| **데이터** | 미국 수출입 상세 데이터 (HS 기반) |
| **응답 형식** | JSON |
| **대시보드 활용** | 미국向 수출입 분석, 미국 시장 트렌드 |
| **등록 URL** | https://api.census.gov/data/key_signup.html |
| **등록 상태** | ✅ **API Key 발급 및 연동 완료** |
| **API Route** | `POST /api/us-census` — 미국 수출입 통계 조회 |

```bash
# .env.local에 추가
USCENSUS_API_KEY="57ad5d9332b5b942e539e9dd3a0c83c00a5a06eb"
```

---

### 17. Eurostat API ⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | (불필요 — 오픈 접근) |
| **Base URL** | `https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/` |
| **Docs** | https://wikis.ec.europa.eu/display/EUROSTATHELP/API |
| **가격** | 🆓 **완전 무료** |
| **인증** | 불필요 |
| **데이터** | EU 27개국 무역 통계, PRODCOM 생산 데이터 |
| **응답 형식** | JSON / SDMX |
| **대시보드 활용** | EU 시장 수출입 분석, PRODCOM 가공 데이터 |
| **등록 상태** | ✅ **즉시 사용 가능** |

```python
# 사용 예시: EU 수산물 수입 데이터
import requests
url = "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/DS-045409/?format=JSON"
resp = requests.get(url)
```

---

### 18. NOAA Fisheries Foreign Trade ⭐ (수산물 특화)

| 항목 | 내용 |
|------|------|
| **환경변수** | (불필요 — 오픈 접근) |
| **URL** | https://www.fisheries.noaa.gov/foss/f?p=215:2 |
| **가격** | 🆓 **완전 무료** |
| **인증** | 불필요 |
| **데이터** | 미국 수산물 수출입 (종별, 국가별, 제품유형별) |
| **대시보드 활용** | 미국 수산물 시장 분석, 종별 수출입 트렌드 |
| **등록 상태** | 🔵 **참조용 (웹 인터페이스)** |

---

## 신규 등록: HS 코드 & 관세 특화 (무료/Freemium)

### 19. HS Ping API ⭐⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | `HSPING_API_KEY` |
| **Base URL** | `https://api.hsping.com/v1/` |
| **Docs** | https://hsping.com/docs |
| **가격** | 🆓 **월 100건 무료** / 유료 (대량) |
| **인증** | API Key |
| **커버리지** | US, Canada, UK, EU, Singapore 등 |
| **대시보드 활용** | HS 코드 자동 분류, 품목 분류 자동화 |
| **등록 URL** | https://hsping.com/signup |
| **등록 상태** | ✅ **파이프라인 구축 및 API Key 연동 완료** |
| **API Route** | `POST /api/hs-ping` — HS 코드 자동 분류 |
| **Fallback** | 12개 Silla 핵심 품목 사전 분류 DB 내장 |
| **한→영 매핑** | 20+ 한국어 품목명 자동 변환 지원 |

```bash
# .env.local에 추가 (Live API 활성화)
HSPING_API_KEY="sk_live_***REDACTED*** (see .env.local)"
# Fallback만으로도 12개 핵심 품목 분류 가능
```

---

### 20. Tariffs API ⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | `TARIFFS_API_KEY` |
| **Base URL** | `https://api.tariffs.io/v1/` |
| **Docs** | https://tariffs.io/docs |
| **가격** | 🆓 무료 계산기 + 개발자 API (제한적 무료) |
| **인증** | API Key |
| **특장점** | Section 301/232 복합 관세 스태킹 계산 (미국 특화) |
| **대시보드 활용** | 착지원가 시뮬레이션, 관세 영향 분석 |
| **등록 상태** | ✅ **파이프라인 구축 완료 (Key 대기중)** |
| **API Route** | `POST /api/tariffs` — 복합 관세율 및 착지원가 시뮬레이션 |

```bash
# .env.local에 추가
TARIFFS_API_KEY="your_key_here"
```

---

## 신규 등록: 바이어/공급업체 발굴 (무료)

### 21. Open Supply Hub API ⭐⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | `OSH_API_TOKEN` |
| **Base URL** | `https://opensupplyhub.org/api/` |
| **Docs** | https://opensupplyhub.org/api/docs |
| **가격** | 🆓 **완전 무료 (Open Data)** |
| **인증** | API Token (무료 등록) |
| **데이터** | 글로벌 공급체인 시설/공장 위치 + 소유 정보 |
| **대시보드 활용** | 공급업체 시설 매핑, ESG/강제노동 감사 |
| **등록 URL** | https://opensupplyhub.org/auth/login |
| **등록 상태** | ✅ **파이프라인 구축 완료** |
| **API Route** | `POST /api/osh` — 공급업체 시설 검색 |
| **Fallback** | 6개국 19개 수산물 가공시설 DB 내장 |

```bash
# .env.local에 추가 (Live API 활성화)
OSH_API_TOKEN="your_token_here"
# Fallback만으로도 TH/VN/ID/CN/EC/KR 시설 조회 가능
```

---

### 22. ImportYeti (웹 스크래핑)

| 항목 | 내용 |
|------|------|
| **환경변수** | (공식 API 없음) |
| **URL** | https://www.importyeti.com/ |
| **가격** | 🆓 웹 검색 무료 |
| **API** | ❌ 공식 API 미제공 (스크래핑 필요) |
| **데이터** | 미국 수입 B/L 데이터 기반 바이어/공급업체 |
| **대시보드 활용** | 경쟁사 분석, 공급업체 발굴 (미국 한정) |
| **등록 상태** | ⚠️ **스크래핑 파이프라인 운영 중** |

---

### 23. U.S. ITA Data Services ⭐

| 항목 | 내용 |
|------|------|
| **환경변수** | `ITA_API_KEY` |
| **Base URL** | `https://api.trade.gov/` |
| **Docs** | https://developer.trade.gov/ |
| **가격** | 🆓 **완전 무료** |
| **인증** | API Key (무료 등록) |
| **데이터** | 미국 수출 시장 데이터, 무역 이벤트, FTA 정보 |
| **대시보드 활용** | 미국 시장 진출 분석, FTA 활용 전략 |
| **등록 URL** | https://developer.trade.gov/signup |
| **등록 상태** | ✅ **파이프라인 구축 완료 (Key 대기중)** |
| **API Route** | `POST /api/us-ita` — 시장/정책 리서치 데이터 조회 |

```bash
# .env.local에 추가
ITA_API_KEY="your_key_here"
```

---

## 신규 등록: 제재 & 컴플라이언스 (무료)

### 24. OFAC SDN List (미국 제재)

| 항목 | 내용 |
|------|------|
| **환경변수** | (다운로드 기반 — API Key 불필요) |
| **Data URL** | https://www.treasury.gov/ofac/downloads/ |
| **Docs** | https://sanctionslist.ofac.treas.gov/ |
| **가격** | 🆓 **완전 무료** |
| **형식** | CSV / XML / JSON 다운로드 |
| **데이터** | SDN, Sectoral Sanctions, FSE, Non-SDN 리스트 |
| **한계** | 미국 OFAC만 / 퍼지 매칭 엔진 자체 구현 필요 |
| **등록 상태** | ✅ **즉시 다운로드 가능** |

---

### 25. EU Sanctions Map

| 항목 | 내용 |
|------|------|
| **환경변수** | (웹 기반) |
| **URL** | https://sanctionsmap.eu/ |
| **가격** | 🆓 **완전 무료** |
| **데이터** | EU 제재 대상국/개인/단체 |
| **등록 상태** | ✅ **즉시 접근 가능** |

---

## 유료 후보 (미등록)

> 아래 플랫폼들은 무료로 제공되지 않는 기능을 보유한 유료 서비스입니다.  
> 필요 시 영업 문의 후 등록합니다.

| # | 플랫폼 | 핵심 기능 | 가격 모델 | 평가 |
|:-:|:-------|:---------|:---------|:-----|
| — | **Trademo** | 글로벌 B/L + 기업 프로필 + 통합 제재 | Enterprise | 🔴 비쌀 듯 |
| — | **Panjiva (S&P Global)** | 글로벌 선적 B/L 데이터 | Enterprise | 🔴 고가 |
| — | **Descartes Datamyne** | 글로벌 무역 데이터 + 컴플라이언스 | Enterprise | 🔴 고가 |
| — | **ImportGenius** | 미국 수입 B/L + 기업 검색 | $99~399/월 | 🟠 중가 |
| — | **Veridion** | 기업 프로필 API + 공급업체 발굴 | Freemium~Enterprise | 🟡 검토 가능 |

---

## API 등록 체크리스트

### 🔴 즉시 등록 추천 (높은 ROI)

- [x] **UN Comtrade** — https://comtradeplus.un.org/ → API Key 발급
- [ ] **WTO Data Portal** — https://apiportal.wto.org/ → Subscribe
- [x] **HS Ping** — https://hsping.com/signup → 무료 Tier 등록

### 🟡 파이프라인 구축 완료 (API Key 발급 및 연동 대기)

- [x] **WTO Data Portal** — https://apiportal.wto.org/ → Subscribe (`app/api/wto`)
- [x] **U.S. Census Bureau** — https://api.census.gov/data/key_signup.html (`app/api/us-census`)
- [ ] **Open Supply Hub** — https://opensupplyhub.org/auth/login (`app/api/osh`)
- [ ] **U.S. ITA** — https://developer.trade.gov/signup (`app/api/us-ita`)
- [ ] **Tariffs API** — https://tariffs.io/docs (`app/api/tariffs`)

### ✅ 인증 불필요 (즉시 사용 가능)

- [x] **WITS API** — 오픈 접근
- [x] **FAOSTAT / FishStatJ** — 오픈 접근
- [x] **Eurostat API** — 오픈 접근
- [x] **OFAC SDN List** — 다운로드
- [x] **EU Sanctions Map** — 웹 접근
- [x] **NOAA Fisheries** — 웹 접근

---

## 📊 전체 현황 요약

| 카테고리 | 등록 완료 | 신규 추가 | 합계 |
|:---------|:--------:|:--------:|:----:|
| 🇰🇷 한국 공공 API | 4 | 0 | 4 |
| 🌐 경제/금융 API | 2 | 0 | 2 |
| 🤖 AI/인프라 | 3 | 0 | 3 |
| 📊 글로벌 무역 인텔리전스 | 0 | **9** | 9 |
| 🐟 명태 전용 인텔리전스 | 0 | **4** | 4 |
| 📦 HS 코드 & 관세 | 0 | **2** | 2 |
| 🏢 바이어/공급업체 | 0 | **3** | 3 |
| 🛡️ 제재/컴플라이언스 | 0 | **2** | 2 |
| 🏛️ 국정연 정책연구 기반 | 0 | **4** | 4 |
| **합계** | **9** | **24** | **33** |

---

## 🏛️ 국가정책연구포털 기반 신규 API (2025-05-14 추가)

### 26. 해양수산부 공공데이터 통합 (MOF Fishery)
- **Route**: `/api/mof-fishery`
- **Method**: POST
- **Endpoints**: 위판장 위탁판매(select0040), 수출입(select0070), 어업생산(select0180), 운송비(seaimextrnpcst)
- **Key**: `PUBLIC_DATA_API_KEY` + `KCS_API_KEY` (기등록)
- **근거**: (일반 2025-01) 해양수산 공공데이터 플랫폼 활용 제고 방안 연구
- **Status**: ✅ 파이프라인 완성 — Fallback 데이터 내장

### 27. 참치 정책 리스크 인텔리전스 (Policy Risk)
- **Route**: `/api/tuna-policy-risk`
- **Method**: POST / GET
- **Data**: 6대 정책 리스크 정량화 (미국 301, EU IUU, 강제노동, CPTPP/RCEP, IOTC TAC, SIMP)
- **Key**: `WTO_API_KEY` (기등록)
- **근거**: 국정연 8건 (2019-12, 2024-06, 2024-08, 2025-04, 2025-13, 2025-15 등)
- **Status**: ✅ 파이프라인 완성 — WTO Live 연동 + Static Policy Matrix

### 28. 참치 AI 가격 예측 엔진 (Price Forecast)
- **Route**: `/api/tuna-forecast`
- **Method**: POST / GET
- **Model**: 5변수 VAR (가다랑어FOB, MGO, ENSO, KRW/USD, 태국가동률)
- **Key**: `FRED_API_KEY` (기등록)
- **근거**: (기본 2024-08) 수산물 무역 단기 전망모형 구축 연구
- **Status**: ✅ 파이프라인 완성 — FRED Live + VAR 예측

### 29. 참치 신흥시장 기회 인텔리전스 (Emerging Markets)
- **Route**: `/api/tuna-emerging-markets`
- **Method**: POST / GET
- **Data**: 아프리카 5국 + 중동 3국 + ASEAN 3국 (총 11개 시장)
- **Key**: `COMTRADE_API_KEY` (기등록)
- **근거**: 국정연 아프리카 수산협력(2023-05), 할랄 수출전략(2023-09), ASEAN 무역(2024-03), 군소도서국(2024-01)
- **Status**: ✅ 파이프라인 완성 — Comtrade Live + 정책연구 매트릭스

### 30. 명태 정책 리스크 인텔리전스 (Pollock Policy Risk)
- **Route**: `/api/pollock-policy-risk`
- **Method**: POST / GET
- **Data**: 6대 정책 리스크 정량화 (러시아 제재, 미국 301, NPFMC 쿼터, SIMP, 강제노동, 원산지 세탁)
- **Key**: `WTO_API_KEY` + `COMTRADE_API_KEY` (기등록)
- **근거**: 국정연 6건 (2019-12, 2023-10, 2024-06, 2024-08, 2025-04, 2025-13, 2025-15)
- **Status**: ✅ 파이프라인 완성 — WTO Live + 6대 리스크 매트릭스 + FTA 관세 시뮬레이션

### 31. 명태 AI 가격 예측 엔진 (Pollock Forecast)
- **Route**: `/api/pollock-forecast`
- **Method**: POST / GET
- **Model**: 5변수 VAR (러시아 FOB, MGO, 베링해 SST, KRW/USD, 중국 다롄 가동률)
- **Products**: 통명태 H&G + 수리미 FA급 + 명란(Roe) 3품목
- **Key**: `FRED_API_KEY` (기등록)
- **근거**: (기본 2024-08) 수산물 무역 단기 전망모형 + (일반 2025-14) AI 무역전망 고도화
- **Status**: ✅ 파이프라인 완성 — FRED Live + VAR 예측 + SST 상관분석 + What-If 시나리오

### 32. 명태 글로벌 공급망 인텔리전스 (Pollock Supply Chain)
- **Route**: `/api/pollock-supply-chain`
- **Method**: POST / GET
- **Data**: HHI 집중도 지수 + 글로벌 플로우 맵 + 대체 소싱 레이더 + 대체 어종 교차탄력성
- **Key**: `COMTRADE_API_KEY` + `KCS_API_KEY` (기등록)
- **근거**: (일반 2023-10) 전략품목 관리 + (일반 2024-05) 공급망 관리 + (일반 2022-11) 대체관계 분석
- **Status**: ✅ 파이프라인 완성 — Comtrade Live + HHI 7,100 극단적 집중 Alert

### 33. 명태 착지원가 시뮬레이터 (Pollock Landed Cost)
- **Route**: `/api/pollock-landed-cost`
- **Method**: POST / GET
- **Data**: 3경로 비교 (러시아 직수입 vs 중국 우회 vs 미국 MSC) + 환율 민감도
- **Key**: `FRED_API_KEY` (기등록)
- **근거**: (일반 2024-06) 신통상규범 영향 + (기본 2025-10) 물가 안정화
- **Status**: ✅ 파이프라인 완성 — FRED FX Live + 워터폴 원가분해 + 경로별 Alert
