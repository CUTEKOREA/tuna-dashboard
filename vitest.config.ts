import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    // 자격증명 픽스처 주입 — 실키가 소스에서 제거되어(2026-08-13) 테스트가 스스로 마련한다.
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
