/**
 * 참치 세력 지구본 — 서른세 편의 기업 해부를 지구 위에 네 층으로 얹는다.
 *
 * ## 이 위젯이 그리지 않는 것
 *
 * 흔한 기업 지도가 거짓말하는 자리 다섯을 구조로 막았다. 자세한 근거는
 * `lib/data/company-geo.ts` 와 `lib/data/company-relations.ts` 의 머리 주석에 있다.
 *
 * 1. 본사 핀에 크기를 주지 않는다 — `hasSize()` 가 `kind: 'hq'` 를 언제나 거른다.
 * 2. 선단을 지도에 찍지 않는다 — 20편에 모항이 0건이고 있는 것은 기국뿐이다.
 * 3. 미확인 거점을 찍지 않는다 — `UNLOCATED_PLANTS` 는 패널에 개수만 낸다.
 * 4. 국가를 칠하지 않는다 — 지구는 어두운 바탕이고 점과 선만 있다.
 * 5. 근거 없는 관계를 굵게 긋지 않는다 — `strokeWeight()` 가 `confirmed:false` 를 고정폭으로 돌린다.
 *
 * ## 시간축
 *
 * 「우리」 층에만 있다. Bolton 공급선 명단은 2021~2025년 척수가 확정돼 있지만
 * 다른 층에는 그런 시계열이 없다 — 없는 층에 스크럽바를 붙이면 없는 시계열을 만드는 것이다.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ALL_POINTS,
  FLAG_STATES,
  GeoPoint,
  HQ_POINTS,
  NO_FLEET,
  PLANT_POINTS,
  UNLOCATED_PLANTS,
  hasSize,
  isProduction,
} from '@/lib/data/company-geo';
import {
  ALL_RELATIONS,
  EQUITY_RELATIONS,
  EXTERNAL_NODES,
  Relation,
  RELATIONS_BY_LAYER,
  isSolid,
  strokeWeight,
} from '@/lib/data/company-relations';
import {
  Cinematics,
  flyIntro,
  flyToLayer,
  flyToPoint,
  installCinematics,
} from './globe-cinematics';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

/* ── 층 ─────────────────────────────────────────────────────────── */

type LayerKey = 'catch' | 'make' | 'capital' | 'ours';

interface LayerDef {
  key: LayerKey;
  name: string;
  /** 이 층이 답하는 물음. */
  question: string;
  accent: string;
  /** 층 전환 때 카메라가 가는 곳. */
  view: { lat: number; lng: number; altitude: number };
}

const LAYERS: LayerDef[] = [
  // 시야는 그 층의 점이 실제로 있는 자리를 잡는다. 빈 바다를 보여 주면 층이 비어 보인다.
  { key: 'catch', name: '잡는 곳', question: '배는 어느 나라 깃발을 다는가',
    accent: '#4FB0A5', view: { lat: 26, lng: 72, altitude: 2.05 } },
  { key: 'make', name: '만드는 곳', question: '캔은 어디서 만들어지는가',
    accent: '#DFA085', view: { lat: 24, lng: 14, altitude: 1.95 } },
  { key: 'capital', name: '쥔 곳', question: '누가 누구를 소유하는가',
    accent: '#C08A3E', view: { lat: 26, lng: -142, altitude: 2.3 } },
  { key: 'ours', name: '우리가 닿은 곳', question: '신라교역은 어디에 붙어 있는가',
    accent: '#C25B4E', view: { lat: 22, lng: 116, altitude: 2.1 } },
];

/** Bolton 공급선 명단의 한국 선사별 척수. 「우리」 층 시간축이 쓰는 유일한 시계열. */
const LIST_TIMELINE: { year: number; silla: number; note: string }[] = [
  { year: 2021, silla: 6, note: '우리 선망선 6척 전원이 올랐다' },
  { year: 2022, silla: 0, note: '명단 총 496척 · 우리 계열 표기 없음' },
  { year: 2023, silla: 0, note: '명단 총 407척 · 우리 계열 0척' },
  { year: 2024, silla: 2, note: 'EXPLORER · JUPITER 두 척 복귀 (총 399척)' },
  { year: 2025, silla: 5, note: 'HARVESTER · PIONEER · SPRINTER 추가 (총 964척)' },
];

/* ── 노드 좌표 해석 ──────────────────────────────────────────────── */

interface Node {
  id: string;
  label: string;
  country: string;
  lat: number;
  lng: number;
  numeral?: string;
}

function buildNodeIndex(): Map<string, Node> {
  const m = new Map<string, Node>();
  for (const p of HQ_POINTS) {
    m.set(p.company, { id: p.company, label: p.label.replace(/\s*(본사|등기 본점)$/, ''),
      country: p.country, lat: p.lat, lng: p.lng, numeral: p.numeral });
  }
  for (const [id, e] of Object.entries(EXTERNAL_NODES)) {
    m.set(id, { id, label: e.label, country: e.country, lat: e.lat, lng: e.lng });
  }
  return m;
}

/** `#RRGGBB` → `r,g,b`. 파동은 알파를 시간에 따라 깎아야 해서 rgba 로 조립한다. */
function hexRgb(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/* ── 컴포넌트 ───────────────────────────────────────────────────── */

export default function TunaPowerGlobe() {
  const globeRef = useRef<any>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 620 });
  const [layer, setLayer] = useState<LayerKey>('make');
  const [year, setYear] = useState(2025);
  const [picked, setPicked] = useState<GeoPoint | null>(null);
  const [pickedRel, setPickedRel] = useState<Relation | null>(null);
  const [spin, setSpin] = useState(true);
  const [ready, setReady] = useState(false);
  /** 층 전환 직후 잠깐 뜨는 타이틀 카드. 연출용이고 데이터가 아니다. */
  const [card, setCard] = useState(false);

  const cineRef = useRef<Cinematics | null>(null);
  const introRef = useRef(false);

  const nodeIndex = useMemo(() => buildNodeIndex(), []);
  const current = LAYERS.find((l) => l.key === layer)!;

  /* 크기 추적 */
  useEffect(() => {
    const read = () => {
      if (!boxRef.current) return;
      setSize({ w: boxRef.current.clientWidth, h: boxRef.current.clientHeight || 620 });
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  /* 자전 */
  useEffect(() => {
    const g = globeRef.current;
    if (!g?.controls) return;
    const c = g.controls();
    c.autoRotate = spin;
    c.autoRotateSpeed = 0.28;
    c.enableDamping = true;
    c.dampingFactor = 0.055;
    // 지구 안으로 파고들거나 별 밖으로 나가지 않게 궤도를 가둔다.
    c.minDistance = 160;
    c.maxDistance = 620;
  }, [spin, size.w, ready]);

  /* 연출 설치 — 별·림·블룸·톤매핑. 지구본이 준비된 뒤에만 붙는다. */
  useEffect(() => {
    if (!ready) return;
    const cine = installCinematics(globeRef.current, current.accent);
    cineRef.current = cine;
    if (!cine) return;

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      cine.tick(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cine.dispose();
      cineRef.current = null;
    };
    // 강조색은 아래 효과가 따로 갈아 끼운다 — 층마다 재설치하면 별이 다시 만들어진다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* 첫 진입 — 멀리서 붙는다 */
  useEffect(() => {
    if (!ready || introRef.current) return;
    introRef.current = true;
    const ids = flyIntro(globeRef.current, current.view);
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* 층 전환 — 뒤로 빠졌다 들어가고, 강조색과 타이틀 카드가 같이 바뀐다 */
  useEffect(() => {
    setPicked(null);
    setPickedRel(null);
    cineRef.current?.setAccent(current.accent);
    if (!ready || !introRef.current) return;
    const ids = flyToLayer(globeRef.current, current.view);
    setCard(true);
    const off = window.setTimeout(() => setCard(false), 2300);
    return () => [...ids, off].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, ready]);

  /* 지도에 찍는 점. 층마다 다르다. */
  const points = useMemo(() => {
    if (layer === 'make') return PLANT_POINTS;
    if (layer === 'catch') return HQ_POINTS.filter((p) => FLAG_STATES.some((f) => f.company === p.company));
    return HQ_POINTS;
  }, [layer]);

  /* 층에 걸리는 관계 */
  const relations = useMemo<Relation[]>(() => {
    if (layer === 'capital') return RELATIONS_BY_LAYER.capital;
    if (layer === 'ours') {
      return RELATIONS_BY_LAYER.ours.filter((r) => {
        if (r.kind !== 'registry' || !r.label.includes('명단')) return true;
        const t = LIST_TIMELINE.find((x) => x.year === year);
        return r.from !== 'external:silla' || (t?.silla ?? 0) > 0;
      });
    }
    return [];
  }, [layer, year]);

  const arcs = useMemo(
    () =>
      relations
        .map((r) => {
          const a = nodeIndex.get(r.from);
          const b = nodeIndex.get(r.to);
          if (!a || !b || (a.lat === b.lat && a.lng === b.lng)) return null;
          return { r, startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng };
        })
        .filter(Boolean) as { r: Relation; startLat: number; startLng: number; endLat: number; endLng: number }[],
    [relations, nodeIndex],
  );

  /**
   * 단위마다 따로 정규화한다.
   *
   * 하나의 최댓값으로 전부 나누면 **명·톤/년·MT/일이 한 자로 재진다.**
   * 실제로 그랬다 — 파고파고 108,000 톤/년이 최댓값이 되어 포소르하 2,358명과
   * 사뭇사콘 1,000 MT/일(연 30만 톤급)이 그 톤 값으로 나뉘어 더 작게 그려졌다.
   * `company-geo.ts` 의 5번 규칙이 「같은 단위끼리만 견준다」인데 코드가 깨고 있었다.
   */
  const maxByUnit = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of points) {
      if (!hasSize(p)) continue;
      m.set(p.sizeUnit!, Math.max(m.get(p.sizeUnit!) ?? 0, p.sizeValue!));
    }
    return m;
  }, [points]);

  const radiusOf = useCallback(
    (p: GeoPoint) => {
      if (!hasSize(p)) return 0.24;
      const max = maxByUnit.get(p.sizeUnit!) ?? p.sizeValue!;
      return 0.26 + Math.sqrt(p.sizeValue! / max) * 0.70;
    },
    [maxByUnit],
  );

  /**
   * 파동. **모든 점에 똑같이** 걸고 주기만 어긋나게 둔다 —
   * 일부에만 걸면 밝기가 중요도를 말하게 되고, 그건 데이터에 없는 축이다.
   */
  const rings = useMemo(
    () => points.map((p, i) => ({ lat: p.lat, lng: p.lng, period: 3000 + (i % 7) * 340 })),
    [points],
  );

  /**
   * 이 층의 아크가 닿는 **편 밖 상대**. 점으로 찍지 않으면 아크가
   * 근처 본사 핀에서 출발하는 것처럼 보인다 — 미쓰비시상사 선이 ニッスイ 핀에서
   * 뻗어 나가 「ニッスイ가 시도했다」로 읽혔다. 회색 마름모로 따로 낸다.
   */
  const externals = useMemo(() => {
    const ids = new Set<string>();
    for (const a of arcs) {
      if (a.r.from.startsWith('external:')) ids.add(a.r.from);
      if (a.r.to.startsWith('external:')) ids.add(a.r.to);
    }
    return [...ids].map((id) => ({ id, ...EXTERNAL_NODES[id] })).filter((x) => x.label);
  }, [arcs]);

  const timelineNow = LIST_TIMELINE.find((t) => t.year === year);

  /**
   * 캡션의 개수는 **손으로 적지 않고 화면에서 센다.**
   * 「지분선 12개」라 써 놓고 10개가 그려지고 그중 국경을 넘는 것이 7개였다.
   * 「회색 점선 둘」이라 써 놓고 셋이 그려졌고 그 셋째는 살아 있는 관계였다.
   */
  const drawn = useMemo(() => {
    const cross = arcs.filter((a) => {
      const x = nodeIndex.get(a.r.from);
      const y = nodeIndex.get(a.r.to);
      return x && y && x.country !== y.country;
    }).length;
    const grey = arcs.filter(
      (a) => a.r.status !== 'active' || !a.r.confirmed,
    ).length;
    const dead = arcs.filter((a) => a.r.status !== 'active').length;
    return { total: arcs.length, cross, grey, unconfirmedLive: grey - dead };
  }, [arcs, nodeIndex]);

  /** 기국으로 셀 수 있는 칸과 그렇지 않은 칸(등록부 이름·소유 구분)을 가른다. */
  const flagSplit = useMemo(
    () =>
      FLAG_STATES.map((f) => ({
        ...f,
        real: f.flags.filter((x) => x.isFlag !== false),
        other: f.flags.filter((x) => x.isFlag === false),
      })),
    [],
  );

  /** 이 층에 선단 정보가 아예 없는 회사. 「일곱」이라 못박았다가 실제로 열하나였다. */
  const fleetSilent = useMemo(() => {
    const known = new Set([
      ...FLAG_STATES.map((f) => f.company),
      ...NO_FLEET.map((n) => n.company),
    ]);
    return HQ_POINTS.filter((p) => !known.has(p.company));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* ── 층 선택 ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {LAYERS.map((l) => {
          const on = l.key === layer;
          return (
            <button
              key={l.key}
              onClick={() => setLayer(l.key)}
              style={{
                padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
                border: `1px solid ${on ? l.accent : 'rgba(148,163,184,0.32)'}`,
                background: on ? `${l.accent}22` : 'transparent',
                color: on ? l.accent : 'var(--w-slate-300, #cbd5e1)',
                fontSize: 13, fontWeight: on ? 700 : 500, transition: 'all .2s',
              }}
            >
              {l.name}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setSpin((s) => !s)}
            style={{
              padding: '5px 11px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              border: '1px solid rgba(148,163,184,0.3)', background: 'transparent',
              color: 'var(--w-slate-400, #94a3b8)',
            }}
          >
            {spin ? '자전 멈춤' : '자전 시작'}
          </button>
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--w-slate-400, #94a3b8)' }}>
        <b style={{ color: current.accent }}>{current.name}</b> — {current.question}
      </p>

      {/* ── 지구본 ────────────────────────────────────────────── */}
      <div
        ref={boxRef}
        style={{
          position: 'relative', width: '100%', height: 620, minHeight: 620,
          // 별이 보이려면 바탕이 거의 검어야 한다. 색은 지평 근처에만 남긴다.
          background: 'radial-gradient(135% 100% at 50% 46%, #061014 0%, #030710 55%, #010306 100%)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: `inset 0 0 90px rgba(0,0,0,0.85), 0 0 0 1px ${current.accent}22`,
        }}
      >
        {size.w > 0 && (
          <Globe
            ref={globeRef}
            width={size.w}
            height={size.h}
            globeImageUrl="/textures/earth-blue-marble.jpg"
            bumpImageUrl="/textures/earth-topology.png"
            backgroundColor="rgba(0,0,0,0)"
            onGlobeReady={() => setReady(true)}
            showAtmosphere={false}
            /* 점 — 납작한 원이 아니라 지면에서 솟은 기둥이다 */
            pointsData={points}
            pointLat={(d: any) => d.lat}
            pointLng={(d: any) => d.lng}
            pointAltitude={(d: any) => (hasSize(d) ? 0.055 : 0.032)}
            pointRadius={(d: any) => radiusOf(d)}
            pointColor={(d: any) => (d.kind === 'plant' ? current.accent : 'rgba(203,213,225,0.62)')}
            pointLabel={(d: any) => `${d.label} · ${d.country}`}
            pointsTransitionDuration={900}
            onPointClick={(d: any) => {
              setPicked(d as GeoPoint);
              setPickedRel(null);
              setSpin(false);
              flyToPoint(globeRef.current, d.lat, d.lng);
            }}
            /* 파동 — 연출이다. 크기도 색도 값을 말하지 않는다 */
            ringsData={rings}
            ringLat={(d: any) => d.lat}
            ringLng={(d: any) => d.lng}
            ringColor={() => (t: number) => `rgba(${hexRgb(current.accent)},${(1 - t) * 0.34})`}
            ringMaxRadius={1.9}
            ringPropagationSpeed={0.85}
            ringRepeatPeriod={(d: any) => d.period}
            /* 편 밖 상대 — 회사 핀과 섞이지 않게 라벨 표식으로 따로 낸다 */
            labelsData={externals}
            labelLat={(d: any) => d.lat}
            labelLng={(d: any) => d.lng}
            labelText={(d: any) => d.label}
            labelSize={0.62}
            labelDotRadius={0.34}
            labelColor={() => 'rgba(226,232,240,0.78)'}
            labelResolution={2}
            labelAltitude={0.014}
            /* 선 */
            arcsData={arcs}
            arcStartLat={(d: any) => d.startLat}
            arcStartLng={(d: any) => d.startLng}
            arcEndLat={(d: any) => d.endLat}
            arcEndLng={(d: any) => d.endLng}
            arcColor={(d: any) => {
              const r: Relation = d.r;
              if (r.status === 'failed') return ['rgba(148,163,184,0.10)', 'rgba(148,163,184,0.30)'];
              if (r.status === 'ended') return ['rgba(148,163,184,0.10)', 'rgba(148,163,184,0.45)'];
              if (!r.confirmed) return ['rgba(203,213,225,0.10)', 'rgba(203,213,225,0.38)'];
              return [`${current.accent}22`, current.accent];
            }}
            arcStroke={(d: any) => strokeWeight(d.r)}
            /* 확정된 관계만 입자가 흐른다 */
            arcDashLength={(d: any) => (isSolid(d.r) ? 0.42 : 0.12)}
            arcDashGap={(d: any) => (isSolid(d.r) ? 0.14 : 0.9)}
            arcDashAnimateTime={(d: any) => (isSolid(d.r) ? 2600 : 0)}
            arcAltitudeAutoScale={0.48}
            arcsTransitionDuration={900}
            arcLabel={(d: any) => `${d.r.label}`}
            onArcClick={(d: any) => { setPickedRel(d.r as Relation); setPicked(null); setSpin(false); }}
          />
        )}

        {/* ── 연출 겹판 ──────────────────────────────────────────
            아래 넷은 전부 장식이다. 클릭을 먹지 않도록 pointerEvents 를 끈다. */}

        {/* 비네트 — 가장자리를 눌러 가운데로 눈을 몬다 */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background:
              'radial-gradient(120% 85% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        {/* 필름 그레인 — 아주 옅게. 디지털 렌더의 매끈함을 깬다 */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.055,
            mixBlendMode: 'overlay',
            backgroundImage:
              'repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 2px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 3px)',
            animation: 'tunaGrain 1.1s steps(3) infinite',
          }}
        />

        {/* 레터박스 — 층이 바뀌는 동안만 위아래가 닫힌다 */}
        <motion.div
          aria-hidden
          animate={{ height: card ? 34 : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, background: '#03060a', pointerEvents: 'none' }}
        />
        <motion.div
          aria-hidden
          animate={{ height: card ? 34 : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#03060a', pointerEvents: 'none' }}
        />

        {/* HUD 모서리 — 게임 화면의 프레임 */}
        {([['left', 'top'], ['right', 'top'], ['left', 'bottom'], ['right', 'bottom']] as const).map(([x, y]) => (
          <div
            key={`${x}${y}`}
            aria-hidden
            style={{
              position: 'absolute', [x]: 10, [y]: 10, width: 22, height: 22, pointerEvents: 'none',
              [`border${x === 'left' ? 'Left' : 'Right'}`]: `1px solid ${current.accent}55`,
              [`border${y === 'top' ? 'Top' : 'Bottom'}`]: `1px solid ${current.accent}55`,
              transition: 'border-color .4s',
            } as React.CSSProperties}
          />
        ))}

        {/* 타이틀 카드 */}
        <AnimatePresence>
          {card && (
            <motion.div
              key={layer}
              initial={{ opacity: 0, y: 14, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.16em' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none',
                textShadow: '0 2px 24px rgba(0,0,0,0.85)',
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 800, color: current.accent }}>{current.name}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(226,232,240,0.82)', letterSpacing: '0.04em' }}>
                {current.question}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{'@keyframes tunaGrain{0%{transform:translate(0,0)}33%{transform:translate(-1px,1px)}66%{transform:translate(1px,-1px)}100%{transform:translate(0,0)}}'}</style>

        {/* 범례 */}
        <div
          style={{
            position: 'absolute', left: 14, bottom: 14, padding: '10px 12px', borderRadius: 8,
            background: 'rgba(3,6,10,0.62)', border: '1px solid rgba(148,163,184,0.18)',
            fontSize: 11.5, lineHeight: 1.7, color: 'var(--w-slate-300, #cbd5e1)', pointerEvents: 'none',
          }}
        >
          <div><span style={{ color: current.accent }}>●</span> 확정 — 실선 · 굵기가 값에 비례</div>
          <div><span style={{ color: 'rgba(203,213,225,0.6)' }}>○</span> 미확인 — 점선 · 고정 굵기</div>
          <div style={{ opacity: 0.72 }}>
            회색은 <b>끝났거나 · 무산됐거나 · 근거가 미확인</b>인 관계다 — 셋을 한 색으로 낸다
          </div>
          <div style={{ opacity: 0.72 }}>◇ 표식은 편 밖의 상대다 (카드가 없다)</div>
        </div>

        {/* 상세 카드 */}
        <AnimatePresence>
          {(picked || pickedRel) && (
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22 }}
              style={{
                position: 'absolute', right: 14, top: 14, width: 296, padding: '14px 15px',
                borderRadius: 10, background: 'rgba(3,6,10,0.9)',
                border: `1px solid ${current.accent}55`, color: 'var(--w-slate-200, #e2e8f0)', fontSize: 12.5,
              }}
            >
              {picked && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{picked.label}</div>
                  <div style={{ color: 'var(--w-slate-400, #94a3b8)', marginBottom: 9 }}>
                    {picked.country} · 편 {picked.numeral} ·{' '}
                    {picked.kind === 'hq'
                      ? '등기·본사'
                      : isProduction(picked)
                        ? '생산 거점'
                        : picked.role === 'trading' ? '트레이딩 법인' : '구매 거점'}
                  </div>
                  {hasSize(picked) && (
                    <div style={{ marginBottom: 7 }}>
                      규모 <b style={{ color: current.accent }}>
                        {picked.sizeValue!.toLocaleString('ko-KR')} {picked.sizeUnit}
                      </b>
                    </div>
                  )}
                  {picked.note && (
                    <div style={{ marginBottom: 7, color: '#e8b45f' }}>{picked.note}</div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--w-slate-500, #64748b)', lineHeight: 1.6 }}>
                    근거 {picked.basis}
                  </div>
                </>
              )}
              {pickedRel && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{pickedRel.label}</div>
                  <div style={{ color: 'var(--w-slate-400, #94a3b8)', marginBottom: 9 }}>
                    {nodeIndex.get(pickedRel.from)?.label} → {nodeIndex.get(pickedRel.to)?.label}
                    {pickedRel.status === 'ended' && ' · 끝난 관계'}
                    {pickedRel.status === 'failed' && ' · 무산'}
                    {!pickedRel.confirmed && ' · 미확인'}
                  </div>
                  {pickedRel.caution && (
                    <div
                      style={{
                        marginBottom: 8, padding: '7px 9px', borderRadius: 6,
                        background: 'rgba(194,91,78,0.13)', border: '1px solid rgba(194,91,78,0.3)',
                        color: '#e9a99f', lineHeight: 1.6,
                      }}
                    >
                      쓰면 안 되는 말 — {pickedRel.caution}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--w-slate-500, #64748b)', lineHeight: 1.6 }}>
                    근거 {pickedRel.basis}
                  </div>
                </>
              )}
              <button
                onClick={() => { setPicked(null); setPickedRel(null); }}
                style={{
                  marginTop: 10, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11,
                  border: '1px solid rgba(148,163,184,0.3)', background: 'transparent',
                  color: 'var(--w-slate-400, #94a3b8)',
                }}
              >
                닫기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 층별 아래 패널 ────────────────────────────────────── */}
      {layer === 'catch' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {flagSplit.map((f) => (
              <div
                key={f.company}
                style={{
                  padding: '8px 11px', borderRadius: 8, fontSize: 12,
                  border: '1px solid rgba(79,176,165,0.28)', background: 'rgba(79,176,165,0.07)',
                  color: 'var(--w-slate-300, #cbd5e1)',
                }}
              >
                <b>{nodeIndex.get(f.company)?.label ?? f.company}</b>{' '}
                {f.real.length > 0
                  ? f.real.map((x) => `${x.country} ${x.count}`).join(' · ')
                  : <span style={{ opacity: 0.6 }}>기국 표기 없음</span>}
                {f.other.length > 0 && (
                  <span style={{ color: '#e8b45f' }}>
                    {' '}· 기국 아님({f.other.map((x) => `${x.country} ${x.count}`).join(' · ')})
                  </span>
                )}
                {f.note && (
                  <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: '#e8b45f' }}>
                    {f.note}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#e8b45f', lineHeight: 1.7 }}>
            배를 바다에 찍지 않았다. 서른세 편 어디에도 <b>모항이 없고</b> 있는 것은 기국뿐이다 —
            기국은 배가 어디서 조업하는지가 아니라 어느 나라 깃발을 다는지다.{' '}
            <b>노란 칸은 기국이 아니다</b> — 편이 등록부 이름(WCPFC 등록·ICCAT 비활성)이나
            소유 구분(해외 자회사·합작)으로만 적은 것이라 나라로 세면 안 된다.
          </p>
          <div
            style={{
              padding: '11px 13px', borderRadius: 8, fontSize: 12.5, lineHeight: 1.75,
              border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(148,163,184,0.05)',
              color: 'var(--w-slate-300, #cbd5e1)',
            }}
          >
            <b>자사 명의 등재가 0척인 회사가 {NO_FLEET.length}곳이다.</b>{' '}
            {NO_FLEET.map((n) => nodeIndex.get(n.company)?.label ?? n.company).join(' · ')}.
            근거는 회사마다 다르다 — 「RFMO 자사 명의 0척」·「선박명부 등재 0척」처럼
            <b> 등록부의 부재</b>이지 소유의 부재가 아니다. FCF는 협력 공급 어선이 600척 넘는다.
            {fleetSilent.length > 0 && (
              <>
                {' '}그리고 <b>선단 정보가 아예 없는 회사가 {fleetSilent.length}곳</b> 더 있다 —{' '}
                {fleetSilent.map((p) => nodeIndex.get(p.company)?.label ?? p.company).join(' · ')}.
                빈칸을 채우지 않았다.
              </>
            )}
          </div>
        </div>
      )}

      {layer === 'make' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--w-slate-400, #94a3b8)', lineHeight: 1.75 }}>
            원의 크기는 <b>인력·캐파 값이 확정된 거점</b>에만 붙였다. 단위가 다른 값끼리는 견주지 않는다 —
            명(인력)과 톤/년(캐파)과 MT/일(일산)은 서로 다른 자다.
            본사 핀은 회색 작은 점이고 <b>크기를 갖지 않는다</b>.
            그리고 크기는 <b>같은 단위끼리만</b> 정규화한다 — 명·톤/년·MT/일을 한 자로 재면
            단위가 큰 쪽이 무조건 커진다.
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: '#e8b45f', lineHeight: 1.75 }}>
            <b>이 층의 점 {points.length}개 가운데 {points.filter((p) => !isProduction(p)).length}개는
            캔을 만드는 곳이 아니다</b> —{' '}
            {points.filter((p) => !isProduction(p)).map((p) => p.label).join(' · ')} 는
            트레이딩·구매 법인이다. 상세 카드에도 그렇게 적는다.
          </p>
          <div
            style={{
              padding: '11px 13px', borderRadius: 8, fontSize: 12.5, lineHeight: 1.75,
              border: '1px solid rgba(223,160,133,0.28)', background: 'rgba(223,160,133,0.07)',
              color: 'var(--w-slate-300, #cbd5e1)',
            }}
          >
            <b>위치가 확인되지 않은 공장은 찍지 않았다.</b>{' '}
            {UNLOCATED_PLANTS.map((u) => `${nodeIndex.get(u.company)?.label ?? u.company} ${u.count}곳`).join(' · ')}.
            지도에 올리면 없는 정밀도를 만든다.
          </div>
        </div>
      )}

      {layer === 'capital' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--w-slate-400, #94a3b8)', lineHeight: 1.75 }}>
            화면에 그려진 지분선 {drawn.total}개, 그중 <b>국경을 넘는 것이 {drawn.cross}개</b>다
            (원장에는 {EQUITY_RELATIONS.length}개가 있고 양 끝 좌표가 같은 것은 그리지 않는다).
            선을 클릭하면 근거와 함께 <b>그 관계로 하면 안 되는 말</b>이 뜬다.
          </p>
          <div
            style={{
              padding: '11px 13px', borderRadius: 8, fontSize: 12.5, lineHeight: 1.75,
              border: '1px solid rgba(192,138,62,0.28)', background: 'rgba(192,138,62,0.07)',
              color: 'var(--w-slate-300, #cbd5e1)',
            }}
          >
            대만 회사가 미국 브랜드를 갖고, 한국 회사가 미국령 사모아에서 캔을 만들며,
            이탈리아 그룹이 스페인 캐너리의 40%를 쥔다.{' '}
            <b>회색은 {drawn.grey}개</b>다 — 1989년 태국 인수는 파산으로 끝났고,
            2025년 일본 상사의 <b>지분 확대분</b>은 응모 미달로 무산됐다
            (그 회사의 6.19%는 1992년부터 살아 있다 — 무산된 것은 확대분이다).
            나머지 {drawn.unconfirmedLive}개는 끝난 것이 아니라 <b>근거가 미확인</b>인 관계다.
          </div>
        </div>
      )}

      {layer === 'ours' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: 'var(--w-slate-400, #94a3b8)' }}>공급선 명단 연도</span>
            {LIST_TIMELINE.map((t) => {
              const on = t.year === year;
              return (
                <button
                  key={t.year}
                  onClick={() => setYear(t.year)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                    border: `1px solid ${on ? '#C25B4E' : 'rgba(148,163,184,0.28)'}`,
                    background: on ? 'rgba(194,91,78,0.16)' : 'transparent',
                    color: on ? '#e9a99f' : 'var(--w-slate-400, #94a3b8)',
                    fontWeight: on ? 700 : 500,
                  }}
                >
                  {t.year}
                </button>
              );
            })}
            <span style={{ fontSize: 12.5, color: '#e9a99f' }}>
              명단 등재 <b>{timelineNow?.silla ?? 0}척</b>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--w-slate-400, #94a3b8)', lineHeight: 1.75 }}>
            {timelineNow?.note}
          </p>
          <div
            style={{
              padding: '11px 13px', borderRadius: 8, fontSize: 12.5, lineHeight: 1.75,
              border: '1px solid rgba(194,91,78,0.28)', background: 'rgba(194,91,78,0.07)',
              color: 'var(--w-slate-300, #cbd5e1)',
            }}
          >
            <b>시간축은 이 층에만 있다.</b> 확정된 시계열이 공급선 명단 하나뿐이라,
            다른 층에 연도 스크럽바를 붙이면 없는 시계열을 만드는 것이 된다.
            <br />
            <b>이 숫자는 보유 선박 수가 아니라 명단에 오른 척수다.</b> 0인 해는 배가 없었던 해가
            아니라 그 판에 우리 계열 표기가 없던 해다. 그리고 2024→2025 에 분모가 399 → 964로
            2.4배가 된 것은 배가 는 것이 아니라 <b>명단의 범위가 넓어진 것</b>이라,
            두 해의 등재 척수를 그대로 견주면 안 된다.
          </div>
        </div>
      )}

      <p style={{ margin: 0, fontSize: 11.5, color: 'var(--w-slate-500, #64748b)', lineHeight: 1.7 }}>
        점 {ALL_POINTS.length}개 · 관계 {ALL_RELATIONS.length}개.
        좌표는 도시 중심의 근사치이고 부두·공장의 정확한 위치가 아니다.
        어장 경계는 그리지 않았다 — 관할 경계 폴리곤이 자료에 없다.
      </p>
    </div>
  );
}
