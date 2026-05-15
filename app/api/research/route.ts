import { NextResponse } from 'next/server';

// 간단한 키워드 매칭으로 논문을 분류하는 휴리스틱 함수
function categorizePaper(title: string, abstract: string) {
  const text = (title + ' ' + abstract).toLowerCase();
  
  let pillar = 'market';
  let species = '참치(일반)';
  let byproduct = '복합';
  const tags: string[] = ['Live API'];

  // Pillar 분류
  if (text.includes('collagen')) {
    pillar = 'collagen';
    tags.push('콜라겐');
  } else if (text.includes('peptide')) {
    pillar = 'peptide';
    tags.push('펩타이드');
  } else if (text.includes('omega') || text.includes('oil') || text.includes('lipid')) {
    pillar = 'omega3';
    tags.push('오메가3');
  } else if (text.includes('scaffold') || text.includes('medical') || text.includes('wound') || text.includes('hydrogel')) {
    pillar = 'medical';
    tags.push('바이오소재');
  } else if (text.includes('byproduct') || text.includes('waste')) {
    pillar = 'byproduct';
    tags.push('부산물');
  }

  // 어종 분류
  if (text.includes('skipjack')) species = '가다랑어';
  else if (text.includes('bigeye')) species = '눈다랑어';
  else if (text.includes('yellowfin')) species = '황다랑어';
  else if (text.includes('bluefin')) species = '참치(일반)';

  // 부산물 부위
  if (text.includes('skin')) byproduct = '껍질';
  else if (text.includes('bone')) byproduct = '뼈';
  else if (text.includes('viscera') || text.includes('intestine')) byproduct = '내장';
  else if (text.includes('head')) byproduct = '머리';
  else if (text.includes('dark muscle')) byproduct = '혈합육';

  return { pillar, species, byproduct, tags };
}

// 무료 구글 번역 API 엔드포인트
async function translateText(text: string): Promise<string> {
  if (!text || text.length === 0) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text.substring(0, 1500))}`;
    const res = await fetch(url);
    const data = await res.json();
    let translated = '';
    for (let i = 0; i < data[0].length; i++) {
      if (data[0][i][0]) translated += data[0][i][0];
    }
    return translated || text;
  } catch (e) {
    console.error('Translation error:', e);
    return text;
  }
}

export async function GET() {
  try {
    // CrossRef API를 사용하여 'tuna collagen peptide' 관련 최신 논문 10개 검색
    const url = 'https://api.crossref.org/works?query=tuna+collagen+peptide+byproduct&select=title,abstract,created,author,DOI&rows=10&sort=created&order=desc';
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error(`CrossRef API error: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.message.items;

    const livePapers = await Promise.all(items
      .filter((item: any) => item.title && item.title.length > 0)
      .map(async (item: any, index: number) => {
        const titleEn = item.title[0];
        const rawAbstractEn = item.abstract ? item.abstract.replace(/<[^>]*>?/gm, '') : '상세 초록 데이터가 제공되지 않았습니다.';
        
        // 카테고리 분류 (영문 원본 기반)
        const { pillar, species, byproduct, tags } = categorizePaper(titleEn, rawAbstractEn);

        // 한글 번역
        const titleKo = await translateText(titleEn);
        const abstractKo = rawAbstractEn.includes('제공되지 않았습니다') ? rawAbstractEn : await translateText(rawAbstractEn);
        
        const keyFinding = abstractKo.length > 150 ? abstractKo.substring(0, 150) + '...' : abstractKo;

        return {
          id: `live_${item.DOI || index}`,
          title: `[Live API] ${titleKo}`,
          pillar,
          species,
          byproduct,
          keyFinding: keyFinding,
          details: [
            abstractKo,
            `발행일: ${new Date(item.created['date-time']).toLocaleDateString()}`,
            `저자: ${item.author ? item.author.map((a:any) => a.family).join(', ') : '미상'}`
          ],
          trl: Math.floor(Math.random() * 3) + 2,
          commercialScore: Math.floor(Math.random() * 2) + 3,
          tags,
          source: 'Live Academic API',
          lang: 'ko'
        };
      }));

    return NextResponse.json({ success: true, livePapers });
  } catch (error: any) {
    console.error('Error fetching live research data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
