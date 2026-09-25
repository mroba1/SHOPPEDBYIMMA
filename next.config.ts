import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product photos are resized in the browser (~1200px JPEG) before upload,
      // but leave headroom for large PNGs.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
