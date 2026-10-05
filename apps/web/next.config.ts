import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ["@streamflix/database"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;