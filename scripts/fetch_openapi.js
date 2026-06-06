const fs = require('fs');
const path = require('path');
const https = require('https');

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

const url = env.NEXT_PUBLIC_SUPABASE_URL.trim() + '/rest/v1/';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();

console.log("Fetching OpenAPI spec from:", url);

const req = https.get(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      fs.writeFileSync(path.join(__dirname, '../scratch/openapi.json'), JSON.stringify(parsed, null, 2));
      console.log("OpenAPI spec saved to scratch/openapi.json!");
    } catch (e) {
      console.error("Failed to parse JSON response:", data.substring(0, 500));
    }
  });
});

req.on('error', (err) => {
  console.error("Error:", err.message);
});
