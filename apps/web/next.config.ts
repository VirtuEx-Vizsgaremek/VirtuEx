import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['img.logo.dev']
  }
};

module.exports = {
  images: {
    remotePatterns: [new URL('https://avatar.vercel.sh/**')]
  }
};

export default nextConfig;
