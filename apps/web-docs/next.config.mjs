import { composePlugins, withNx } from "@nx/next";
import { get } from "@vercel/edge-config";
import createMDX from "fumadocs-mdx/config";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "",

  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },

  swcMinify: true,
  reactStrictMode: true,

  /*experimental: {
    instrumentationHook: true
  },*/

  devIndicators: {
    buildActivityPosition: "bottom-right"
  },

  // Disable linting during build => the linter may have optional dev dependencies
  // (eslint-plugin-cypress) that wont exist during prod build
  // You should lint manually only
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },

  // https://nextjs.org/docs/app/api-reference/next-config-js/typescript
  typescript: {
    ignoreBuildErrors: true
  },

  // https://nextjs.org/docs/app/api-reference/next-config-js/poweredByHeader
  poweredByHeader: false,

  // biome-ignore lint/nursery/useAwait: <explanation>
  rewrites: async () => {
    return [
      { source: "/healthz", destination: "/api/health" },
      { source: "/api/healthz", destination: "/api/health" },
      { source: "/health", destination: "/api/health" },
      { source: "/ping", destination: "/api/health" }
    ];
  },

  // biome-ignore lint/nursery/useAwait: <explanation>
  redirects: async () => {
    try {
      return get("redirects");
    } catch {
      return [];
    }
  }
};

const plugins = [withMDX, withNx];

export default composePlugins(...plugins)(nextConfig);
