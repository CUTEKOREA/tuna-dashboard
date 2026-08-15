'use client';

import { type FormEvent, useRef, useState } from 'react';
import { Loader2, MailPlus, Send } from 'lucide-react';
import styles from './MailInboxDashboard.module.css';

function isUncertain(status: number, code?: string): boolean {
  return status >= 500 || status === 409 || code === 'mail_send_status_unknown';
}

export default function CompanySmtpPanel({ from }: { from: string }) {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [working, setWorking] = useState(false);
  const [sendUncertain, setSendUncertain] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const requestIdRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  const resetRequest = () => {
    requestIdRef.current = null;
    setNotice('');
    setError('');
  };

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current || sendUncertain) return;
    if (!window.confirm(`회사 계정 ${from}에서 메일을 즉시 발송합니다. 내용을 확인했고 발송하시겠습니까?`)) return;

    sendingRef.current = true;
    const requestId = requestIdRef.current ?? crypto.randomUUID();
    requestIdRef.current = requestId;
    setWorking(true);
    setNotice('');
    setError('');
    try {
      const response = await fetch('/api/mail/company-smtp/send', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': requestId,
        },
        body: JSON.stringify({ to: recipient, subject, text }),
      });
      const value = await response.json().catch(() => ({})) as { code?: string };
      if (!response.ok) {
        if (isUncertain(response.status, value.code)) {
          setSendUncertain(true);
          setError('발송 상태를 확인할 수 없습니다. 회사 웹메일 또는 수신자에게 발송 여부를 확인하기 전에는 재전송할 수 없습니다.');
          return;
        }
        requestIdRef.current = null;
        setError(value.code === 'mail_send_rate_limited'
          ? '발송 횟수 제한에 도달했습니다. 잠시 후 다시 시도해주세요.'
          : '받는 사람·제목·본문을 확인해주세요.');
        return;
      }
      requestIdRef.current = null;
      setRecipient('');
      setSubject('');
      setText('');
      setNotice('회사 메일을 발송했습니다.');
    } catch {
      setSendUncertain(true);
      setError('발송 상태를 확인할 수 없습니다. 회사 웹메일 또는 수신자에게 발송 여부를 확인하기 전에는 재전송할 수 없습니다.');
    } finally {
      sendingRef.current = false;
      setWorking(false);
    }
  };

  const acknowledgeUncertain = () => {
    if (!window.confirm('회사 웹메일 또는 수신자에게 실제 발송 여부를 확인하셨습니까?')) return;
    requestIdRef.current = null;
    setSendUncertain(false);
    setError('');
    setNotice('발송 여부 확인을 완료했습니다. 새 메일을 작성할 수 있습니다.');
  };

  return (
    <form className={styles.sendPanel} onSubmit={send}>
      <div className={styles.sendPanelHeader}>
        <div>
          <span className={styles.eyebrow}><MailPlus size={15} /> 회사 SMTP 발송</span>
          <h2>{from}</h2>
        </div>
        <p>STARTTLS로 일반 텍스트 메일 한 건만 발송합니다. 받은메일 조회와 첨부파일은 지원하지 않습니다.</p>
      </div>
      {notice && <div className={styles.notice}>{notice}</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.sendFields}>
        <label>
          받는 사람
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            disabled={working || sendUncertain}
            value={recipient}
            onChange={(event) => { resetRequest(); setRecipient(event.target.value); }}
          />
        </label>
        <label>
          제목
          <input
            type="text"
            maxLength={200}
            required
            disabled={working || sendUncertain}
            value={subject}
            onChange={(event) => { resetRequest(); setSubject(event.target.value); }}
          />
        </label>
        <label className={styles.messageField}>
          본문
          <textarea
            maxLength={10_000}
            rows={7}
            required
            disabled={working || sendUncertain}
            value={text}
            onChange={(event) => { resetRequest(); setText(event.target.value); }}
          />
          <span>{text.length.toLocaleString('ko-KR')} / 10,000자</span>
        </label>
      </div>
      <div className={styles.sendActions}>
        {sendUncertain ? (
          <>
            <span>중복 발송을 막기 위해 확인 전까지 입력을 잠갔습니다.</span>
            <button type="button" className={styles.secondaryButton} disabled={working} onClick={acknowledgeUncertain}>
              실제 발송 여부 확인 완료
            </button>
          </>
        ) : (
          <>
            <span>발송 버튼을 누르면 최종 확인창이 표시됩니다.</span>
            <button type="submit" className={styles.primaryButton} disabled={working || sendUncertain}>
              {working ? <Loader2 className={styles.spinner} size={15} /> : <Send size={15} />}
              회사 메일 발송
            </button>
          </>
        )}
      </div>
    </form>
  );
}
