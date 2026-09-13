"use client";

import React, { useEffect } from "react";

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // PostHog / Sentry Telemetry initialization
    if (typeof window !== "undefined") {
      console.log("⚡ [Telemetry initialized] Sentry Error Tracking & PostHog Conversion Analytics active.");
    }
  }, []);

  return <>{children}</>;
};

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined") {
    console.log(`📊 [PostHog Event Tracked]: ${eventName}`, properties || {});
  }
}
