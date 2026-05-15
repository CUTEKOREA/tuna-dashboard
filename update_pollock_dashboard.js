const fs = require('fs');

let content = fs.readFileSync('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PollockDashboard.tsx', 'utf8');

// The replacement logic: we need to replace the section starting from `{/* ═══ VALUE CHAIN FRAMEWORK ═══ */}` 
// to the end of the `return` statement's JSX with our new 5-part structure.

const newStructure = `
      {/* ═══ VALUE CHAIN FRAMEWORK ═══ */}
      
      {/* Part I — 원물 생산 (Raw Material) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(6, 182, 212, 0.3)', paddingBottom: '0.5rem' }}>
          <Anchor size={24} color="#06b6d4" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>Part I — 원물 생산 (Raw Material)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>글로벌 어획 및 자원 밀도</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w1_global_catch', 'w2_hegemony', 'w3_diverging', 'w24_opex_spread', 'w31_catch_gap', 'w32_sst_fleet_matrix', 'k5_hatch_temp', 'k2_epa_larva'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          <PollockConcentrationIndex />
          <PollockAlternativeSourcing />
        </div>
      </section>

      {/* Part II — 가공 산업 (Processing) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', paddingBottom: '0.5rem' }}>
          <Factory size={24} color="#38bdf8" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>Part II — 가공 산업 (Processing)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>수리미 및 고부가 가공 허브</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w5_china_blackhole', 'w9_surimi_megatrend', 'w10_surimi_top3', 'w12_proc_vs_surimi', 'w17', 'w20_whitefish_reshuffle', 'w22_precision_release', 'w25_processing_bottleneck', 'k1_3d_surimi', 'k3_gamma_roe', 'k4_senior_food'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
        </div>
      </section>

      {/* Part III — 물류 및 무역 (Logistics) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '0.5rem' }}>
          <Truck size={24} color="var(--color-warning)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>Part III — 물류 및 무역 (Logistics)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>글로벌 서플라이 체인 및 물동량</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w8_korea_deficit', 'w11_surimi_trade', 'w13', 'w15', 'w16', 'w18', 'w19_tariff_engineering', 'w21_b_season_hedge', 'w26_inventory_freight', 'w29_eu_derisk_pivot', 'n1_sanction_paradox', 'n5_rcep_detour'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          <PollockFtaTariffMatrix />
          <PollockRouteComparison />
          <PollockLandedCostWaterfall />
        </div>
      </section>

      {/* Part IV — 판매 및 수요 (Sales & Demand) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', paddingBottom: '0.5rem' }}>
          <DollarSign size={24} color="var(--color-danger)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>Part IV — 판매 및 수요 (Sales & Demand)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>수요 예측 및 단가 트렌드</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w6_inflation_unitprice', 'w7_usa_russia_unitprice', 'w27_substitute_spread', 'w33_arbitrage_tracker'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          <PollockPriceForecastChart />
          <PollockScenarioSimulator />
          <PollockSubstituteElasticity />
        </div>
      </section>

      {/* Part V — ESG 및 지속가능성 (Sustainability) */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '0.5rem' }}>
          <ShieldCheck size={24} color="var(--color-success)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>Part V — ESG 및 지속가능성 (Sustainability)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>규제 리스크 및 친환경 프리미엄</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w4_korea_crisis', 'w14', 'w23_upcycling_esg', 'w28_esg_premium', 'w30_traceability_risk', 'n6_waste_to_wealth'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          <PollockRiskScorecard />
          <PollockSanctionParadox />
        </div>
      </section>

    </div>
  );
`;

const startIndex = content.indexOf('{/* ═══ VALUE CHAIN FRAMEWORK ═══ */}');
const endIndex = content.indexOf('  function renderWidgetCard(w: any) {');

if (startIndex !== -1 && endIndex !== -1) {
    const updatedContent = content.substring(0, startIndex) + newStructure + "\n" + content.substring(endIndex);
    fs.writeFileSync('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PollockDashboard.tsx', updatedContent);
    console.log("Successfully updated PollockDashboard.tsx structure");
} else {
    console.log("Failed to find indices");
}

