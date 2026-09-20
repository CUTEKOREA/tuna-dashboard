import rows from '../../data/reefer_week37.json';

export const reeferWeeklyReport = {
  source: {
    file: 'Reefer ship movement for week 37th.xlsx',
    sha256: '171caae22ca11f57718b34e62f4abdf497feaedfb5f3fc1a8f63fd84b012df2f',
    week: 37,
    startDate: '2026-09-11',
    endDate: '2026-09-17',
  },
  rows,
} as const;
