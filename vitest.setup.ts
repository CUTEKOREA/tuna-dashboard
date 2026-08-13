/**
 * 테스트 전용 자격증명 픽스처.
 *
 * 2026-08-13 이전에는 라우트마다 실제 발급키가 소스에 폴백으로 박혀 있어서
 * 계약 테스트가 아무 설정 없이도 돌았다. 그 키를 전부 제거했으므로
 * (공개 저장소 노출), 테스트는 자기 몫의 더미 값을 스스로 마련한다.
 *
 * 여기 값은 어떤 서비스로도 인증되지 않는 문자열이다. 계약 테스트는
 * fetch를 목킹하므로 실제 호출이 나가지 않는다.
 *
 * 이미 설정된 변수는 덮어쓰지 않는다 — 실키로 통합 테스트를 돌리는 경우를 막지 않기 위해서다.
 */
const TEST_CREDENTIALS: Record<string, string> = {
  DATA_GO_KR_NEW_KEY: 'test-data-go-kr-key',
  DATA_GO_KR_COMMON_KEY: 'test-data-go-kr-common-key',
  KCS_API_KEY: 'test-kcs-key',
  FISHERY_API_KEY: 'test-fishery-key',
  KAMIS_API_KEY: 'test-kamis-key',
  KAMIS_CERT_ID: 'test-kamis-cert-id',
  DART_API_KEY: 'test-dart-key',
  USDA_FAS_API_KEY: 'test-usda-fas-key',
  USCENSUS_API_KEY: 'test-uscensus-key',
  UN_COMTRADE_PRIMARY_KEY: 'test-comtrade-primary-key',
  UN_COMTRADE_SECONDARY_KEY: 'test-comtrade-secondary-key',
  PROXY_SECRET: 'test-proxy-secret',
  ECOS_API_KEY: 'test-ecos-key',
  FRED_API_KEY: 'test-fred-key',
};

for (const [name, value] of Object.entries(TEST_CREDENTIALS)) {
  if (!process.env[name]) {
    process.env[name] = value;
  }
}
