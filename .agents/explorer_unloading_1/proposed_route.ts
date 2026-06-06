import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 웹훅 보안을 위한 커스텀 토큰 
const WEBHOOK_SECRET = process.env.UNLOADING_WEBHOOK_SECRET || 'secret123';

// Supabase 클라이언트 (Vercel 환경 변수 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // 1. 보안 토큰 검증
    const { searchParams } = new URL(req.url);
    if (searchParams.get('token') !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 이메일 데이터 추출 (SendGrid Inbound Parse는 multipart/form-data 형식으로 전송됨)
    const formData = await req.formData();
    const textBody = formData.get('text') as string;
    const subject = formData.get('subject') as string;
    
    if (!textBody) {
      return NextResponse.json({ error: 'No text body found in email' }, { status: 400 });
    }

    // 3. 정규식을 이용한 데이터 파싱
    const dateMatch = textBody.match(/금일\((.*?)\)/);
    const vesselMatch = textBody.match(/금일\([^)]+\)\s*(.*?)\s*하역결과/);
    const dailyMatch = textBody.match(/일일\s*하역량\s*([\d,\.]+)\s*MT/);
    const cumMatch = textBody.match(/하역\s*누계\s*([\d,\.]+)\s*MT/);
    const remMatch = textBody.match(/잔\s*량\s*([\d,\.]+)\s*MT/);
    const timeMatch = textBody.match(/(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/);
    const holdsMatch = [...textBody.matchAll(/([A-Z/]+)\(#[^)]+\)/g)].map(m => m[0]);
    const uniqueHolds = [...new Set(holdsMatch)];
    
    const tomorrowMatch = textBody.match(/명일.*약\s*([\d,]+)\s*톤/);
    
    const qualitySectionMatch = textBody.match(/제품상태:([\s\S]*?)5\.\s*명일/);
    let qualityNotes = "";
    if (qualitySectionMatch) {
      qualityNotes = qualitySectionMatch[1].replace(/\n\s*\*/g, ' ').replace(/\n/g, '').trim();
    }

    if (!dateMatch || !vesselMatch) {
       console.error("Failed to parse essential data from email", textBody);
       return NextResponse.json({ error: 'Failed to parse email format' }, { status: 400 });
    }

    const reportDate = dateMatch[1];
    // 이메일 선박명 매핑 (예: SEIN PHOENIX -> sein-phoenix)
    const vesselRaw = vesselMatch[1].trim();
    const vesselId = vesselRaw.toLowerCase().replace(/\s+/g, '-').replace(/^m\/v-|^mv-/, '');

    const dailyAmount = dailyMatch ? parseFloat(dailyMatch[1].replace(/,/g, '')) : 0;
    const cumAmount = cumMatch ? parseFloat(cumMatch[1].replace(/,/g, '')) : 0;
    const remAmount = remMatch ? parseFloat(remMatch[1].replace(/,/g, '')) : 0;
    
    const workTime = timeMatch ? `${timeMatch[1]} ~ ${timeMatch[2]}` : '-';
    let targetHolds = uniqueHolds.length > 0 ? uniqueHolds.join(', ') : '-';
    
    // 추가 퀄리티 노트에 내일 예정 물량 추가
    if (tomorrowMatch) {
       qualityNotes += ` 명일(${new Date().getMonth()+1}/${new Date().getDate()+1}) 약 ${tomorrowMatch[1]}톤 하역 진행 예정.`;
    }

    // 4. Supabase DB 저장
    
    // 4-1. Vessel 존재 여부 확인 및 upsert
    const { data: existingVessel, error: vFetchErr } = await supabase
      .from('unloading_vessels')
      .select('*')
      .eq('vessel_id', vesselId)
      .maybeSingle();

    if (vFetchErr) {
      console.error("Error fetching vessel:", vFetchErr);
    }

    if (!existingVessel) {
      const { error: vInsertErr } = await supabase
        .from('unloading_vessels')
        .insert({
          vessel_id: vesselId,
          name: vesselRaw,
          location: 'BANGKOK, THAILAND',
          buyer: 'FCF CO.,LTD',
          status: '하역중 (In Progress)',
          reported_total: cumAmount + remAmount,
          date_range: '2026.05.23 ~ 진행중'
        });
      if (vInsertErr) {
        console.error("Error inserting vessel:", vInsertErr);
      }
    } else {
      const { error: vUpdateErr } = await supabase
        .from('unloading_vessels')
        .update({
          reported_total: cumAmount + remAmount,
          status: '하역중 (In Progress)'
        })
        .eq('vessel_id', vesselId);
      if (vUpdateErr) {
        console.error("Error updating vessel:", vUpdateErr);
      }
    }

    // 4-2. 일일 리포트 저장
    const { data: reportData, error: reportError } = await supabase
      .from('unloading_reports')
      .upsert({
        vessel_id: vesselId,
        report_date: reportDate,
        work_time: workTime,
        target_holds: targetHolds,
        daily_amount: dailyAmount,
        cumulative_amount: cumAmount,
        quality_notes: qualityNotes
      }, { onConflict: 'vessel_id, report_date' })
      .select();

    if (reportError) {
      console.error("Supabase insert error:", reportError);
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    // 4-3. Species 업데이트 (UC, TUM, CMC, ISA, MMP, AAI, SJ, YF 파싱 및 매핑)
    const speciesList = ['UC', 'TUM', 'CMC', 'ISA', 'MMP', 'AAI', 'SJ', 'YF'];
    const parsedSpecies: { [key: string]: number } = {};
    for (const sp of speciesList) {
      const regex = new RegExp(`${sp}\\s*([\\d,\\.]+)\\s*(?:MT|톤)?`, 'i');
      const match = textBody.match(regex);
      if (match) {
        parsedSpecies[sp] = parseFloat(match[1].replace(/,/g, ''));
      }
    }

    const speciesMapping: { [key: string]: string } = {
      TUM: 'YF',
      YF: 'YF',
      UC: 'SJ',
      CMC: 'SJ',
      ISA: 'SJ',
      MMP: 'SJ',
      AAI: 'SJ',
      SJ: 'SJ'
    };

    const dailySpeciesAmounts: { [key: string]: number } = {};
    for (const [sp, amt] of Object.entries(parsedSpecies)) {
      const targetId = speciesMapping[sp.toUpperCase()];
      if (targetId) {
        dailySpeciesAmounts[targetId] = (dailySpeciesAmounts[targetId] || 0) + amt;
      }
    }

    for (const [targetId, dailyAmt] of Object.entries(dailySpeciesAmounts)) {
      if (dailyAmt > 0) {
        const { data: existingSpec, error: sFetchErr } = await supabase
          .from('unloading_species')
          .select('*')
          .eq('vessel_id', vesselId)
          .eq('species_id', targetId)
          .maybeSingle();

        if (sFetchErr) {
          console.error(`Error fetching species ${targetId}:`, sFetchErr);
          continue;
        }

        if (existingSpec) {
          const newActual = (Number(existingSpec.actual_amount) || 0) + dailyAmt;
          const { error: sUpdateErr } = await supabase
            .from('unloading_species')
            .update({ actual_amount: newActual })
            .eq('vessel_id', vesselId)
            .eq('species_id', targetId);

          if (sUpdateErr) {
            console.error(`Error updating species ${targetId}:`, sUpdateErr);
          }
        } else {
          const speciesName = targetId === 'SJ' ? 'Skipjack' : 'Yellowfin';
          let reportedAmount = 0;
          if (vesselId === 'sein-phoenix') {
            reportedAmount = targetId === 'SJ' ? 6646.000 : 309.000;
          }
          const { error: sInsertErr } = await supabase
            .from('unloading_species')
            .insert({
              vessel_id: vesselId,
              species_id: targetId,
              species_name: speciesName,
              reported_amount: reportedAmount,
              actual_amount: dailyAmt
            });

          if (sInsertErr) {
            console.error(`Error inserting species ${targetId}:`, sInsertErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, parsed: { vesselId, reportDate, dailyAmount } });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
