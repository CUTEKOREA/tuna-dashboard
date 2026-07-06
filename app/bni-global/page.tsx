import type { Metadata } from 'next';
import BniGlobalDashboard from '../../components/BniGlobalDashboard';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'BNI Global 시장 브리핑',
  description: 'BNI Global 정기 시장 보고서를 기반으로 한 거래처 제공용 독립 대시보드',
};

export default function BniGlobalPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <BniGlobalDashboard />
      </div>
    </main>
  );
}
