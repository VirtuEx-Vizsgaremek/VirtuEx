/**
 * Next.js configuration (JavaScript)
 *
 * Purpose:
 * - Ensure external image hosts are recognized by `next/image`.
 * - Provide a minimal, safe default configuration that enables React strict mode.
 *
 * Note:
 * - If you also have a `next.config.ts`, Next will pick up the JS config if it's present.
 * - After changing this file, restart your Next dev server so the changes take effect.
 */

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add any external domains you want to allow <Image /> to load from.
    // Keep this list minimal for security reasons.
    domains: ['img.logo.dev', 'avatar.vercel.sh']
  }
};

module.exports = nextConfig;
