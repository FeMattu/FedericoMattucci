import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'db9pbmct2ycbl.cloudfront.net'
        }
      ],
      minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days caching
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      formats: ['image/webp'],
    },
    // Aggiungo caching aggressivo per i contenuti statici
    staticPageGenerationTimeout: 90,
    onDemandEntries: {
      maxInactiveAge: 60 * 60 * 24 * 7, // 7 days
      pagesBufferLength: 100,
    },
  };
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
