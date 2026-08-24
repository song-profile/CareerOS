import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        hostname: "*.googleusercontent.com",
        protocol: "https",
      },
      {
        hostname: "googleusercontent.com",
        protocol: "https",
      },
    ],
  },
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
