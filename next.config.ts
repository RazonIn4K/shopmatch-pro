import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // TypeScript checking enabled - all type errors must be fixed
};

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  ...(sentryAuthToken
    ? {
        authToken: sentryAuthToken,
        org: "davidortizhighencodelearningco",
        project: "javascript-nextjs",
        // Upload a larger set of source maps for prettier stack traces when release upload is enabled.
        widenClientFileUpload: true,
      }
    : {}),

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  telemetry: false,
  release: {
    create: Boolean(sentryAuthToken),
  },
  useRunAfterProductionCompileHook: Boolean(sentryAuthToken),
  sourcemaps: {
    disable: !sentryAuthToken,
  },

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the Sentry DSN in `sentry.client.config.ts` does not include the `tunnelRoute` option.
  tunnelRoute: "/monitoring",
});
