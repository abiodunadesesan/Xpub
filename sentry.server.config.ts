// Sentry Server Configuration Placeholder
export const sentryServerConfig = {
  dsn: process.env.SENTRY_DSN || "https://mock_sentry_dsn@sentry.io/123456",
  tracesSampleRate: 1.0,
};
