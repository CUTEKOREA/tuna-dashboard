import { LogIn, ShieldCheck } from 'lucide-react';
import styles from './MailAdminLogin.module.css';

export default function MailAdminLogin() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="mail-login-title">
        <div className={styles.iconWrap} aria-hidden="true">
          <ShieldCheck size={30} />
        </div>
        <p className={styles.eyebrow}>소유자 전용</p>
        <h1 id="mail-login-title">참치왕국 보안 로그인</h1>
        <p className={styles.description}>
          허용된 구글 계정으로 로그인한 뒤 메일 메뉴를 열 수 있습니다.
        </p>
        <form className={styles.form} action="/auth/start" method="get">
          <input type="hidden" name="next" value="/mail" />
          <button type="submit">
            <LogIn size={18} aria-hidden="true" />
            구글 계정으로 로그인
          </button>
        </form>
      </section>
    </main>
  );
}
