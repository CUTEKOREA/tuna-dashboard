const { spawn, spawnSync } = require('child_process');
const path = require('path');
const net = require('net');
const http = require('http');

// Find a free port starting from a base port
function getFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(getFreePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.listen(startPort);
  });
}

// Poll the server until it responds
function waitForServer(port, timeoutMs = 60000) {
  const startTime = Date.now();
  console.log(`Waiting for Next.js dev server to start on port ${port}...`);
  return new Promise((resolve, reject) => {
    function poll() {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error("Timeout waiting for Next.js server to start"));
        return;
      }
      const req = http.get(`http://localhost:${port}/unloading`, (res) => {
        // Any response (even redirect or 500) means the server is running
        resolve();
      });
      req.on('error', () => {
        setTimeout(poll, 1000);
      });
    }
    poll();
  });
}

async function main() {
  const port = await getFreePort(3000);
  console.log(`Starting E2E Test Suite on Port: ${port}`);

  // Spawn Next.js production server
  // detached: true lets us kill the entire process group
  const devServer = spawn('npm', ['run', 'start', '--', '-p', port], {
    env: { ...process.env, PORT: port },
    shell: true,
    detached: true
  });

  let serverDead = false;

  // Clean-up handler to kill Next.js server on exit/crash
  const killServer = () => {
    if (serverDead) return;
    console.log("Shutting down Next.js dev server...");
    try {
      // Kill the entire process group (indicated by negative PID)
      process.kill(-devServer.pid, 'SIGINT');
      serverDead = true;
    } catch (e) {
      // already dead
    }
  };

  // Register clean-up hooks
  process.on('exit', killServer);
  process.on('SIGINT', () => {
    killServer();
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error("Uncaught exception in runner:", err);
    killServer();
    process.exit(1);
  });

  devServer.stdout.on('data', (data) => {
    console.log(`[Next.js]: ${data.toString().trim()}`);
  });

  devServer.stderr.on('data', (data) => {
    console.error(`[Next.js Error]: ${data.toString().trim()}`);
  });

  try {
    // Wait for the server to be responsive
    await waitForServer(port);
    console.log("Next.js dev server is ready! Executing test specs...");

    const specs = [
      'tier1_features.spec.js',
      'tier2_boundaries.spec.js',
      'tier3_pairwise.spec.js',
      'tier4_realworld.spec.js',
      'unloading-history.spec.js'
    ];

    const results = [];
    let anyFailed = false;

    for (const spec of specs) {
      const specPath = path.join(__dirname, 'specs', spec);
      console.log(`\n--------------------------------------------------`);
      console.log(`Executing Spec: ${spec}`);
      console.log(`--------------------------------------------------`);

      const result = spawnSync('node', [specPath], {
        env: { ...process.env, PORT: port },
        stdio: 'inherit' // stream spec stdout/stderr directly to the console
      });

      const passed = result.status === 0;
      if (!passed) anyFailed = true;

      results.push({
        spec,
        passed,
        exitCode: result.status
      });
    }

    console.log(`\n==================================================`);
    console.log(`ALL SPECS COMPLETED. SUMMARY STATS:`);
    console.log(`==================================================`);
    for (const res of results) {
      console.log(`${res.passed ? '✅ PASS' : '❌ FAIL'} - ${res.spec} (Exit Code: ${res.exitCode})`);
    }
    console.log(`==================================================`);

    killServer();

    // Exit with appropriate code
    process.exit(anyFailed ? 1 : 0);

  } catch (error) {
    console.error("Test execution failed:", error);
    killServer();
    process.exit(1);
  }
}

main();
