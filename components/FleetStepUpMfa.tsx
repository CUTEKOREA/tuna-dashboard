'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import s from './FleetCommandCenter.module.css';

type MailMfaStatus = {
  mfa?: {
    enrolled?: boolean;
    factorId?: string | null;
  };
};

export default function FleetStepUpMfa({ onVerified }: { onVerified: () => void }) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [code, setCode] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/mail/status', {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    }).then(async (response) => {
      const payload = await response.json().catch(() => ({})) as MailMfaStatus;
      if (!response.ok) {
        setEnrolled(false);
        return;
      }
      setEnrolled(Boolean(payload.mfa?.enrolled));
      setFactorId(payload.mfa?.factorId ?? null);
    }).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setEnrolled(false);
    });
    return () => controller.abort();
  }, []);

  const verify = async () => {
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError('인증 앱의 6자리 코드를 입력해주세요.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      const response = await fetch('/api/mail/mfa/verify', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ factorId, code }),
      });
      if (!response.ok) {
        setError('2단계 인증 코드를 확인하지 못했습니다.');
        return;
      }
      onVerified();
    } catch {
      setError('2단계 인증 코드를 확인하지 못했습니다.');
    } finally {
      setWorking(false);
    }
  };

  if (enrolled === null) {
    return <p className={s.protectedDetailStatus}>2단계 인증 상태를 확인하는 중입니다.</p>;
  }

  if (!enrolled || !factorId) {
    return <Link href="/mail?next=/fleet">메일에서 2단계 인증 등록</Link>;
  }

  return (
    <form className={s.stepUpMfa} onSubmit={(event) => { event.preventDefault(); void verify(); }}>
      <label htmlFor="fleet-mfa-code">인증 앱 코드</label>
      <div className={s.stepUpMfaRow}>
        <input
          id="fleet-mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6자리 코드"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <button type="submit" disabled={working}>인증하고 선단으로</button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
