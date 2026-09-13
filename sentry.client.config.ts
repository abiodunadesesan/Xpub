// Sentry Client Configuration Placeholder
export const sentryClientConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://mock_sentry_dsn@sentry.io/123456",
  tracesSampleRate: 1.0,
  debug: false,
};

export function captureException(error: any) {
  console.error("⚡ [Sentry Telemetry Exception Captured]:", error);
}
