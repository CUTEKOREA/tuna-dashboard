const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.trim().replace(/\\n$/, '').replace(/\n$/, '');
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).trim().replace(/\\n$/, '').replace(/\n$/, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function dump() {
  const { data: vessels } = await supabase.from('unloading_vessels').select('*');
  console.log('--- vessels ---');
  console.log(vessels);

  const { data: reports } = await supabase.from('unloading_reports').select('*');
  console.log('--- reports ---');
  console.log(reports);

  const { data: species } = await supabase.from('unloading_species').select('*');
  console.log('--- species ---');
  console.log(species);
}

dump();
