import rows from '../../data/reefer_week38.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 38th.xlsx',
    sha256: '238f288180976912ed83618dcb051148dc1057a38db5b23abd1ddfef55274d34',
    week: 38,
    startDate: '2026-09-18',
    endDate: '2026-09-24',
  },
  rows,
} as const;
