#!/usr/bin/env node
/**
 * 에이전트용 피처 맵을 만들고, 실제 코드와 어긋났는지 검사한다.
 *
 *   node scripts/feature_map.mjs --write   docs/agent/feature-map.md 의 «자동» 구역을 다시 쓴다
 *   node scripts/feature_map.mjs --check   어긋나면 비0 으로 끝난다 (verify 체인용)
 *
 * 왜 필요한가 — 화면이 40개, 위젯이 549개다. 에이전트가 「어느 주소로 가면 그 화면이
 * 나오나」를 코드에서 매번 되짚느라 시간을 버린다. 실제로 라이브 확인을 하다 /kim·
 * /korea-market 이 404 인 것을 뒤늦게 알았고, 로컬은 시크릿이 없어 / 가 503 이라는 것도
 * 서버를 띄워 보고서야 알았다.
 *
 * ⚠ 손으로 쓴 «함정»·«증거» 구역은 이 스크립트가 절대 덮어쓰지 않는다. 사람이 아는 것과
 *   코드에서 읽히는 것을 한 파일에 두되, 갱신 주체를 나눈다.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MAP_PATH = 'docs/agent/feature-map.md';
const BEGIN = '<!-- BEGIN GENERATED — scripts/feature_map.mjs. 손으로 고치지 마라 -->';
const END = '<!-- END GENERATED -->';

/** 레지스트리에서 메뉴 정의를 읽는다. 정본은 lib/dashboard-registry.ts 하나다. */
async function readMenus() {
  const src = await readFile(path.join(ROOT, 'lib/dashboard-registry.ts'), 'utf8');
  const block = src.slice(src.indexOf('DASHBOARD_MENU_CONFIGS'));
  const pattern = /\{\s*key:\s*'([^']+)',\s*title:\s*'([^']+)',\s*section:\s*'([^']+)'([^}]*)\}/g;
  const menus = [...block.matchAll(pattern)].map(([, key, title, section, rest]) => ({
    key,
    title,
    section,
    operation: /requiresOperationAccess:\s*true/.test(rest),
    admin: /requiresAdminAccess:\s*true/.test(rest),
  }));
  if (!menus.length) throw new Error('dashboard-registry.ts 에서 메뉴를 하나도 못 읽었다');

  const hidden = new Set(readSet(src, 'HIDDEN_DASHBOARD_MENU_KEYS'));
  const session = new Set(readSet(src, 'SESSION_ACCESS_MENUS'));
  return menus.map((x) => ({ ...x, hidden: hidden.has(x.key), session: session.has(x.key) }));
}

/** `new Set([...])` 형태의 상수에서 문자열만 뽑는다. 못 찾으면 빈 배열(검사는 계속된다). */
function readSet(src, name) {
  const at = src.indexOf(name);
  if (at < 0) return [];
  const open = src.indexOf('[', at);
  const close = src.indexOf(']', open);
  if (open < 0 || close < 0) return [];
  return [...src.slice(open, close).matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

/** app/ 아래 실제 페이지 폴더.
 *  ⚠ 폴더가 있다고 화면이 있는 게 아니다 — 은퇴한 화면은 page.tsx 가 notFound() 한 줄이라
 *    주소를 열면 404 다(/kim·/korea-market 이 그랬다). 살아 있는 것과 갈라서 적는다. */
async function readAppRoutes() {
  const entries = await readdir(path.join(ROOT, 'app'), { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const live = [];
  const retired = [];
  for (const d of dirs) {
    if (d.startsWith('[') || d === 'api') continue;
    const page = path.join(ROOT, 'app', d, 'page.tsx');
    if (!existsSync(page)) continue;
    const src = await readFile(page, 'utf8');
    (/notFound\(\)/.test(src) ? retired : live).push(d);
  }
  return {
    statics: live.sort(),
    retired: retired.sort(),
    dynamic: dirs.filter((d) => d.startsWith('[')).sort(),
    hasApi: dirs.includes('api'),
  };
}

/** app/api 아래 route.ts → 엔드포인트 경로 */
async function readApiRoutes() {
  const base = path.join(ROOT, 'app/api');
  if (!existsSync(base)) return [];
  const out = [];
  async function walk(dir, prefix) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const next = path.join(dir, e.name);
      if (e.isDirectory()) await walk(next, `${prefix}/${e.name}`);
      else if (e.name === 'route.ts' || e.name === 'route.tsx') out.push(`/api${prefix}`);
    }
  }
  await walk(base, '');
  return out.sort();
}

const SECTION_LABEL = {
  operation: '운영', understanding: '시장 이해', fishery: '수산',
  strategy: '전략', agriculture: '농산', livestock: '축산',
};

function render(menus, app, apis) {
  const lines = [];
  lines.push(BEGIN, '');
  lines.push(`_생성: \`node scripts/feature_map.mjs --write\` · 메뉴 ${menus.length}개 · 정적 라우트 ${app.statics.length}개 · API ${apis.length}개_`, '');

  lines.push('## 화면 — 어떻게 도달하나', '');
  lines.push('`app/[category]/page.tsx` 가 `app/page.tsx` 를 통째로 다시 불러 그리는 단일 페이지 구조다.');
  lines.push('그래서 아래 키는 전부 `https://leedonggun.co.kr/<키>` 로 열린다. 목록에 없는 키는 404 다.', '');
  lines.push('| 키 (URL) | 화면 | 구역 | 접근 |');
  lines.push('|---|---|---|---|');
  for (const m of menus) {
    const access = [
      m.admin ? '관리자' : null,
      m.operation ? '운영 권한' : null,
      m.session ? '세션 필요' : null,
      m.hidden ? '숨김' : null,
    ].filter(Boolean).join(' · ') || '공개';
    lines.push(`| \`/${m.key}\` | ${m.title} | ${SECTION_LABEL[m.section] ?? m.section} | ${access} |`);
  }
  lines.push('');

  lines.push('## 정적 라우트 (카테고리 키와 별개)', '');
  lines.push(app.statics.map((s) => `\`/${s}\``).join(' · ') || '없음', '');

  lines.push('', `### 은퇴한 주소 — 열면 404 (${app.retired.length}개)`, '');
  lines.push('`page.tsx` 가 `notFound()` 한 줄만 들고 있다. 폴더가 보인다고 화면이 있는 게 아니다.', '');
  lines.push(app.retired.map((s) => `\`/${s}\``).join(' · ') || '없음', '');

  lines.push('## API', '');
  lines.push(`${apis.length}개.`, '');
  lines.push('<details><summary>전체 목록</summary>', '');
  lines.push(apis.map((a) => `- \`${a}\``).join('\n'), '');
  lines.push('</details>', '');
  lines.push(END);
  return lines.join('\n');
}

function splice(existing, generated) {
  const begin = existing.indexOf(BEGIN);
  const end = existing.indexOf(END);
  if (begin < 0 || end < 0) throw new Error(`${MAP_PATH} 에 생성 구역 표식이 없다`);
  return existing.slice(0, begin) + generated + existing.slice(end + END.length);
}

const mode = process.argv.includes('--write') ? 'write'
  : process.argv.includes('--check') ? 'check' : null;
if (!mode) {
  console.error('사용법: node scripts/feature_map.mjs --write | --check');
  process.exit(2);
}

const [menus, app, apis] = await Promise.all([readMenus(), readAppRoutes(), readApiRoutes()]);
const generated = render(menus, app, apis);
const mapFile = path.join(ROOT, MAP_PATH);

if (!existsSync(mapFile)) {
  console.error(`✗ ${MAP_PATH} 가 없다. 먼저 만들어라.`);
  process.exit(1);
}

const existing = await readFile(mapFile, 'utf8');
const updated = splice(existing, generated);

if (mode === 'write') {
  await writeFile(mapFile, updated);
  console.log(`✓ ${MAP_PATH} 갱신 — 메뉴 ${menus.length} · 정적 ${app.statics.length} · API ${apis.length}`);
} else if (updated !== existing) {
  console.error(`✗ ${MAP_PATH} 가 코드와 어긋난다. \`node scripts/feature_map.mjs --write\` 로 갱신하고 커밋해라.`);
  console.error('  (화면이 늘거나 줄었는데 맵이 그대로면 에이전트가 없는 주소를 찾아다닌다)');
  process.exit(1);
} else {
  console.log(`✓ 피처 맵 최신 — 메뉴 ${menus.length} · 정적 ${app.statics.length} · API ${apis.length}`);
}
