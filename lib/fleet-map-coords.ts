/**
 * 일일 업무보고의 선박 위치 문자열을 위경도로 변환한다.
 * 보고 원문은 «N0351 W16734 (H)» 같은 도·분 표기이거나 «X-MAS», «TEMA» 같은 항구명이다.
 */

/** 보고서에 지명으로만 표기되는 항구·기지의 위경도 */
export const FLEET_PORTS: Record<string, [number, number]> = {
  'X-MAS': [1.87, -157.43], // 크리스마스섬(키리티마티)
  BKK: [13.72, 100.56], // 방콕
  GENSAN: [6.11, 125.17], // 제너럴산토스
  RABAUL: [-4.2, 152.18], // 라바울
  TARAWA: [1.43, 173.0],
  FUNAFUTI: [-8.52, 179.2],
  MAJURO: [7.1, 171.37],
  TEMA: [5.62, 0.02], // 가나 테마항
  ABIDJAN: [5.32, -4.02],
  부산: [35.1, 129.04],
  통영: [34.85, 128.43],
};

/** 도·분 표기 (위도 2자리도·2자리분, 경도 3자리도·2자리분) */
const DEGREE_MINUTE = /([NS])(\d{2})(\d{2})\s+([EW])(\d{3})(\d{2})/;

/** 위치 문자열 → [위도, 경도]. 해석 불가하면 null. */
export function parseFleetPosition(zone: string): [number, number] | null {
  const z = zone.toUpperCase();
  for (const [port, position] of Object.entries(FLEET_PORTS)) {
    if (z.includes(port)) return position;
  }
  const dm = z.match(DEGREE_MINUTE);
  if (!dm) return null;
  const lat = (Number(dm[2]) + Number(dm[3]) / 60) * (dm[1] === 'S' ? -1 : 1);
  const lng = (Number(dm[5]) + Number(dm[6]) / 60) * (dm[4] === 'W' ? -1 : 1);
  return [lat, lng];
}

/**
 * 태평양 선단은 날짜변경선 양쪽(방콕 100°E ~ 크리스마스섬 157°W)에 걸쳐 있다.
 * 서경을 동경 연장(+360)으로 환산해야 지도가 끊기지 않고 한 화면에 들어온다.
 */
export function toPacificLng(lng: number): number {
  return lng < 0 ? lng + 360 : lng;
}
