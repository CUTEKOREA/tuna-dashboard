import rows from '../../data/reefer_week33.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 33rd.xlsx',
    sha256: '03d617a781debd2e49d65c295daa136e53dd2e47e899fe23f089c508e602bca1',
    week: 33,
    startDate: '2026-08-14',
    endDate: '2026-08-20',
  },
  rows,
} as const;
