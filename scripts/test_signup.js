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

async function run() {
  const email = `test_worker_${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "password123";
  
  console.log("Attempting sign up...");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });
  console.log("Sign up result:", { user: signUpData.user, signUpError });
  
  if (signUpData.user) {
    console.log("Attempting sign in...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log("Sign in result:", { session: signInData.session, signInError });
  }
}

run();
