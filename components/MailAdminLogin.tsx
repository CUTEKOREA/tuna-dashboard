'use client';

import { useState, type FormEvent } from 'react';
import { LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './MailAdminLogin.module.css';

export default function MailAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError('로그인 정보를 확인하지 못했습니다.');
        return;
      }
      router.replace('/mail');
      router.refresh();
    } catch {
      setError('로그인 정보를 확인하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="mail-login-title">
        <div className={styles.iconWrap} aria-hidden="true">
          <ShieldCheck size={30} />
        </div>
        <p className={styles.eyebrow}>관리자 전용</p>
        <h1 id="mail-login-title">통합 메일 로그인</h1>
        <p className={styles.description}>
          확인된 관리자 계정으로 로그인하세요. 메일 연결과 조회에는 로그인 후 2단계 인증이 필요합니다.
        </p>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              inputMode="email"
              required
              disabled={loading}
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? <LockKeyhole size={18} /> : <LogIn size={18} />}
            {loading ? '확인 중' : '로그인'}
          </button>
        </form>

        <p className={styles.boundary}>
          계정이 관리자 허용 목록에 없거나 이메일 확인이 완료되지 않으면 메일 화면에 접근할 수 없습니다.
        </p>
      </section>
    </main>
  );
}
