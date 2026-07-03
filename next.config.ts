import type { NextConfig } from "next";

const isCapacitor = process.env.CAPACITOR_BUILD === "1";

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : undefined,
  distDir: isCapacitor ? 'dist' : '.next',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
