import rows from '../../data/reefer_week39.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 39th.xlsx',
    sha256: '33952c4f9401b12b566772fbe3721cd3f6bc0b4db794075221a3323a8f03ee3d',
    week: 39,
    startDate: '2026-09-25',
    endDate: '2026-10-01',
  },
  rows,
} as const;
