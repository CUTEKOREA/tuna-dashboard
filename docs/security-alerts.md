# 대시보드 보안 알림 운영

## 신호와 발송

| 신호 | 기준 |
| --- | --- |
| 비로그인·허용되지 않은 계정의 API 요청 | DB 시각의 10분 버킷에서 전체 합산 30회 |
| 인증된 민감 API GET 요청 | 계정별 10분 버킷에서 300회 |
| Vercel 대량 공격 | 이 프로젝트에 한정한 firewall.attack 웹훅 |

민감 경로는 lib/security/policy.ts의 고정 목록이다. 요청 횟수이며 실제 응답 성공·다운로드·유출 확정을 뜻하지 않는다. 공개 로그인 페이지 방문과 503 설정 장애는 집계하지 않는다. WAF에서 먼저 차단된 요청은 앱 집계에 들어오지 않는다.

5분 cron이 큐를 확인한다. 전체 시간당 최대 1통이며, 방화벽 경보 우선·최신 경보를 대표로 선택하고 나머지는 suppressed로 보존한다. 동시 실행은 DB 잠금으로 중복 발송을 방지한다. SMTP 수락 여부가 불명확하거나 발송 중 중단된 기록은 unknown으로 남기며 자동 재발송하지 않는다. 수신 메일과 SMTP 기록을 확인한 뒤 수동 조치한다.

## 비밀값과 구독

Production에만 SECURITY_ALERTS_ENABLED=1, SECURITY_ALERT_EMAIL, SECURITY_EVENT_HASH_KEY(무작위 32바이트 이상), VERCEL_SECURITY_WEBHOOK_SECRET, SECURITY_VERCEL_PROJECT_ID, SECURITY_VERCEL_TEAM_ID를 설정한다. 기존 SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET, COMPANY_SMTP_*를 재사용한다. 값은 Git·로그·알림에 넣지 않는다.

웹훅은 별도의 secret과 단일 projectIds 구독으로 scope를 고정한다. 원문 바이트 HMAC-SHA1을 상수시간 검증한 뒤 이벤트 종류·ID·시각을 검증하고, 본문 scope 필드가 있으면 설정과 일치해야 한다. 64KB·수신 5초 제한, 미래 5분/과거 24시간 제한, ID 및 원문 해시 중복 검증을 적용한다.

API 명세의 anomaly 이벤트 이름들은 현재 계정의 등록 API에서 거절되므로 실제 구독은 공식 지원이 확인된 firewall.attack 하나다. 알림 원문·링크·수신자를 payload에서 받아 사용하지 않는다.

## 개인정보와 보관

- 원본 IP·이메일·URL/query·Cookie·토큰·자료/메일 원문을 저장하지 않는다.
- 익명 API 거부는 고정된 하나의 가명으로 집계한다.
- 인증 계정은 날짜를 포함한 별도 HMAC으로 식별한다.
- 버킷은 24시간, 경보·중복 방지 기록은 30일 보관한다.
- 인증된 cron이 발송 활성화·SMTP 설정과 독립적으로 정리한다. DB/cron 자체 장애 시에는 복구 후 정리된다.
- RLS ON, anon/authenticated의 테이블·RPC 권한 없음, service_role만 사용한다.

## 방화벽 규칙

| 규칙 | 운영 제한 |
| --- | --- |
| td-probe-paths | .env/.git/WordPress/phpMyAdmin/PHPUnit 탐색 경로 deny |
| td-auth-start | GET/HEAD /auth/start, IP별 30회/60초 |
| td-protected-read | 민감 자료 GET/HEAD 5경로 합산 IP별 120회/60초 |
| td-external-bulk-post | 외부 조회 POST 5경로 합산 IP별 30회/60초 |

목표 동작은 요청 초과 시429이며 지속 IP 차단은 사용하지 않는다. 실제 활성 단계는 배포 기록과 Vercel firewall overview를 확인한다. 로그인 callback·cron·webhook·정적 파일은 위 규칙에 포함하지 않는다. Pro의 요청 횟수 제한은 사용량 과금이며 새 구독을 추가하지 않는다.

## 점검·복구

1. 오류 로그의 [security] 고정 코드를 확인한다. 오류 객체나 비밀값을 출력하지 않는다.
2. dashboard_security_alerts의 status/시간/종류/횟수로 예약·SMTP 수락 결과를 확인한다.
3. 원치 않는 차단은 해당 WAF 규칙을 log로 돌리고 diff 확인 후 publish한다.
4. 알림 수신·신규 집계를 끄려면 SECURITY_ALERTS_ENABLED=0으로 변경하고 재배포한다. cron의 보관기간 정리는 유지한다.
5. 전체 대시보드 MFA 적용은 이 변경에 포함하지 않는다.
