import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 웹훅 보안을 위한 커스텀 토큰 
// SendGrid 등에서 webhook URL 설정 시: https://.../api/webhooks/unloading?token=YOUR_SECRET_TOKEN
const WEBHOOK_SECRET = process.env.UNLOADING_WEBHOOK_SECRET || 'secret123';

// Supabase 클라이언트 (Vercel 환경 변수 사용)
// 서버 사이드이므로 SERVICE_ROLE_KEY를 사용하여 RLS를 우회할 수 있습니다. (설정된 경우)
// 없으면 ANON_KEY를 사용하되 RLS 정책으로 보호해야 합니다.
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
    
    const cmcMatch = textBody.match(/CMC\s*([\d,\.]+)\s*MT/);
    const tumMatch = textBody.match(/TUM\s*([\d,\.]+)\s*MT/);
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
    const vesselId = vesselRaw.toLowerCase().replace(/\s+/g, '-');

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
    // 먼저 vessel이 존재하는지 확인하거나 upsert (vessel_id 기준으로)
    // 참고: 실제 운영에서는 vessel 데이터를 미리 등록해두는 것을 권장합니다.
    
    // 4-1. 일일 리포트 저장
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

    // 4-2. Vessel 요약 정보 업데이트 (actual_total)
    await supabase
      .from('unloading_vessels')
      .update({ 
        reported_total: cumAmount + remAmount, // 하역누계 + 잔량 = 총 적재량
      })
      .eq('vessel_id', vesselId);

    // 4-3. Species 업데이트 (CMC=SJ, TUM=YF 가정)
    if (cmcMatch) {
      // 기존 값을 덮어쓰거나 누적을 업데이트하는 로직 (단순화를 위해 여기서는 처리 생략 또는 직접 구현)
      // Excel처럼 정확한 SJ 누계를 얻으려면 추가 로직이 필요하지만, 
      // 이메일에 포함된 일일 CMC 량을 DB 어딘가에 누적해야 합니다.
      // (Option C 1단계 완료)
    }

    return NextResponse.json({ success: true, parsed: { vesselId, reportDate, dailyAmount } });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
