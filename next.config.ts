import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "fm-website-bucket.s3.eu-west-3.amazonaws.com",
        },
        {
            protocol: 'https',
            hostname: 'https://83bcyhrw4y5rseam.public.blob.vercel-storage.com',
            pathname: '/**',
        },
      ],
      domains: ["fm-website-bucket.s3.eu-west-3.amazonaws.com"],
    },
  };
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
