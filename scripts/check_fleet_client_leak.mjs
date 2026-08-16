#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const STATIC_ROOT = join(process.cwd(), '.next', 'static');
const PRIVATE_DETAIL_PATH = join(process.cwd(), 'artifacts', 'fleet-daily-detail.json');
const PRIVATE_SOURCE_PATH = join(process.cwd(), 'lib', 'data', 'generated', 'fleet-daily-private.json');
const ALLOW_SYNTHETIC = process.argv.includes('--allow-synthetic');
const RAW_COORDINATE = /^[NS]\d{4}\s+[EW]\d{5}(?:\s|$)/;

function listStaticFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listStaticFiles(path);
    return entry.isFile() && ['.js', '.json', '.map'].includes(extname(entry.name)) ? [path] : [];
  });
}

function findPrivateSource() {
  return [
    process.env.FLEET_DAILY_DETAIL_JSON,
    existsSync(PRIVATE_DETAIL_PATH) ? readFileSync(PRIVATE_DETAIL_PATH, 'utf8') : null,
    existsSync(PRIVATE_SOURCE_PATH) ? readFileSync(PRIVATE_SOURCE_PATH, 'utf8') : null,
  ].find((value) => typeof value === 'string' && value.trim().length > 0);
}

function detailTokens() {
  const rawDetail = findPrivateSource();
  if (!rawDetail) {
    if (!ALLOW_SYNTHETIC) {
      throw new Error('보호 상세 증거가 없어 실제 누출 검사를 수행할 수 없습니다');
    }
    return {
      evidence: 'synthetic',
      tokens: [
        ['synthetic-position', 'N0001 E00001 (QA)'],
        ['synthetic-note', 'fleet-private-note-canary-20260816'],
        ['synthetic-plan', 'fleet-private-plan-canary-20260816'],
      ],
    };
  }

  const parsed = JSON.parse(rawDetail);
  const detail = parsed.latest ?? parsed;
  const tokens = [];
  const add = (id, value) => {
    if (typeof value === 'string' && value.length > 0 && value !== '-') tokens.push([id, value]);
  };
  for (const [region, rows] of [
    ['pacific', detail.pacific?.vessels],
    ['atlantic', detail.atlantic?.vessels],
    ['carrier', detail.carrier?.vessels],
    ['longline', detail.longline?.vessels],
  ]) {
    for (const [index, row] of (rows ?? []).entries()) {
      if (typeof row.position === 'string' && RAW_COORDINATE.test(row.position)) {
        add(`${region}-${index}-position`, row.position);
      }
      add(`${region}-${index}-note`, row.note);
      add(`${region}-${index}-plan`, row.loadPlan);
    }
  }
  return { evidence: 'private', tokens };
}

if (!existsSync(STATIC_ROOT)) {
  console.error('fleet client leak 검사 실패: .next/static이 없습니다');
  process.exit(1);
}

let evidence;
let tokens;
try {
  ({ evidence, tokens } = detailTokens());
} catch (error) {
  console.error(`fleet client leak 검사 실패: ${error instanceof Error ? error.message : '보호 상세를 읽지 못했습니다'}`);
  process.exit(1);
}
if (tokens.length === 0) {
  console.error('fleet client leak 검사 실패: 보호 상세에서 검사할 토큰을 찾지 못했습니다');
  process.exit(1);
}

const files = listStaticFiles(STATIC_ROOT);
const leaked = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const [id, value] of tokens) {
    if (source.includes(value)) leaked.push({ id, file });
  }
}

if (leaked.length > 0) {
  console.error(`fleet client leak 검사 실패: ${new Set(leaked.map((item) => item.id)).size}개 보호 토큰이 정적 번들에 있습니다`);
  process.exit(1);
}

const evidenceLabel = evidence === 'private' ? '실제 보호 상세' : '합성 경계 증거';
console.log(`fleet client leak 검사 통과: 정적 파일 ${files.length}개, ${evidenceLabel} ${tokens.length}개`);
