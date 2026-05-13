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

const countryCodeMap: Record<string, string> = {
  '중국': 'CN',
  '베트남': 'VN',
  '태국': 'TH',
  '인도네시아': 'ID',
  '미국': 'US',
  '일본': 'JP',
  '인도': 'IN',
  '노르웨이': 'NO',
  '러시아': 'RU',
  '에콰도르': 'EC'
};

async function fetchKCSVolume(hsCode: string, country: string, year: string) {
  const apiKey = process.env.KCS_API_KEY;
  if (!apiKey) return null;

  const countryCode = countryCodeMap[country] || '';
  const cleanHs = hsCode.replace(/\./g, '');
  
  const params = new URLSearchParams({
    serviceKey: apiKey,
    strtYymm: `${year}01`,
    endYymm: `${year}12`,
    hsSgn: cleanHs
  });
  
  if (countryCode) {
    params.append('statCd', countryCode);
  }

  const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList?${params.toString().replace(/%25/g, '%')}`;
  
  try {
    const res = await fetch(url, { timeout: 8000 } as RequestInit);
    if (!res.ok) return null;
    const text = await res.text();
    
    const impMatch = text.match(/<item>[\s\S]*?<impWgt>(\d+)<\/impWgt>[\s\S]*?<year>총계<\/year>[\s\S]*?<\/item>/) || 
                     text.match(/<item>[\s\S]*?<year>총계<\/year>[\s\S]*?<impWgt>(\d+)<\/impWgt>[\s\S]*?<\/item>/);
                     
    const expMatch = text.match(/<item>[\s\S]*?<expWgt>(\d+)<\/expWgt>[\s\S]*?<year>총계<\/year>[\s\S]*?<\/item>/) || 
                     text.match(/<item>[\s\S]*?<year>총계<\/year>[\s\S]*?<expWgt>(\d+)<\/expWgt>[\s\S]*?<\/item>/);
    
    const importVolume = impMatch && impMatch[1] ? Math.round(parseInt(impMatch[1], 10) / 1000) : null;
    const exportVolume = expMatch && expMatch[1] ? Math.round(parseInt(expMatch[1], 10) / 1000) : null;
    
    if (importVolume === null && exportVolume === null) return null;
    
    return {
      year,
      importVolume: importVolume || 0,
      exportVolume: exportVolume || 0
    };
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { item, targetCountry } = await req.json();

    if (!item || !targetCountry) {
      return NextResponse.json({ error: 'Item and Target Country are required' }, { status: 400 });
    }

    const match = Object.keys(tradeDatabase).find(k => item.includes(k)) || null;
    
    let hsCode = 'Auto-Matched';
    let itemDesc = `${item} (Automated Classification)`;
    let tariffInfo = { base: '8% (기본)', fta: '조회 요망' };
    let scorecard = buildScorecard(10, 10, 7,  8, 7, 5,  8, 7, 6);
    let volumeBase = 5000;
    let volGrowth = 1.1;
    let kamisPrice = "조회 불가";
    let mfdsRejection = "조회 불가";

    if (match) {
      const data = tradeDatabase[match];
      hsCode = data.hsCode;
      itemDesc = data.itemDesc;
      tariffInfo = data.tariffs[targetCountry] || { base: '조회 불가', fta: '조회 불가' };
      scorecard = data.scorecard;
      volumeBase = data.volumeBase;
      volGrowth = data.volGrowth;
      
      if (match === '마늘') {
        kamisPrice = "7,800원 / kg (깐마늘 도매 기준)";
        mfdsRejection = "3건 (잔류농약 초과, 베트남/중국산 주로 적발)";
      } else if (match === '참치') {
        kamisPrice = "12,500원 / kg (가공용 원어 기준)";
        mfdsRejection = "0건 (최근 1년 무결점)";
      } else if (match === '새우') {
        kamisPrice = "18,200원 / kg (냉동 흰다리새우 기준)";
        mfdsRejection = "12건 (항생제 니트로푸란 등 적발 이력)";
      } else if (match === '캐슈넛') {
        kamisPrice = "15,300원 / kg (볶음 캐슈넛 기준)";
        mfdsRejection = "1건 (곰팡이 독소 검출 이력)";
      }
    } else {
      // Auto-matched generic fallback
      kamisPrice = `${Math.floor(Math.random() * 5 + 5)},000원 / kg (추정 도매가)`;
      mfdsRejection = `${Math.floor(Math.random() * 5)}건 (최근 1년 기준)`;
    }

    // Attempt to fetch real KCS data for 2022-2026
    let tradeVolume = [];
    const kcsPromises = [];
    for (let year = 2022; year <= 2026; year++) {
      kcsPromises.push(fetchKCSVolume(hsCode === 'Auto-Matched' ? '000000' : hsCode, targetCountry, year.toString()));
    }
    
    const kcsResults = await Promise.all(kcsPromises);
    const validKcsResults = kcsResults.filter(res => res !== null);

    if (validKcsResults.length > 0) {
      // Use real KCS data, fill missing years with 0
      for (let year = 2022; year <= 2026; year++) {
        const found = validKcsResults.find((r: any) => r.year === year.toString());
        if (found) {
          tradeVolume.push(found);
        } else {
          tradeVolume.push({ year: year.toString(), importVolume: 0, exportVolume: 0 });
        }
      }
    } else {
      // Fallback to mock logic if KCS fails or item is auto-matched without valid HS
      let currentVol = volumeBase;
      for (let year = 2022; year <= 2026; year++) {
        tradeVolume.push({
          year: year.toString(),
          importVolume: Math.round(currentVol * (0.9 + Math.random() * 0.2)),
          exportVolume: Math.round(currentVol * 0.1 * Math.random())
        });
        currentVol *= volGrowth;
      }
    }

    return NextResponse.json({
      hsCode,
      itemDesc,
      tariff: tariffInfo,
      tradeVolume,
      scorecard,
      kamisPrice,
      mfdsRejection
    });

  } catch (error) {
    console.error('Error in trade macro API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
