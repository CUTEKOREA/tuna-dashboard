import { NextResponse, type NextRequest } from 'next/server';
import { normalizeDashboardNextPath, type OwnerAccessCode } from './owner-policy';

const ERROR_MESSAGES: Record<OwnerAccessCode | 'oauth_failed', string> = {
  authentication_required: '구글 로그인 세션을 확인하지 못했습니다. 다시 시도해주세요.',
  configuration_required: '접속 보안 설정이 완료되지 않았습니다.',
  google_account_required: '구글 계정으로 로그인해야 합니다.',
  oauth_failed: '구글 로그인을 완료하지 못했습니다. 다시 시도해주세요.',
  owner_required: '이 대시보드에 허용된 구글 계정이 아닙니다.',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderDashboardLogin(request: NextRequest): NextResponse {
  const defaultNext = request.nextUrl.pathname === '/mail/login' ? '/mail' : '/market';
  const nextPath = normalizeDashboardNextPath(
    request.nextUrl.searchParams.get('next') ?? defaultNext,
  );
  const errorCode = request.nextUrl.searchParams.get('error') ?? '';
  const errorMessage = errorCode in ERROR_MESSAGES
    ? ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES]
    : '';
  const errorMarkup = errorMessage
    ? `<p class="error" role="alert">${escapeHtml(errorMessage)}</p>`
    : '';

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>보안 로그인 | 참치왕국</title>
  <style>
    :root{color-scheme:dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    *{box-sizing:border-box}
    body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;background:#080b0d;color:#f8fafc}
    .card{width:min(440px,100%);padding:44px;border:1px solid #24334d;border-radius:20px;background:#0f1525;box-shadow:0 18px 50px rgba(0,0,0,.35)}
    .icon{width:54px;height:54px;display:grid;place-items:center;margin-bottom:20px;border:1px solid #19618a;border-radius:16px;background:#0b2a3e;color:#38bdf8;font-size:26px}
    .eyebrow{margin:0 0 16px;color:#38bdf8;font-size:13px;font-weight:800;letter-spacing:.08em}
    h1{margin:0 0 18px;font-size:30px;line-height:1.25;letter-spacing:-.03em}
    .description,.boundary{color:#94a3b8;line-height:1.75}
    .description{margin:0 0 28px;font-size:16px}
    form{margin:0}
    button{width:100%;min-height:48px;border:0;border-radius:11px;background:#38bdf8;color:#03131c;font-size:14px;font-weight:800;cursor:pointer}
    button:focus-visible{outline:3px solid #f8fafc;outline-offset:3px}
    .boundary{margin:22px 0 0;padding-top:20px;border-top:1px solid #243047;font-size:12px}
    .error{margin:0 0 18px;padding:12px;border:1px solid #9f3141;border-radius:10px;background:#38131a;color:#fecdd3;font-size:13px;line-height:1.55}
    @media(max-width:520px){.card{padding:28px;border-radius:18px}h1{font-size:26px}}
  </style>
</head>
<body>
  <main class="card" aria-labelledby="login-title">
    <div class="icon" aria-hidden="true">✓</div>
    <p class="eyebrow">소유자 전용</p>
    <h1 id="login-title">참치왕국 보안 로그인</h1>
    <p class="description">허용된 구글 계정 한 개로만 대시보드와 내부 데이터를 열람할 수 있습니다.</p>
    ${errorMarkup}
    <form action="/auth/start" method="get">
      <input type="hidden" name="next" value="${escapeHtml(nextPath)}">
      <button type="submit">구글 계정으로 로그인</button>
    </form>
    <p class="boundary">다른 구글 계정이나 이메일·비밀번호 계정은 로그인되어 있어도 접근할 수 없습니다.</p>
  </main>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      'Content-Type': 'text/html; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}
