import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.30.1.35", "192.168.0.147"],
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/signin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
