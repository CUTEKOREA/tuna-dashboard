import rows from '../../data/reefer_week34.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 34th.xlsx',
    sha256: '1076d085bcf7908b20887c224e5fe771f0415a97f1c439221190c8e14c554ef3',
    week: 34,
    startDate: '2026-08-21',
    endDate: '2026-08-27',
  },
  rows,
} as const;
