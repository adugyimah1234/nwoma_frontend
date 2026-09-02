/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {}, // use object instead of `true`
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },typescript: {
    // ⚠️ This allows production builds to succeed even if there are type errors
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:3000',
        destination: 'https://3gecbackend-k4dd3nsdw-morrisonadus-projects.vercel.app/:5000', // Proxy to Express backend
      },
    ];
  },

};

export default nextConfig;
