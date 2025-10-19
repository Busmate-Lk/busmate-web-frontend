import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.woff2': ['file-loader'],
      '*.woff': ['file-loader'],
      '*.ttf': ['file-loader'],
      '*.eot': ['file-loader'],
    }
  },

  // ✅ Ignore lint & TS errors during build (only for deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/user-management/:path*',
        destination: 'http://107.21.189.199:8081/:path*' // Vercel will proxy server-side
      },
      {
        source: '/api/route-management/:path*',
        destination: 'http://18.140.161.237:8080/:path*'
      }
    ]
  }
};

export default nextConfig;
