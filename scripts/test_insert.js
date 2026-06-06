const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.replace(/\\n/g, '\n');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("1. Testing unloading_vessels insert/upsert...");
  const { data: vData, error: vError } = await supabase
    .from('unloading_vessels')
    .upsert({
      vessel_id: 'sein-phoenix',
      name: 'M/V SEIN PHOENIX',
      location: 'BANGKOK, THAILAND',
      buyer: 'FCF CO.,LTD',
      status: '하역중 (In Progress)',
      reported_total: 6955,
      date_range: '2026.05.23 ~ 진행중'
    });
  console.log("unloading_vessels upsert:", { vData, vError });

  console.log("2. Testing unloading_reports insert/upsert...");
  const { data: rData, error: rError } = await supabase
    .from('unloading_reports')
    .upsert({
      vessel_id: 'sein-phoenix',
      report_date: '6/2',
      work_time: '08:20 ~ 14:00',
      target_holds: 'S/SPR(#1-A), MOAMARI(#4-C)',
      daily_amount: 198.78,
      cumulative_amount: 2304.99,
      quality_notes: 'Test notes'
    });
  console.log("unloading_reports upsert:", { rData, rError });
}

test();
