/**
 * squid_v5.json 데이터 계약의 TypeScript 미러.
 * 정본은 scripts/squid_v5.schema.json — 스키마를 바꾸면 여기도 같이 바꾼다.
 */

export type TaxonScope = 'squid_only' | 'incl_cuttlefish' | 'cephalopods_nei';
export type WeightBasis = 'live_weight' | 'product_weight' | 'net_weight' | 'n/a';
export type MarketStage =
  | 'consumer' | 'wholesale' | 'import_unit' | 'export_unit' | 'first_sale' | 'n/a';
export type QuotaSemantics =
  | 'legal_limit' | 'allocation' | 'consumption' | 'catch' | 'closure_notice' | 'effort_limit' | 'n/a';
export type ClaimType =
  | 'descriptive' | 'market_size' | 'legal' | 'risk_screening' | 'operational';
export type SourceGrade = 'A' | 'B' | 'C';

export interface WidgetBasis {
  species: string[];
  taxon_scope: TaxonScope;
  taxon_note?: string;
  hs_codes?: string[];
  weight_basis: WeightBasis;
  product_form?: string;
  market_stage: MarketStage;
  aggregation?: 'none' | 'sum_within_stage' | 'mean_within_stage';
  quota_semantics?: QuotaSemantics;
  metrics?: string[];
  claim_type: ClaimType;
  currency?: string;
  currency_converted?: boolean;
  fx_date?: string | null;
  nominal_real?: 'nominal' | 'real' | 'n/a';
  coverage_start: string;
  coverage_end: string;
  published_at: string;
  retrieved_at: string;
  source_ids: string[];
  source_grade: SourceGrade;
  archive_path: string;
  restrictions: string[];
  blocked_use: string[];
}

export interface SquidWidget {
  section: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  subtitle?: string;
  chartType: string;
  data: any[] | Record<string, any>;
  xAxis?: string;
  series?: any[];
  unit?: string;
  situation?: string;
  takeaway?: string;
  methodology?: string;
  basis: WidgetBasis;
}

export interface SquidSource {
  source_id: string;
  publisher: string;
  series?: string;
  priority: 'P0' | 'P1' | 'P2';
  grade: SourceGrade;
  frequency: string;
  landing_url: string;
  archive_subdir?: string;
  latest_verified?: string;
  note?: string;
}

export interface SquidGate {
  gate_id: string;
  subject: string;
  allowed_use: string;
  blocked_use: string;
  evidence_path?: string;
}

export interface SquidMonitoring {
  source_id: string;
  series: string;
  frequency: string;
  latest_verified: string;
  next_check: string;
  status:
    | 'active'
    | 'active_gap'
    | 'pipeline_gap'
    | 'coverage_gap'
    | 'manual_export_gap'
    | 'scheduled'
    /** 일부 구간만 확보 (예: 중국 해관 2025 월별 4개 HS 만) */
    | 'partial';
}

export interface SquidV5 {
  meta: {
    built_at: string;
    builder_version: string;
    archive_snapshot: string;
    gate_version: string;
    /** LIVE 는 계약상 존재하지 않는다 (룰북 L-09) */
    telemetry: 'SYNCED' | 'STATIC';
  };
  sources: SquidSource[];
  gates: SquidGate[];
  monitoring: SquidMonitoring[];
  widgets: Record<string, SquidWidget>;
}
