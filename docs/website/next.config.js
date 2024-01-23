//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");
const { get } = require("@vercel/edge-config");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  basePath: "",

  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },

  swcMinify: true,
  reactStrictMode: false,

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

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
];

module.exports = composePlugins(...plugins)(nextConfig);
