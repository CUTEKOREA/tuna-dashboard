/**
 * 골뱅이 명부 JSON 인테이크. 아키텍처 가드상 원본 JSON import 는 lib/data 에서만 한다.
 * 확장 명부(국내가공·수입명의·제품·위판조합·급식낙찰)는 공용 valuechain-companies.ts 를 거치지 않고 여기서 연다.
 */
import raw from '@/public/data/whelk_company_research_v1.json';

export const WHELK_COMPANY_RESEARCH = raw;
