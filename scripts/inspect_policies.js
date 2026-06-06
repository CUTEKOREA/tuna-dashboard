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
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.replace(/\\n/g, '\n');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching reports...");
  const { data, error } = await supabase
    .from('unloading_reports')
    .select('*')
    .limit(1);
    
  console.log("unloading_reports read result:", { data, error });
}

run();
