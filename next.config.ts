import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const cloudfront = process.env.CLOUDFRONT_URL ? new URL(process.env.CLOUDFRONT_URL).hostname : undefined

const nextConfig: NextConfig = {
  // The E2E suite builds into its own folder (scripts/e2e-server.mjs).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: cloudfront ? [{ protocol: 'https', hostname: cloudfront }] : [],
    // Signed URLs change every request: keep the optimized cache short-lived.
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
    ]
  },
}

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig)
