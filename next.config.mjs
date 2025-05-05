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
  images: {
    // Allow images from Vercel Blob storage
    domains: ['vandhz2u601yidrb.public.blob.vercel-storage.com'],
  },
};

export default nextConfig;
