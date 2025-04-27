/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Use the UMD/minified version of ApexCharts to avoid "resolve is not defined" error
      apexcharts: 'apexcharts/dist/apexcharts.min.js',
    };
    return config;
  },
};

export default nextConfig;
