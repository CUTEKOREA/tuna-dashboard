const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const { once } = require('node:events');

function getFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(getFreePort(startPort + 1));
        return;
      }
      reject(error);
    });
    probe.once('listening', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : startPort;
      probe.close(() => resolve(port));
    });
    probe.listen(startPort, '127.0.0.1');
  });
}

function waitForServer(server, port, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const onExit = (code, signal) => {
      reject(new Error(`Next.js server exited before readiness: code=${code} signal=${signal}`));
    };
    server.once('exit', onExit);

    const poll = () => {
      const request = http.get(`http://127.0.0.1:${port}/unloading`, (response) => {
        response.resume();
        server.off('exit', onExit);
        resolve();
      });
      request.setTimeout(1_000, () => request.destroy());
      request.once('error', () => {
        if (Date.now() >= deadline) {
          server.off('exit', onExit);
          reject(new Error(`Timed out waiting for Next.js server on port ${port}`));
          return;
        }
        setTimeout(poll, 500);
      });
    };

    poll();
  });
}

async function stopServer(server) {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;

  try {
    if (process.platform === 'win32') server.kill('SIGTERM');
    else process.kill(-server.pid, 'SIGTERM');
  } catch {
    return;
  }

  const stopped = await Promise.race([
    once(server, 'exit').then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (!stopped) {
    try {
      if (process.platform === 'win32') server.kill('SIGKILL');
      else process.kill(-server.pid, 'SIGKILL');
    } catch {
      // The process already exited between the timeout and the kill attempt.
    }
  }
}

async function main() {
  const preferredPort = Number.parseInt(process.env.PORT || '3027', 10);
  const port = await getFreePort(Number.isFinite(preferredPort) ? preferredPort : 3027);
  const nextBin = require.resolve('next/dist/bin/next');
  const server = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    cwd: path.resolve(__dirname, '..'),
    detached: process.platform !== 'win32',
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  const stopOnSignal = (signal) => {
    void stopServer(server).finally(() => {
      process.exit(signal === 'SIGINT' ? 130 : 143);
    });
  };
  process.once('SIGINT', () => stopOnSignal('SIGINT'));
  process.once('SIGTERM', () => stopOnSignal('SIGTERM'));

  try {
    await waitForServer(server, port);
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, 'specs', 'unloading-history.spec.js')],
      {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, PORT: String(port) },
        stdio: 'inherit',
      },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  } finally {
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
