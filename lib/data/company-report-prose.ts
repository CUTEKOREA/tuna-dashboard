import albacoraRaw from '@/public/data/companies/albacora_prose_v1.json';
import boltonRaw from '@/public/data/companies/bolton_prose_v1.json';
import fcfRaw from '@/public/data/companies/fcf_prose_v1.json';
import frabelleRaw from '@/public/data/companies/frabelle_prose_v1.json';
import frinsaRaw from '@/public/data/companies/frinsa_prose_v1.json';
import itochuRaw from '@/public/data/companies/itochu_prose_v1.json';
import jaisRaw from '@/public/data/companies/jais_prose_v1.json';
import jealsaRaw from '@/public/data/companies/jealsa_prose_v1.json';
import thaiunionRaw from '@/public/data/companies/thaiunion_prose_v1.json';
import nauterraRaw from '@/public/data/companies/nauterra_prose_v1.json';
import starkistRaw from '@/public/data/companies/starkist_prose_v1.json';
import dongwonRaw from '@/public/data/companies/dongwon_prose_v1.json';
import sajoRaw from '@/public/data/companies/sajo_prose_v1.json';
import bumblebeeRaw from '@/public/data/companies/bumblebee_prose_v1.json';
import umiosRaw from '@/public/data/companies/umios_prose_v1.json';
import kyokuyoRaw from '@/public/data/companies/kyokuyo_prose_v1.json';
import seavalueRaw from '@/public/data/companies/seavalue_prose_v1.json';
import nissuiRaw from '@/public/data/companies/nissui_prose_v1.json';
import centurypacificRaw from '@/public/data/companies/centurypacific_prose_v1.json';
import boltonfoodRaw from '@/public/data/companies/boltonfood_prose_v1.json';
import trimarineRaw from '@/public/data/companies/trimarine_prose_v1.json';
import princesRaw from '@/public/data/companies/princes_prose_v1.json';
import iotRaw from '@/public/data/companies/iot_prose_v1.json';
import atiRaw from '@/public/data/companies/ati_prose_v1.json';
import nirsaRaw from '@/public/data/companies/nirsa_prose_v1.json';
import eurofishRaw from '@/public/data/companies/eurofish_prose_v1.json';
import tecopescaRaw from '@/public/data/companies/tecopesca_prose_v1.json';
import dongwonfnbRaw from '@/public/data/companies/dongwonfnb_prose_v1.json';
import hagoromoRaw from '@/public/data/companies/hagoromo_prose_v1.json';
import cnfcRaw from '@/public/data/companies/cnfc_prose_v1.json';
import kaichuangRaw from '@/public/data/companies/kaichuang_prose_v1.json';
import allianceRaw from '@/public/data/companies/alliance_prose_v1.json';
import herdezRaw from '@/public/data/companies/herdez_prose_v1.json';
import sajoseafoodRaw from '@/public/data/companies/sajoseafood_prose_v1.json';
import garavillaRaw from '@/public/data/companies/garavilla_prose_v1.json';
import salicaRaw from '@/public/data/companies/salica_prose_v1.json';
import majesticRaw from '@/public/data/companies/majestic_prose_v1.json';
import scaRaw from '@/public/data/companies/sca_prose_v1.json';
import ghanaRaw from '@/public/data/companies/ghana_prose_v1.json';
import azoresRaw from '@/public/data/companies/azores_prose_v1.json';
import togRaw from '@/public/data/companies/tog_prose_v1.json';
import mauritiusRaw from '@/public/data/companies/mauritius_prose_v1.json';
import galapescaRaw from '@/public/data/companies/galapesca_prose_v1.json';
import cosiRaw from '@/public/data/companies/cosi_prose_v1.json';
import kingfisherRaw from '@/public/data/companies/kingfisher_prose_v1.json';
import capsenRaw from '@/public/data/companies/capsen_prose_v1.json';
import bountyRaw from '@/public/data/companies/bounty_prose_v1.json';
import rdRaw from '@/public/data/companies/rd_prose_v1.json';
import soltunaRaw from '@/public/data/companies/soltuna_prose_v1.json';
import pafcoRaw from '@/public/data/companies/pafco_prose_v1.json';
import pinsaRaw from '@/public/data/companies/pinsa_prose_v1.json';
import sstcRaw from '@/public/data/companies/sstc_prose_v1.json';
import grupomarRaw from '@/public/data/companies/grupomar_prose_v1.json';
import procesaRaw from '@/public/data/companies/procesa_prose_v1.json';
import tropicalRaw from '@/public/data/companies/tropical_prose_v1.json';
import seatechRaw from '@/public/data/companies/seatech_prose_v1.json';
import ppfRaw from '@/public/data/companies/ppf_prose_v1.json';
import inepacaRaw from '@/public/data/companies/inepaca_prose_v1.json';
import kflRaw from '@/public/data/companies/kfl_prose_v1.json';
import sapmerRaw from '@/public/data/companies/sapmer_prose_v1.json';
import patayaRaw from '@/public/data/companies/pataya_prose_v1.json';
import sojitzRaw from '@/public/data/companies/sojitz_prose_v1.json';
import pollockRaw from '@/public/data/companies/pollock_prose_v1.json';
import octopusRaw from '@/public/data/companies/octopus_prose_v1.json';
import shrimpRaw from '@/public/data/companies/shrimp_prose_v1.json';
import squidRaw from '@/public/data/companies/squid_prose_v1.json';
import tunaRaw from '@/public/data/companies/tuna_prose_v1.json';
import surimiRaw from '@/public/data/companies/surimi_prose_v1.json';
import mackerelRaw from '@/public/data/companies/mackerel_prose_v1.json';
import tunafarmRaw from '@/public/data/companies/tunafarm_prose_v1.json';
import whelkRaw from '@/public/data/companies/whelk_prose_v1.json';

/**
 * 조사보고서 서술 전량 인테이크.
 *
 * 손으로 쓴 `lib/company-*-content.ts` 는 보고서 본문의 **18%**만 담았다(49,365 / 269,034자).
 * 나머지는 보고서에만 있었고, 보고서를 고칠 때마다 같은 일을 두 번 했다. 표를 원문에서
 * 그대로 읽는 방식(`company-report-tables.ts`)을 서술에도 적용한다 — 사람이 정하는 것은
 * 절 → 단계 매핑뿐이고 문장은 옮겨 적지 않는다. 생성은 `python3 scripts/build_report_prose.py`.
 */

/** 서술 한 덩어리. `kind` 가 화면 렌더를 가른다. */
export interface ProseBlock {
  kind: 'lead' | 'para' | 'call' | 'h3' | 'quote' | 'li' | 'term';
  text: string;
  /** 절 본문 안의 문자 오프셋. 표·그림을 원문 자리에 되돌릴 때 쓴다. */
  ord: number;
  /** 근거 등급 칩. 보고서가 문장 끝에 달아 둔 것을 그대로 옮긴다. */
  chips?: string[];
  /** 콜아웃 제목, 또는 소제목 본문 */
  title?: string;
  /** 콜아웃 색 — warn(주의) · hot(강조) */
  tone?: 'warn' | 'hot';
}

export interface ProseSection {
  sid: string;
  numeral: string;
  label: string;
  subtitle: string;
  blocks: ProseBlock[];
  /** 대시보드 단계 (c01 …) */
  stage: string;
}

interface Intake {
  _meta: { 출처: string; 생성: string; 설명: string };
  sections: ProseSection[];
}

const INTAKES: Record<string, Intake> = {
  albacora: albacoraRaw as unknown as Intake,
  bolton: boltonRaw as unknown as Intake,
  fcf: fcfRaw as unknown as Intake,
  frabelle: frabelleRaw as unknown as Intake,
  frinsa: frinsaRaw as unknown as Intake,
  itochu: itochuRaw as unknown as Intake,
  jais: jaisRaw as unknown as Intake,
  jealsa: jealsaRaw as unknown as Intake,
  nauterra: nauterraRaw as unknown as Intake,
  starkist: starkistRaw as unknown as Intake,
  dongwon: dongwonRaw as unknown as Intake,
  sajo: sajoRaw as unknown as Intake,
  bumblebee: bumblebeeRaw as unknown as Intake,
  umios: umiosRaw as unknown as Intake,
  kyokuyo: kyokuyoRaw as unknown as Intake,
  seavalue: seavalueRaw as unknown as Intake,
  nissui: nissuiRaw as unknown as Intake,
  centurypacific: centurypacificRaw as unknown as Intake,
  boltonfood: boltonfoodRaw as unknown as Intake,
  trimarine: trimarineRaw as unknown as Intake,
  princes: princesRaw as unknown as Intake,
  iot: iotRaw as unknown as Intake,
  ati: atiRaw as unknown as Intake,
  nirsa: nirsaRaw as unknown as Intake,
  eurofish: eurofishRaw as unknown as Intake,
  tecopesca: tecopescaRaw as unknown as Intake,
  dongwonfnb: dongwonfnbRaw as unknown as Intake,
  hagoromo: hagoromoRaw as unknown as Intake,
  cnfc: cnfcRaw as unknown as Intake,
  kaichuang: kaichuangRaw as unknown as Intake,
  alliance: allianceRaw as unknown as Intake,
  herdez: herdezRaw as unknown as Intake,
  sajoseafood: sajoseafoodRaw as unknown as Intake,
  garavilla: garavillaRaw as unknown as Intake,
  salica: salicaRaw as unknown as Intake,
  majestic: majesticRaw as unknown as Intake,
  sca: scaRaw as unknown as Intake,
  ghana: ghanaRaw as unknown as Intake,
  azores: azoresRaw as unknown as Intake,
  tog: togRaw as unknown as Intake,
  mauritius: mauritiusRaw as unknown as Intake,
  galapesca: galapescaRaw as unknown as Intake,
  cosi: cosiRaw as unknown as Intake,
  kingfisher: kingfisherRaw as unknown as Intake,
  capsen: capsenRaw as unknown as Intake,
  bounty: bountyRaw as unknown as Intake,
  rd: rdRaw as unknown as Intake,
  soltuna: soltunaRaw as unknown as Intake,
  pafco: pafcoRaw as unknown as Intake,
  pinsa: pinsaRaw as unknown as Intake,
  sstc: sstcRaw as unknown as Intake,
  grupomar: grupomarRaw as unknown as Intake,
  procesa: procesaRaw as unknown as Intake,
  tropical: tropicalRaw as unknown as Intake,
  seatech: seatechRaw as unknown as Intake,
  ppf: ppfRaw as unknown as Intake,
  inepaca: inepacaRaw as unknown as Intake,
  kfl: kflRaw as unknown as Intake,
  sapmer: sapmerRaw as unknown as Intake,
  pataya: patayaRaw as unknown as Intake,
  sojitz: sojitzRaw as unknown as Intake,
  pollock: pollockRaw as unknown as Intake,
  octopus: octopusRaw as unknown as Intake,
  shrimp: shrimpRaw as unknown as Intake,
  squid: squidRaw as unknown as Intake,
  tuna: tunaRaw as unknown as Intake,
  surimi: surimiRaw as unknown as Intake,
  mackerel: mackerelRaw as unknown as Intake,
  tunafarm: tunafarmRaw as unknown as Intake,
  whelk: whelkRaw as unknown as Intake,
  thaiunion: thaiunionRaw as unknown as Intake,
};

export const REPORT_PROSE_COMPANIES = Object.keys(INTAKES);

/**
 * 공통 품목 라우트(/industry/[key])는 품목이 39개라 정적 import 로 묶으면 번들이 수 MB 붙는다.
 * 화면이 `/data/companies/<key>_*_v1.json` 을 받아 여기 등록한 뒤 같은 함수로 읽는다.
 */
export function registerReportIntake(key: string, raw: unknown): void {
  INTAKES[key] = raw as Intake;
}

/** 그 회사 보고서에서 옮겨 온 서술 전량. */
export function reportProse(company: string): ProseSection[] {
  return INTAKES[company]?.sections ?? [];
}

/** 한 단계에 붙는 절. 보고서 절 순서를 그대로 지킨다. */
export function proseForStage(company: string, stage: string): ProseSection[] {
  return reportProse(company).filter((s) => s.stage === stage);
}

/** 어느 단계에도 안 붙은 절이 있으면 화면에서 사라진 것이다 — 테스트가 본다. */
export function proseStagesUsed(company: string): string[] {
  return [...new Set(reportProse(company).map((s) => s.stage))].sort();
}
