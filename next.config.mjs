/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    BASE_URL: process.env.BASE_URL, // server-side only
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
