# SE Asia 참치 OEM 벤더 풀 — 종합 리서치 보고서

> 생성일: 2026-06-06 | 페이지: https://leedonggun.co.kr/seasia-oem | 컴포넌트: `components/SEAsiaOEMDashboard.tsx`
> 방법론: 멀티에이전트 파이프라인 (research → adversarial verify → synthesize). 1차 출처(EU TRACES/NAFIQAD 승인코드·MSC cert-finder·ISSF 참여사·美 세관/Panjiva·VASEP·기업 IR) 교차검증. 인증코드는 페이지 직접 확인분만 verified.
> ⚠️ 모든 신규/공개정보는 **미실사(공개정보 기반)**. 발주 전 TRACES·FDA·MSC 등록부 직접 조회 및 현장 실사 권장.

---
## Part A. 기존 17개사 — 공개정보 보강 + 인증/생산능력 정정 권고

각 벤더에 `publicProfile`(설립·본사·소유·공장·제품·수출시장·인증·최근동향·출처)를 추가 병합 완료(17/17). 아래는 기존 인증 boolean·생산능력의 **검증 결과 정정 권고**.

| 벤더 | 신뢰도 | 기존(FDA/EU/MSC/cap) | 정정 권고 | 핵심 근거 |
|---|---|---|---|---|
| Tan Phat Canned Food (Edison F | 낮음 | T/T/T/50 | **변경 없음(확인/근거부족)** | 기존 필드 4종(hasFDA·hasEU·msc·capacityMT) 모두 high 확신 변경 근거 없음(검증 신뢰도 전부 low). 특히 msc는 MSC 1차 등록부에서 매칭 0건·ISSF 비참여로 unsubstantiated, hasEU(DL 223/TS 754)·hasFDA는 1차  |
| Highland Dragon Enterprise (HD | 보통 | T/T/T/40 | **MSC T→F** | hasFDA=true: 미국 세관 데이터상 저산성 캔 참치가 2026년 5월까지 미국 항만으로 약 2,963건 반입되어 FDA FCE/SID 등록이 법적으로 전제됨(번호는 비공개 DB라 직접 검증 불가, 강한 정황 근거 high). hasEU=true: VASEP 프로필에 EU 코드 D |
| KTCFOOD | 보통 | T/T/T/100 | **MSC T→F** | capacityMT: 기존 100 MT/day는 단위 오류('80,000~100,000 cans/day'를 오독)로 1차·산업 출처가 MT/day 표기를 전혀 쓰지 않아 null 권고. hasEU: NAFIQAD EU 등록목록에서 DH 755 확인(high). msc: MSC CoC 인 |
| Yueh Chyang Canned Food (YCC) | 보통 | T/T/T/80 | **MSC T→F** | msc: 공장명 MSC Chain-of-Custody 인증서가 어떤 MSC 검색에서도 발견되지 않아 default-to-reject 적용해 false로 변경(ISSF/MSC는 Thai Union 그룹 차원만 존재). capacityMT: 'Trade Flow Analysis of Pac |
| Foodtech JSC | 보통 | T/T/F/70 | **변경 없음(확인/근거부족)** | 검증의 existingFieldVerdict가 hasFDA·hasEU=keep-true, msc=keep-false, capacityMT(70)=consistent로 모두 현행 유지를 권고했고 high 확신의 change-to-*/revise 권고가 없으므로 변경 없음. |
| Everwin Industrial (Toan Thang | 보통 | F/T/T/50 | **FDA F→T, MSC T→F** | hasFDA→true: 미국으로 캔/조제 참치 지속 수출(Panjiva 486건+, 바이어 Mitsui·Kawasho)로 외국시설 FDA 등록이 사실상 필수·일관(단 FCE/등록번호 코드는 미확인). msc→false: MSC 공식 DB 'Everwin' 0건, CoC 인증 없음(소속은 |
| Halong Canfoco | 보통 | F/F/F/60 | **FDA F→T, EU F→T** | hasEU=true: VASEP에 EU 승인코드 DH203 등재·독일 등 EU 수출(번호는 미확정이나 승인업체 자체는 타당). hasFDA=true: 2017~2025 미국 222건 통조림 참치 선적으로 FDA 시설등록 사실상 필수(번호 12326850270은 1차 미확인). msc=f |
| Thanh Dung Canning | 보통 | F/T/F/30 | **변경 없음(확인/근거부족)** | hasFDA=keep-false(FCE/SID 등록번호 미관측, 미국 선적은 약한 정황뿐), hasEU=insufficient-evidence(EU TRACES 1차 확인 불가, VASEP 자체 라벨뿐), msc=keep-false(MSC CoC·ISSF 등재 없음), 생산능력 30 M |
| Ha Long Tuna JSC (Da Nang) | 낮음 | T/T/F/25 | **변경 없음(확인/근거부족)** | msc=false: MSC Chain of Custody·ISSF 참여기업 목록에서 모두 미발견으로 기존 가정(false)이 검증됨(중확신). hasFDA/hasEU는 자기신고·미확인이며 거론된 FDA 번호는 환각 위험이라 변경 불가(null). capacityMT는 추적 가능한 출처가 |
| Golden Ocean Seafood | 낮음 | T/T/T/15 | **FDA T→F, EU T→F, MSC T→F** | FDA 등록·미국 수입기록 없음(뚜이호아 FDA 기록은 별개사 Golden Shrimp Seafood JSC), VASEP의 EU 코드란 공란으로 DL 번호 없음, MSC CoC 부재·ISSF 비회원, 15 MT/일은 별개사 Golden Seafood VN(Kien Giang) 수치 혼 |
| KIFOCAN | 보통 | F/T/F/20 | **변경 없음(확인/근거부족)** | capacityMT: 검증에서 'revise'(20 MT/day 가정 제거, 미확정 처리) 권고됐으나 새 수치 근거가 없어 null로 표기(가정값 폐기). hasEU=true는 1차 2개 출처로 확인되어 변경 불필요(keep-true), hasFDA=false·msc=false는 현행  |
| Thai Union Group PCL | 보통 | T/T/T/1560 | **변경 없음(확인/근거부족)** | 기존 1,560 MT/day는 어떤 출처로도 뒷받침되지 않아(검증 verdict: unsupported, ASEAN Records 페이지에 능력 수치 부재) 제거 권고하나, 대체할 출처 확정 수치도 없어 capacityMT는 null로 둠. hasFDA/hasEU/msc는 검증상 kee |
| Sea Value PLC | 보통 | T/T/T/1000 | **변경 없음(확인/근거부족)** | MSC: 적대적 검증이 브로슈어 4페이지 인증 배너에서 MSC 블루틱 에코라벨 로고를 고해상도 직독으로 확인(reviewerConfidence=high)했으므로 msc=true로 정정. capacityMT=1000은 브로슈어 CAPACITY 페이지로 일 1,000 MT 이상 확인되어 유 |
| Chotiwat Manufacturing (CMC) | 높음 | T/T/T/370 | **cap 370→400** | capacityMT: 공식 연혁이 현재 400 tonnes/day(완제품, +냉장 3,000톤)를 명시 — 기존 370은 미지지(high). msc: 공식 인증서 페이지·보도자료로 MSC CoC(유효 2026-06-13) 확인(high). hasEU·hasFDA: EU 승인코드·FDA  |
| A.E.C. Canning Co. Ltd. | 보통 | T/T/T/50 | **EU T→F, MSC T→F** | hasEU=false: 자사 인증 페이지 및 TRACES 등 어디에도 EU 승인번호 부재(USFDA·FCE·SFDA·TH만 표기). msc=false: MSC CoC 미발견 + ISSF 비참여, 지속가능성은 Dolphin Safe뿐. hasFDA=true: 페이지에 FCE 33417·U |
| Kingfisher Holdings Ltd. | 높음 | T/T/T/60 | **변경 없음(확인/근거부족)** | hasFDA·hasEU·msc는 모두 keep-true 권고(FDA WL #423596 2014/종결 2017, EU 수출시장+EU Catch Certificate, MSC SEAPAC-SP2 2024.11 CoC). capacityMT는 60 MT/day가 1차 출처 미검증(unsup |
| Pataya Food Group | 보통 | T/T/F/100 | **변경 없음(확인/근거부족)** | msc=false 유지 권고: 회사 About 페이지에 약어 'MSC'만 표기되고 발급기관(cert.msc.org/fisheries.msc.org)에서 Pataya CoC 인증번호가 확인되지 않아 fabrication-risk. hasFDA/hasEU는 정황상 보유 가능성 높으나 공개  |

### A-1. 주요 정정 테마
- **MSC 과대표기**: 기존 `msc=true` 다수가 MSC 공개 cert-finder·ISSF 목록에서 0건 → 정직하게 false 권고: **highland-dragon·ktcfood·ycc·everwin·aec-canning·golden-ocean** (6건). 반면 **sea-value·chotiwat·kingfisher**는 실제 MSC CoC/로고 확인되어 유지.
- **FDA 상향**(美 세관/Panjiva 선적기록=등록 정황): everwin(F→T), halong-canfoco(F→T).
- **EU**: halong-canfoco(DH203)·ktcfood(DH755) 코드 확인. aec-canning·golden-ocean은 등록부 부재로 하향 권고.
- **생산능력**: chotiwat 370→**400 t/day**(공식 연혁, high). ktcfood 100MT는 '10만 캔/일' 오독 가능성(미확정), golden-ocean 15MT는 타사(Golden Shrimp/Golden Seafood VN) 수치 혼입 정황.
- ⚠️ **halong-canfoco**: 내수용(Tier3)으로 분류돼 있으나 EU(DH203)+美수출 222건 확인 → **재분류(tier/specialty) 검토 필요**.
- ⚠️ **golden-ocean**: 기존 FDA/EU/MSC 3개가 모두 다른 회사 데이터 혼입 정황(신뢰도 낮음) → 전면 재확인 필요.

---
## Part B. 신규 발굴 후보 (기존 17개사 외)

6개 앵글 다각도 스윕 → 39개 고유 후보 → 중복/계열 병합 후 **34개 고유 회사**. 추천(include) 29개사.

### B-1. INCLUDE — 추천 (실존·참치가공·별개법인 확인)

| 회사 | 국가 | 세그먼트 | 신뢰도 | FDA/EU/MSC | 추정 Tier | 신라교역 관점 |
|---|---|---|---|---|---|---|
| Tropical Canning (Thailand) Public Co. | Th | multi (canned/pouched tuna + ready | 높음 | ?/T/? | Tier 2: Specialized (ind | Thai Union 계열이 아닌 독립 상장 캐너로, 참치 통조림/파우치 OEM과 참치 원료 펫푸드를 동시에 공급할 수 있어 신라교역의 공급선 다변화 및 펫푸드 카테고리 진출 파트너로 의미가 있다. ISSF 참여·태국 |
| Asian Alliance International Co., Ltd. | Th | petfood | 높음 | T/T/? | Tier 2: Specialized (참치  | Thai Union/Sea Value 등 경쟁 브랜드에 묶이지 않은 독립계열(Asian Sea Corporation PCL 100% 자회사) SET 상장 OEM 파트너로, 참치 통조림·파우치·냉동로인과 참치 기반 웻 |
| Golden Prize Canning Co., Ltd. | Th | canned | 높음 | T/T/? | Tier 2: Specialized (대형  | 100% 수출형 독립 캔 참치 전문 가공사로 135개국+ 수출망과 EU/FDA 승인을 갖춰 신라교역의 PB/OEM 캔 참치 소싱 후보로 의미가 크다. Thai Union·Sea Value 계열이 아닌 가족경영 독립  |
| Diamond Food Product Co., Ltd. (brand: | Th | canned | 높음 | T/?/T | Tier 2: Specialized (전속  | FINE CHEF 자사 브랜드와 OEM/PB를 모두 운영하는 전속 참치캔 제조사로, 한국 시장용 PB 참치캔 소싱 또는 자사 캐파를 활용한 중소 물량 OEM 파트너로 적합하다. 다만 일당/연간 캐파 수치와 EU 승인 |
| MMP International Co., Ltd. | Th | canned | 높음 | T/T/? | Tier 2: Specialized | 중형 독립 태국 캐너리로 3oz~케이터링 사이즈 전 규격 참치캔 + 고등어/새우/게/baby clam/펫푸드까지 다품종 OEM 대응이 가능해, 신라교역의 소량 다품종·EU향 PB 라인 위탁 파트너로 적합. 몰디브 p |
| RS Cannery Co., Ltd. | Th | multi | 높음 | T/T/T | Tier 2: Specialized | 30년 이상 OEM/PL 전문 태국 참치 캐너로 북미·EU·일본 바이어 브랜드를 동시에 공급하는 독립 중견사라, 신라교역이 대기업(Thai Union/Sea Value)에 종속되지 않은 유연한 위탁생산 파트너로 활용 |
| Thai Inaba Foods Co., Ltd. | Th | petfood | 높음 | T/?/F | Tier 3: Niche (premium J | 신라교역이 프리미엄 참치 기반 습식 펫푸드(CIAO/Churu)나 RTE 참치 OEM 라인을 원할 경우에 한해 의미가 있으며, 일반 인간용 참치캔 주류 OEM 파트너로는 적합도가 낮다. 일본 모회사 소유의 고QA 공 |
| Siam International Food Co., Ltd. | Th | multi (canned tuna / processed sea | 보통 | ?/?/? | Tier 2: Specialized (dua | 남부 태국(Songkhla)에 자가 참치 통조림 공장을 보유하고 인간용 참치/수산가공품과 습식 펫푸드를 동시에 OEM 생산하는 중견 가공사로, 신라교역이 참치 통조림과 펫푸드(참치 원료 활용) 라인을 한 파트너에서  |
| Pegasus Food Co., Ltd. | Th | canned | 보통 | ?/?/F | Tier 3: Niche (소형 전문 OEM | Songkhla 참치 허브의 독립계 중소 캔 OEM으로 Halal·GMP·HACCP 기반 중동/할랄 시장 PB 소싱과 소량·맞춤 물량 파트너로서 검토 가치가 있으나, EU/USFDA/MSC 미확인이라 정식 수출 전  |
| Ongreen Thailand Co., Ltd. | Th | canned | 보통 | ?/?/F | Tier 3: Niche (소형 태국 OEM | 참치·고등어·정어리 캔을 OEM/PB로 1986년부터 27개국 이상에 수출해 온 소형 태국 가공사로, 신라교역의 자체 브랜드(PB) 캔 참치/혼합 어종 캔 소싱에 적합한 턴키 공급 후보다. 다만 EU 승인코드·FDA |
| P.C. Tuna Co., Ltd. | Th | multi (precooked tuna loin + 완제 통조 | 보통 | ?/?/F | Tier 2: Specialized (pre | precooked tuna loin 전문 공급 및 SEALIFE 자체브랜드 OEM 양면에서 신라교역의 쿡로인 조달·한국향 OEM 위탁 후보. 단 대미·대유럽 수출 인증 미확인으로 실사 필요. |
| Amazing Tuna Company Limited | Th | sashimi | 보통 | ?/T/? | Tier 3: Niche (Specializ | 태국 측에서 보기 드문 순수 사시미급 참치 전문 가공사로, 자체 GMP·HACCP 공장에서 냉동 프리미엄 사시미 로인·사쿠·스테이크를 생산하고 주 2회 항공 배송하며 명시적으로 일본·한국 사시미 시장을 겨냥한다. 신 |
| R. Monkhorn Frozen Co., Ltd. (R. Monkh | Th | frozen loin | 보통 | ?/?/? | Tier 3: Niche (frozen tu | 사메 사머 사콘 소재 독립 가족경영 참치 가공사로, 냉동 로인·캔·부가가치 제품과 스킵잭·옐로핀·통골 처리가 가능해 신라교역의 중소형 차별화 OEM(특히 냉동 로인) 소싱 후보로 의미가 있다. 다만 EU/US 인증코 |
| Hai Vuong Co., Ltd. (Havuco / Hai Vuon | Vi | multi (frozen loin/saku/steak/cube | 높음 | T/T/T | Tier 1: Strategic (Vietn | 신라교역 관점에서 냉동 사시미/스테이크·쿡로인부터 캔·파우치 yellowfin/skipjack(oil/brine/water)까지 단일 그룹에서 OEM 조달이 가능한 Vietnam 최대 참치 가공사로, EU(스페인 상 |
| Dragon Waves Frozen Food Factory Co.,  | Vi | multi (precooked/canned tuna loin  | 높음 | T/T/? | Tier 2: Specialized (대형  | Hai Vuong 그룹 계열의 대형 참치 가공사로, CO처리/내추럴 옐로핀 로인·사쿠·스테이크 및 precooked/canned 참치 OEM 양산이 가능해 신라교역의 냉동 참치로인·통조림 원료·쿡로인 소싱 파트너로  |
| Nha Trang Bay Joint Stock Company | Vi | frozen loin / sashimi-grade tuna | 높음 | T/T/? | Tier 2: Specialized (sas | 옐로핀 사시미/로인급 CO-처리 가공과 -55°C 초저온 인프라, Friend of the Sea·Dolphin-Safe 인증을 갖춘 EU 등재 시설로, 신라교역의 EU·한국 리테일향 프리미엄 냉동 참치 로인/사쿠  |
| Mariso Vietnam Co., Ltd. | Vi | frozen loin | 높음 | T/T/? | Tier 2: Specialized (fro | 신선·냉동 참치 로인/스테이크/사쿠(HS0304) 및 쿡로인·파우치 가공이 가능한 베트남 Top-5 참치 수출사로, Hai Vuong 계열 인프라와 미국(Bumble Bee 납품)·EU(에스토니아 트레이딩암 Mari |
| Binh Dinh Fishery Joint Stock Company  | Vi | frozen loin | 높음 | T/T/F | Tier 2: Specialized (원양  | BIDIFISCO는 EU 의무기준을 충족하며 스페인·EU向 냉동 참치 loin(HS 0304) 수출 상위권에 검증된 실적을 가진 원양 참치 전문 가공사로, 신라교역의 EU·고부가 사시미/스테이크/saku OEM 소싱 |
| Nghi Son Foods Group | Vi | multi (frozen-loin + sashimi-grade | 높음 | T/T/T | Tier 2: Specialized | 냉동 참치 로인/사쿠/사시미급과 통조림 참치를 한 그룹에서 모두 공급해 신라교역의 멀티-포맷 OEM 소싱(냉동 원물+가공품) 단일 창구로 활용 가치가 높으며, FDA·EU(DL 688/HK 695)·MSC 보유로 미 |
| Tin Thinh Co., Ltd. (Tinthinh Foods /  | Vi | multi (냉동 수산물 + 통조림) | 높음 | ?/T/? | Tier 2: Specialized (mul | 참치(냉동 로인·통조림) 및 다어종을 함께 소싱할 수 있는 베트남 중규모 다품목 OEM 후보. EU(DL385)·미국·일본 수출 이력과 BRC/IFS 인증으로 다국적 채널 대응 가능하나, 통조림 캐파가 작아 중소 물 |
| Hai Son Foods Co., Ltd. | Vi | frozen loin | 높음 | T/?/F | Tier 3: Niche (냉동 황다랑어 로 | 냉동 황다랑어 로인·사쿠·스테이크에 특화된 베트남 Khanh Hoa 소재 중소 가공사로, 사시미·스테이크용 프리미엄 원물 OEM 소싱 후보로 검토 가치가 있다. 다만 생산능력·EU DL 코드·MSC가 확인되지 않아  |
| Trang Thuy Seafood Co., Ltd. | Vi | frozen loin | 높음 | T/T/? | Tier 2: Specialized | 냉동 황다랑어 로인/사쿠/스테이크를 17년 이상 전문 가공하고 EU(DL 626)·US(FDA)·일본·한국에 이미 수출하는 독립 OEM으로, 신라교역의 냉동로인·사시미급 소싱 수요와 직접 부합한다. 베트남의 對스페인 |
| Frescol Tuna (Viet Nam) Co., Ltd | Vi | cook loin / frozen loin | 높음 | ?/T/T | Tier 2: Specialized | 순수 cook-loin/frozen-loin 전문 원료 공급자로, 캐너에게 깨끗한 OEM 원료(프리쿡 로인) 소싱처가 되어 신라교역의 베트남 참치 파트너 풀에 바로 편입 가능한 후보다. 미국 수출 트랙레코드와 EU· |
| Ba Hai Joint Stock Company | Vi | sashimi / cook loin / frozen loin  | 높음 | T/T/? | Tier 3: Niche (specializ | 신라교역 OEM 다변화 관점에서 캔이 아닌 사시미급·프리쿡 로인·CO/TS 냉동로인 전문 베트남 중소 가공사로 틈새 파트너 가치가 있으나, 2017년 FDA 히스타민 HACCP 경고 이력으로 컴플라이언스 재실사가 선 |
| Hong Ngoc Seafood Co., Ltd | Vi | frozen loin / sashimi (yellowfin t | 높음 | T/T/T | Tier 2: Specialized (fro | 미국 대형 유통(Walmart·Kroger·Costco·Sysco)에 직납하는 검증된 냉동 사시미급 옐로핀 로인·사쿠·포케 전문 가공사로, 신라교역의 냉동 참치 로인/스테이크 OEM 소싱 파트너로 적합하다. BRC  |
| Hai Trieu Food Co., Ltd | Vi | frozen loin | 높음 | T/T/T | Tier 2: Specialized | 자체 7척 선단·완전 추적성·FOS/MSC CoC를 갖춘 자연산 황다랑어 전문 가공사로, 프리미엄 사시미·스테이크용 냉동 로인(saku·loin·belly·cube)을 찾는 신라교역 바이어에게 차별화된 지속가능·고품 |
| Viet Nhat Seafood Corporation (VISEACO | Vi | canned | 보통 | ?/T/? | Tier 3: Niche / Speciali | DH 754 / Phu Nhat는 EU 등재된 전용 캔참치 가공장으로 OEM(91-100% 수출, 유럽향)을 명시 제공하는 중소 OEM 후보다. 신라교역 입장에선 yellowfin/tongol/skipjack 오일/ |
| Phuc Thinh Hung Seafood Co., Ltd | Vi | canned / cook loin / frozen loin | 보통 | T/?/? | Tier 2: Specialized (coo | 증숙(precooked) 참치로인을 캔공장에 납품하는 동시에 자체 oil/brine 캔까지 가공하는 멀티세그먼트 OEM으로, 신라교역이 쿡로인 원료 소싱과 PB 참치캔 위탁생산 양쪽에 활용 가능한 베트남 남중부 신규 |
| Huy Phat Co., Ltd. | Vi | frozen loin | 보통 | ?/?/? | Tier 3: Niche (frozen ye | 사시미급 황다랑어 냉동 로인/큐브를 자사 가공·IQF·냉장창고(100t/일 냉동, 1,500t 보관)로 직접 처리하는 Nha Trang 소재 중소 OEM 베이스로, 신라교역의 냉동 로인/사쿠/스테이크 라인 소싱 다변 |

### B-2. MAYBE — 보류 (추가 검증 필요)

| 회사 | 국가 | 세그먼트 | 신뢰도 | FDA/EU/MSC | 추정 Tier | 신라교역 관점 |
|---|---|---|---|---|---|---|
| I-TAIL Corporation PCL (ITC) — formerl | Th | petfood | 높음 | T/T/? | Tier 2: Specialized (Pet | 참치 기반 습식 펫푸드/RTE OEM이 신라교역 파트너 풀에 포함된다면 세계적 규모(연 17만톤+, 글로벌 톱5 펫푸드사 중 4곳과 협업, 세계 유일 AAALAC 인증 습식 펫푸드 OEM)의 매력적 후보다. 다만 인 |

### B-3. EXCLUDE — 제외

- **Nha Trang Seaproduct Company (NTSF / Nha Trang Seafoods F17)** (Vietnam) — 실존·별개법인이나 핵심 가공품은 새우(Vannamei)+팡가시우스(cá tra)임. 공식 VASEP 회원페이지 제품군이 "Tôm đông lạnh, Cá tra đông lạnh"(냉동새우·팡가시우스)이고, US 수입 B/L 기록(F89 JSC)은 Vannamei 새우 전용, 자회사 NTSF Seafoods JSC(Can Tho, DL461)는 팡가시우스 
- **Unicord Public Co., Ltd.** (Thailand) — 실존하는 대규모 참치 통조림 가공사이나, 기존 17개사 목록의 #13 Sea Value PLC의 자회사/구성사임. Sea Value Co.(현 Sea Value PLC 지주사)가 2005-09-15 Unicord를 인수(자본금 5.2억 바트, 일 400톤). 즉 기존 등재 대기업의 자회사이므로 별개 신규 법인이 아님 — 중복.
- **Tradelinks Trading Co., Ltd (Vietnam TradeLinks)** (Vietnam) — Tradelinks Trading Co., Ltd는 B2B 디렉터리(TradeKey 등, 2009년 3월 가입)에 실존하나, 자사 프로파일은 "canned tuna, basa fish fat"을 취급하는 무역상(trading/sales)으로만 기재되어 있어 자체 가공설비 증거가 없음. 결정적으로, 발굴근거가 된 "-60C super-frozen sashim
- **Marine Frozen Foods Co., Ltd** (Thailand) — 참치 가공업체로 보기 어려움. 자사 공식 웹사이트(marinefrozenfoods.com)와 모든 상세 제품 카탈로그(exporthub, trade-seafood)에는 담수어·새우 위주 포트폴리오(Rohu, Pangasius, Tilapia, Mrigal, Silver Carp, Catfish, Vannamei 새우, 갑오징어, 랍스터)만 등재되어 있고 참

### B-4. INCLUDE 상세 프로필

#### Tropical Canning (Thailand) Public Co., Ltd. (TC)  (Thailand, 높음)
- Tropical Canning (Thailand) PCL(TC)은 1979년 설립, 1990년 태국증권거래소(SET) 상장된 독립 참치 캐너로 본사 주소가 메모와 정확히 일치하는 실존 기업이다. 참치 통조림/파우치(스프링워터·브라인·오일), 즉석 참치/연어/정어리/고등어, 그리고 참치 원료 펫푸드(TCB·Snappy Tom·hug Plus)를 제조하며 유럽·아시아·미주·호주·아프리카로 수출한다. Tan 가문·개인이 주요 지분을 보유한 독립 법인으로 Thai Union·Sea Value 등 기존 17개사와 별개이며, ISSF 참여사·태국참치산업협회 회원으로 검증된다.
  - 설립: 1979 (SET 상장 1990-01-12)
  - 공장: Hat Yai, Songkhla 90110 (본사·주공장, 1/1 Moo 2 Kanjanawanit Rd.)
  - 생산능력: 직원 약 2,232~2,617명 규모. 2024년 매출 약 6,569백만 바트(약 USD163M+). 정확한 톤 단위 생산능력은 1차 출처에서 미공개.
  - 검증된 인증: ISSF Participating Company (tuna conservation compliance), Thai Tuna Industry Association membership (ordinary member)
  - 웹: https://www.tropical.co.th/

#### Asian Alliance International Co., Ltd. (AAI / Asian Sea Corporation PCL)  (Thailand, 높음)
- Asian Alliance International (AAI)는 2005년 설립되어 2022년 SET에 상장(심볼 AAI, 등록자본 21.25억 바트)된 실존 기업으로, Asian Sea Corporation PCL이 지분 100%를 보유한 자회사다. 참치 통조림·파우치·냉동로인·참치 부산물(피시밀·어유·어즙)과 참치 기반 웻펫푸드를 OEM/자사 브랜드(Monchu, Hajiko, Pro)로 생산하며 미국·EU가 주력 수출시장이고 Thai Tuna Industry Association 정회원이다. 모기업 Asian Sea(1964년 설립)는 Thai Union·Sea Value와 무관한 별도 그룹으로, 기존 17개사 및 자회사와 중복되지 않는 독립 참치가공 OEM 파트너다.
  - 설립: 2005-03-15 (설립); 2022-03-10 PCL 전환; SET 상장 2022-11-01
  - 공장: 본사 사무소: 55/2 Moo 2 Rama 2 Road, Bangkrajao, Muang, Samut Sakhon 74000 · 공장: 8/8 Moo 3 Rama 2 Road, Banbor, Muang, Samut Sakhon 74000
  - 생산능력: 웻펫푸드 연 49,500MT(완제품; 자료에 따라 41,000MT로도 표기) + 참치/인간식용 연 17,500MT + 피시밀 연 6,000MT
  - 검증된 인증: HACCP, GMP (Good Manufacturing Practice), Earth Island Institute Dolphin Safe, Halal, Kosher, Thai Labour Standard TLS 8001-2020
  - 웹: https://asianalliance.co.th/en/

#### Golden Prize Canning Co., Ltd.  (Thailand, 높음)
- Golden Prize Canning은 1997년 설립된 태국 사뭇사콘 소재의 가족경영 독립 캔 수산물 전문 가공사로, 공식 웹사이트·MarinTrust 인증서·Panjiva 무역데이터(2,306건 선적)·2016년 노동분쟁 언론보도(Bangkok Post 등)로 실존이 확인된다. Skipjack·Yellowfin·Tongol·Albacore 등 다종 참치를 솔리드/청크/플레이크/슈레디드 및 파우치·파테 형태로 가공하며 EU 등재·FDA·HACCP·GMP·BRC·SEDEX·AEO·Halal 인증을 보유하고 135개국+에 수출한다. 기존 17개사 명단 및 그 자회사와 별개의 독립 법인으로, 신라교역 OEM 후보로 포함 권고한다.
  - 설립: 1997
  - 공장: 사뭇사콘 공장 (55/4 Moo 3, Kok-Kham Rd., Bangyapraek, Muang, Samut Sakhon 74000) — 약 105,000 SQM 생산부지 · 방콕 본사/오피스 (69 Jalansanitwong Rd., Bangbamru, Bangplad, Bangkok 10700)
  - 생산능력: 공식사이트 기준 연 155,000 MT 생산 + 30,000 MT 냉장창고, 직원 3,000명+ (Tridge에는 12 KMT로 표기 — 출처 간 수치 불일치, 공식사이트 값 우선)
  - 검증된 인증: EU Approval (수산물 EU 등재), US FDA, BRCGS (BRC Grade A), HACCP, GMP, MarinTrust Standard for Responsible Supply (Fishmeal & Fishoil; 어유·어분 부산물 책임공급 - Skipjack/Yellowfin/Albacore/Frigate tuna, FAO 51/57/61/71) Cert #190, SEDEX (SMETA), AEO (Authorized Economic Operator)
  - 웹: https://www.goldenprize.co.th/

#### Diamond Food Product Co., Ltd. (brand: FINE CHEF)  (Thailand, 높음)
- Diamond Food Product Co., Ltd.은 2011년 태국 Samut Sakhon(Mahachai)에 설립된 참치 통조림/파우치 전문 가공·수출업체로, 자사 브랜드 FINE CHEF와 OEM(PB) 생산을 병행한다. 공식 웹사이트·TTIA 정회원 등재·Gulfood 2026 출품·태국 사업자등록(90090136)·미국 세관 수출기록(Panjiva 423건, HS 1604.14)으로 실존과 참치 가공이 교차 확인되며, Thai Union/Sea Value 등 17개 기존사와 무관한 독립 법인이다. BRC·MSC·USFDA·ISO·Halal·Kosher·Dolphin-Safe를 표방하나 페이지상 구체적 인증코드(EU 승인번호·FCE·MSC CoC ID·BRC 등급)는 확인되지 않았다.
  - 설립: 2011 (Mahachai 신공장 2015년 가동)
  - 공장: 89/72 Moo 2, Rama 2 Rd., T. Kalong, A. Mueang, Samut Sakhon 74000 (참치 가공공장, Mahachai Factory Town) · 마케팅 오피스: The Bright Rama 2, 15/6, Bangkok 10150
  - 웹: https://www.diamondfoodproduct.co.th

#### MMP International Co., Ltd.  (Thailand, 높음)
- MMP International Co., Ltd.(별칭 Mahachai Marine Products)는 태국 Samut Sakhon 소재 약 2001년 설립의 독립 중형 참치 캐너리로, 자체 웹사이트·TTIA 창립 정회원(2013)·IPNLF(11년)·ISSF 참여사(2012)·EII 돌핀세이프 등재 등 다수의 1차/업계 출처로 실존이 확인된다. 3oz~케이터링 사이즈 전 규격 참치캔에 고등어·새우·게·baby clam·펫푸드까지 다품종을 1교대 100MT·종업원 2,000명·20,000m2 단일 공장에서 OEM 생산하며 독일·영국·그리스 등 EU 6개국+미국·일본으로 수출한다. 기존 17개사 및 Thai Union/Sea Value와는 별개의 독립 법인이며, 돌핀세이프·ISSF·Fairtrade는 확인되나 FDA·EU 코드·BRC/MSC는 1차 코드 미확인(근거 정황만 존재)이라 실사 시 인증서 직접 확인이 필요하다.
  - 설립: 약 2001년 (2021년 ISSF 보도 기준 '20년 전' 설립; Tridge/Volza는 2001년 표기)
  - 공장: Samut Sakhon (Mahachai) 단일 캐너리 — 약 20,000 m2, 자체 창고 및 컨테이너 적재 설비
  - 생산능력: 1교대당 평균 100 MT 처리, 종업원 2,000명 이상 (중형 캐너리 — 효율·품질관리·고객대응 균형형으로 자체 포지셔닝)
  - 검증된 인증: Dolphin-Safe (Earth Island Institute / IMMP), ISSF Participating Company, Fairtrade (몰디브 Maandhoo pole-and-line fishery)
  - 웹: http://www.mmptuna.com/ (운영 중이나 TLS 인증서 도메인 불일치 오류 — 콘텐츠는 검색 스니펫 및 Sourcing Transparency Platform 미러로 확인)

#### RS Cannery Co., Ltd.  (Thailand, 높음)
- RS Cannery Co., Ltd.(정식 R S Cannery Co., Ltd.)는 1983년 설립된 태국 사뭇쁘라깐(Bangpoo 산업단지) 소재 독립 참치 캐너로, 알바코어·옐로핀·스킵잭을 통조림·파우치(물/염수/오일/브로스)로 가공하고 RTE 참치식·연어·참치/치킨 펫푸드까지 생산하는 OEM/private-label 전문업체다. Thai Tuna Industry Association 정회원이자 ISSF 참여기업이며, Panjiva 기준 미국 3,000건 이상 선적과 Loblaw·Dollarama(캐나다) 등 북미 리테일 바이어를 두고 일본·유럽·중동에도 수출한다. Thai Union·Sea Value 등 기존 17개사 및 그 자회사와 무관한 별개 법인으로, 실존·참치가공·독립성이 모두 1차 출처로 확인된다.
  - 설립: 1983
  - 공장: Bangpoo Industrial Estate, Samut Prakan, Thailand (255/1 Moo 4 Soi 3, T. Praeksa, A. Muang, 10280)
  - 생산능력: 정확한 생산능력 미공개; 30년 이상 경력의 중견 캐너로 미국향 단일 선적 사례 약 20톤 규모(Panjiva)
  - 검증된 인증: BRC (British Retail Consortium) Food Safety, GMP (Good Manufacturing Practice), HACCP, ISO 9001:2015, Halal, Kosher, ISSF Participating Company, Dolphin-Safe
  - 웹: https://www.rscannery.com/

#### Thai Inaba Foods Co., Ltd.  (Thailand, 높음)
- Thai Inaba Foods Co., Ltd.는 일본 Inaba Foods(1805년 어물상 창업, 1948년 법인화)가 100% 소유한 사라부리 소재 참치 가공·펫푸드 제조 법인으로, 인간용 참치캔과 스킵잭 기반 프리미엄 습식 펫푸드(CIAO/Churu 브랜드)를 생산해 북미 등 전 세계로 수출한다. Thai Tuna Industry Association 정회원이며 2015년 이후 미국향 선적 1,443건(주 수하인 Inaba Foods USA Inc.)이 확인되고 2025년 7월 WHA 사라부리 4공장(투자액 20억 바트 이상)을 가동했다. 기존 17개사 및 그 자회사와 별개의 일본계 독립 법인으로, 펫푸드/RTE 참치 니치 OEM 관점에서만 신라교역에 관련성이 있다.
  - 설립: Inaba Foods Japan 창업 1805년·법인화 1948년; 태국 진출 2006년, 본격 생산확장 2012년
  - 공장: 사라부리 Nong Khae 본공장 (190 Moo 7, Nong Pla Kradi Rd.) · WHA Saraburi Industrial Land 제4공장 (2025-07-21 가동, 투자 20억 바트 이상)
  - 생산능력: 정확한 톤수 비공개. 4개 공장 체제로 확장; 북미향 미국 선적 약 1,443건(2015-12~2026-05, 출처 ImportInfo/Panjiva). 펫푸드 'POUCH PETFOOD'·HS2309.10 주력
  - 검증된 인증: Dolphin-Safe / dolphin-friendly fisheries sourcing, Thai Tuna Industry Association - Ordinary Member, Third-party batch testing (pathogen/contaminant)
  - 웹: https://www.inaba-ciao.com/

#### Siam International Food Co., Ltd.  (Thailand, 보통)
- Siam International Food Co., Ltd.(SIF)는 태국 송클라(Chana)에 소재한 실존 수산가공사로, TTIA(태국참치산업협회) 정회원이자 2013년 협회 설립 16개 창립사 중 하나이며 남부 태국에 자가 참치 통조림 공장을 보유한 20년 이상 경력의 가공업체다. 인간용 참치 통조림·수산가공품과 습식 펫푸드(캔 고양이 사료 등)를 동시 생산·수출하는 듀얼 OEM 역량을 갖췄고(HS16·HS23 수출 기록, 미국 Inaba Foods·캐나다 Freedom Pet Supplies 납품, 부산 경유 시애틀 선적 확인), 기존 17개사 및 그 자회사와 별개의 독립 법인이다. 다만 1차 출처에서 EU 등록번호·FCE·MSC ID 등 인증 코드는 직접 확인되지 않아 인증 정보는 미검증 상태다.
  - 설립: 약 2005-2006년 (출처별 2005/2006 상이)
  - 공장: 남부 태국 Songkhla주 Chana, 88 Moo 10 T. Natab — 참치 통조림 및 펫푸드 가공 공장(본사 겸 공장)
  - 생산능력: 공식 생산능력 미공개. D&B/Tracxn상 매출 약 $5M, 종업원 11-50명(16명 기재 소스 존재)으로 보고되나 통조림 공장 규모 대비 과소집계 가능성 있어 신뢰도 낮음
  - 웹: https://www.sif.co.th/

#### Pegasus Food Co., Ltd.  (Thailand, 보통)
- Pegasus Food Co., Ltd.는 2010년 3월 설립된 태국 Songkhla 소재 독립계 캔 수산물 제조사로, 참치 5개 라인(Skipjack·Longtail)과 정어리/고등어 5개 라인을 운영하며 1일 약 5컨테이너 규모를 가공한다. 공식 웹사이트·B2B 디렉터리(NC-Net/emidas, Tridge, 21food, Anuga)와 Volza 통관 데이터(101건 선적)로 실존·참치가공·17개 기존사와 별개 법인임이 확인됐다. Halal·GMP·HACCP는 확인되나 EU 승인번호·USFDA 등록번호·MSC는 1차 출처에서 미확인이며, 웹사이트가 표방한 미국·캐나다·호주·NZ 시장과 달리 실제 통관 기록은 카타르·사우디·이스라엘 등 중동에 집중되어 시장 주장과 실거래 간 차이가 있다.
  - 설립: 2010-03 (March 2010)
  - 공장: 68/2 Moo 6, T. Tumnob, A. Singhakorn, Songkhla 90280, Thailand (단일 캐너리)
  - 생산능력: 참치 5개 라인 + 정어리/고등어 5개 라인. 첨단 가공유닛 기준 1일 약 5컨테이너 생산(웹사이트 기재, 2014년 시점 라인 증설 언급). 캔 규격 95g~1,880g.
  - 검증된 인증: Halal, GMP, HACCP
  - 웹: https://www.pegasusfood.co.th/

#### Ongreen Thailand Co., Ltd.  (Thailand, 보통)
- Ongreen Thailand Co., Ltd.(법인명 On-Green Produces Co., Ltd., 약칭 OGC Thailand)는 1986년 설립된 태국 사뭇사콘 소재의 캔 어류 가공·수출사로, 공식 웹사이트와 태국 DOF/MOAC 가공시설 등록 목록(동일 주소 111/15 Moo4, Bankoh, Muang Samut Sakhon 74000)을 통해 실존이 확인된다. 캔 참치(Albacore·Tongol·Yellowfin·Skipjack·Bonito; Flake/Chunk/Solid/Shredded/Fillet; 콩기름·해바라기유·염수)와 고등어·정어리 캔을 OEM/PB 및 자체 브랜드 'Khun Mae'로 27개국 이상(중미·EU·동남아·카리브·UAE 등)에 수출한다. Thai Union·Sea Value·Pataya 등 기존 17개사 및 그 자회사와는 별개의 독립 법인으로 보이나, EU 승인코드·FDA FCE·MSC 등은 1차 출처에서 직접 확인되지 않았다.
  - 설립: 1986
  - 공장: Samut Sakhon factory: 111/15 Moo4, Tambol Bankoh, Amphur Muang, Samut Sakhon 74000, Thailand
  - 생산능력: 생산능력·종업원 수 공개 없음. '신선 어류는 매일 공장에 입고되어 1일 내 가공·캔닝'이라고 명시. 캔 포맷: 125g(Club), 155g(Jitney), 185g(Half-Tall), 215g(Oval), 425g(Tall)
  - 검증된 인증: GMP, HACCP, HALAL, Green Industry (Thailand) + Carbon Footprint System, Thai Department of Fisheries 가공시설 등록 (On-Green Produces Co., Ltd.)
  - 웹: https://ongreenthailand.com

#### P.C. Tuna Co., Ltd.  (Thailand, 보통)
- P.C. Tuna Co., Ltd.(브랜드 SEALIFE, 2005~2006년 설립, 태국 Samut Sakhon Krathum Baen 소재)는 태국 주요 참치 캐너에 precooked tuna loin을 공급하는 1차가공 OEM이자 참치/연어 파우치·캔·펫푸드 제조사로 실존이 확인된다. Thai Tuna Industry Association 정회원이며 GMP·HACCP·ISO9001·CICOT Halal·Earth Island(dolphin-safe) 인증을 보유하나 EU 등재번호·MSC·미국 FDA 등록은 1차 출처로 확인되지 않았다. 기존 17개사 및 Thai Union/Sea Value 계열과는 별개의 비상장 가족기업(대표 Pornchai Pansrikaew/Pasrikaew)으로, 일 약 50톤 규모의 중소 전문 공급사로 평가된다.
  - 설립: 2005~2006 (출처별로 C.P. Tuna 2005 / P.C. Tuna 2006으로 표기, 동일 주소·대표)
  - 공장: Samut Sakhon (Krathum Baen, Klongmadue) 단일 가공공장 230/1 Moo 10
  - 생산능력: precooked tuna loin 최소 약 50톤/일 (C.P. Tuna 동일주소 trade profile 기준, 2차 출처)
  - 검증된 인증: Halal (CICOT) CICOT.HL.43B5550100463
  - 웹: https://www.pctuna.co.th/

#### Amazing Tuna Company Limited  (Thailand, 보통)
- Amazing Tuna Company Limited은 태국 사뭇사콘에 자체 GMP·HACCP 인증 공장을 둔 실존 참치 가공·수출사로, 냉동 프리미엄 사시미 참치 로인·사쿠(아카미)·스테이크와 'Japan Grade Sashimi Tuna'(주 2회 방콕 항공 운송)를 주력으로 한다. 자사 트레이딩 페이지는 BRC·HACCP·GMP 인증, EU 등록(EUCC·EII Dolphin Safe), ISSF·EU 등록 어선, IUU 점검을 명시하며, 제3자 업계 가이드(Freshdi)도 일본·한국 사시미 시장 대상 독립 공급사로 분류해 기존 17개사 및 Thai Union/Sea Value 계열과 별개 법인임이 확인된다. 다만 설립연도·소유주 실명·생산능력·FDA/MSC 등록번호 등 1차 근거는 미공개로, EU 코드와 FDA 등록은 직접 검증되지 않았다.
  - 공장: 자체 GMP·HACCP 인증 가공공장 1개소, 태국 사뭇사콘(방콕 인근), 주소 71/14 Moo 3, Bang Ya Phraek, Mueang Samut Sakhon
  - 생산능력: 생산능력 수치 미공개. 'Japan Grade Sashimi Tuna'는 어획 직후 가공·포장 후 주 2회(twice weekly) 방콕으로 항공 운송. 사시미 참치는 전량 연승(longline) 어선 원료, 일부 어획자는 Ikejime 기법 숙련.
  - 검증된 인증: GMP, HACCP, GHP (staff trained), BRC
  - 웹: https://amazingtuna.com/

#### R. Monkhorn Frozen Co., Ltd. (R. Monkhorn Frozen Food)  (Thailand, 보통)
- R. Monkhorn Frozen Co., Ltd.는 2005년 설립된 태국 사머 사콘 소재 가족경영 참치 가공사로, 공식 웹사이트(rmk.co.th)·TFPA 회원 등재·Gulfood/Anuga/Saudi Food Show 출전으로 실존이 확인된다. 약 500명·16,000㎡·일 70MT 규모로 스킵잭·옐로핀·통골을 원료로 냉동 로인, 캔, 부가가치 제품을 생산하며 기존 17개 후보사 및 Thai Union/Sea Value 계열과는 무관한 독립 법인이다. 다만 EU·US 진출과 FAS는 제3자 마케팅 문구에 그치고 EU/FDA 등록번호·BRC/HACCP/ISO22000·MSC는 1차 출처에서 확인되지 않아 신뢰도는 medium이다.
  - 설립: 2005
  - 공장: Samut Sakhon, Thailand — 16,000 sqm production site
  - 생산능력: ~500 employees; stated production capacity ~70 MT/day (per company about-us page)
  - 검증된 인증: TFPA membership (Thai Food Processors' Association)
  - 웹: https://www.rmk.co.th/

#### Hai Vuong Co., Ltd. (Havuco / Hai Vuong Group)  (Vietnam, 높음)
- Hai Vuong Co., Ltd.(Havuco / Hai Vuong Group)는 1997년 나트랑 현지 사업가들이 설립한 베트남 최대 참치·표층어(pelagic) 가공수출 그룹으로, 공식 웹사이트(haivuong.com)·VASEP·FIS(seafood.media)·LinkedIn·FDA 기록으로 실존이 확인된다. 그룹은 Hai Vuong(지주)·Dragon Waves(캐닝/파우치 공장, 2004 설립, EU DL314·FDA Reg.11781748552)·Nha Trang Bay·Pink Sea·Bidifisco 등으로 구성되며, 냉동 loin/saku/steak/cube와 pre-cooked loin/flakes, 그리고 oil/brine/water의 파우치·캔 yellowfin·skipjack까지 신라교역이 찾는 OEM 풀스코프를 모두 생산한다. Thai Union·Sea Value 자회사가 아닌 독립 법인이며 기존 17개사와 별개로, EU·USDC·MSC·BRC·IFS·HACCP 인증을 보유한 유력 후보다(단 FDA Import Alert 16-105의 Kingfish/Wahoo 부패 적발 이력은 품질 검증 시 확인 필요).
  - 설립: 1997 (Dragon Waves 자회사 2004 설립)
  - 공장: Hai Vuong (지주/main, Suoi Dau IZ, Khanh Hoa) · Dragon Waves Frozen Food Factory Co., Ltd. (2004 설립, 21,300m2, EU DL314, FDA Reg.11781748552, 일 약 100MT 원료, 약 1,000명) · Nha Trang Bay Joint Stock Co. · Pink Sea
  - 생산능력: 출처별 편차: 그룹 처리능력 약 110,000MT/년(참치·표층어 약 75,000~85,000MT), 완제품 수출 약 60,000MT/년(참치·표층어 약 50,000MT). 일부 FIS 프로필은 보수적으로 가공 약 40,000MT(참치 약 30,000MT)·매출 약 $150M로 기재. 임직원 약 3,000명
  - 검증된 인증: EU Approval (DL code) DL314, FDA Registration 11781748552 (Dragon Waves), BRC, IFS, HACCP / GMP, Halal, Friend of the Sea (Bidifisco group plant), FDA Import Alert (negative flag) 16-105 (Kingfish/Wahoo decomposition)
  - 웹: https://haivuong.com/

#### Dragon Waves Frozen Food Factory Co., Ltd.  (Vietnam, 높음)
- Dragon Waves Frozen Food Factory(2004년 설립)는 베트남 최대 참치·원양어 가공·수출그룹인 Hai Vuong Co., Ltd.(1997년 설립)의 자회사로 실존이 확인된다. Khanh Hoa Suoi Dau 공단에서 일 약 100MT 원료를 처리하며 CO처리/내추럴 옐로핀 로인·사쿠·스테이크·청크 및 precooked/canned 참치를 생산하고, EU 승인코드 DL 314·FDA 등록·BRC·HACCP를 보유한다. Thai Union/Sea Value 등 기존 17개사와는 무관한 독립 그룹 계열로, 신라교역의 냉동 참치로인·통조림 원료 OEM 후보로 유효하다.
  - 설립: 2004 (자회사 설립; 모그룹 Hai Vuong Co., Ltd.는 1997)
  - 공장: Lot C3-C7, Suoi Dau Industrial Zone, Cam Lam District, Khanh Hoa (약 21,300m², 종업원 약 1,000명)
  - 생산능력: Dragon Waves 단일 공장 약 100MT 원료/일 (≈30,000MT/년 규모). 그룹 전체는 연 110,000MT 이상 수산물, 그 중 약 85,000MT가 참치·원양어. 발굴메모의 '~20,000MT 참치/년'은 보수적 추정치로 보이며 그룹 공시(~85,000MT)와 상이
  - 검증된 인증: EU Approval Number DL 314, FDA Registration 11781748552, BRC Global Standard (Food Safety), HACCP, ISO (accreditation), Halal, Dolphin-Safe (Earth Island Institute)
  - 웹: https://www.dragonwaves.com (그룹: https://haivuong.com)

#### Nha Trang Bay Joint Stock Company  (Vietnam, 높음)
- Nha Trang Bay Joint Stock Company는 Hai Vuong Group 산하의 실존하는 참치 가공·수출 공장으로, 베트남 Khanh Hoa성 Cam Lam현 Suoi Dau 공단(Lot B13/B14)에 소재한다. CO-처리 옐로핀 참치 로인·사쿠·스테이크·큐브 등 사시미/로인급 제품을 일일 약 80MT 가공하며, -55°C 냉동창고(2,000MT)·에어블라스트 급속동결기·스티밍룸·CO처리룸을 갖춘 EU 등재 시설(DL 620으로 다수 무역 디렉터리에 표기)이다. Friend of the Sea 및 Earth Island Dolphin-Safe 인증을 보유해 EU/한국 리테일 지속가능성 소구가 강하며, 제시된 17개 기존사 및 Thai Union/Sea Value 등과 별개 법인이다(이름이 유사한 pangasius 가공사 NTSF Seafoods/DL 461과도 별개).
  - 공장: Lot B13/B14, Suoi Dau Industrial Zone, Cam Lam, Khanh Hoa — 20,100 m2 단지(사무동·가공장·냉장창고·기숙사·식당), band saw 40대, 에어블라스트 급속동결기 5대, 스티밍룸, CO처리룸, 칠러룸, -55°C 냉동창고 3기(2,000MT)
  - 생산능력: 원료 약 80 MT/일 가공 능력. 모회사 Hai Vuong Group은 연간 참치·원양어종 약 50,000~85,000MT 가공, 50개국 이상 수출(출처별 그룹 합계 수치 상이)
  - 검증된 인증: Friend of the Sea, Earth Island Dolphin-Safe
  - 웹: http://haivuong.com

#### Mariso Vietnam Co., Ltd.  (Vietnam, 높음)
- Mariso Vietnam Co., Ltd.(Công Ty TNHH Mariso Việt Nam, MST 4201800980, 2018년 7월 설립)는 Khanh Hoa Suoi Dau 산업단지에 가공공장을 둔 실존 참치 가공·수출사로, 냉동 옐로핀 로인·스테이크·사쿠·쿡로인·파우치 가다랑어 등을 미국(Bumble Bee 등)·일본·EU(Spain/Estonia)·중동으로 수출하는 베트남 Top-5 참치 수출사(5사 합산 국가 수출액의 39%)다. 베트남 최대 참치 가공사 Hai Vuong Group과 동일 단지·연락선을 공유하는 계열/제휴 관계이며, EU 트레이딩암 Mariso Seafood OÜ(Estonia)와 미국 Mariso Food Inc를 통해 글로벌 판매망을 운영한다. 제시된 17개 기존 후보(태국 대기업 포함)와 자본·법인상 별개이며 중복이 아니어서 신규 OEM 후보로 포함 권고한다.
  - 설립: 2018-07 (베트남 법인, MST/세금코드 4201800980)
  - 공장: Lot B8 & part of B9, Suoi Dau Industrial Zone, Suoi Tan, Cam Lam, Khanh Hoa (본사·가공공장)
  - 생산능력: 단독 생산능력 수치는 1차 출처에서 미확인. 무역DB상 수출 약 3,514건·수입 약 1,274건 규모이며 미국향으로 Bumble Bee Foods에만 5,000건 이상 선적 기록 등 가동률이 높은 활성 가공·수출사.
  - 웹: marisoseafood.com (EU/Estonia 트레이딩암 Mariso Seafood OÜ 사이트; 베트남 가공법인 자체 공식 사이트는 미확인)

#### Binh Dinh Fishery Joint Stock Company (BIDIFISCO)  (Vietnam, 높음)
- BIDIFISCO(Binh Dinh Fishery JSC)는 베트남 Qui Nhon(Binh Dinh)에 본사를 둔 실존하는 원양 참치 가공·수출 기업으로, 1999년 국영 Binh Dinh Fishery Company가 주식회사로 전환(equitized)되어 설립되었다. 참치가 수출의 약 80%를 차지하며 냉동·신선 참치를 whole/fillet/portion/loin/steak/cube/saku 형태로 가공, 스페인 등 EU(수출액의 약 40~70%)·미국·일본 등에 공급하는 베트남 7위권 참치 가공사이자 스페인向 참치 수출 상위 3사 중 하나다. HACCP·SGS·ISO 22000·ISO 9001·EU approval·FDA 보유, Friend of the Sea(RINA, yellowfin 황다랑어, purse seine, FAO 71) 인증 이력이 있으나 동 인증은 2024-01-23 만료됨. 제시된 17개사 및 Thai Union/Sea Value 등 대기업과는 별개의 독립 법인이다.
  - 설립: 1999 (국영 Binh Dinh Fishery Company를 주식회사로 equitized)
  - 공장: Qui Nhon City, Binh Dinh 본사·가공공장 (2D Tran Hung Dao Street)
  - 생산능력: 생산능력 5,000 MT/년, 냉동 30 MT/일, 냉장창고 600 MT (trade-seafood 디렉토리 및 발굴 도시에 근거). 연 10~15% 성장 자체 보고
  - 검증된 인증: HACCP, EU approval (fishery products), FDA / USDA-USDC, SGS, Friend of the Sea (Yellowfin tuna, purse seine, FAO 71)
  - 웹: http://www.bidifisco.com/

#### Nghi Son Foods Group  (Vietnam, 높음)
- Nghi Son Foods Group JSC(NSFG, Tax ID 0312962965)는 2009년 설립·2014년 호치민시(HCMC) 법인화된 실존 베트남 참치 가공·수출 기업으로, Phan Thiet(Binh Thuan)에 위치한 Hai Trieu Food 공장(2019년 인수)을 생산 거점으로 둔다. 냉동 옐로핀 참치(loin/steak/saku/cube/kama/ground, Natural 및 CO 처리)와 통조림 참치(chunk/shredded, oil/brine)를 단일 그룹에서 모두 생산해 frozen-loin·사시미급·canned OEM을 포괄한다. 기존 17개사 및 Thai Union/Sea Value와는 무관한 별개 독립 법인이며, BRCGS·MSC·HACCP·FDA 등 인증을 표방하고 EU 수출 라이선스 DL 688·HK 695가 독립 출처로 확인된다.
  - 설립: 2009 (그룹 출범); 2014 HCMC 법인화; Hai Trieu Food 공장 2006 설립·2019 인수
  - 공장: Hai Trieu Food Factory No.1 (Phan Thiet City, Binh Thuan) - 2019 인수, DL 688 · Hai Trieu Food Factory No.2 (Phan Thiet City) - Phase1 2022/Phase2 2024 · NSF Group Co.,Ltd. 신규 냉동·통조림 공장 (Binh Dinh) - 2024 투자승인 · HK 695 (참치 가공 EU 등록), DL 947 (집계 출처 언급, EU 등록부 직접 미확인)
  - 생산능력: 공식·1차 출처에 일/연 생산능력 수치 미공개. 3개 EU/US 승인 공장 운영으로만 기술됨
  - 검증된 인증: EU approval (fishery products) DL 688, EU approval (fishery products) HK 695, US FDA registration, HACCP
  - 웹: https://nghisonfoodsgroup.com/

#### Tin Thinh Co., Ltd. (Tinthinh Foods / 'Tithico')  (Vietnam, 높음)
- Tin Thinh Co., Ltd(TITHICO)는 2002년 설립된 베트남 Khanh Hoa(Cam Lam, Suoi Dau 공단) 소재 민간 수산가공업체로, 냉동 황다랑어/가다랑어 로인과 통조림 참치(in brine/in oil)는 물론 marlin·swordfish·mahi·두족류·새우 등을 가공한다. EU 수출용 DL385 코드와 HACCP·BRC·IFS·KOSHER 인증을 보유하며 USA·EU·일본·중동·호주 등으로 수출하고, 연간 냉동 1.2만톤·통조림 1,500톤 처리 능력에 1,000여 명을 고용한다. 기존 17개 후보사 및 Thai Union/Sea Value 등 대기업과 무관한 독립 법인으로 확인되어 신규 OEM 후보로 적합하다.
  - 설립: 2002
  - 공장: Lot F1, Suoi Dau Industrial Zone, Cam Lam, Khanh Hoa, Vietnam
  - 생산능력: 연간 냉동 수산물 12,000톤 이상 + 통조림 1,500톤 처리 능력, 종업원 1,000명 이상 (공식 About Us 기준)
  - 검증된 인증: HACCP / EU export code (NAVIQAD) DL385, BRC, IFS, KOSHER
  - 웹: https://tinthinh.com.vn/

#### Hai Son Foods Co., Ltd.  (Vietnam, 높음)
- Hai Son Foods Co., Ltd.(CÔNG TY TNHH THỰC PHẨM HẢI SƠN, 세무코드 4201652429, 2015년 설립)는 베트남 Khanh Hoa Suoi Dau 공단에 소재한 실존 냉동 참치 가공·수출사로, 황다랑어 로인·사쿠·스테이크·큐브·분쇄육을 생산하며 미국·유럽·캐나다·중동에 수출한다. 같은 공단의 Hai Vuong Group(1997년·3,000명·10만MT급) 및 기존 17개사와 별개 법인이며 대기업 자회사가 아니다. 웹사이트에 FDA·BRC·BAP·Halal을 표기하나 EU DL 승인코드·MSC·FCE는 1차 확인되지 않아 미검증 상태다.
  - 설립: 2015 (전신 VN Seafood Company는 2001년부터 운영; 세무등록 2015-07-23)
  - 공장: Factory 1 — Lot D2-D3, Suoi Dau Industrial Zone, Khanh Hoa (본사·공장 동일 주소)
  - 웹: https://haisonfoods.vn/

#### Trang Thuy Seafood Co., Ltd.  (Vietnam, 높음)
- Trang Thuy Seafood Co., Ltd.는 베트남 Phu Yen성 Tuy Hoa시 소재의 실존하는 독립 냉동수산 가공·수출 기업(BRC 4400281923, 2001년 등록; VASEP 회원)으로, 냉동 황다랑어 로인/사쿠/스테이크와 마히마히를 주력으로 US·EU·일본·한국에 수출한다. EU 수출승인코드 DL 626과 HACCP·ISO·BRC를 보유하고 US FDA 추적 대상(2023 histamine 관련 경고서한은 2024-01 시정 종결)이며, 베트남의 對스페인 냉동참치 상위 3사로 거명될 만큼 EU 냉동로인 실적이 확인된다. 기존 17개 후보·Thai Union/Sea Value 계열과 무관한 별개 법인으로, 신라교역 냉동로인·사시미 OEM 후보로 include 권고(MSC CoC만 미확인).
  - 설립: 2001 (Business Registration Certificate 4400281923, Phu Yen DPI, 17/05/2001; originated as Trang Thuy Private Enterprise / small workshop)
  - 공장: Lot A12, An Phu Industrial Zone, Tuy Hoa City, Phu Yen Province (단일 가공공장, 약 5,500 m2)
  - 생산능력: 월 약 300톤 완제품, 5개 가공라인(냉동 3·건조 1·즉석 1), 냉동창고 5기 총 2,000톤 (frozen-goods.com 비공식 출처 기준, 회사 공식 페이지 미공개)
  - 검증된 인증: EU establishment approval (DL code) DL 626 (추가 HK 337), HACCP, ISO, BRC (Global Standard for Food Safety), Vietnam food safety establishment certificate No. 11/2017/QM-T/BT (issued 12/11/2015), FDA seafood HACCP / US import compliance Warning letters 66434 (2023-11-03) → resolved 668434 (2024-01-04)
  - 웹: https://trangthuyseafood.vn/

#### Frescol Tuna (Viet Nam) Co., Ltd  (Vietnam, 높음)
- Frescol Tuna (Viet Nam) Co., Ltd는 2013-06-21 설립된 베트남 응에안성 소재 FDI 유한책임회사로, Nam Cam 공단에 냉동 프리쿡(cook) 참치 로인 전문공장을 운영하는 실존 가공업체다(2019-2021 신축, 냉동창고 12,000MT, 종업원 1,000~1,500명). 가다랑어·날개다랑어·황다랑어·눈다랑어 프리쿡 로인과 flake·shredded·red meat를 생산해 미국(California항) 등으로 수출하며, EU코드 DL 983·GMP·HACCP·BRC·MSC CoC·Kosher·Dolphin Safe를 표방한다(Dolphin Safe는 EII에서 독립 확인). 소유는 Mongkol Banthrarungroj가 이끄는 Thai Corp International/Berli Jucker(BJC)·Royal Foods 태국계 네트워크와 연결되나, 기존 17개사 및 그 자회사와는 별개 법인이다.
  - 설립: 2013-06-21 (베트남 기업등록 기준 설립일; 공장은 2019-12~2021-01 신축)
  - 공장: 응에안성 Nghi Loc District, Nam Cam 공단 Area B 프리쿡 참치 로인 공장 — 부지 약 11,000㎡, 2019-12~2021-01 신축, NH3 냉동시스템·냉동창고 약 12,000MT(지역 최대급)
  - 생산능력: 공개 출처에 일/연 생산능력 수치 없음. 냉동창고 12,000MT 및 종업원 1,000~1,500명 규모로 보아 중대형. 미국향 누적 약 63건 선적(ImportGenius) 확인.
  - 검증된 인증: EU approved establishment (EU 승인 가공장) DL 983, Dolphin Safe (EII/IMMP)
  - 웹: https://www.frescoltuna.com/

#### Ba Hai Joint Stock Company  (Vietnam, 높음)
- Ba Hai Joint Stock Company는 베트남 Phu Yen성 Hoa Hiep 공단에 본사를 둔 실존 참치·수산물 가공·수출업체로, 공식 웹사이트·VASEP 디렉터리(EU코드 DL198, HACCP/ISO22000/BRC)·Phu Yen 정부 자료·무역 디렉터리·2017년 FDA 경고서한 등 다수 1차/2차 출처로 확인된다. 사시미급 참치, CO/TS 처리 냉동 로인, 프리쿡 skipjack/yellowfin 로인, tuna saku를 미국·일본·EU·캐나다 등에 수출하며 제시된 17개 기존사 및 Thai Union/Sea Value 계열과 무관한 독립 법인이다. 단 2017년 FDA가 'Ba Hai Company Limited'(동일 주소·연락처) 대상으로 scombroid 어종 HACCP 중대결함 경고서한을 발부한 이력이 있어, 참치 가공 실재성은 강하게 입증되나 히스타민 관리 컴플라이언스 재검증이 필요하다.
  - 설립: 2005년 (꽃게/블루스위밍크랩 사업으로 시작, 2009년 제2공장 인수)
  - 공장: Lot A9-A11 Hoa Hiep Industrial Zone, Dong Hoa, Phu Yen Province (본공장) · 2009년 인수한 제2공장
  - 생산능력: 구체 톤수 미공개. 2021년 10월 APO(Asian Productivity Organization)+일본 과학기술부 후원으로 냉동(콜드체인) 기술설비 도입, 심가공 고부가화 추진
  - 검증된 인증: HACCP, ISO 22000:2007, BRC, EU establishment approval DL198, FDA registered exporter (US)
  - 웹: https://www.bahaiseafood.com/ (등록 도메인 bahai.com.vn 병기)

#### Hong Ngoc Seafood Co., Ltd  (Vietnam, 높음)
- Hong Ngoc Seafood Co., Ltd는 2000년 설립된 실존 베트남 독립 가공사로, Phu Yen 참치 클러스터(Lot B3, Hoa Hiep 산업단지)에서 사시미·포케급 냉동 옐로핀 로인·사쿠·스테이크와 swordfish·mahi-mahi·wahoo를 가공하며 통조림·쿡로인은 취급하지 않는다. FDA Food Facility(16829718850)·EU(DL 609)·BRC A·MSC·FIP·SMETA를 표방하고 2017~2026년 미국향 선하증권 418건으로 상시 수출이 확인되며, Walmart·Costco·Sysco 등 미국 대형 유통에 직납한다. 기존 17개사(태국·베트남 통조림 대기업군 및 Thai Union/Sea Value 계열) 어느 곳과도 별개 법인으로, 신라교역의 냉동 사시미급 참치 로인 OEM 후보로 포함 권고한다.
  - 설립: 2000
  - 공장: Lot B3, Hoa Hiep Industrial Zone, Hoa Hiep Bac Ward, Dong Hoa Town, Phu Yen Province, Vietnam (단일 가공공장, Phu Yen 참치 클러스터)
  - 생산능력: 공식 생산능력 미공개. 2017-08~2026-05 미국향 선하증권 418건(최근 90일 11건)으로 상시 가동 확인, 주 선적항 Vung Tau(338/418).
  - 검증된 인증: FDA Food Facility Registration 16829718850
  - 웹: http://hongngocseafood.com

#### Hai Trieu Food Co., Ltd  (Vietnam, 높음)
- Hai Trieu Food Co., Ltd(법적명 Hai Trieu Company Limited)는 2006년 베트남 Phan Thiet 공단(Binh Thuan/현 Lam Dong)에 설립된 실존 참치 가공·수출업체로, 7척 자체 선단으로 handline·pole-and-line 자연산 황다랑어를 잡아 사시미급 saku·loin·belly·cube 등 냉동 로인 제품을 생산한다. VASEP 공식 등록(EU 승인코드 DL 688·DL 947·HK 695)과 HACCP·BRC·MSC CoC·FDA·Friend of the Sea(베트남 6번째 FOS 인증) 인증, Panjiva 기준 2007년 이래 423건의 대미 선적 기록이 실존·참치가공을 교차 확인한다. 2019년 Nghi Son Foods Group에 인수되어 그룹 계열사가 되었으나, 제시된 17개 기존사(태국 대기업 및 베트남 통조림사) 및 그 자회사와는 별개의 독립 법인이다.
  - 설립: 2006
  - 공장: Factory 1 (DL 688): Lot 2/6, Phan Thiet Industrial Zone, Binh Thuan/Lam Dong Province · Factory 2 (DL 947): Lot 2/3, Phan Thiet Industrial Zone · 추가 코드 HK 695
  - 생산능력: 구체 생산능력(톤/년) 수치는 1차 출처에서 미확인. 7척 handline/pole-and-line 자체 선단 운영.
  - 검증된 인증: EU establishment approval DL 688, EU establishment approval DL 947, EU establishment approval HK 695, Friend of the Sea (FOS) Sustainable Fisheries & Traceability (CoC v.5 - FOS wild 4), MSC Chain of Custody (CoC), BRCGS / BRC Food Safety, HACCP, US FDA registration
  - 웹: https://haitrieufood.com/

#### Viet Nhat Seafood Corporation (VISEACORP) / Phu Nhat Canning Co., Ltd.  (Vietnam, 보통)
- Viet Nhat Seafood Corporation(상호 VISEACORP, 2002-04-01 설립, 대표 Nguyen Van Nhut)와 그 가공장 Phu Nhat Canning Co., Ltd(Long An성 Ben Luc, EU코드 DH 754)는 실존하는 전용 캔참치 OEM 가공업체로, yellowfin/tongol/skipjack/bonito 오일·브라인 캔(185g-1880g)을 91-100% 수출(유럽 중심)하며 OEM을 명시 제공한다. 기존 17개사 중 Tan Phat Canned Food(Edison Foods)와 같은 Luong Hoa/Ben Luc 지역에 있어 B2B 집계 사이트(goldsupplier 'phunhat' 서브도메인)가 두 회사를 혼동시켰으나, EU코드(DH 754 vs TS 754/DL 223)·설립연도(2002 vs 2010)·사업자번호가 모두 달라 별개 법인으로 확인된다. EU 등재·HACCP는 확인되나 FDA·MSC는 1차 출처로 확증되지 않아 null로 둔다(타사 Tan Phat의 FDA/BRC/MSC와 혼동 주의).
  - 설립: 2002-04-01
  - 공장: Phu Nhat Canning Co., Ltd cannery — Luong Hoa Hamlet, Ben Luc District, Long An Province; ~3,672 m2 processing area; ~300 employees; canned-fish lines
  - 생산능력: Output ~30 tons/day; 3-4 automated canning lines; cold storage ~1,000 t raw materials and ~2,000 t finished canned product.
  - 검증된 인증: EU Approval Code (fishery products) DH 754
  - 웹: vietnhat.com (group); storefronts: phuongchi.en.hisupplier.com

#### Phuc Thinh Hung Seafood Co., Ltd  (Vietnam, 보통)
- Phuc Thinh Hung Seafood Co., Ltd는 2021년 설립된 베트남 남중부(Khanh Hoa, Suoi Dau 공단/Cam Lam 추정) 소재 참치 가공·수출 기업으로, 자체 캔공장에서 oil/brine 참치캔을 생산하고 냉동로인·증숙(precooked) 로인을 캔공장용으로 공급한다. 주력 제품은 yellowfin 로인(CO처리)·non-CO 큐브·precooked tuna flake와 bonito/skipjack/tongol 통조림이며, 중동·아시아·유럽·미주·호주로 수출한다(미국향은 Panjiva 통관기록 874건, 소비자 Sea Delight LLC 등 확인). 기존 17개사·Thai Union/Sea Value 계열과 무관한 별개 법인이나, EU DL코드·FDA 등록번호·MSC 등 1차 인증 코드는 직접 확인되지 않았다.
  - 설립: 2021
  - 공장: Khanh Hoa Province — Lot F9-F10, Suoi Dau Industrial Zone, Cam Lam District (trade-seafood 디렉터리/Panjiva의 'Thinh Hung Co., Ltd' 주소, Nha Trang 인근) · 자체 캔(oil/brine) 라인 + IQF·plate/blast/tunnel freezer·flake ice 등 냉동가공 설비 보유 진술
  - 웹: https://www.phucthinhhungseafood.com/

#### Huy Phat Co., Ltd.  (Vietnam, 보통)
- Huy Phat Co., Ltd.는 베트남 Nha Trang(Khanh Hoa)에 소재한 실존 수산 가공·수출 기업으로, 2003년 등록(등록번호 4200536821)되어 CO 처리 황다랑어 로인, 비-CO 참치 큐브, 프리쿡 플레이크 등 참치를 실제 가공하며 냉동 100t/일·IQF 50t/일·냉장창고 1,500t 규모를 자사 웹사이트에 명시한다. 기존 17개 후보사 및 Thai Union/Sea Value 계열과 무관한 별개 법인이며, 발굴 메모대로 냉동 로인 세그먼트 OEM 베이스로 부합한다. 다만 용량·시장은 모두 자기보고이고 EU DL코드·FDA·MSC 등 핵심 인증이 1차 출처로 확인되지 않아 신뢰도는 medium이며 인증 실사가 필요하다.
  - 설립: 2003 (Business Registration Certificate No. 4200536821 issued 2003-11-14 by Khanh Hoa Province DPI)
  - 공장: 24/2 Hung Vuong Street, Nha Trang, Khanh Hoa Province (본사·가공시설, 사이트상 단일 시설만 확인)
  - 생산능력: 냉동 100+ t/day, IQF 50+ t/day, 냉장창고 1,500+ t (전량 자사 웹사이트 자기보고, 제3자 검증 안 됨)
  - 검증된 인증: Vietnam Business Registration Certificate 4200536821
  - 웹: https://huyphatseafood.com/
