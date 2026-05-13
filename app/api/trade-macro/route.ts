import { NextResponse } from 'next/server';

// Detailed Scorecard Builder based on the educational methodology images
function buildScorecard(d_vol: number, d_cagr: number, d_ind: number, a_tar: number, a_ntb: number, a_log: number, s_pol: number, s_ex: number, s_trd: number) {
  const demandTotal = d_vol + d_cagr + d_ind; // Max 40
  const accessTotal = a_tar + a_ntb + a_log; // Max 30
  const stabilityTotal = s_pol + s_ex + s_trd; // Max 30
  const totalScore = demandTotal + accessTotal + stabilityTotal;

  let verdict = '';
  if (totalScore >= 80) verdict = '최우선 탐색 대상';
  else if (totalScore >= 65) verdict = '조건부 검토';
  else verdict = '현 시점 제외';

  const getGrade = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.85) return 'S';
    if (ratio >= 0.75) return 'A';
    if (ratio >= 0.60) return 'B';
    return 'C';
  };

  return {
    totalScore,
    verdict,
    demand: {
      score: demandTotal,
      maxScore: 40,
      grade: getGrade(demandTotal, 40),
      details: [
        { label: '수입 규모 (Import Volume)', score: d_vol, max: 15, desc: '최소 $1M 이상 시장 유무 검토' },
        { label: '성장률 (YoY/CAGR)', score: d_cagr, max: 15, desc: '3년 평균 성장 지표' },
        { label: '구매력 및 산업연계성', score: d_ind, max: 10, desc: '투입재로 사용되는 후방 산업 규모' }
      ]
    },
    accessibility: {
      score: accessTotal,
      maxScore: 30,
      grade: getGrade(accessTotal, 30),
      details: [
        { label: '관세율 (MFN/FTA)', score: a_tar, max: 12, desc: '한국과의 FTA 체결 및 실효 관세율' },
        { label: '비관세장벽 및 인증', score: a_ntb, max: 10, desc: '수입 허가제, 기술 규격, FDA/할랄 등' },
        { label: '물류 거리 및 인프라', score: a_log, max: 8, desc: '해상 운임, 통관 소요일 및 항만 인프라' }
      ]
    },
    stability: {
      score: stabilityTotal,
      maxScore: 30,
      grade: getGrade(stabilityTotal, 30),
      details: [
        { label: '정치·제도 리스크', score: s_pol, max: 12, desc: '정치 불안정성 및 계약 이행 가능성' },
        { label: '환율 및 물류망 리스크', score: s_ex, max: 10, desc: '현지 통화 변동성 및 내륙 운송 불안정' },
        { label: '무역분쟁 및 제재', score: s_trd, max: 8, desc: '반덤핑 부과 이력 및 제재 대상국 여부' }
      ]
    }
  };
}

const tradeDatabase: Record<string, any> = {
  '마늘': {
    hsCode: '0703.20',
    itemDesc: 'Garlic, fresh or chilled',
    tariffs: {
      '중국': { base: '360%', fta: '15% (APTA 협정세율 또는 TRQ 적용 시)' },
      '베트남': { base: '360%', fta: '0% (VKFTA 기준 특정 조건 충족 시)' }
    },
    volumeBase: 15000,
    volGrowth: 1.15,
    scorecard: buildScorecard(14, 13, 9,  8, 6, 7,  9, 8, 7) // Total: 81
  },
  '참치': {
    hsCode: '1604.14',
    itemDesc: 'Tunas, skipjack and bonito (Sarda spp.), prepared or preserved',
    tariffs: {
      '태국': { base: '20%', fta: '0% (AKFTA)' },
      '인도네시아': { base: '20%', fta: '0% (CEPA)' }
    },
    volumeBase: 42000,
    volGrowth: 1.05,
    scorecard: buildScorecard(15, 12, 10,  12, 9, 8,  10, 8, 7) // Total: 91
  },
  '새우': {
    hsCode: '0306.17',
    itemDesc: 'Other shrimps and prawns, frozen',
    tariffs: {
      '베트남': { base: '20%', fta: '0% (VKFTA 무관세 쿼터)' },
      '태국': { base: '20%', fta: '0% (AKFTA)' }
    },
    volumeBase: 30000,
    volGrowth: 1.08,
    scorecard: buildScorecard(13, 11, 8,  11, 8, 7,  8, 7, 6) // Total: 79
  },
  '캐슈넛': {
    hsCode: '0801.32',
    itemDesc: 'Cashew nuts, fresh or dried, shelled',
    tariffs: {
      '베트남': { base: '8%', fta: '0% (AKFTA)' },
      '인도': { base: '8%', fta: '0% (CEPA)' }
    },
    volumeBase: 8000,
    volGrowth: 1.2,
    scorecard: buildScorecard(14, 15, 8,  12, 8, 6,  10, 8, 7) // Total: 88
  }
};

export async function POST(req: Request) {
  try {
    const { item, targetCountry } = await req.json();

    if (!item || !targetCountry) {
      return NextResponse.json({ error: 'Item and Target Country are required' }, { status: 400 });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    const match = Object.keys(tradeDatabase).find(k => item.includes(k)) || null;
    
    if (!match) {
      return NextResponse.json({
        hsCode: 'Auto-Matched',
        itemDesc: `${item} (Automated Classification)`,
        tariff: {
          base: '8% (기본)',
          fta: '조회 요망'
        },
        tradeVolume: [
          { year: '2022', importVolume: 5000, exportVolume: 1000 },
          { year: '2023', importVolume: 5200, exportVolume: 1100 },
          { year: '2024', importVolume: 5600, exportVolume: 1250 },
          { year: '2025', importVolume: 6100, exportVolume: 1400 },
          { year: '2026', importVolume: 6500, exportVolume: 1550 }
        ],
        scorecard: buildScorecard(10, 10, 7,  8, 7, 5,  8, 7, 6) // Total: 68
      });
    }

    const data = tradeDatabase[match];
    const tariffInfo = data.tariffs[targetCountry] || { base: '조회 불가', fta: '조회 불가' };

    const tradeVolume = [];
    let currentVol = data.volumeBase;
    for (let year = 2022; year <= 2026; year++) {
      tradeVolume.push({
        year: year.toString(),
        importVolume: Math.round(currentVol * (0.9 + Math.random() * 0.2)),
        exportVolume: Math.round(currentVol * 0.1 * Math.random())
      });
      currentVol *= data.volGrowth;
    }

    return NextResponse.json({
      hsCode: data.hsCode,
      itemDesc: data.itemDesc,
      tariff: tariffInfo,
      tradeVolume,
      scorecard: data.scorecard
    });

  } catch (error) {
    console.error('Error in trade macro API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
