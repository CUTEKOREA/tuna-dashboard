/** @type {import('next').NextConfig} */
const nextConfig = {
  // 인증이 필요한 로컬 이미지는 최적화 서버가 요청 헤더를 전달하지 않으므로 원본으로 제공한다.
  images: {
    unoptimized: true,
  },
  // 페이월 데이터(data/)는 public 정적 서빙 대신 라우트 fs 읽기 전용 —
  // Vercel 서버리스 번들에 파일 포함 보장 (file tracing 누락 대비)
  outputFileTracingIncludes: {
    '/api/atuna-prices': ['./data/atuna_prices.json'],
    '/api/atuna-daily': ['./data/atuna_daily/**/*'],
  },
  async rewrites() {
    return [
      {
        source: '/:path(ranching|field-ops|petfood|tuna-extract)',
        destination: '/',
      },
    ]
  },
};

export default nextConfig;
