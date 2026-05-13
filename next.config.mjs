/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/:path(market|fleet|logistics|unloading|ranching|value-chain|mackerel|squid|cashew|cassava|garlic|carrot|cocoa|mangosteen|used-car|pollock|shrimp|salmon|field-ops|petfood|seasia-oem|fleet-strategy|korea-market)',
        destination: '/',
      },
    ]
  },
};

export default nextConfig;
