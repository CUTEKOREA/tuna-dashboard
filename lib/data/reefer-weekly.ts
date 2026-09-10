import rows from '../../data/reefer_week36.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 36th.xlsx',
    sha256: '9ffeb58f7279df8f2e03e95e197227f4d43b4ab9c8c74a45f1f3062ae9095d5f',
    week: 36,
    startDate: '2026-09-04',
    endDate: '2026-09-10',
  },
  rows,
} as const;
