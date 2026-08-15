# 회사 SMTP 발송 운영 설정

## 범위

관리자 메일 화면에서 `ledog@sla.co.kr` 명의의 일반 텍스트 메일을 한 명에게 수동 발송한다.

- 서버: `mail1.sla.co.kr:587`
- 전송 보안: STARTTLS 필수, TLS 1.2 이상, 인증서 검증 필수
- 지원: 단일 수신자, 제목 최대 200자, 본문 최대 10,000자
- 제외: 받은메일 조회, 회신 thread, 첨부파일, HTML, 다중 수신자, 자동 발송, 예약 발송

`ledog@sla.co.kr`는 Microsoft 365 사서함이 아니다. Microsoft Entra 또는 Graph 앱을 등록하지 않는다.

## 받은메일을 제공하지 않는 이유

2026-08-15 외부 연결 실측 결과:

- SMTP 587은 STARTTLS를 제공한다.
- IMAP 143은 STARTTLS를 광고하지 않으며 직접 `STARTTLS` 명령도 거부한다.
- IMAPS 993은 닫혀 있다.
- POP3 110은 STLS를 거부하고 POP3S 995는 닫혀 있다.

따라서 현재 인터넷 경로에서 받은메일 자격증명을 안전하게 전송할 표준 프로토콜이 없다. IT가 유효한 인증서의 IMAPS 993을 활성화하기 전에는 받은메일 기능을 추가하지 않는다.

## Production 환경 변수

Vercel의 `tuna-dashboard` 프로젝트 Production 환경에 모두 Sensitive로 등록한다.

```text
COMPANY_SMTP_HOST=mail1.sla.co.kr
COMPANY_SMTP_PORT=587
COMPANY_SMTP_USER=ledog@sla.co.kr
COMPANY_SMTP_PASSWORD=<회사 메일 비밀번호>
COMPANY_SMTP_FROM=ledog@sla.co.kr
```

비밀번호는 저장소·문서·채팅·브라우저 Web Storage에 기록하지 않는다. 서버 환경 변수로만 보관한다. 코드가 host 587, 동일 user/from, `@sla.co.kr` 주소를 다시 검증하므로 다른 서버나 평문 포트로 바꾸면 fail-closed 된다.

## Supabase migration

Production SQL editor에서 다음 파일을 적용한다.

```text
supabase/migrations/20260815233000_create_company_smtp_send_requests.sql
```

적용 후 확인:

1. `public.company_smtp_send_requests`에 RLS가 활성화되어 있다.
2. `anon`, `authenticated`는 테이블과 RPC를 직접 사용할 수 없다.
3. `service_role`만 reserve/complete RPC를 실행할 수 있다.
4. UUID가 canonical payload SHA-256에 결속된다.
5. 상태는 `pending`, `sent`, `unknown`만 허용된다.

## 운영 QA

1. `https://leedonggun.co.kr/mail/login`에서 관리자 로그인 후 TOTP AAL2를 완료한다.
2. 회사 SMTP 발송 패널에 `ledog@sla.co.kr`가 표시되는지 확인한다.
3. 본인 관리 주소로 제목과 식별 가능한 일반 텍스트 본문을 입력한다.
4. 최종 확인창을 승인해 한 번 발송한다.
5. 수신함에서 정확히 한 건 수신됐는지 확인한다.
6. Supabase audit에서 같은 UUID가 `sent` 한 행인지 확인한다. 수신자·제목·본문·비밀번호는 DB에 저장되지 않아야 한다.
7. 같은 UUID 재요청은 provider를 다시 호출하지 않는지 확인한다.
8. 네트워크 오류/5xx 시 UI 입력이 잠기고 `unknown`이 기록되는지 확인한다. 실제 수신 여부를 수신자나 HTTPS 회사 웹메일에서 확인하기 전에는 재발송하지 않는다.

## 배포 게이트

```bash
unset NODE_ENV
npm run verify
```

migration과 환경 변수를 먼저 준비하고, PR 병합 후 Production deployment SHA를 병합 SHA와 대조한다. 실발송 QA 전에는 운영 완료로 기록하지 않는다.
