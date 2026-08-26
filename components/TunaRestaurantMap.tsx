'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './TunaRestaurantMap.module.css';
import { Map, Store, Info, Target, TrendingUp, ShoppingCart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import { TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

echarts.use([MapChart, TooltipComponent, VisualMapComponent, CanvasRenderer]);

export default function TunaRestaurantMap() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [data, setData] = useState<any>(null);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [municipalitiesGeoJson, setMunicipalitiesGeoJson] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);

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
      fetch('/data/tuna_regional_dashboard.json').then(r => {
        if (!r.ok) throw new Error('Data fetch failed');
        return r.json();
      })
    ]).then(([geo, muniGeo, tunaData]) => {
      setGeoJson(geo);
      setMunicipalitiesGeoJson(muniGeo);
      setData(tunaData);
    }).catch(err => {
      console.error('Failed to load map data:', err);
      setData({ counts: {}, municipality_counts: {}, details: {} });
    });
  }, []);

  useEffect(() => {
    if (!data || !geoJson || !municipalitiesGeoJson || !chartRef.current) return;

    const container = chartRef.current;

    const initChart = () => {
      // Dispose previous instance before creating new
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }

      // Guard: only init when container has valid dimensions
      if (container.clientWidth <= 0 || container.clientHeight <= 0) return;

      const myChart = echarts.init(container);
      chartInstance.current = myChart;
      
      let currentMapName = 'restaurant-korea';
      let chartData: any[] = [];
      let maxVal = 500;

      if (!selectedProvince) {
        echarts.registerMap('restaurant-korea', geoJson as any);
        chartData = Object.keys(data.counts || {}).map(key => ({
          name: key,
          value: data.counts[key]
        }));
      } else {
        const provinceFeature = geoJson.features.find((f: any) => f.properties.name === selectedProvince);
        if (provinceFeature) {
          const pCode = provinceFeature.properties.code;
          const filteredFeatures = municipalitiesGeoJson.features.filter((f: any) => f.properties.code.startsWith(pCode));
          const customGeoJson = { type: 'FeatureCollection', features: filteredFeatures };
          echarts.registerMap('restaurant-province', customGeoJson as any);
          currentMapName = 'restaurant-province';
          
          const muniCounts = data.municipality_counts?.[selectedProvince] || {};
          chartData = Object.keys(muniCounts).map(key => ({
            name: key,
            value: muniCounts[key]
          }));
          maxVal = Math.max(10, ...chartData.map(d => d.value));
        }
      }

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#0F172A',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          textStyle: { color: '#f8fafc' },
          formatter: function(params: any) {
            const val = params.value ? params.value + '개' : '0개';
            if (!selectedProvince) {
               return `<strong>${params.name}</strong><br/>영업 중인 참치 식당: ${val}<br/><span style="color:var(--w-slate-400);font-size:11px">클릭하여 시/군/구 보기</span>`;
            } else {
               return `<strong>${params.name}</strong><br/>영업 중인 참치 식당: ${val}<br/><span style="color:var(--w-slate-400);font-size:11px">클릭하여 세부 목록 보기</span>`;
            }
          }
        },
        visualMap: {
          min: 0,
          max: maxVal,
          left: 'left',
          bottom: 'bottom',
          text: ['많음', '적음'],
          calculable: true,
          textStyle: { color: '#cbd5e1' },
          inRange: {
            color: [
              'rgba(0, 0, 0, 0.2)', 
              'rgba(244, 114, 182, 0.2)',
              'rgba(236, 72, 153, 0.4)', 
              'rgba(219, 39, 119, 0.7)', 
              'rgba(190, 24, 93, 1)'
            ]
          }
        },
        series: [
          {
            name: '참치 식당 수',
            type: 'map',
            map: currentMapName,
            roam: true,
            itemStyle: {
              areaColor: 'rgba(30, 41, 59, 0.3)',
              borderColor: 'rgba(244, 114, 182, 0.3)',
              borderWidth: 1,
              shadowColor: 'rgba(244, 114, 182, 0.2)',
              shadowBlur: 10
            },
            emphasis: {
              label: { show: true, color: 'var(--text-primary)' },
              itemStyle: {
                areaColor: 'rgba(244, 114, 182, 0.6)',
                borderColor: 'var(--text-primary)',
                borderWidth: 2,
                shadowColor: 'rgba(244, 114, 182, 0.8)',
                shadowBlur: 15
              }
            },
            data: chartData
          }
        ]
      };

      myChart.setOption(option, true);

      myChart.on('click', (params: any) => {
        const regionName = params.name;
        if (!selectedProvince) {
          setSelectedProvince(regionName);
          setSelectedMunicipality(null);
          setRestaurants([]);
        } else {
          setSelectedMunicipality(regionName);
          setRestaurants(data.details[selectedProvince]?.[regionName] || []);
        }
      });
    };

    // Use ResizeObserver to detect when container gets valid dimensions
    const ro = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        if (!chartInstance.current) {
          initChart();
        } else {
          chartInstance.current.resize();
        }
      }
    });
    ro.observe(container);

    // Also try init immediately if already sized
    initChart();

    return () => {
      ro.disconnect();
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data, geoJson, municipalitiesGeoJson, selectedProvince]);

  const getSizeBadge = (size: string | number | null) => {
    if (!size) return { label: '정보 없음', color: '#64748b', bg: 'rgba(100,116,139,0.15)' };
    const s = typeof size === 'string' ? parseFloat(size) : size;
    if (s >= 200) return { label: '대형', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.15)' };
    if (s >= 80) return { label: '중형', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.15)' };
    return { label: '소형', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.15)' };
  };

  const totalRestaurants = data ? Object.values(data.counts || {}).reduce((a: number, b: any) => a + b, 0) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>
          <Map size={20} />
          <span className={styles.titleGradient}>전국 참치 전문점 영업 현황 매핑</span>
          <span className={styles.totalBadge}>{totalRestaurants.toLocaleString()}개</span>
        </h3>
        <p className={styles.subtitle}>
          지도에서 지역을 클릭하면 세부 매장 리스트가 나타납니다. · 출처: 
          <TermTooltip term="지방행정 인허가 데이터" description="행정안전부 지방행정 인허가 데이터 개방 시스템에서 '일식(참치)' 카테고리로 추출한 전국 영업 중(영업/정상) 사업장 데이터입니다. 폐업/취소/만료 업체는 제외되었습니다." />
        </p>
      </div>

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
              className={styles.backButton}
            >
              <span>← 전국 지도로 돌아가기</span>
            </button>
          )}

          <div ref={chartRef} className={styles.chartArea} />
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailHeader}>
            {selectedProvince && selectedMunicipality 
              ? `${selectedProvince} ${selectedMunicipality} 상세 정보` 
              : selectedProvince 
                ? `${selectedProvince}의 시/군/구를 선택해주세요`
                : '지역을 선택해주세요'}
            {selectedMunicipality && <span className={styles.badge}>총 {restaurants.length}개</span>}
          </div>
          
          <div className={styles.detailList}>
            {!selectedMunicipality ? (
              <div className={styles.emptyState}>
                <Info size={32} color="#475569" style={{marginBottom: '1rem'}} />
                {selectedProvince ? '지도에서 세부 시/군/구를 클릭하세요.' : '좌측 지도에서 지역(예: 서울특별시)을 클릭하세요.'}
              </div>
            ) : restaurants.length === 0 ? (
              <div className={styles.emptyState}>해당 지역에는 영업 중인 식당 데이터가 없습니다.</div>
            ) : (
              <AnimatePresence mode="popLayout">
                {restaurants.map((rest, idx) => {
                  const sizeBadge = getSizeBadge(rest.size);
                  return (
                    <motion.div 
                      key={`${rest.name}-${idx}`} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 1.5) }}
                      className={styles.restaurantItem}
                    >
                      <div className={styles.restName}>
                        <Store size={14} color="#ec4899" /> {rest.name}
                      </div>
                      <div className={styles.restBadgeRow}>
                        <span className={styles.restCategory}>{rest.category || '기타'}</span>
                        <span className={styles.sizeBadge} style={{ color: sizeBadge.color, background: sizeBadge.bg }}>
                          {sizeBadge.label} {rest.size ? `(${parseFloat(rest.size).toLocaleString()}㎡)` : ''}
                        </span>
                      </div>
                      <div className={styles.restInfo}>📍 {rest.address}</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* TakeawayBox - 가이드라인 §2-1 준수 */}
      <div style={{ marginTop: '1.25rem' }}>
        <TakeawayBox
          source="행정안전부 지방행정 인허가 데이터 (2026년 4월 기준)"
          situation={`전국에서 영업 중인 참치 전문점은 총 ${totalRestaurants.toLocaleString()}개이며, 경기도(618개)와 서울(498개)이 전체의 50.4%를 차지합니다. 부산(123개)·인천(148개)·경남(112개) 등 항만도시에도 밀집되어 있어, 축양 참다랑어의 국내 B2B 수요 기반은 수도권+항만 축으로 뚜렷하게 형성되어 있습니다.`}
          actionPlan={
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--w-slate-200)', fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '4px' }}><strong>[1차 타겟]</strong> 서울 강남/중구/용산 + 경기 분당/판교 - 대형 오마카세/법인접대 상권 플래그십 직납</li>
              <li style={{ marginBottom: '4px' }}><strong>[2차 볼륨]</strong> 경기 평택/남양주/인천 남동 - 다점포 가성비 세트 물류 거점</li>
              <li><strong>[3차 지방]</strong> 광주 서구/전주 완산/경북 구미 - 지역 수산 도매상 독점 파트너십</li>
            </ul>
          }
        />
      </div>

      <div className={styles.strategyGrid}>
        <h3 className={styles.strategyHeader}>
          <Target size={20} color="var(--color-warning)" />
          국내 축양 참다랑어 2차 가공 <TermTooltip term="B2B 세일즈" description="Business-to-Business. 일반 소비자가 아닌, 참치 전문점·호텔·급식업체 등 사업자에게 직접 납품하는 기업 간 거래 모델입니다." /> 3단계 전략 (데이터 기반)
        </h3>
        <div className={styles.strategyCols}>
          <div>
            <div className={styles.strategyColTitle}>
              <TrendingUp size={16} color="var(--color-danger)" />
              1. 초고부가가치 플래그십 (프리미엄)
            </div>
            <div className={styles.strategyColText}>
              <span className={styles.highlight}>서울 강남구/중구, 경기 분당구</span>에 대형 참치전문점(&gt;100㎡)이 집중되어 있습니다.<br/><br/>
              <TermTooltip term="오도로" description="참다랑어 뱃살 중 가장 기름이 많은 최상급 부위입니다. kg당 단가가 가장 높으며, 오마카세 코스의 하이라이트로 쓰입니다." />/
              <TermTooltip term="가마도로" description="참다랑어 턱살 아래의 가장 희귀한 초프리미엄 부위로, 한 마리에서 극소량만 나옵니다." /> 등 <b>최고급 부위 맞춤형 사쿠(블록)</b>를 직납하여 하이엔드 오마카세와 법인 접대 상권을 장악합니다.
            </div>
          </div>
          <div>
            <div className={styles.strategyColTitle}>
              <ShoppingCart size={16} color="var(--color-info)" />
              2. 물류 거점화 다점포 공략 (볼륨)
            </div>
            <div className={styles.strategyColText}>
              <span className={styles.highlight}>경기 평택/남양주, 서울 강서, 인천 남동</span>은 참치집 밀집도가 가장 높은 &apos;볼륨 마켓&apos;입니다.<br/><br/>
              <TermTooltip term="아카미" description="참다랑어의 붉은살(적색육) 부위입니다. 지방이 적고 단백질이 풍부하며, 상대적으로 가격이 저렴하여 가성비 세트 구성에 활용됩니다." />/
              <TermTooltip term="쥬도로" description="참다랑어의 중간 뱃살(중간 지방) 부위입니다. 오도로보다 기름기가 적지만, 아카미보다 풍미가 있어 가성비와 맛의 균형이 좋습니다." /> 가성비 세트를 구성하고, 이들 지역을 <b>수도권 <TermTooltip term="RDC" description="Regional Distribution Center(지역 물류센터). 대형 메가 허브에서 받은 물량을 최종 배송지역에 맞춰 소분·재포장하는 중간 거점 물류센터입니다." /> 거점</b>으로 삼아 소포장 당일/새벽 배송을 뚫습니다.
            </div>
          </div>
          <div>
            <div className={styles.strategyColTitle}>
              <ShieldCheck size={16} color="var(--color-success)" />
              3. 지방 상권 독점 벤더 파트너십
            </div>
            <div className={styles.strategyColText}>
              <span className={styles.highlight}>광주 서구, 전주 완산구, 경북 구미</span>는 비수도권임에도 대형 참치집이 밀집된 핵심 상권입니다.<br/><br/>
              직접 콜드체인을 쏘기엔 운송비가 크므로, 이 지역들은 <b>상위 지역 수산 도매상(벤더)과 독점 파트너십</b>을 맺어 진입하는 것이 시장점유율 확보에 유리합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
