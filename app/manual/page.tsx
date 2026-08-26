'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, Terminal, FolderTree, Sparkles, BookOpen, Clock, AlertTriangle, Database, ChevronRight } from 'lucide-react';

type Category = '농산물' | '수산물' | '축산물' | '임산물' | '가공품';

type Item = {
  ko: string;
  en: string;
  slug: string;
  category: Category;
  regex?: string;
  faoCodes?: string;
  pinkSheet?: boolean;
  psd?: boolean;
  notes?: string;
};

const PRESET_ITEMS: Item[] = [
  // 농산물
  { ko: '캐슈넛', en: 'cashew nuts', slug: 'cashew_nuts', category: '농산물', regex: '\\b(cashew)\\w*', pinkSheet: false, psd: true },
  { ko: '카사바', en: 'cassava', slug: 'cassava', category: '농산물', regex: '\\b(cassava|manioc|tapioca|yuca)\\w*', pinkSheet: false, psd: false, notes: '부분일치로 tapioca-of-potatoes 포함될 수 있음' },
  { ko: '망고', en: 'mango', slug: 'mango', category: '농산물', regex: '\\b(mango)\\w*', pinkSheet: false, psd: false },
  { ko: '망고스틴', en: 'mangosteen', slug: 'mangosteen', category: '농산물', regex: '\\b(mangosteen)\\w*', notes: '단독 코드 없음 - Item 571 묶음 코드(mango+guava+mangosteen)만 존재' },
  { ko: '바나나', en: 'banana', slug: 'banana', category: '농산물', regex: '\\b(banana|plantain|musa)\\w*', pinkSheet: true, psd: false },
  { ko: '옥수수', en: 'maize', slug: 'maize', category: '농산물', regex: '\\b(maize|corn)\\w*', pinkSheet: true, psd: true, notes: 'PSD alldata.zip만 보유 (카테고리 zip 없음)' },
  { ko: '밀', en: 'wheat', slug: 'wheat', category: '농산물', regex: '\\b(wheat)\\w*', pinkSheet: true, psd: true },
  { ko: '쌀', en: 'rice', slug: 'rice', category: '농산물', regex: '\\b(rice|paddy)\\w*', pinkSheet: true, psd: true, notes: 'PSD alldata.zip만 보유' },
  { ko: '대두', en: 'soybeans', slug: 'soybeans', category: '농산물', regex: '\\b(soya|soybean)\\w*', pinkSheet: true, psd: true },
  { ko: '팜유', en: 'palm oil', slug: 'palm_oil', category: '농산물', regex: '\\bpalm\\w*', pinkSheet: true, psd: true, notes: 'PALM.PRD.TOTL 등 WB 전용 14개 지표 존재' },
  { ko: '커피', en: 'coffee', slug: 'coffee', category: '농산물', regex: '\\b(coffee)\\w*', pinkSheet: true, psd: true, notes: 'ICO 글로벌 통계 보조' },
  { ko: '코코아', en: 'cocoa', slug: 'cocoa', category: '농산물', regex: '\\b(cocoa)\\w*', pinkSheet: true, psd: false, notes: 'ICCO 가격·시장 보조' },
  { ko: '차', en: 'tea', slug: 'tea', category: '농산물', regex: '\\b(tea)\\w*', pinkSheet: true, psd: false },
  { ko: '사탕수수', en: 'sugar', slug: 'sugar', category: '농산물', regex: '\\b(sugar|sucrose)\\w*', pinkSheet: true, psd: true },
  { ko: '면화', en: 'cotton', slug: 'cotton', category: '농산물', regex: '\\b(cotton)\\w*', pinkSheet: true, psd: true },
  { ko: '올리브', en: 'olive', slug: 'olive', category: '농산물', regex: '\\b(olive)\\w*', pinkSheet: false, psd: false, notes: 'QCL+SCL 모두 데이터 보유 (가공품 예외)' },
  { ko: '바닐라', en: 'vanilla', slug: 'vanilla', category: '농산물', regex: '\\b(vanilla)\\w*', pinkSheet: false, psd: false, notes: 'PSD·Pink Sheet 동시 미지원' },
  { ko: '당근', en: 'carrot', slug: 'carrot', category: '농산물', regex: '\\b(carrot)\\w*', pinkSheet: false, psd: false, notes: 'KAMIS code=232 도매가 추적' },
  { ko: '마늘', en: 'garlic', slug: 'garlic', category: '농산물', regex: '\\b(garlic)\\w*', pinkSheet: false, psd: false },
  { ko: '양파', en: 'onion', slug: 'onion', category: '농산물', regex: '\\b(onion)\\w*', pinkSheet: false, psd: false },

  // 수산물
  { ko: '참치', en: 'tuna', slug: 'tuna', category: '수산물', regex: '\\b(tuna|thunnus|skipjack|albacore|yellowfin|bluefin|bigeye)\\w*', notes: 'ISSCAAP Group "Tunas, bonitos, billfishes" + Genus Thunnus/Katsuwonus/Auxis 결합 매칭. 5개 RFMO(WCPFC·IATTC·ICCAT·IOTC·CCSBT) 보강' },
  { ko: '연어', en: 'salmon', slug: 'salmon', category: '수산물', regex: '\\b(salmon|salmo|oncorhynchus)\\w*', notes: 'NOAA·EUMOFA 보조' },
  { ko: '오징어', en: 'squid', slug: 'squid', category: '수산물', regex: '\\b(squid|loligo|todarodes|ommastrephes)\\w*' },
  { ko: '주꾸미', en: 'jukkumi (webfoot octopus)', slug: 'jukkumi', category: '수산물', regex: '\\b(octopus|callistoctopus|amphioctopus)\\w*' },
  { ko: '갈치', en: 'hairtail', slug: 'hairtail', category: '수산물', regex: '\\b(hairtail|trichiurus|cutlassfish)\\w*' },
  { ko: '명태', en: 'pollock', slug: 'pollock', category: '수산물', regex: '\\b(pollock|gadus|alaska)\\w*' },
  { ko: '새우', en: 'shrimp', slug: 'shrimp', category: '수산물', regex: '\\b(shrimp|prawn|penaeus)\\w*' },
  { ko: '굴', en: 'oyster', slug: 'oyster', category: '수산물', regex: '\\b(oyster|crassostrea)\\w*' },
  { ko: '골뱅이', en: 'whelk', slug: 'whelk', category: '수산물', regex: '\\b(whelk|buccinum|neptunea)\\w*' },
  { ko: '김', en: 'laver / nori', slug: 'laver', category: '수산물', regex: '\\b(laver|nori|pyropia|porphyra)\\w*' },

  // 축산물
  { ko: '소·소고기', en: 'cattle / beef', slug: 'beef', category: '축산물', regex: '\\b(cattle|beef|bovine)\\w*', psd: true, notes: 'PSD livestock zip + WOAH 질병 보강' },
  { ko: '돼지·돼지고기', en: 'pig / pork', slug: 'pork', category: '축산물', regex: '\\b(pig|swine|pork|porcine)\\w*', psd: true },
  { ko: '닭', en: 'chicken / poultry', slug: 'chicken', category: '축산물', regex: '\\b(chicken|poultry|gallinaceous)\\w*', notes: 'PSD에 broiler/chicken meat만, alldata.zip 사용' },
  { ko: '계란', en: 'eggs', slug: 'eggs', category: '축산물', regex: '\\b(egg|eggs)\\w*', psd: false, pinkSheet: false, notes: 'PSD·Pink Sheet 동시 미지원 (FAOSTAT-only 케이스)' },
  { ko: '우유·낙농', en: 'milk / dairy', slug: 'dairy', category: '축산물', regex: '\\b(milk|dairy|cheese|butter|yogurt)\\w*', psd: true },

  // 임산물
  { ko: '천연고무', en: 'natural rubber', slug: 'natural_rubber', category: '임산물', regex: '\\b(rubber|hevea|latex)\\w*', pinkSheet: true, notes: 'Forestry zip 사용, IRSG 보조' },
];

const NORMALIZED_LIST: { kos: string[]; item: Item }[] = PRESET_ITEMS.map((item) => ({
  kos: [item.ko, item.en, item.slug].map((s) => s.toLowerCase()),
  item,
}));

function classifyByKeyword(text: string): Category {
  const t = text.toLowerCase();
  if (/(tuna|salmon|squid|shrimp|prawn|octopus|oyster|fish|seaweed|laver|nori|whelk|hairtail|pollock|crab|lobster|scallop|mussel|kelp)/.test(t)) return '수산물';
  if (/(cattle|beef|pork|pig|chicken|poultry|egg|milk|dairy|cheese|butter|sheep|goat|turkey|duck)/.test(t)) return '축산물';
  if (/(rubber|wood|timber|lumber|pulp|paper|cork|charcoal|fuelwood|hevea)/.test(t)) return '임산물';
  if (/(oil|cake|meal|flour|starch|refined)/.test(t)) return '가공품';
  return '농산물';
}

function makeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

function findPreset(query: string): Item | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const row of NORMALIZED_LIST) {
    if (row.kos.some((k) => k === q)) return row.item;
  }
  for (const row of NORMALIZED_LIST) {
    if (row.kos.some((k) => k.includes(q) || q.includes(k))) return row.item;
  }
  return null;
}

// ── Design Tokens (design.md 준수) ──
const C = {
  bg: '#020617',
  surface1: '#0F172A',
  surface2: '#1E293B',
  surface3: '#334155',
  border: '#1E293B',
  borderHover: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textDim: '#64748B',
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  amber: '#F59E0B',
};

const tabularNum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

function CopyButton({ text, label = '복사' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: copied ? C.green : C.surface3,
        color: copied ? '#022c1f' : C.textPrimary,
        border: `1px solid ${copied ? C.green : C.borderHover}`,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? '복사됨' : label}
    </button>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  accent,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: C.surface1,
        border: `1px solid ${C.border}`,
        borderLeft: accent ? `3px solid ${accent}` : `1px solid ${C.border}`,
        borderRadius: 8,
        padding: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: subtitle ? 4 : 12 }}>
        {icon}
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>
          {title}
        </div>
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 12 }}>{subtitle}</div>
      )}
      {children}
    </div>
  );
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          fontSize: 10,
          color: C.textDim,
          padding: '2px 6px',
          background: C.surface3,
          borderRadius: 2,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {language}
      </div>
      <pre
        style={{
          background: '#0a1020',
          color: C.textSecondary,
          padding: '14px 16px',
          paddingTop: 30,
          borderRadius: 4,
          fontSize: 12,
          lineHeight: 1.55,
          overflow: 'auto',
          margin: 0,
          fontFamily: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
          border: `1px solid ${C.border}`,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

const CATEGORY_RULES: Record<Category, { sections: string[]; sources: string[]; notes: string }> = {
  농산물: {
    sections: ['§1 FAOSTAT 표준 흐름', '§1.3 필터링 (정규식 \\b(...)\\w*)', '§1.4 FBS 보조', '§2 USDA PSD', '§3 World Bank'],
    sources: ['FAOSTAT 9 도메인 (QCL/QI/QV/TCL/TM/PP/FBS/FBSH/SCL)', 'USDA PSD alldata.zip', 'World Bank Pink Sheet + Indicators'],
    notes: '가공품(oil/cake/meal)은 QCL이 아닌 SCL의 Production element 확인 (§1.3.1)',
  },
  수산물: {
    sections: ['§1.6 FishStat (Capture/Aquaculture/GlobalProduction)', '§7 EUMOFA·NOAA·KMI 보조', '§7 RFMO 5개 (WCPFC·IATTC·ICCAT·IOTC·CCSBT)'],
    sources: ['FAO FishStat 2024.1.0', 'EUMOFA Data', 'NOAA FOSS', 'K-MOF 수산정보포털'],
    notes: 'FAOSTAT bulks-faostat의 Fishery_*.zip은 모두 403. 반드시 fao.org/fishery/static/Data/ 경로 사용. ISSCAAP Group + 학명 Genus 결합 매칭 필수',
  },
  축산물: {
    sections: ['§1.7 FAOSTAT 표준 9 zip', '§2.1 USDA PSD livestock/dairy 우선', '§7.4 WOAH 동물보건'],
    sources: ['FAOSTAT QCL (가축 두수=Element=Stocks)', 'USDA PSD livestock/dairy', 'WOAH', 'USDA NASS', 'IDF'],
    notes: 'LiveAnimals/Emissions 별도 zip은 404 - 표준 9 zip만 사용 (chicken·beef·eggs로 검증됨)',
  },
  임산물: {
    sections: ['§1.8 Forestry 도메인 (Forestry / Forestry_Trade_Flows)', '§7.4 ITTO·FAO FRA 보조'],
    sources: ['FAOSTAT Forestry + Forestry_Trade_Flows', 'ITTO', 'FAO FRA', 'EU FLEGT'],
    notes: '천연고무는 임산물로 분류, IRSG 별도 보조 가능',
  },
  가공품: {
    sections: ['§1.3.1 SCL Supply Utilization Accounts 우선', '§1.5 검증시 SCL Production 사용'],
    sources: ['FAOSTAT SCL', '필요시 QCL 보조 (olive oil 등 일부 가공품 등록)'],
    notes: '대두박(238), 팜유(257), cassava starch(129) 등의 생산은 SCL only',
  },
};

const ESTIMATED_TIME: Record<Category, string> = {
  농산물: '약 10~15분',
  수산물: '약 15~20분 (FishStat + RFMO 추가)',
  축산물: '약 10~15분',
  임산물: '약 10~15분',
  가공품: '약 10~15분',
};

const MANIFEST_PATH = '/Users/idong-geon/.claude/manuals/agri_commodity_data_collection.md';

function buildTrigger(item: { ko: string; en: string; slug: string }): string {
  return `${item.ko}(${item.en} / slug: ${item.slug}) 품목에 대해 ~/.claude/manuals/agri_commodity_data_collection.md 매뉴얼대로 데이터 수집해줘. 워크스페이스는 ~/agri_data/${item.slug}/ 로 만들고, v28.3 독립 저장 표준을 따른다.`;
}

function buildSetupBash(item: { slug: string }): string {
  return `# v28.3 독립 워크스페이스 생성
mkdir -p ~/agri_data/${item.slug}/{faostat/{raw,filtered},usda_psd,worldbank,extras,raw_data,processed_data}
cd ~/agri_data/${item.slug}
date '+%F %T  v28.3 workspace created' > collect.log
echo "${item.slug}" > .slug
ls -la`;
}

function buildPythonHint(item: Item): string {
  const re = item.regex || `\\b(${item.en.split(' ')[0]})\\w*`;
  return `# FAOSTAT 이름 기반 매칭 (§1.1 - trailing \\b 함정 주의)
import re, csv, zipfile, io
PAT = re.compile(r"${re}", re.I)

# zip 안 main CSV의 Item 컬럼 매칭
with zipfile.ZipFile("Production_Crops_Livestock_E_All_Data_(Normalized).zip") as zf:
    name = [n for n in zf.namelist() if n.endswith(".csv") and "Normalized" in n][0]
    with zf.open(name) as f:
        r = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
        hits = [row for row in r if PAT.search(row.get("Item", ""))]
print(f"matched rows: {len(hits)}")`;
}

export default function ManualPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | '전체'>('전체');

  const selected = useMemo<Item | null>(() => {
    const preset = findPreset(query);
    if (preset) return preset;
    if (!query.trim()) return null;
    return {
      ko: query.trim(),
      en: query.trim(),
      slug: makeSlug(query),
      category: classifyByKeyword(query),
      regex: `\\b(${makeSlug(query).split('_')[0]})\\w*`,
    };
  }, [query]);

  const trigger = selected ? buildTrigger(selected) : '';
  const bashSetup = selected ? buildSetupBash(selected) : '';
  const pyHint = selected ? buildPythonHint(selected) : '';
  const rules = selected ? CATEGORY_RULES[selected.category] : null;

  const filtered = useMemo(() => {
    if (activeCategory === '전체') return PRESET_ITEMS;
    return PRESET_ITEMS.filter((i) => i.category === activeCategory);
  }, [activeCategory]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.textSecondary,
        fontFamily: 'Inter, "Plus Jakarta Sans", system-ui, sans-serif',
        padding: '24px 28px 80px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              color: C.textTertiary,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} /> 대시보드
          </button>
          <div style={{ fontSize: 11, color: C.textDim, ...tabularNum }}>
            매뉴얼 v28.3 · 2026-05-14
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Sparkles size={20} color={C.blue} />
            <h1 style={{ fontSize: 24, fontWeight: 600, color: C.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
              데이터 수집 매뉴얼 실행기
            </h1>
          </div>
          <div style={{ fontSize: 13, color: C.textTertiary, lineHeight: 1.55 }}>
            농수축산물 품목명을 입력하면 Claude에 붙여넣을 트리거 문장과 폴더 생성 명령어를 자동 생성합니다.
            <br />
            정본: <code style={{ fontSize: 11, color: C.textSecondary, background: C.surface2, padding: '2px 6px', borderRadius: 2 }}>{MANIFEST_PATH}</code>
          </div>
        </div>

        {/* Input */}
        <SectionCard
          title="품목 선택 또는 직접 입력"
          subtitle="자주 쓰는 품목 칩을 누르거나 한글·영문으로 직접 입력하세요."
          icon={<BookOpen size={16} color={C.blue} />}
          accent={C.blue}
        >
          {/* Category filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {(['전체', '농산물', '수산물', '축산물', '임산물'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '4px 10px',
                  background: activeCategory === cat ? C.blue : 'transparent',
                  color: activeCategory === cat ? C.textPrimary : C.textTertiary,
                  border: `1px solid ${activeCategory === cat ? C.blue : C.border}`,
                  borderRadius: 2,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Preset chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {filtered.map((item) => (
              <button
                key={item.slug}
                onClick={() => setQuery(item.ko)}
                style={{
                  padding: '5px 11px',
                  background: query === item.ko ? C.green : C.surface2,
                  color: query === item.ko ? '#022c1f' : C.textSecondary,
                  border: `1px solid ${query === item.ko ? C.green : C.border}`,
                  borderRadius: 2,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: query === item.ko ? 600 : 400,
                }}
                title={`${item.en} (${item.slug})`}
              >
                {item.ko}
              </button>
            ))}
          </div>

          {/* Free input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 캐슈넛, tuna, mackerel..."
            style={{
              width: '100%',
              padding: '10px 12px',
              background: C.surface2,
              color: C.textPrimary,
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
        </SectionCard>

        {/* Output */}
        {selected && (
          <>
            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '14px 0' }}>
              <KpiCell label="한글" value={selected.ko} />
              <KpiCell label="영문" value={selected.en} mono />
              <KpiCell label="슬러그" value={selected.slug} mono />
              <KpiCell label="자동 분류" value={selected.category} accent={C.green} />
              <KpiCell label="예상 시간" value={ESTIMATED_TIME[selected.category]} icon={<Clock size={11} />} />
            </div>

            {/* Trigger */}
            <div style={{ marginBottom: 14 }}>
              <SectionCard
                title="Claude 트리거 문장"
                subtitle="아래 문장을 복사해 Claude에 그대로 붙여넣으세요. v28.3 자동 실행 모드로 진입합니다."
                icon={<Sparkles size={16} color={C.green} />}
                accent={C.green}
              >
                <div
                  style={{
                    background: '#0a1020',
                    border: `1px solid ${C.border}`,
                    borderRadius: 4,
                    padding: 14,
                    fontSize: 13,
                    color: C.textPrimary,
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  {trigger}
                </div>
                <CopyButton text={trigger} label="트리거 복사" />
              </SectionCard>
            </div>

            {/* Bash setup */}
            <div style={{ marginBottom: 14 }}>
              <SectionCard
                title="워크스페이스 생성 명령어"
                subtitle="터미널에서 먼저 실행하면 폴더가 준비됩니다 (선택)."
                icon={<Terminal size={16} color={C.amber} />}
                accent={C.amber}
              >
                <CodeBlock code={bashSetup} language="bash" />
                <div style={{ marginTop: 10 }}>
                  <CopyButton text={bashSetup} label="명령어 복사" />
                </div>
              </SectionCard>
            </div>

            {/* Python hint */}
            <div style={{ marginBottom: 14 }}>
              <SectionCard
                title="FAOSTAT 정규식 매칭 패턴"
                subtitle={`품목 정규식: ${selected.regex || '(자동 생성)'} - trailing \\b 함정 주의 (§1.1)`}
                icon={<Database size={16} color={C.blue} />}
                accent={C.blue}
              >
                <CodeBlock code={pyHint} language="python" />
                <div style={{ marginTop: 10 }}>
                  <CopyButton text={pyHint} label="코드 복사" />
                </div>
              </SectionCard>
            </div>

            {/* Applied rules */}
            {rules && (
              <div style={{ marginBottom: 14 }}>
                <SectionCard
                  title={`${selected.category} 적용 규칙`}
                  icon={<FolderTree size={16} color={C.blue} />}
                >
                  <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        적용 섹션
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {rules.sections.map((s) => (
                          <li key={s} style={{ fontSize: 12, color: C.textSecondary, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ChevronRight size={11} color={C.textDim} /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        데이터 소스
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {rules.sources.map((s) => (
                          <li key={s} style={{ fontSize: 12, color: C.textSecondary, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ChevronRight size={11} color={C.textDim} /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div
                    style={{
                      background: C.surface2,
                      borderLeft: `2px solid ${C.amber}`,
                      padding: '10px 12px',
                      fontSize: 12,
                      color: C.textSecondary,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <AlertTriangle size={13} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>{rules.notes}</div>
                  </div>
                  {selected.notes && (
                    <div
                      style={{
                        marginTop: 10,
                        background: C.surface2,
                        borderLeft: `2px solid ${C.blue}`,
                        padding: '10px 12px',
                        fontSize: 12,
                        color: C.textSecondary,
                        borderRadius: 2,
                      }}
                    >
                      <span style={{ color: C.blue, fontWeight: 600 }}>품목 별주의: </span>
                      {selected.notes}
                    </div>
                  )}
                </SectionCard>
              </div>
            )}

            {/* Folder tree */}
            <SectionCard title="예상 폴더 구조" icon={<FolderTree size={16} color={C.textTertiary} />}>
              <CodeBlock
                language="tree"
                code={`~/agri_data/${selected.slug}/
├── faostat/
│   ├── raw/                       # bulk zip
│   └── filtered/                  # ${selected.slug} 필터링 CSV
├── usda_psd/                      # 미수록시 NOT_AVAILABLE.txt
├── worldbank/                     # Pink Sheet + Indicators
├── extras/                        # §7 추가 공신력 사이트
├── raw_data/
├── processed_data/
├── README.md
├── source.json                    # config + collector 버전
├── reproduce.sh                   # 재현 스크립트
└── collect.log                    # 단계별 시각 기록`}
              />
            </SectionCard>
          </>
        )}

        {!selected && (
          <div
            style={{
              marginTop: 24,
              padding: 32,
              background: C.surface1,
              border: `1px dashed ${C.border}`,
              borderRadius: 8,
              textAlign: 'center',
              color: C.textDim,
              fontSize: 13,
            }}
          >
            품목을 선택하거나 입력하면 트리거 문장과 명령어가 자동 생성됩니다.
          </div>
        )}

        {/* Core rules footer */}
        <div style={{ marginTop: 28 }}>
          <SectionCard title="v28.3 핵심 원칙" icon={<AlertTriangle size={16} color={C.amber} />}>
            <ul data-mobile-stack style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                '작업 중간에 사용자 확인 질문 금지 (자동 실행 모드)',
                '워크스페이스 독립 저장 - _shared/ symlink 금지',
                'ZIP: 해제 후 원본 삭제 / PDF: pypdf로 MD 변환 후 둘 다 보관',
                'FAOSTAT API 521/timeout 시 이름 기반 매칭으로 즉시 우회',
                '정규식 \\b(...)\\w* 필수 - trailing \\b는 복수형 매칭 실패',
                '가공품 생산은 SCL Production 확인 (QCL 0행이 정상)',
                'macOS Python SSL 에러 시 curl 다운로드 → Python 파싱',
                '디스크 <5GB 시 사용자에게 보고 (외장 매체 미사용)',
              ].map((rule, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12,
                    color: C.textSecondary,
                    padding: '8px 10px',
                    background: C.surface2,
                    borderLeft: `2px solid ${C.amber}`,
                    borderRadius: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {rule}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function KpiCell({ label, value, mono, accent, icon }: { label: string; value: string; mono?: boolean; accent?: string; icon?: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        background: C.surface1,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: accent || C.textPrimary,
          fontFamily: mono ? '"JetBrains Mono", "SF Mono", Menlo, monospace' : 'inherit',
          ...tabularNum,
        }}
      >
        {value}
      </div>
    </div>
  );
}
