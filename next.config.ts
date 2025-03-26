import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
    images: {
      domains: ['db9pbmct2ycbl.cloudfront.net'],
    },
  };
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
