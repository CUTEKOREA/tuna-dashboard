# 출처 아카이브 신선도 점검 2026-10

**점검일**: 2026-10-01  
**기준선**: T-3y = 2023-10-01 (이보다 오래된 발행일 → stale)  
**점검 대상**: `docs/2026_*_industry_sources.md` 12개 파일  
**총 출처 수**: 158건 (파일별 선언값 합산)  

> 이 리포트는 **제안만** 한다. 원본 아카이브·대시보드 코드는 수정하지 않았다.  
> 정정·삭제·교체는 사람이 결정한다.

---

## 1. 파일별 요약

| 파일 | 총 출처 | stale (T-3y 초과) | unknown (발행일 불명) |
|---|---|---|---|
| 2026_cashew_industry_sources.md | 14 | 0 | 0 |
| 2026_chicken_industry_sources.md | 14 | 0 | 0 |
| 2026_flatfish_industry_sources.md | 14 | 0 | 0 |
| **2026_galchi_industry_sources.md** | **14** | **6** | **1** |
| **2026_jukkumi_industry_sources.md** | **11** | **1** | **1** |
| 2026_mackerel_industry_sources.md | 15 | 0 | 0 |
| 2026_octopus_industry_sources.md | 14 | 0 | 0 |
| 2026_salmon_industry_sources.md | 14 | 0 | 0 |
| 2026_shrimp_industry_sources.md | 14 | 0 | 0 |
| 2026_squid_industry_sources.md | 16 | 0 | 0 |
| 2026_tuna_industry_sources.md | 14 | 0 | 0 |
| 2026_whelk_industry_sources.md | 14 | 0 | 0 |
| **합계** | **158** | **7** | **2** |

> unknown 집계 기준: 지속 갱신 데이터베이스(KAMIS·KCS·MOF 등)는 발행일 개념이 없으므로 제외.  
> 학술논문·기관보고서로서 발행연도를 파싱할 수 없는 경우만 unknown으로 분류.

---

## 2. Stale 출처 목록 (7건)

### 2-1. `2026_galchi_industry_sources.md` — 6건

| # | 제목 | 발행일 | 경과 | URL |
|---|---|---|---|---|
| G-1 | DEB-IBM for predicting climate change and anthropogenic impacts on population dynamics of hairtail Trichiurus lepturus in the East China Sea | 2022 | ~4년 | https://academic.oup.com/conphys/article/10/1/coac044/6639913 |
| G-2 | Species Composition, Growth, and Trophic Traits of Hairtail (Trichiuridae), the Most Productive Fish in Chinese Marine Fishery | 2022 | ~4년 | https://pmc.ncbi.nlm.nih.gov/articles/PMC9687022/ |
| G-3 | Catch-based vs surplus production model for hairtail (ScienceDirect) | 2021 | ~5년 | https://www.sciencedirect.com/science/article/abs/pii/S2352485521004187 |
| G-4 | Frontiers Marine Science — Beibu Gulf hairtail ecology | 2022 | ~4년 | https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2022.1079590/full |
| G-5 | Estimating biological reference points for Largehead hairtail (Trichiurus lepturus) in the Yellow Sea and Bohai Sea | 2019 | ~7년 | https://link.springer.com/article/10.1007/s13131-019-1343-4 |
| G-6 | Frontiers Nutrition — hairtail nutritional composition 2022 | 2022 | ~4년 | https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2022.1034868/full |

### 2-2. `2026_jukkumi_industry_sources.md` — 1건

| # | 제목 | 발행일 | 경과 | URL |
|---|---|---|---|---|
| J-1 | Development of Amphioctopus fangsiao from eggs to hatchlings (ResearchGate/Springer) | 2019 | ~7년 | https://www.researchgate.net/publication/337718592 |

---

## 3. Unknown 출처 (2건)

| 파일 | 제목 | URL | 비고 |
|---|---|---|---|
| 2026_galchi_industry_sources.md | CITES Appendix 검색 | URL 미기재 | URL·발행일 모두 불명. CITES 공식 체크리스트로 교체 검토 필요 |
| 2026_jukkumi_industry_sources.md | Haizhou Bay Growth (ZGHYDXXBYWB 중국수산학회지) | https://html.rhhz.net/ZGHYDXXBYWB/html/40e25a72-c301-4e0c-9ab4-3232ef34d4cc.htm | 학술논문이나 발행연도 파싱 불가 |

---

## 4. 최신 대체 후보 (WebSearch 결과 기반)

> 아래는 **제안**이다. 실제 접근·내용 확인 후 사람이 교체 여부를 결정한다.  
> HS코드 연관성이 있는 경우 해당 코드를 병기한다.

### G-1 대체 후보 (DEB-IBM 갈치 개체군 모델)

| 항목 | 내용 |
|---|---|
| 제목 | Reconstruction of Recreational Catch and Multi-Fisheries Stock Assessment of Hairtail (*Trichiurus lepturus*) in Korean Waters Under a Data-Limited Situation |
| 기관 | MDPI *Fishes* |
| URL | https://www.mdpi.com/2410-3888/10/4/166 |
| 발행일 | 2025 |
| 비고 | 한국 해역 자료 포함, 베이지안 잉여 생산 모델 적용. HS 030389(갈치류 냉동·신선) |

### G-2 대체 후보 (갈치류 종 구성 분류학)

| 항목 | 내용 |
|---|---|
| 제목 | Chromosome-Level Genomics Unravels *Trichiurus*' 300-Year Taxonomic Enigma: Cryptic Speciation and Glacial Adaptations in Northwest Pacific Coast |
| 기관 | bioRxiv (preprint) |
| URL | https://www.biorxiv.org/content/10.1101/2025.03.05.641545v1.full |
| 발행일 | 2025.03 |
| 비고 | 황해·동중국해 cryptic 신종 확인. 프리프린트이므로 게재 확인 필요 |

보완 후보 (동종 주제, 동료심사 완료):

| 항목 | 내용 |
|---|---|
| 제목 | Population dynamics and exploitation status of largehead hairtail (*Trichiurus japonicus*) in the Northern South China Sea |
| 기관 | ScienceDirect (*Regional Studies in Marine Science*) |
| URL | https://www.sciencedirect.com/science/article/abs/pii/S2352485525003937 |
| 발행일 | 2025 |
| 비고 | LBB·LBSPR·CMSY 3종 데이터제한 평가 결합. 동중국해·남중국해 종 조성 포함 |

### G-3 대체 후보 (잉여 생산 모델 방법론)

| 항목 | 내용 |
|---|---|
| 제목 | Reconstruction of Recreational Catch and Multi-Fisheries Stock Assessment of Hairtail (*Trichiurus lepturus*) in Korean Waters Under a Data-Limited Situation |
| 기관 | MDPI *Fishes* |
| URL | https://www.mdpi.com/2410-3888/10/4/166 |
| 발행일 | 2025 |
| 비고 | G-1과 동일 논문. 복수 어업 잉여 생산 모델 비교 방법론 포함 |

### G-4 대체 후보 (베이부만·북부 남중국해 서식지 분포)

| 항목 | 내용 |
|---|---|
| 제목 | Spatial and Temporal Distribution of Habitat Pattern of *Trichiurus japonicus* in the Northern South China Sea Under Future Climate Scenarios |
| 기관 | MDPI *Fishes* |
| URL | https://www.mdpi.com/2410-3888/9/12/488 |
| 발행일 | 2024 |
| 비고 | 기후 시나리오별 서식지 예측 포함. 베이부만 분포와 직접 관련 |

### G-5 대체 후보 (생물학적 기준점 — 황해·보하이해)

| 항목 | 내용 |
|---|---|
| 제목 | Whether the summer fishing moratorium can improve the status of fisheries resources in the Yellow Sea and Bohai Sea |
| 기관 | ScienceDirect (*Ocean & Coastal Management*) |
| URL | https://www.sciencedirect.com/science/article/pii/S240584402414131X |
| 발행일 | 2024 |
| 비고 | 황해·보하이해 갈치 B/BMSY·F/FMSY 2022년까지 추정 포함. 금어기 효과 분석 |

보완 후보:

| 항목 | 내용 |
|---|---|
| 제목 | Unveiling the status of *Trichiurus lepturus* stocks in the southern Java waters, Indonesia: A biological and length-based assessment approach |
| 기관 | Pensoft / AIEP |
| URL | https://aiep.pensoft.net/article/138745/ |
| 발행일 | 2025 |
| 비고 | SPR 26% (과도 어획 수준) 추정. 방법론 참고용 |

### G-6 대체 후보 (갈치 영양 성분·기능성)

| 항목 | 내용 |
|---|---|
| 제목 | Analysis of total and free amino acid compositions of fishery byproducts from three commonly consumed fish species in South Korea |
| 기관 | PMC (PubMed Central) |
| URL | https://pmc.ncbi.nlm.nih.gov/articles/PMC13331930/ |
| 발행일 | 2025 |
| 비고 | 한국 소비 어종(갈치 포함 가능) 아미노산 조성 분석 — 내용 확인 후 적용 |

보완 후보 (일본산 갈치 지방산·영양 분석):

| 항목 | 내용 |
|---|---|
| 제목 | Proximate composition, fatty acids and tocopherol content of *Trichiurus* spp. — Miyazaki coast |
| 기관 | Springer *Food Analytical Methods* |
| URL | https://link.springer.com/article/10.1007/s11694-025-03617-8 |
| 발행일 | 2025 |
| 비고 | 일본 미야자키 해역. 2022.05~2024.03 시료 기반. DHA·EPA 정량 포함 |

### J-1 대체 후보 (주꾸미 배발생·양식 발달)

| 항목 | 내용 |
|---|---|
| 제목 | Morphological ontogeny and growth patterns of gold-ringed octopus *Amphioctopus fangsiao*: Implications for aquaculture development |
| 기관 | Journal of the World Aquaculture Society (Wiley) |
| URL | https://onlinelibrary.wiley.com/doi/full/10.1111/jwas.70101 |
| 발행일 | 2026 |
| 비고 | 양식 발달·성장 패턴 종합. 2019년 기초 연구의 후속 실용화 연구 |

보완 후보 (온도 변동 → 배발생 영향):

| 항목 | 내용 |
|---|---|
| 제목 | Living in a dynamic environment: The effects of multi-ways temperature variation on embryo and newborn juveniles of *Amphioctopus fangsiao* |
| 기관 | PubMed |
| URL | https://pubmed.ncbi.nlm.nih.gov/38453076 |
| 발행일 | 2024 |
| 비고 | 온도 변동이 배아 산화 스트레스·당지질 대사에 미치는 영향. 기후 리스크 관점 |

### CITES unknown 대체 후보 (갈치 CITES 등재 여부)

| 항목 | 내용 |
|---|---|
| 제목 | CITES Species+ — Trichiurus spp. 등재 현황 |
| 기관 | CITES / UNEP-WCMC |
| URL | https://speciesplus.net/#/taxon_concepts?taxonomy=cites_eu&taxon_concept_query=Trichiurus&geo_entities_ids=&page=1 |
| 발행일 | 상시 갱신 |
| 비고 | CITES 공식 데이터베이스. 현재 갈치류는 CITES 부속서 미등재 확인 필요 |

---

## 5. 방법론 메모

- **T-3y 기준 적용**: 2026-10-01 기준 2023-10-01 이전 발행 → stale 분류.
- **"상시" 표기 처리**: KAMIS·KCS·MOF·FAO 데이터베이스처럼 지속 갱신되는 공식 통계 포털은 단일 발행일이 없으므로 stale 집계에서 제외.
- **연도만 표기된 경우**: 연도 전체(예: "2022")는 해당 연도 12월 31일로 보수적 처리 → 2022년 전체가 T-3y 이전이므로 stale.
- **WebSearch 한계**: 검색 결과는 제안 수준이며, 실제 접근·본문 확인 전에 교체 결정 금지.
- **신뢰원 우선순위 준수**: RFMO > FAO/EUMOFA/USDA/NOAA > 정부기관 순으로 후보 선정.

---

_점검 도구: Claude Code (자동 스케줄) · WebSearch · git 브랜치 `chore/source-freshness-202610`_  
_원본 아카이브 수정 없음 · 배포·머지 없음_
