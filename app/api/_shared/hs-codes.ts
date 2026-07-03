/**
 * HS/HSK 코드 단일 출처 (L-04) — 개선 기획서 축 B
 *
 * 문제: KCS 라우트마다 HS 코드가 하드코딩돼 흩어짐. 이번 세션 김 사례처럼
 *   6자리(1212.21)에 미역·다시마 혼입, 조미김 정확 코드(2008.99.50.10) 탐색을
 *   라우트 안에서 반복. 매핑을 여기 1곳에 모아 위젯/라우트가 참조하도록 한다.
 *
 * 필드:
 *  - hsk10: KCS nitemtrade 호출용 10자리(또는 6자리 + prefix 필터). KCS는 10자리 의무(L-04).
 *  - prefix: 6자리 호출 후 <hsCd> 접두 필터로 종(種) 분리가 필요할 때(예: 김 1212211).
 *  - note: 검증 근거·함정 기록.
 *
 * 신규 라우트/위젯은 코드를 하드코딩하지 말고 이 테이블을 import 한다.
 * (점진 이관 대상: galchi·mackerel·pollock·shrimp·salmon·squid 등 기존 라우트)
 */

export type HsEntry = {
  label: string;      // 사용자 노출 한글명
  hsSgn: string;      // KCS nitemtrade hsSgn 파라미터 (6 또는 10자리)
  prefix?: string;    // <hsCd> 접두 필터 (종 분리용)
  statKorGuard?: string; // <statKor> 가드 값 (혼입 차단용)
  note: string;
};

export const HS_CODES = {
  // 김(Laver) — 2026-06-28 실측 검증
  kim_dried: {
    label: '마른김(원초 김)',
    hsSgn: '121221',
    prefix: '1212211',            // 1212.21.1x = 김. 2x=미역·3x=다시마 배제
    note: 'HS 1212.21은 식용 해조류 바스켓(김~77%). prefix 1212211로 김만 집계.',
  },
  kim_seasoned: {
    label: '조미김',
    hsSgn: '2008995010',          // 10자리 직접 — statKor="김"
    statKorGuard: '김',
    note: '6자리 200899은 사과·포도·팝콘 혼재. 10자리 2008.99.50.10만 김.',
  },

  // 갈치 — 기존 라우트(app/api/galchi/kcs) 이관 대상
  galchi_frozen: {
    label: '냉동 갈치',
    hsSgn: '0303892000',
    note: '2026-06-11 검증. statKor "갈치". 구 0303899060(아귀) 폐기.',
  },
  mackerel_frozen: {
    label: '냉동 고등어',
    hsSgn: '030354',
    note: 'KCS nitemtrade 냉동 고등어. 국가명은 statCdCntnKor1, statKor는 품목명이라 국가 집계에 사용 금지.',
  },
  shrimp_frozen: {
    label: '냉동 새우',
    hsSgn: '030617',
    note: '기존 /api/shrimp/customs 및 sourcing-sim 운영값 이관. 냉동 기타 새우·보리새우류 HS 030617.',
  },

  // 기존 KCS 라우트 로컬 매핑 이관(2026-07-03). 값은 기존 운영 라우트와 동일.
  pollock_frozen: {
    label: '냉동 명태',
    hsSgn: '030367',
    note: '기존 /api/pollock-kcs HS 030367 운영값 이관.',
  },
  cashew_kernel: {
    label: '까놓은 캐슈',
    hsSgn: '0801320000',
    note: '기존 /api/cashew/kcs kernel 운영값 이관.',
  },
  cashew_inshell: {
    label: '껍질 있는 캐슈',
    hsSgn: '0801310000',
    note: '기존 /api/cashew/kcs inshell 운영값 이관.',
  },
  jukkumi_frozen: {
    label: '냉동 주꾸미·문어류',
    hsSgn: '0307599000',
    note: '기존 /api/jukkumi/kcs frozen 운영값 이관.',
  },
  octopus_live: {
    label: '산 낙지',
    hsSgn: '0307510000',
    note: '기존 /api/octopus/kcs live 운영값 이관.',
  },
  octopus_frozen: {
    label: '냉동 낙지/문어',
    hsSgn: '0307521000',
    note: '기존 /api/octopus/kcs frozen 운영값 이관.',
  },
  whelk_frozen: {
    label: '산·신선·냉장 골뱅이/패류',
    hsSgn: '0307600000',
    note: '기존 /api/whelk/kcs frozen 운영값 이관.',
  },
  whelk_canned: {
    label: '조제·보존 골뱅이 통조림',
    hsSgn: '1605550000',
    note: '기존 /api/whelk/kcs canned 운영값 이관.',
  },
  flatfish_fresh: {
    label: '가자미 신선',
    hsSgn: '0302230000',
    note: '기존 /api/flatfish/kcs fresh 운영값 이관.',
  },
  flatfish_frozen: {
    label: '가자미 냉동',
    hsSgn: '0303330000',
    note: '기존 /api/flatfish/kcs frozen 운영값 이관.',
  },
  flatfish_fillet_fresh: {
    label: '가자미 필렛 신선',
    hsSgn: '0304310000',
    note: '기존 /api/flatfish/kcs fillet 운영값 이관.',
  },
  salmon_fresh: {
    label: '대서양연어 신선/냉장',
    hsSgn: '0302140000',
    note: '기존 /api/salmon/kcs fresh 운영값 이관.',
  },
  salmon_frozen: {
    label: '대서양연어 냉동',
    hsSgn: '0303130000',
    note: '기존 /api/salmon/kcs frozen 운영값 이관.',
  },
  salmon_fillet_fresh: {
    label: '연어 필렛 신선',
    hsSgn: '0304410000',
    note: '기존 /api/salmon/kcs fillet_fresh 운영값 이관.',
  },
  salmon_fillet_frozen: {
    label: '연어 필렛 냉동',
    hsSgn: '0304810000',
    note: '기존 /api/salmon/kcs fillet_frozen 운영값 이관.',
  },
  salmon_smoked: {
    label: '훈제 연어',
    hsSgn: '0305410000',
    note: '기존 /api/salmon/kcs smoked 운영값 이관.',
  },
} satisfies Record<string, HsEntry>;

export type HsKey = keyof typeof HS_CODES;
