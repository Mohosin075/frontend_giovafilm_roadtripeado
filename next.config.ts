import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/** Uploads are served by the API, so whatever host it runs on must be allowed */
const apiHostPatterns = (): RemotePattern[] =>
  [process.env.NEXT_PUBLIC_BASEURL, process.env.NEXT_PUBLIC_IMAGE_BASEURL]
    .filter((value): value is string => Boolean(value?.trim()))
    .flatMap(value => {
      try {
        const url = new URL(value);
        return [
          {
            protocol: url.protocol.replace(":", "") as "http" | "https",
            hostname: url.hostname,
            ...(url.port ? { port: url.port } : {}),
            pathname: "/**",
          },
        ];
      } catch {
        return [];
      }
    });

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      ...apiHostPatterns(),
      {
        protocol: "http",
        hostname: "10.10.7.11",
        port: "5002",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mohosin5004.binarybards.online",

        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.10.7.50",
        port: "4009",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.10.7.50",
        port: "4009",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'mymaps.usercontent.google.com',
        pathname: '/hostedimage/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
