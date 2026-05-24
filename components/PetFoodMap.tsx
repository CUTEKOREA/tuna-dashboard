'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './PetFoodMap.module.css';
import { Map, Store, Info, Target, Stethoscope, Pill, Scissors, ArrowLeft, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

/* ═══════════════════════════════════════════════
   Category Config — single source of truth
   ═══════════════════════════════════════════════ */
const CATEGORIES = [
  { key: '전체',       icon: '🗺️', color: '#38bdf8', label: '전체 시설' },
  { key: '동물병원',   icon: '🏥', color: 'var(--color-danger)', label: '동물병원' },
  { key: '동물약국',   icon: '💊', color: 'var(--color-success)', label: '동물약국' },
  { key: '동물미용업', icon: '✂️', color: 'var(--color-warning)', label: '동물미용업' },
] as const;

const COLOR_RAMPS: Record<string, string[]> = {
  '전체':       ['rgba(0, 0, 0, 0.2)', 'rgba(56,189,248,0.2)', 'rgba(56,189,248,0.4)', 'rgba(14,165,233,0.7)', 'rgba(2,132,199,1)'],
  '동물병원':   ['rgba(0, 0, 0, 0.2)', 'rgba(239,68,68,0.15)', 'rgba(239,68,68,0.35)', 'rgba(220,38,38,0.65)', 'rgba(185,28,28,1)'],
  '동물약국':   ['rgba(0, 0, 0, 0.2)', 'rgba(16,185,129,0.15)', 'rgba(16,185,129,0.35)', 'rgba(5,150,105,0.65)', 'rgba(4,120,87,1)'],
  '동물미용업': ['rgba(0, 0, 0, 0.2)', 'rgba(245,158,11,0.15)', 'rgba(245,158,11,0.35)', 'rgba(217,119,6,0.65)', 'rgba(180,83,9,1)'],
};

const CATEGORY_ACCENT: Record<string, string> = {
  '동물병원': 'var(--color-danger)', '동물약국': 'var(--color-success)', '동물미용업': 'var(--color-warning)',
};

/* ═══════════════════════════════════════════════ */

export default function PetFoodMap() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [municipalitiesGeoJson, setMunicipalitiesGeoJson] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');

  /* ── Compute national stats once data loads ── */
  const nationalStats = useMemo(() => {
    if (!data) return { total: 0, hospital: 0, pharmacy: 0, grooming: 0 };
    let hospital = 0, pharmacy = 0, grooming = 0;
    Object.values(data.details || {}).forEach((prov: any) => {
      Object.values(prov).forEach((list: any) => {
        list.forEach((item: any) => {
          if (item.category === '동물병원') hospital++;
          else if (item.category === '동물약국') pharmacy++;
          else if (item.category === '동물미용업') grooming++;
        });
      });
    });
    return { total: hospital + pharmacy + grooming, hospital, pharmacy, grooming };
  }, [data]);

  /* ── Compute region-level stats (province or municipality) ── */
  const regionStats = useMemo(() => {
    if (!data || !selectedProvince) return null;
    const provDetails = data.details[selectedProvince] || {};
    let hospital = 0, pharmacy = 0, grooming = 0;
    if (selectedMunicipality) {
      const list = provDetails[selectedMunicipality] || [];
      list.forEach((item: any) => {
        if (item.category === '동물병원') hospital++;
        else if (item.category === '동물약국') pharmacy++;
        else if (item.category === '동물미용업') grooming++;
      });
    } else {
      Object.values(provDetails).forEach((list: any) => {
        list.forEach((item: any) => {
          if (item.category === '동물병원') hospital++;
          else if (item.category === '동물약국') pharmacy++;
          else if (item.category === '동물미용업') grooming++;
        });
      });
    }
    return { total: hospital + pharmacy + grooming, hospital, pharmacy, grooming };
  }, [data, selectedProvince, selectedMunicipality]);

  const displayStats = regionStats || nationalStats;

  /* ── Data fetching ── */
  useEffect(() => {
    Promise.all([
      fetch('https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_geo_simple.json').then(r => {
        if (!r.ok) throw new Error('GeoJSON fetch failed');
        return r.json();
      }),
      fetch('https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_geo_simple.json').then(r => {
        if (!r.ok) throw new Error('Municipalities GeoJSON fetch failed');
        return r.json();
      }),
      fetch('/data/petfood_regional_dashboard.json').then(r => {
        if (!r.ok) throw new Error('Data fetch failed');
        return r.json();
      })
    ]).then(([geo, muniGeo, petfoodData]) => {
      setGeoJson(geo);
      setMunicipalitiesGeoJson(muniGeo);
      setData(petfoodData);
    }).catch(err => {
      console.error('Failed to load map data:', err);
      setData({ counts: {}, municipality_counts: {}, details: {} });
    });
  }, []);

  /* ── ECharts rendering ── */
  useEffect(() => {
    if (!data || !geoJson || !municipalitiesGeoJson || !chartRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';
    script.async = true;
    script.onload = () => {
      const echarts = (window as any).echarts;
      const myChart = echarts.init(chartRef.current);
      
      let currentMapName = 'korea';
      let chartData: any[] = [];

      if (!selectedProvince) {
        echarts.registerMap('korea', geoJson);
        if (categoryFilter === '전체') {
          chartData = Object.keys(data.counts || {}).map(key => ({
            name: key, value: data.counts[key]
          }));
        } else {
          chartData = Object.keys(data.details || {}).map(pName => {
            const munis = data.details[pName] || {};
            let count = 0;
            Object.values(munis).forEach((list: any) => {
              count += list.filter((r: any) => r.category === categoryFilter).length;
            });
            return { name: pName, value: count };
          });
        }
      } else {
        const provinceFeature = geoJson.features.find((f: any) => f.properties.name === selectedProvince);
        if (provinceFeature) {
          const pCode = provinceFeature.properties.code;
          const filteredFeatures = municipalitiesGeoJson.features.filter((f: any) => f.properties.code.startsWith(pCode));
          echarts.registerMap('province', { type: 'FeatureCollection', features: filteredFeatures });
          currentMapName = 'province';
          
          if (categoryFilter === '전체') {
            const muniCounts = data.municipality_counts?.[selectedProvince] || {};
            chartData = Object.keys(muniCounts).map(key => ({
              name: key, value: muniCounts[key]
            }));
          } else {
            const munis = data.details[selectedProvince] || {};
            chartData = Object.keys(munis).map(key => {
              const list = munis[key] || [];
              return { name: key, value: list.filter((r: any) => r.category === categoryFilter).length };
            });
          }
        }
      }

      const maxVal = chartData.length > 0 ? Math.max(10, ...chartData.map(d => d.value)) : 5000;
      const accentColor = CATEGORY_ACCENT[categoryFilter] || '#38bdf8';

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#0F172A',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          padding: [12, 16],
          textStyle: { color: '#f8fafc', fontSize: 13 },
          formatter(params: any) {
            const val = params.value ? params.value.toLocaleString() : '0';
            const catLabel = categoryFilter === '전체' ? '반려동물 시설' : categoryFilter;
            const hint = !selectedProvince ? '클릭 → 시/군/구 드릴다운' : '클릭 → 시설 목록 보기';
            return `<div style="font-weight:700;font-size:14px;margin-bottom:6px">${params.name}</div>` +
              `<div style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${accentColor}"></span>${catLabel}: <b>${val}</b>개</div>` +
              `<div style="color:#64748b;font-size:11px;margin-top:6px">${hint}</div>`;
          }
        },
        visualMap: {
          min: 0, max: maxVal,
          left: 'left', bottom: 'bottom',
          text: ['밀집', '희소'],
          calculable: true,
          textStyle: { color: '#94a3b8', fontSize: 11 },
          inRange: { color: COLOR_RAMPS[categoryFilter] || COLOR_RAMPS['전체'] }
        },
        series: [{
          name: '반려동물 시설 수',
          type: 'map',
          map: currentMapName,
          roam: true,
          itemStyle: {
            areaColor: 'rgba(30, 41, 59, 0.3)',
            borderColor: `${accentColor}33`,
            borderWidth: 1,
            shadowColor: `${accentColor}22`,
            shadowBlur: 8
          },
          emphasis: {
            label: { show: true, color: 'var(--text-primary)', fontWeight: 'bold', fontSize: 13 },
            itemStyle: {
              areaColor: `${accentColor}88`,
              borderColor: 'var(--text-primary)',
              borderWidth: 2,
              shadowColor: `${accentColor}aa`,
              shadowBlur: 20
            }
          },
          data: chartData
        }]
      };

      myChart.setOption(option, true);

      myChart.on('click', (params: any) => {
        if (!selectedProvince) {
          setSelectedProvince(params.name);
          setSelectedMunicipality(null);
          setRestaurants([]);
        } else {
          setSelectedMunicipality(params.name);
          setRestaurants(data.details[selectedProvince]?.[params.name] || []);
        }
      });

      const handleResize = () => myChart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        myChart.dispose();
      };
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [data, geoJson, municipalitiesGeoJson, selectedProvince, categoryFilter]);

  /* ── Helpers ── */
  const getCategoryItemClass = (category: string) => {
    if (category === '동물병원') return styles.restaurantItemHospital;
    if (category === '동물약국') return styles.restaurantItemPharmacy;
    if (category === '동물미용업') return styles.restaurantItemGrooming;
    return '';
  };

  const getCategoryBadgeClass = (category: string) => {
    if (category === '동물병원') return styles.restCategoryHospital;
    if (category === '동물약국') return styles.restCategoryPharmacy;
    if (category === '동물미용업') return styles.restCategoryGrooming;
    return '';
  };

  const getFilterActiveClass = (cat: string) => {
    if (categoryFilter !== cat) return '';
    if (cat === '동물병원') return styles.filterBtnHospital;
    if (cat === '동물약국') return styles.filterBtnPharmacy;
    if (cat === '동물미용업') return styles.filterBtnGrooming;
    return styles.filterBtnActive;
  };

  const getCategoryIcon = (category: string) => {
    if (category === '동물병원') return <Stethoscope size={13} color="var(--color-danger)" />;
    if (category === '동물약국') return <Pill size={13} color="var(--color-success)" />;
    return <Scissors size={13} color="var(--color-warning)" />;
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => categoryFilter === '전체' || r.category === categoryFilter);
  }, [restaurants, categoryFilter]);

  const locationLabel = selectedProvince && selectedMunicipality 
    ? `${selectedProvince} ${selectedMunicipality}` 
    : selectedProvince || '전국';

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.headerRow}>
        <h3 className={styles.title}>
          <Map size={20} color="#38bdf8" />
          전국 반려동물 인프라 매핑 — B2B 유통 거점 분석
        </h3>
        <p className={styles.subtitle}>
          전국 {nationalStats.total.toLocaleString()}개 시설의 공간 분포를 분석하여 펫푸드 유통 최적 거점을 도출합니다. 
          지도를 클릭하면 시/도 → 시/군/구 → 개별 시설 순으로 드릴다운됩니다.
        </p>

        {/* ── Category Filters ── */}
        <div className={styles.filterContainer}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`${styles.filterBtn} ${getFilterActiveClass(cat.key)}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Stats Bar ── */}
      <div className={styles.summaryBar}>
        {[
          { label: '전체 시설', value: displayStats.total, icon: '🗺️', cls: styles.statCardAll },
          { label: '동물병원', value: displayStats.hospital, icon: '🏥', cls: styles.statCardHospital },
          { label: '동물약국', value: displayStats.pharmacy, icon: '💊', cls: styles.statCardPharmacy },
          { label: '동물미용업', value: displayStats.grooming, icon: '✂️', cls: styles.statCardGrooming },
        ].map(s => (
          <div key={s.label} className={`${styles.statCard} ${s.cls}`}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value.toLocaleString()}</div>
            <div className={styles.statLabel}>{locationLabel} · {s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Map + Detail Panel ── */}
      <div className={styles.mainLayout}>
        <div className={styles.mapSection}>
          {!data && <div className={styles.loading}>데이터를 불러오는 중...</div>}
          
          {selectedProvince && (
            <button 
              onClick={() => {
                setSelectedProvince(null);
                setSelectedMunicipality(null);
                setRestaurants([]);
              }}
              className={styles.backBtn}
            >
              <ArrowLeft size={14} />
              <span>전국 지도로 돌아가기</span>
            </button>
          )}

          <div ref={chartRef} className={styles.chartArea} />
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailHeader}>
            {selectedProvince && selectedMunicipality 
              ? <span><BarChart3 size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />{selectedProvince} {selectedMunicipality}</span>
              : selectedProvince 
                ? `${selectedProvince}의 시/군/구를 선택하세요`
                : '지도에서 지역을 선택하세요'}
            {selectedMunicipality && <span className={styles.badge}>총 {filteredRestaurants.length}개</span>}
          </div>
          
          <div className={styles.detailList}>
            {!selectedMunicipality ? (
              <div className={styles.emptyState}>
                <Info size={28} color="#475569" />
                {selectedProvince 
                  ? '지도에서 시/군/구를 클릭하면 해당 지역의 시설 목록이 표시됩니다.' 
                  : '좌측 지도에서 시/도를 클릭하여 지역별 반려동물 인프라를 탐색하세요.'}
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className={styles.emptyState}>
                해당 지역에는 영업 중인 {categoryFilter === '전체' ? '반려동물 시설' : categoryFilter}이(가) 없습니다.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredRestaurants.map((rest, idx) => (
                  <motion.div 
                    key={`${rest.name}-${idx}`} 
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.015, 1) }}
                    className={`${styles.restaurantItem} ${getCategoryItemClass(rest.category)}`}
                  >
                    <div className={styles.restName}>
                      {getCategoryIcon(rest.category)} {rest.name}
                    </div>
                    <span className={`${styles.restCategory} ${getCategoryBadgeClass(rest.category)}`}>
                      {rest.category || '기타'}
                    </span>
                    <div className={styles.restInfo}>📍 {rest.address}</div>
                    {rest.size && rest.size !== '0.0' && (
                      <div className={styles.restInfo}>📐 {rest.size}㎡</div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
         STRATEGY SECTION — Data-driven insights
         ═══════════════════════════════════════════════ */}
      <div className={styles.strategyGrid}>
        <h3 className={styles.strategyHeader}>
          <Target size={20} color="var(--color-warning)" />
          펫푸드 B2B 유통 채널 진입 전략 — 시설 데이터 기반 분석
        </h3>
        <div className={styles.strategyCols}>
          {/* Strategy 1: 동물병원 */}
          <div className={`${styles.strategyCard} ${styles.strategyCardHospital}`}>
            <div className={`${styles.strategyStep} ${styles.stepHospital}`}>1</div>
            <div className={styles.strategyColTitle}>
              <Stethoscope size={16} color="var(--color-danger)" />
              동물병원 — 처방식 프리미엄 허브
            </div>
            <div className={`${styles.strategyKpi} ${styles.kpiHospital}`}>
              {nationalStats.hospital.toLocaleString()}개
            </div>
            <div className={styles.strategyColText}>
              전국 {nationalStats.hospital.toLocaleString()}개 동물병원은 펫푸드 시장에서 
              <span className={styles.highlightRed}> 가장 높은 객단가</span>를 형성하는 채널입니다. 
              수의사의 처방·추천이 구매를 결정하는 구조이므로, 한 번 입점하면 
              <span className={styles.highlightRed}> 브랜드 전환율이 극히 낮은 Lock-in</span> 효과가 발생합니다.
            </div>
            <div className={styles.strategyAction}>
              <div className={styles.actionLabel}>핵심 실행안</div>
              참치 원물 기반 <b>신장 케어 처방식</b>을 개발하여 수의사 채널 독점 공급. 
              EPA/DHA 함량을 전면에 내세운 임상 데이터 마케팅으로 수의사 신뢰를 확보하고, 
              병원당 월 정기배송 B2B 구독 모델을 설계합니다.
            </div>
          </div>

          {/* Strategy 2: 동물약국 */}
          <div className={`${styles.strategyCard} ${styles.strategyCardPharmacy}`}>
            <div className={`${styles.strategyStep} ${styles.stepPharmacy}`}>2</div>
            <div className={styles.strategyColTitle}>
              <Pill size={16} color="var(--color-success)" />
              동물약국 — 기능성 영양제 메가 채널
            </div>
            <div className={`${styles.strategyKpi} ${styles.kpiPharmacy}`}>
              {nationalStats.pharmacy.toLocaleString()}개
            </div>
            <div className={styles.strategyColText}>
              <span className={styles.highlightGreen}>{nationalStats.pharmacy.toLocaleString()}개로 가장 많은 시설 수</span>를 보유한 
              동물약국은 처방전 없이 방문 가능한 접근성과 약사의 전문 상담이 결합된 
              <span className={styles.highlightGreen}> 기능성 제품의 최대 유통망</span>입니다. 
              병원 대비 {(nationalStats.pharmacy / Math.max(nationalStats.hospital, 1)).toFixed(1)}배 많은 
              터치포인트를 확보할 수 있습니다.
            </div>
            <div className={styles.strategyAction}>
              <div className={styles.actionLabel}>핵심 실행안</div>
              참치 유래 <b>오메가-3 관절/피모 영양제</b>를 약국 전용 라벨로 기획하여 
              약사 상담 동선에 배치. &quot;처방전 없이 살 수 있는 프리미엄&quot; 포지셔닝으로 
              병원 채널과 가격 충돌을 회피하면서 볼륨을 확보합니다.
            </div>
          </div>

          {/* Strategy 3: 동물미용업 */}
          <div className={`${styles.strategyCard} ${styles.strategyCardGrooming}`}>
            <div className={`${styles.strategyStep} ${styles.stepGrooming}`}>3</div>
            <div className={styles.strategyColTitle}>
              <Scissors size={16} color="var(--color-warning)" />
              동물미용업 — 충동구매 간식 파이프라인
            </div>
            <div className={`${styles.strategyKpi} ${styles.kpiGrooming}`}>
              {nationalStats.grooming.toLocaleString()}개
            </div>
            <div className={styles.strategyColText}>
              {nationalStats.grooming.toLocaleString()}개 미용샵은 반려인이 
              <span className={styles.highlightAmber}> 평균 1~2시간 체류</span>하는 유일한 오프라인 접점입니다. 
              대기 시간 동안의 자연스러운 노출은 온라인에서 불가능한 
              <span className={styles.highlightAmber}> 시식 → 즉시 구매</span> 전환을 가능하게 합니다.
            </div>
            <div className={styles.strategyAction}>
              <div className={styles.actionLabel}>핵심 실행안</div>
              참치 저키·동결건조 간식을 <b>소포장(30g) POP 디스플레이</b>로 제공하여 
              카운터 충동구매를 유도. 미용사에게 건당 수수료(15~20%)를 지급하는 
              커미션 모델로 자발적 추천을 이끌어냅니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
