/** @type {import('next').NextConfig} */
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
const nextConfig = {
  images: {
    domains: ['restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
}

export default nextConfig;