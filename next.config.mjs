/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/:path(market|fleet|logistics|unloading|ranching|value-chain|mackerel|galchi|squid|jukkumi|cashew|cassava|garlic|carrot|cocoa|mangosteen|chicken|whelk|used-car|pollock|shrimp|salmon|field-ops|petfood|seasia-oem|fleet-strategy|korea-market|tuna-extract|cold-storage|research-lab)',
        destination: '/',
      },
    ]
  },
};

export default nextConfig;
