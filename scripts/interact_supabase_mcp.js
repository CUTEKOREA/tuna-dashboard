const { spawn } = require('child_process');

// 시크릿 하드코딩 제거(GitHub push protection) — 환경변수로 주입. (구 토큰은 폐기·회전 필요)
const token = process.env.SUPABASE_PAT || process.env.SUPABASE_ACCESS_TOKEN || "";

const proc = spawn('npx', [
  '-y',
  '@supabase/mcp-server-supabase@0.5.10',
  '--access-token',
  token
], {
  env: process.env
});

let buffer = '';

proc.stdout.on('data', (data) => {
  const str = data.toString();
  buffer += str;
  processBuffer();
});

proc.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

proc.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});

function send(msg) {
  const payload = JSON.stringify(msg) + '\n';
  proc.stdin.write(payload);
}

// Start with initialize
send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
});

function processBuffer() {
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep partial line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id === 1) {
        // Initialize response received, send initialized notification
        send({
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        });
        
        // Let's call list_projects tool
        send({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'list_projects',
            arguments: {}
          }
        });
      } else if (msg.id === 2) {
        console.log('LIST PROJECTS RESULT:', JSON.stringify(msg.result, null, 2));
        
        // Let's try calling execute_sql using 'axfhrskotysvheptucen' as project_id
        send({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'execute_sql',
            arguments: {
              project_id: 'axfhrskotysvheptucen',
              query: 'SELECT current_user, session_user;'
            }
          }
        });
      } else if (msg.id === 3) {
        console.log('EXECUTE SQL RESULT:', JSON.stringify(msg.result, null, 2));
      }
    } catch (e) {
      console.error('Error parsing JSON line:', line, e);
    }
  }
}

setTimeout(() => {
  proc.stdin.end();
}, 8000);
