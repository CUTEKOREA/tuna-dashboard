export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let globalSupabase: any = null;

function getSupabaseClient() {
  if (globalSupabase) return globalSupabase;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !rawKey) return null;
  const supabaseUrl = rawUrl.trim().replace(/\\n$/, '').replace(/\n$/, '');
  const supabaseKey = rawKey.trim().replace(/\\n$/, '').replace(/\n$/, '');
  globalSupabase = createClient(supabaseUrl, supabaseKey);
  return globalSupabase;
}

const LOCAL_DB_PATH = path.join(process.cwd(), 'public/data/unloading/local_db.json');

export async function GET() {
  try {
    let vessels: any[] = [];
    let reports: any[] = [];
    let species: any[] = [];

    const useLocalDb = !getSupabaseClient() || (!process.env.SUPABASE_SERVICE_ROLE_KEY && fs.existsSync(LOCAL_DB_PATH));
    if (useLocalDb) {
      try {
        const db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
        vessels = db.unloading_vessels || [];
        reports = db.unloading_reports || [];
        species = db.unloading_species || [];
      } catch {
        // Fallback
      }
    }

    if (vessels.length === 0) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized (missing environment variables)');
      }
      const { data: vData, error: vErr } = await supabase.from('unloading_vessels').select('*');
      if (vErr) throw vErr;
      vessels = vData || [];
      
      const { data: rData, error: rErr } = await supabase.from('unloading_reports').select('*').order('report_date', { ascending: true });
      if (rErr) throw rErr;
      reports = rData || [];

      const { data: sData, error: sErr } = await supabase.from('unloading_species').select('*');
      if (sErr) throw sErr;
      species = sData || [];
    }

    // Sort reports chronologically. report_date is 'M/D' text, so lexicographic
    // ordering breaks at two-digit days ('6/10' < '6/9') and would also corrupt
    // actualTotal below (taken from the last report's cumulative amount).
    // Applies to both local-DB and Supabase paths (DB .order() is lexicographic too).
    const reportDateKey = (report: any): number => {
      const m = String(report?.report_date || '').match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
      const year = Number(report?.report_year) || 2026;
      return m ? year * 10000 + parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 0;
    };
    reports.sort((a: any, b: any) => reportDateKey(a) - reportDateKey(b));

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
        annualActualTotal: v.annual_actual_total == null ? null : Number(v.annual_actual_total),
        annualStartDate: v.annual_start_date || null,
        holdDataAvailable: v.hold_data_available !== false,
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
      if (mergedData[key].annualActualTotal == null) {
        mergedData[key].annualActualTotal = mergedData[key].actualTotal;
      }
    });

    return NextResponse.json({ success: true, data: mergedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
