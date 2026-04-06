import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  serverExternalPackages: ["ssh2", "ssh2-sftp-client", "fluent-ffmpeg", "image-size", "pdf-lib", "sharp"],

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
      },
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn-eu.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.sndcdn.com",
      },
      {
        protocol: "https",
        hostname: "**.soundcloud.com",
      },
      {
        protocol: "https",
        hostname: "cdn.hitstar.es",
      },
      {
        protocol: "https",
        hostname: "hitstar.es",
      }
    ],
  },
};

export default nextConfig;