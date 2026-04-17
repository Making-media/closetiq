import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  transpilePackages: ["three"],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { sharp: "commonjs sharp" }];
    return config;
  },
};

export default nextConfig;
