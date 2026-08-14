# UI_RULES V2 초안 — Deep Sea Command (2026-08-15)

> **상태**: 초안. Phase 3 완료 시 `UI_RULES.md`에 병합하고 본 파일 삭제.
> **원칙**: V1 룰은 명시된 것만 바뀐다. 아래 「불변」 목록이 우선한다.

## 불변 (V1 그대로)

- 다크 글래스모피즘 War Room 컨셉 (D-03) — 배경만 `--dsc-bg`(#0A141D)로 반 단계 심화
- 시그니처 그라디언트 commodity 1:1 매핑 (D-04) — 팔레트 변경 없음, 용법만 확장
- TakeawayBox 2-Step(SIT/TAK), TermTooltip, 한글 100%(L-01), X축 7자(D-05), W-04 체크리스트
- Recharts ResponsiveContainer, `.toLocaleString()`, 단위 기호 결합
- Lucide 아이콘, 호버 리프트 `translateY(-2px)` + Glow

## 신설

### 1. 히어로 존 (페이지당 정확히 1개)

| 유형 | 적용 | 컴포넌트 |
| --- | --- | --- |
| A. Vessel Ops | /fleet /unloading | `HeroZone variant="vessel"` |
| B. Live Map | /logistics | `HeroZone variant="map"` |
| C. Executive KPI | /market + commodity 전체 | `HeroZone variant="kpi"` |

- 배경(이미지·지도)은 슬롯 — Grok 이미지 ↔ SVG 폴백 교체 가능해야 함
- 경고 패널의 권고 줄은 기존 위젯 TAK 재사용 (새 데이터 계약 금지)

### 2. 타이포 계층 (Twisty 웨이트 대비)

- 페이지 타이틀: `--dsc-title-size`(48-64px) / 웨이트 250 — 히어로 위에 직접
- KPI 주인공: `--dsc-kpi-size`(56-72px) / 웨이트 700 / `tabular-nums` / 단위 18px 병기
- 명조·세리프 헤드라인 금지 (War Room 톤 충돌)

### 3. 페이지 구조 규칙

```
페이지 = HeroZone 1 + 핵심 카드 4-6 + PillTabs(5-Pillar) 계층화
```

- 필 탭 키는 Universal 5-Pillar 고정 (S1-S5)
- 핵심 카드 선정 기준: LIVE/SYNCED 우선, C레벨 의사결정 직결 순
- 나머지 위젯은 탭 뒤로 — 삭제 금지 (W-04 자산 보존)

### 4. 모션 토큰 (신설, 전부 `prefers-reduced-motion` 존중)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--dsc-stagger` | 60ms | 카드 진입 순차 |
| `--dsc-breathe` | 3600ms | 히어로 발광 숨쉬기 |
| `--dsc-lift` | -2px | 호버 리프트 (V1 계승) |
| KPI 카운트업 | 1.4s | react-countup, reduce 시 즉시 표시 |

### 5. 발광 액센트 용법

- `--dsc-glow-cyan/amber/rose` — 데이터 연동 하이라이트 전용 (Raktor 화물칸 문법)
- 장식 목적 발광 금지 — 발광 = "지금 살아있는 데이터"라는 의미 부여
- 예: 하역량→해치 글로우, LIVE 배지 펄스, 활성 탭

### 6. V2 컴포넌트 위치

- `components/v2/HeroZone.tsx` · `components/v2/PillTabs.tsx`
- V2 전환 전 페이지는 V1 규칙 그대로 — 혼재 기간 중 페이지 단위로만 전환 (위젯 단위 혼용 금지)
