import rows from '../../data/reefer_week41.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 41th.xlsx',
    sha256: 'd310034c22a514ba64cb369ebc7c058ef6c4f9df1985b7c3e2a41b9ff4c4d60a',
    week: 41,
    startDate: '2026-10-09',
    endDate: '2026-10-15',
  },
  rows,
} as const;
