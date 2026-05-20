'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './ColdStorageMap.module.css';
import { Snowflake, Warehouse, Info, TrendingUp, Anchor, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import { TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

echarts.use([MapChart, TooltipComponent, VisualMapComponent, CanvasRenderer]);

// Cross-analysis: demand-supply gap data
const CROSS_ANALYSIS = [
  { province: '서울특별시', restaurants: 498, coldStorage: 9, ratio: 55.3, grade: 'critical' as const },
  { province: '대전광역시', restaurants: 67, coldStorage: 4, ratio: 16.8, grade: 'critical' as const },
  { province: '대구광역시', restaurants: 78, coldStorage: 10, ratio: 7.8, grade: 'warning' as const },
  { province: '울산광역시', restaurants: 31, coldStorage: 7, ratio: 4.4, grade: 'warning' as const },
  { province: '인천광역시', restaurants: 148, coldStorage: 45, ratio: 3.3, grade: 'warning' as const },
  { province: '광주광역시', restaurants: 79, coldStorage: 26, ratio: 3.0, grade: 'warning' as const },
  { province: '경기도', restaurants: 618, coldStorage: 400, ratio: 1.5, grade: 'balanced' as const },
  { province: '부산광역시', restaurants: 123, coldStorage: 82, ratio: 1.5, grade: 'balanced' as const },
];

const GRADE_CONFIG = {
  critical: { label: '공급 부족', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.12)', icon: '🔴' },
  warning: { label: '주의', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
  balanced: { label: '밸런스', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.12)', icon: '🟢' },
};

export default function ColdStorageMap() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [data, setData] = useState<any>(null);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [municipalitiesGeoJson, setMunicipalitiesGeoJson] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<any[]>([]);

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
      fetch('/data/cold_storage_dashboard.json').then(r => {
        if (!r.ok) throw new Error('Data fetch failed');
        return r.json();
      })
    ]).then(([geo, muniGeo, coldData]) => {
      setGeoJson(geo);
      setMunicipalitiesGeoJson(muniGeo);
      setData(coldData);
    }).catch(err => {
      console.error('Failed to load cold storage map data:', err);
      setData({ counts: {}, municipality_counts: {}, details: {} });
    });
  }, []);

  useEffect(() => {
    if (!data || !geoJson || !municipalitiesGeoJson || !chartRef.current) return;

    const container = chartRef.current;

    const initChart = () => {
      // Dispose previous instance cleanly
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }

      // Guard: only init when container has valid dimensions
      if (container.clientWidth <= 0 || container.clientHeight <= 0) return;

      const myChart = echarts.init(container);
      chartInstance.current = myChart;
      
      let currentMapName = 'coldstorage-korea';
      let chartData: any[] = [];
      let maxVal = 500;

      if (!selectedProvince) {
        echarts.registerMap('coldstorage-korea', geoJson as any);
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
          echarts.registerMap('coldstorage-province', customGeoJson as any);
          currentMapName = 'coldstorage-province';
          
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
               return `<strong>${params.name}</strong><br/>운영 중인 냉동/냉장업체: ${val}<br/><span style="color:#94a3b8;font-size:11px">클릭하여 시/군/구 보기</span>`;
            } else {
               return `<strong>${params.name}</strong><br/>운영 중인 냉동/냉장업체: ${val}<br/><span style="color:#94a3b8;font-size:11px">클릭하여 세부 목록 보기</span>`;
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
              'rgba(20, 184, 166, 0.2)',
              'rgba(13, 148, 136, 0.4)', 
              'rgba(15, 118, 110, 0.7)', 
              'rgba(17, 94, 89, 1)'
            ]
          }
        },
        series: [
          {
            name: '냉동/냉장업체 수',
            type: 'map',
            map: currentMapName,
            roam: true,
            itemStyle: {
              areaColor: 'rgba(30, 41, 59, 0.3)',
              borderColor: 'rgba(20, 184, 166, 0.3)',
              borderWidth: 1,
              shadowColor: 'rgba(20, 184, 166, 0.2)',
              shadowBlur: 10
            },
            emphasis: {
              label: { show: true, color: 'var(--text-primary)' },
              itemStyle: {
                areaColor: 'rgba(20, 184, 166, 0.6)',
                borderColor: 'var(--text-primary)',
                borderWidth: 2,
                shadowColor: 'rgba(20, 184, 166, 0.8)',
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
          setFacilities([]);
        } else {
          setSelectedMunicipality(regionName);
          setFacilities(data.details[selectedProvince]?.[regionName] || []);
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
    if (s >= 500) return { label: '메가 허브', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.15)' };
    if (s >= 100) return { label: '중형 거점', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.15)' };
    return { label: '소형', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.15)' };
  };

  const totalFacilities = data ? Object.values(data.counts || {}).reduce((a: number, b: any) => a + b, 0) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>
          <Snowflake size={20} />
          <span className={styles.titleGradient}>전국 식품냉동냉장업 영업 현황 매핑</span>
          <span className={styles.totalBadge}>{totalFacilities.toLocaleString()}개</span>
        </h3>
        <p className={styles.subtitle}>
          지도에서 지역을 클릭하면 세부 냉동/냉장 창고 리스트가 나타납니다. · 출처: 
          <TermTooltip term="지방행정 인허가 데이터" description="행정안전부 지방행정 인허가 데이터 개방 시스템에서 '식품냉동냉장업' 카테고리로 추출한 전국 영업 중(영업/정상) 사업장 데이터입니다. 폐업/취소/만료 업체는 제외되었습니다." />
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
                setFacilities([]);
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
            {selectedMunicipality && <span className={styles.badge}>총 {facilities.length}개</span>}
          </div>
          
          <div className={styles.detailList}>
            {!selectedMunicipality ? (
              <div className={styles.emptyState}>
                <Info size={32} color="#475569" style={{marginBottom: '1rem'}} />
                {selectedProvince ? '지도에서 세부 시/군/구를 클릭하세요.' : '좌측 지도에서 지역(예: 서울특별시)을 클릭하세요.'}
              </div>
            ) : facilities.length === 0 ? (
              <div className={styles.emptyState}>해당 지역에는 운영 중인 냉동/냉장 창고 데이터가 없습니다.</div>
            ) : (
              <AnimatePresence mode="popLayout">
                {facilities.map((fac, idx) => {
                  const sizeBadge = getSizeBadge(fac.size);
                  return (
                    <motion.div 
                      key={`${fac.name}-${idx}`} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 1.5) }}
                      className={styles.facilityItem}
                    >
                      <div className={styles.facName}>
                        <Warehouse size={14} color="#14b8a6" /> {fac.name}
                      </div>
                      <div className={styles.facBadgeRow}>
                        <span className={styles.facCategory}>{fac.category || '기타'}</span>
                        <span className={styles.sizeBadge} style={{ color: sizeBadge.color, background: sizeBadge.bg }}>
                          {sizeBadge.label} {fac.size ? `(${parseFloat(fac.size).toLocaleString()}㎡)` : ''}
                        </span>
                      </div>
                      <div className={styles.facInfo}>📍 {fac.address}</div>
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
          situation={`전국 운영 중인 식품냉동냉장업체는 총 ${totalFacilities.toLocaleString()}개이며, 경기도(400개)가 전체의 45%로 입니다. 부산(82개)은 항만 인접 메가 허브로, 경남(78개)과 함께 초도 수입 물류 거점 역할을 수행합니다. 반면 서울(9개)·대전(4개)은 수요 대비 공급 인프라가 극심하게 부족합니다.`}
          actionPlan={
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '4px' }}><strong>[Hub]</strong> 부산 사하/서구 + 인천 중/서구 — 초도 수입 축양 참다랑어 대용량 보관 메가 허브</li>
              <li style={{ marginBottom: '4px' }}><strong>[Spoke]</strong> 경기 광주/용인/남양주 — 2차 가공(블록/사쿠) 완료 후 수도권 당일/새벽 배송 전진기지</li>
              <li><strong>[Partner]</strong> 충남 천안/아산, 경남 김해/양산 — 지방 권역별 벤더 파트너십 콜드체인</li>
            </ul>
          }
        />
      </div>

      {/* 🔥 P1: 수요-공급 갭 크로스 분석 (최대 가치 인사이트) */}
      <div className={styles.crossAnalysis}>
        <h3 className={styles.crossHeader}>
          <AlertTriangle size={20} color="var(--color-warning)" />
          <span className={styles.titleGradientTeal}>참치 전문점(수요) vs 냉동창고(공급) 갭 분석</span>
          <TermTooltip term="수요/공급 비율" description="해당 시도의 참치 전문점 수를 냉동냉장 업체 수로 나눈 값입니다. 비율이 높을수록 공급 인프라가 부족하여 콜드체인 투자 우선순위가 높다는 의미입니다." />
        </h3>
        <p className={styles.crossDesc}>
          비율이 높을수록 콜드체인 투자가 시급한 지역입니다. 서울은 식당 498개 대비 냉동창고 9개로 <strong style={{color: 'var(--color-danger)'}}>55:1</strong>의 극심한 공급 부족 상태입니다.
        </p>
        <div className={styles.crossGrid}>
          {CROSS_ANALYSIS.map((item, idx) => {
            const config = GRADE_CONFIG[item.grade];
            const barWidth = Math.min(100, (item.ratio / 55.3) * 100);
            return (
              <div key={idx} className={styles.crossItem} style={{ borderLeftColor: config.color }}>
                <div className={styles.crossItemHeader}>
                  <span className={styles.crossProvince}>{item.province}</span>
                  <span className={styles.crossBadge} style={{ color: config.color, background: config.bg }}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <div className={styles.crossStats}>
                  <span>🍣 식당 {item.restaurants}개</span>
                  <span>❄️ 냉동 {item.coldStorage}개</span>
                  <span style={{ fontWeight: 700, color: config.color }}>{item.ratio}:1</span>
                </div>
                <div className={styles.crossBar}>
                  <div 
                    className={styles.crossBarFill} 
                    style={{ width: `${barWidth}%`, background: config.color }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <TakeawayBox
            source="참치 전문점 + 냉동냉장업 크로스 분석 (2026년 4월 기준)"
            situation="서울(55:1)과 대전(17:1)은 참치 전문점 수요 대비 냉동냉장 인프라가 극심하게 부족합니다. 이는 현재 서울 참치 전문점들이 경기도 물류센터에서 원거리 배송받거나, 도매시장 경유의 비효율(Inefficiency)적 유통 구조에 의존하고 있음을 의미합니다."
            actionPlan={
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.85rem' }}>
                <li style={{ marginBottom: '4px' }}><strong>[최우선]</strong> 서울 강서/구로 수산물류단지 인근에 축양 참다랑어 전용 소규모 전진 냉동기지 확보 — 당일 배송 리드타임을 4시간→2시간으로 단축</li>
                <li style={{ marginBottom: '4px' }}><strong>[기회]</strong> 대전·대구의 공급 공백을 역으로 활용하여, 충청/영남 권역 독점 냉동 거점을 선점하면 경쟁자 진입 전 시장 락인 가능</li>
                <li><strong>[벤치마크]</strong> 경기(1.5:1)·부산(1.5:1)·제주(1:1) 수준이 이상적 밸런스. 신규 진출 시 수요/공급 비율 2:1 이하를 목표로 설정</li>
              </ul>
            }
          />
        </div>
      </div>

      <div className={styles.strategyGrid}>
        <h3 className={styles.strategyHeader}>
          <Snowflake size={20} color="#14b8a6" />
          참다랑어 보관 및 <TermTooltip term="콜드체인" description="Cold Chain. 수산물을 생산지부터 최종 소비지까지 전 과정에서 적정 온도(-60℃~-40℃)를 유지하며 운송하는 저온 유통 체계입니다. 참다랑어의 경우 -60℃ 초저온이 필수적입니다." /> 물류 최적화 전략
        </h3>
        <div className={styles.strategyCols}>
          <div>
            <div className={styles.strategyColTitle}>
              <TrendingUp size={16} color="var(--color-danger)" />
              1. 항만 인접 메가 허브 (부산/인천)
            </div>
            <div className={styles.strategyColText}>
              <span className={styles.highlight}>부산 사하구/서구, 인천 중구/서구</span>에 대규모 냉동창고가 밀집해 있습니다.<br/><br/>
              초도 수입된 축양 참다랑어의 대용량 보관 거점으로 활용하며, 여기서부터 수도권 및 지방 거점으로 분배하는 메인 콜드체인 허브 역할을 수행합니다.
            </div>
          </div>
          <div>
            <div className={styles.strategyColTitle}>
              <Anchor size={16} color="var(--color-info)" />
              2. 수도권 스포크 물류 거점 (<TermTooltip term="RDC" description="Regional Distribution Center(지역 물류센터). 대형 메가 허브에서 받은 물량을 최종 배송지역에 맞춰 소분·재포장하는 중간 거점 물류센터입니다." />)
            </div>
            <div className={styles.strategyColText}>
              <span className={styles.highlight}>경기 광주/용인/남양주</span>는 수도권 교통 요충지로서 창고가 고도로 밀집된 스포크(Spoke) 거점입니다.<br/><br/>
              2차 가공(블록, 사쿠)이 완료된 프리미엄 참다랑어를 수도권 참치전문점(플래그십) 및 배달/무한리필 시장에 당일/새벽 배송하는 최전선 전진기지로 운용합니다.
            </div>
          </div>
          <div>
            <div className={styles.strategyColTitle}>
              <ShieldCheck size={16} color="var(--color-success)" />
              3. 지방 권역별 거점 분산
            </div>
            <div className={styles.strategyColText}>
              <span className={styles.highlight}>충남 천안/아산, 경남 김해/양산, 광주광역시</span> 등 주요 고속도로 인접지에 거점 창고가 집중되어 있습니다.<br/><br/>
              지방 대형 상권 공급망 불안정을 해소하기 위해 해당 창고 권역별로 벤더 파트너십을 체결, 지방 수요처(오마카세, 프리미엄 식당)에 대한 퀵 배송망을 확보합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
