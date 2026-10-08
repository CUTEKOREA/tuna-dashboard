import { checks, weeks } from '@/lib/data/cosmo';
import { atlanticMails, mailMonthDay } from '@/lib/data/panofi-atlantic-mail';

/**
 * PANOFI 주말 메일의 코스모 수치(일 가공·원어 재고)를 코스모 주간보고 원장과 나란히 놓는다.
 *
 * 메일 기준일(일요일)과 원장 주차 말일(periodEnd)이 같은 주만 짝을 짓는다. 재고 기준일은 메일이
 * 따로 적는다(8/29·9/2·9/11) — 주차 말일과 며칠 어긋나므로 차이를 곧바로 오류로 읽지 않는다.
 * 원장의 선망 원어는 SJ·YF/BE 두 줄이고, 메일은 SJ·YF·MIX(선별 전)로 나눈다. 합계만 비교한다.
 */

const PS_RAW_ITEMS = ['SJ', 'YF/BE'];

export const cosmoMailRows = atlanticMails.map((mail) => {
  const week = weeks.find((w) => w.periodEnd === mailMonthDay(mail.date)) ?? null;
  const psLines = week?.inventory.lines.filter((l) => l.group === '원어' && PS_RAW_ITEMS.includes(l.item)) ?? [];
  const ledgerStockT = week ? psLines.reduce((sum, l) => sum + (l.endQty ?? 0), 0) : null;
  const inflowCheck = week ? checks.find((c) => c.week === week.week && c.name === '원어 입고·구매 물량') ?? null : null;
  return {
    mailLabel: mailMonthDay(mail.date),
    week: week?.week ?? null,
    mailDailyT: mail.cosmo.dailyProcessingT,
    ledgerDailyT: week?.production.CBU?.weekDaily ?? null,
    mailStock: mail.cosmo.stock,
    stockAsOfLabel: mailMonthDay(mail.cosmo.stock.asOf),
    ledgerStockT,
    stockGapT: ledgerStockT == null ? null : mail.cosmo.stock.totalT - ledgerStockT,
    inflowResidualT: inflowCheck && !inflowCheck.ok ? inflowCheck.residual : null,
  };
});
