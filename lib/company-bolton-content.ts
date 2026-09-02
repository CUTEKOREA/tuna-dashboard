/**
 * 「시장 이해 > 기업 해부 > Bolton」 자료 출처.
 *
 * 단계 서술은 **여기 있지 않다.** 조사보고서를 그대로 읽어 온다
 * (`lib/company-prose-stages.ts` · `scripts/build_report_prose.py`).
 * 손으로 쓰던 서술은 보고서 본문의 21%만 담았고 보고서를 고칠 때마다 두 번 일하게 했다.
 */
export const BOLTON_SOURCE_NOTES: string[] = [
  '원자료는 Bolton 조사 아카이브(2026-08)다 - Sustainability Report 2025, 공개 선박명단 2021~2024년판, 이탈리아 등기 기탁분, EU 기업결합 결정문, UN Comtrade. 칸별 출처·등급(A=원본, B=기관 2차, C=업계 매체)이 달려 있다.',
  '비상장 가족기업이라 연결재무제표를 공표하지 않는다. 매출은 회사 발표문, 손익은 등기 기탁분의 언론 인용이다 - 2023년 이후 EBITDA·EBIT는 확인되지 않는다.',
  '조달 740,310 t 은 Bolton Food 원료와 Tri Marine 트레이딩의 합이다. 브랜드가 쓴 양으로 읽으면 안 된다.',
  '참치 단독 매출은 공개되지 않는다. 최소 공개 단위가 Food 카테고리 2,382 M€이고 그 안에 수산캔·육류캔·소스가 함께 들어 있다.',
  '선단은 연도와 등록부를 붙여야 한다. 공개 선박명단 399척은 조달 선단이고, **계열 소유는 WCPFC 10척 · IATTC 4척**이며 ICCAT 3척은 비활성이다(Via Alizé는 2025-04 중남미 매각 보도). AURORA B·ROSITA C 의 **등록 선주는 Atunera Dularra SL(빌바오)이고 그 모회사가 Grupo Conservas Garavilla - Bolton 100% 자회사**라 그룹 선박이 맞다. 알바코라 조사가 같은 배를 자기 선단표에 넣은 것이 겹침의 원인이다.',
];
