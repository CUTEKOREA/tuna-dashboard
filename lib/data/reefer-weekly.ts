import rows from '../../data/reefer_week35.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 35th.xlsx',
    sha256: '6740bc3c393589978f4642a289d15c73443e81a47f039dacef0712181fba1564',
    week: 35,
    startDate: '2026-08-28',
    endDate: '2026-09-03',
  },
  rows,
} as const;
