/**
 * 🌐 글로벌 무역 인텔리전스 대시보드 — 차트 표준화 헬퍼 (V4.1)
 */

/**
 * X축 라벨 한글 기준 최대 N자(기본 7자) 초과 시 잘라내고 '...'을 덧붙임.
 * 괄호 안에 있는 영문 약어나 명칭은 제거함. (예: "서인도양 (W.Indian)" -> "서인도양")
 */
export function truncateKoreanLabel(tick: any, maxLen: number = 7): string {
  if (tick === null || tick === undefined) return '';
  const tickStr = String(tick);
  
  // 괄호 및 영문 약어 제거
  const cleaned = tickStr.replace(/\s*\([A-Za-z\s&\-.\/]+\)/g, '');
  
  if (cleaned.length > maxLen) {
    return cleaned.substring(0, maxLen) + '...';
  }
  return cleaned;
}

/**
 * 한글 기준 7자 초과 라벨이 다수(4개 이상)일 때 Smart Rotation 값 반환
 */
export function getSmartRotation(labels: any[], thresholdLength: number = 7, thresholdCount: number = 4) {
  if (!labels || labels.length === 0) {
    return { angle: 0, textAnchor: 'middle', bottomMargin: 20 };
  }
  
  const longLabelsCount = labels.filter(label => {
    if (!label) return false;
    const cleaned = String(label).replace(/\s*\([A-Za-z\s&\-.\/]+\)/g, '');
    return cleaned.length > thresholdLength;
  }).length;
  
  if (longLabelsCount >= thresholdCount) {
    return {
      angle: -30,
      textAnchor: 'end',
      bottomMargin: 50
    };
  }
  
  return {
    angle: 0,
    textAnchor: 'middle',
    bottomMargin: 20
  };
}
