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
          서아프리카 현지의 상황과 아시아 중개상인들의 구조적 한계, 그리고 이를 돌파하는 우리의 스마트 가공 비전을 카툰 형식으로 쉽게 살펴봅니다.
        </p>
      </div>

      <div className={styles.comicGrid}>
        {/* Panel 1 */}
        <div className={styles.panel}>
          <div className={styles.narrationTop}>
            세계 캐슈넛 원물(RCN)의 60% 이상이 서아프리카에서 재배되지만, 정작 현지 농가들은 가난의 굴레를 벗어나지 못하고 있다.
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
            대부분의 원물을 아시아의 중간 가공업자들이 헐값에 매입해가는 불합리한 구조에 분노한 서아프리카 국가들은 원물 수출을 규제하기 시작했다.
          </div>
        </div>

        {/* Panel 3 */}
        <div className={styles.panel}>
          <div className={styles.narrationTop}>
            하지만 이제 변화의 바람이 분다! 신라교역은 가나와 코트디부아르 현지에 AI 기반의 스마트 가공 플랜트를 건설을 계획 중이다.
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
            고품질의 완형(Whole) 캐슈넛만을 선별해 미국과 유럽에 다이렉트로 수출! 중간 마진을 현지 파트너와 나누며 최고의 ROI를 창출해 낸다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashewCartoon;
