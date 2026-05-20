import React from 'react';
import Image from 'next/image';
import { MonitorPlay } from 'lucide-react';
import styles from './CashewCartoon.module.css';

const CashewCartoon = () => {
  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h2 className={styles.headerTitle}>
          <MonitorPlay size={28} color="#fcd34d" />
          신라 캐슈넛 기회: 만화로 보는 밸류체인
        </h2>
        <p className={styles.headerDesc}>
          서아프리카 현지 매크로 상황과 중개상(Broker)들의 마진 스퀴즈 한계, 그리고 이를 돌파하는 산지 수직계열화(Vertical Integration) 비전을 카툰으로 살펴봅니다.
        </p>
      </div>

      <div className={styles.comicGrid}>
        {/* Panel 1 */}
        <div className={styles.panel}>
          <div className={styles.narrationTop}>
            글로벌 캐슈넛 원물(RCN) 생산의 60%가 서아프리카에 집중되어 있으나, 가치 사슬(Value Chain) 하단에 머물러 경제적 렌트(Rent)를 포획하지 못하는 구조적 모순이 존재한다.
          </div>
          <div className={styles.imageArea}>
            <Image 
              src="/comic_1.png" 
              alt="아프리카 캐슈넛 재배농가" 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.comicImage} 
            />
            <div className={styles.bubble} style={{ top: '15%', right: '10%' }}>
              휴... 일해도 일해도<br/>남는 게 없어...
            </div>
          </div>
        </div>

        {/* Panel 2 */}
        <div className={styles.panel}>
          <div className={styles.imageArea}>
            <Image 
              src="/comic_2.png" 
              alt="아시아 중개상인의 원물 구매와 가나 대통령의 반대" 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.comicImage} 
            />
            <div className={styles.bubble} style={{ top: '10%', right: '5%', transform: 'scaleX(-1)' }}>
              <span style={{ display: 'block', transform: 'scaleX(-1)' }}>
                이 원물을 싸게 사서<br/>아시아로 가져가야지!
              </span>
            </div>
            <div className={`${styles.bubble} ${styles.burstBubble}`} style={{ top: '20%', left: '25%' }}>
              수출하지마!
            </div>
            <div className={styles.bubble} style={{ bottom: '15%', left: '10%' }}>
              휴... 피땀 흘려 키운건데<br/>정말 억울하네...
            </div>
          </div>
          <div className={styles.narrationBottom}>
            원물(RCN) 수출에 따른 국부 유출(Value Leakage)에 대응하여, 서아프리카 국가는 징벌적 세금 부과 및 자원 무기화(Resource Nationalism)를 발동했다.
          </div>
        </div>

        {/* Panel 3 */}
        <div className={styles.panel}>
          <div className={styles.narrationTop}>
            게임 체인저()의 등장. 가나와 코트디부아르 현지에 AI 비전 검수 기반 스마트 가공 플랜트 CAPEX 투자를 단행하여 원가 우위를 선점한다.
          </div>
          <div className={styles.imageArea}>
            <Image 
              src="/comic_3.png" 
              alt="아프리카 현지 스마트 팩토리" 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.comicImage} 
            />
            <div className={styles.bubble} style={{ top: '15%', right: '15%' }}>
              이제 원물이 아니라,<br/>우리가 직접 가공합니다!
            </div>
          </div>
        </div>

        {/* Panel 4 */}
        <div className={styles.panel}>
          <div className={styles.imageArea}>
            <Image 
              src="/comic_4.png" 
              alt="고부가가치 유럽/미주 직수출" 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.comicImage} 
            />
            <div className={`${styles.bubble} ${styles.burstBubble}`} style={{ top: '10%', right: '20%' }}>
              대박!!<br/>이게 직수출의 힘!
            </div>
          </div>
          <div className={styles.narrationBottom}>
            프리미엄 커널(W-180)만을 타겟팅해 EU/US 마켓에 직수출. 유통 채널 축소(Disintermediation)로 발생한 초과 마진(Excess Return)을 바탕으로 ROI를 달성한다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashewCartoon;
