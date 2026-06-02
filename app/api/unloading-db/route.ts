export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: vessels, error: vErr } = await supabase.from('unloading_vessels').select('*');
    if (vErr) throw vErr;
    
    const { data: reports, error: rErr } = await supabase.from('unloading_reports').select('*').order('report_date', { ascending: true });
    if (rErr) throw rErr;

    const { data: species, error: sErr } = await supabase.from('unloading_species').select('*');
    if (sErr) throw sErr;

    const mergedData: any = {};

    vessels.forEach((v: any) => {
      mergedData[v.vessel_id] = {
        name: v.name,
        dateRange: v.date_range,
        location: v.location,
        buyer: v.buyer,
        motherVessel: v.mother_vessel || '-',
        status: v.status,
        reportedTotal: Number(v.reported_total),
        actualTotal: 0, 
        surplus: 0,
        species: [],
        timeline: []
      };
    });

    species.forEach((s: any) => {
      if (mergedData[s.vessel_id]) {
        mergedData[s.vessel_id].species.push({
          id: s.species_id,
          name: s.species_name,
          reported: Number(s.reported_amount),
          actual: Number(s.actual_amount),
          surplus: Number(s.actual_amount) - Number(s.reported_amount)
        });
      }
    });

    reports.forEach((r: any) => {
      if (mergedData[r.vessel_id]) {
        mergedData[r.vessel_id].timeline.push({
          date: r.report_date,
          time: r.work_time,
          targetHol: r.target_holds,
          dailyAmount: Number(r.daily_amount),
          cumAmount: Number(r.cumulative_amount),
          quality: r.quality_notes
        });
        mergedData[r.vessel_id].actualTotal = Number(r.cumulative_amount);
      }
    });

    // Calculate surplus
    Object.keys(mergedData).forEach(key => {
      mergedData[key].surplus = mergedData[key].actualTotal - mergedData[key].reportedTotal;
    });

    return NextResponse.json({ success: true, data: mergedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
