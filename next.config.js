/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  // Server Actions are enabled by default in Next.js 14 and do not require
  // the experimental flag. Keeping this config minimal avoids deprecation
  // warnings.
};

module.exports = nextConfig;