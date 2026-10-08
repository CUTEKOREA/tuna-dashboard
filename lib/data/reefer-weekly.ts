import rows from '../../data/reefer_week40.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 40th.xlsx',
    sha256: '75e8882958d585c33e75b4fcf8752a65de45b1683550a525773db222b5e15087',
    week: 40,
    startDate: '2026-10-02',
    endDate: '2026-10-08',
  },
  rows,
} as const;
