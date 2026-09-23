"use client";

import { useSyncExternalStore } from "react";

/**
 * `false` while rendering on the server, `true` once running in the browser.
 *
 * This is the guard every animated component on this site needs, because
 * Motion's `initial` styling has no server equivalent: animating on the first
 * render produces markup the server never sent, which React reports as a
 * hydration mismatch.
 *
 * It is a store rather than `useState` plus `useEffect` on purpose. Setting
 * state from an effect body to mean "mounted" is the pattern the React
 * compiler lint rules flag (cascading renders), and it was flagged here — four
 * components were each carrying the same warning. `useSyncExternalStore` is
 * the same idea expressed in a way React can reason about: the server snapshot
 * is `false`, the client snapshot is `true`, and there is nothing to subscribe
 * to because the answer never changes once hydration is done.
 */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
