'use client';

import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Inbox, Link2, Loader2, LockKeyhole, MailPlus, RefreshCw, Send, ShieldCheck, Unlink } from 'lucide-react';
import styles from './MailInboxDashboard.module.css';

type MailStatus = {
  ok: true;
  aal: string;
  mfa: {
    required: boolean;
    enrolled: boolean;
    factorId: string | null;
  };
  gmail: {
    email: string;
    connectedAt: string;
  } | null;
};

type MailItem = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  receivedAt: string | null;
  snippet: string;
  unread: boolean;
  gmailUrl: string;
};

type InboxResult = {
  ok: true;
  unreadCount: number;
  messages: MailItem[];
};

type Enrollment = {
  factorId: string;
  qrCode: string;
};

async function mailRequest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...init,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...init.headers,
    },
  });
}

function formatReceivedAt(value: string | null): string {
  if (!value) return '수신 시각 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '수신 시각 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusMessage(status: number, code?: string): string {
  if (status === 401) return '관리자 로그인이 필요합니다.';
  if (status === 403 && code === 'mfa_required') return '2단계 인증을 완료해주세요.';
  if (status === 403) return '관리자 전용 메뉴입니다.';
  return '메일 서비스를 불러오지 못했습니다.';
}

function enrollmentErrorMessage(code?: string): string {
  if (code === 'mfa_enrollment_pending') {
    return '진행 중인 2단계 인증 등록을 먼저 완료해주세요.';
  }
  if (code && /^mfa_[a-z0-9_]+(?::[a-z0-9_]{1,64})?$/.test(code)) {
    return `2단계 인증 등록을 시작하지 못했습니다. (진단 코드: ${code})`;
  }
  return '2단계 인증 등록을 시작하지 못했습니다.';
}

export default function MailInboxDashboard() {
  const [status, setStatus] = useState<MailStatus | null>(null);
  const [inbox, setInbox] = useState<InboxResult | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [limit, setLimit] = useState(20);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const sendingRef = useRef(false);
  const sendRequestIdRef = useRef<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await mailRequest('/api/mail/status');
      const value = await response.json().catch(() => ({})) as MailStatus & { code?: string };
      if (!response.ok) {
        setStatus(null);
        setInbox(null);
        setEnrollment(null);
        setVerificationCode('');
        setError(statusMessage(response.status, value.code));
        return;
      }
      setStatus(value);
    } catch {
      setStatus(null);
      setInbox(null);
      setEnrollment(null);
      setVerificationCode('');
      setError('메일 서비스를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInbox = useCallback(async (messageLimit: number) => {
    setWorking(true);
    setError('');
    try {
      const response = await mailRequest(`/api/mail/gmail/messages?limit=${messageLimit}`);
      const value = await response.json().catch(() => ({})) as InboxResult & { code?: string };
      if (!response.ok) {
        setInbox(null);
        setError(statusMessage(response.status, value.code));
        return;
      }
      setInbox(value);
    } catch {
      setInbox(null);
      setError('Gmail 메일 목록을 불러오지 못했습니다.');
    } finally {
      setWorking(false);
    }
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const connected = query.get('mail_connected');
    const callbackError = query.get('mail_error');
    if (connected || callbackError) {
      const cleaned = new URL(window.location.href);
      cleaned.searchParams.delete('mail_connected');
      cleaned.searchParams.delete('mail_error');
      window.history.replaceState({}, '', `${cleaned.pathname}${cleaned.search}${cleaned.hash}`);
    }
    void loadStatus().then(() => {
      if (connected === 'connected') setNotice('Gmail 연결이 완료되었습니다.');
      if (callbackError === 'denied') setError('Gmail 권한 요청이 취소되었습니다.');
      if (callbackError === 'failed') setError('Gmail 연결을 완료하지 못했습니다.');
    });
  }, [loadStatus]);

  useEffect(() => {
    if (status?.gmail && !status.mfa.required) void loadInbox(limit);
  }, [limit, loadInbox, status?.gmail, status?.mfa.required]);

  const beginEnrollment = async () => {
    setWorking(true);
    setError('');
    try {
      const response = await mailRequest('/api/mail/mfa/enroll', { method: 'POST' });
      const value = await response.json().catch(() => ({})) as Enrollment & { code?: string };
      if (!response.ok) {
        setError(enrollmentErrorMessage(value.code));
        return;
      }
      setEnrollment(value);
    } catch {
      setError('2단계 인증 등록을 시작하지 못했습니다.');
    } finally {
      setWorking(false);
    }
  };

  const verifyMfa = async () => {
    const factorId = enrollment?.factorId ?? status?.mfa.factorId;
    if (!factorId || !/^\d{6}$/.test(verificationCode)) {
      setError('인증 앱의 6자리 코드를 입력해주세요.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      const response = await mailRequest('/api/mail/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factorId, code: verificationCode }),
      });
      if (!response.ok) {
        setError('2단계 인증 코드를 확인하지 못했습니다.');
        return;
      }
      setEnrollment(null);
      setVerificationCode('');
      setNotice('2단계 인증이 완료되었습니다.');
      await loadStatus();
    } catch {
      setError('2단계 인증 코드를 확인하지 못했습니다.');
    } finally {
      setWorking(false);
    }
  };

  const connectGmail = async () => {
    setWorking(true);
    setError('');
    try {
      const response = await mailRequest('/api/mail/gmail/connect', { method: 'POST' });
      const value = await response.json().catch(() => ({})) as { authorizationUrl?: string; code?: string };
      if (!response.ok || !value.authorizationUrl) {
        setError(value.code === 'gmail_already_connected'
          ? '이미 Gmail이 연결되어 있습니다. 먼저 연결을 해제해주세요.'
          : statusMessage(response.status, value.code));
        return;
      }
      window.location.assign(value.authorizationUrl);
    } catch {
      setError('Gmail 연결을 시작하지 못했습니다.');
    } finally {
      setWorking(false);
    }
  };

  const disconnectGmail = async () => {
    setWorking(true);
    setError('');
    try {
      const response = await mailRequest('/api/mail/gmail/disconnect', { method: 'DELETE' });
      const value = await response.json().catch(() => ({})) as { revoked?: boolean };
      if (!response.ok) {
        setError('Gmail 연결을 해제하지 못했습니다.');
        return;
      }
      setInbox(null);
      setNotice(value.revoked === false
        ? '저장된 인증 정보는 삭제했지만 Google 권한 철회는 확인하지 못했습니다. Google 계정 보안 설정에서 연결을 삭제해주세요.'
        : 'Gmail 연결과 저장된 인증 정보가 삭제되었습니다.');
      await loadStatus();
    } catch {
      setError('Gmail 연결을 해제하지 못했습니다.');
    } finally {
      setWorking(false);
    }
  };

  const sendMail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current) return;
    const confirmed = window.confirm('메일은 즉시 발송되며 취소할 수 없습니다. 입력한 내용을 확인했고 발송하시겠습니까?');
    if (!confirmed) return;

    sendingRef.current = true;
    const requestId = sendRequestIdRef.current ?? crypto.randomUUID();
    sendRequestIdRef.current = requestId;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const response = await mailRequest('/api/mail/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestId,
        },
        body: JSON.stringify({ to: recipient, subject, text: messageText }),
      });
      const value = await response.json().catch(() => ({})) as { code?: string };
      if (!response.ok) {
        if (response.status < 500 && value.code !== 'mail_send_status_unknown') {
          sendRequestIdRef.current = null;
        }
        setError(value.code === 'mail_send_rate_limited'
          ? '발송 횟수 제한에 도달했습니다. 잠시 후 다시 시도해주세요.'
          : value.code === 'mail_send_status_unknown'
            ? '발송 상태를 확인할 수 없습니다. 중복 발송을 막기 위해 Gmail 보낸편지함을 먼저 확인해주세요.'
            : response.status === 400
              ? '받는 사람·제목·본문을 확인해주세요.'
              : '메일을 발송하지 못했습니다. Gmail 보낸편지함을 확인한 뒤 다시 시도해주세요.');
        return;
      }
      sendRequestIdRef.current = null;
      setRecipient('');
      setSubject('');
      setMessageText('');
      setNotice('메일을 즉시 발송했습니다.');
    } catch {
      setError('메일을 발송하지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      sendingRef.current = false;
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.shell} aria-live="polite">
        <Loader2 className={styles.spinner} size={28} />
        <p>관리자 권한 확인 중</p>
      </section>
    );
  }

  if (!status) {
    return (
      <section className={styles.shell}>
        <div className={styles.centerCard}>
          <LockKeyhole size={36} />
          <h1>관리자 전용 메일</h1>
          <p>{error || '관리자 권한을 확인하지 못했습니다.'}</p>
          <button type="button" className={styles.primaryButton} onClick={() => void loadStatus()}>
            다시 확인
          </button>
        </div>
      </section>
    );
  }

  const requiresEnrollment = status.mfa.required && !status.mfa.enrolled;
  const requiresVerification = status.mfa.required && status.mfa.enrolled;

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}><ShieldCheck size={15} /> 관리자 전용 · 읽기 및 발송</div>
          <h1><Inbox size={28} /> 통합 메일</h1>
          <p>메일 목록을 조회하고 확인한 일반 텍스트 메일만 즉시 발송합니다.</p>
        </div>
        {status.gmail && (
          <div className={styles.connectionBadge}>
            <Link2 size={15} /> {status.gmail.email}
          </div>
        )}
      </header>

      {notice && <div className={styles.notice}>{notice}</div>}
      {error && <div className={styles.error}>{error}</div>}

      {requiresEnrollment && (
        <div className={styles.centerCard}>
          <ShieldCheck size={36} />
          <h2>2단계 인증 등록</h2>
          <p>관리자 메일은 인증 앱의 일회용 코드로 한 번 더 보호됩니다.</p>
          {!enrollment ? (
            <button type="button" className={styles.primaryButton} disabled={working} onClick={beginEnrollment}>
              인증 앱 등록 시작
            </button>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- Supabase가 반환한 검증된 SVG data URL은 최적화 프록시를 거치지 않는다. */}
              <img
                className={styles.qrCode}
                src={enrollment.qrCode}
                alt="2단계 인증 QR 코드"
              />
              <div className={styles.verifyRow}>
                <input
                  aria-label="2단계 인증 코드"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="6자리 코드"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <button type="button" className={styles.primaryButton} disabled={working} onClick={verifyMfa}>
                  인증 완료
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {requiresVerification && (
        <div className={styles.centerCard}>
          <ShieldCheck size={36} />
          <h2>2단계 인증 확인</h2>
          <p>인증 앱에 표시된 현재 코드를 입력해주세요.</p>
          <div className={styles.verifyRow}>
            <input
              aria-label="2단계 인증 코드"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6자리 코드"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <button type="button" className={styles.primaryButton} disabled={working} onClick={verifyMfa}>
              인증 확인
            </button>
          </div>
        </div>
      )}

      {!status.mfa.required && !status.gmail && (
        <div className={styles.centerCard}>
          <Link2 size={36} />
          <h2>Gmail 읽기·발송 연결</h2>
          <p>최근 메일을 조회하고 직접 작성한 일반 텍스트 메일을 발송합니다.</p>
          <button type="button" className={styles.primaryButton} disabled={working} onClick={connectGmail}>
            Gmail 연결
          </button>
        </div>
      )}

      {!status.mfa.required && status.gmail && (
        <>
          <form className={styles.sendPanel} onSubmit={sendMail}>
            <div className={styles.sendPanelHeader}>
              <div>
                <span className={styles.eyebrow}><MailPlus size={15} /> 새 메일 보내기</span>
                <h2>일반 텍스트 메일</h2>
              </div>
              <p>발송 후 취소할 수 없으며 첨부파일과 자동 발송은 지원하지 않습니다.</p>
            </div>
            <div className={styles.sendFields}>
              <label>
                받는 사람
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={recipient}
                  onChange={(event) => {
                    sendRequestIdRef.current = null;
                    setRecipient(event.target.value);
                  }}
                />
              </label>
              <label>
                제목
                <input
                  type="text"
                  maxLength={200}
                  required
                  value={subject}
                  onChange={(event) => {
                    sendRequestIdRef.current = null;
                    setSubject(event.target.value);
                  }}
                />
              </label>
              <label className={styles.messageField}>
                본문
                <textarea
                  maxLength={10_000}
                  required
                  rows={7}
                  value={messageText}
                  onChange={(event) => {
                    sendRequestIdRef.current = null;
                    setMessageText(event.target.value);
                  }}
                />
                <span>{messageText.length.toLocaleString('ko-KR')} / 10,000자</span>
              </label>
            </div>
            <div className={styles.sendActions}>
              <span>발송 버튼을 누르면 최종 확인창이 표시됩니다.</span>
              <button type="submit" className={styles.primaryButton} disabled={working}>
                {working ? <Loader2 className={styles.spinner} size={15} /> : <Send size={15} />}
                즉시 발송
              </button>
            </div>
          </form>

          <div className={styles.toolbar}>
            <div className={styles.unreadMetric}>
              <span>안 읽은 메일</span>
              <strong>{inbox?.unreadCount ?? '—'}</strong>
            </div>
            <label className={styles.limitControl}>
              조회 건수
              <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
                <option value={20}>20건</option>
                <option value={50}>50건</option>
              </select>
            </label>
            <button type="button" className={styles.secondaryButton} disabled={working} onClick={() => void loadInbox(limit)}>
              <RefreshCw size={15} /> 새로고침
            </button>
            <button type="button" className={styles.dangerButton} disabled={working} onClick={disconnectGmail}>
              <Unlink size={15} /> 연결 해제
            </button>
          </div>

          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <span>발신자</span>
              <span>제목</span>
              <span>수신 시각</span>
              <span>미리보기</span>
              <span>원본</span>
            </div>
            {working && !inbox && <div className={styles.empty}><Loader2 className={styles.spinner} size={22} /> 불러오는 중</div>}
            {!working && inbox?.messages.length === 0 && <div className={styles.empty}>최근 메일이 없습니다.</div>}
            {inbox?.messages.map((message) => (
              <article key={message.id} className={`${styles.mailRow} ${message.unread ? styles.unread : ''}`}>
                <div className={styles.sender} data-label="발신자">{message.from}</div>
                <div className={styles.subject} data-label="제목">{message.subject}</div>
                <time data-label="수신 시각" dateTime={message.receivedAt ?? undefined}>{formatReceivedAt(message.receivedAt)}</time>
                <p data-label="미리보기">{message.snippet || '미리보기 없음'}</p>
                <a href={message.gmailUrl} target="_blank" rel="noopener noreferrer">
                  Gmail 원본 열기 <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
