"use client";

/* Google Tag Manager + dataLayer utilities

Usage:
  import { trackEvent, trackPageView } from "@/lib/analytics/gtm";

All events are pushed to window.dataLayer with an `event` name.
*/

import { useEffect, type RefObject } from "react";

import { GTM_ID } from "./gtm-id";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type GTMEventPayload = Record<string, unknown>;

export function pushToDataLayer(payload: GTMEventPayload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

export function trackEvent(event: string, params: GTMEventPayload = {}) {
  pushToDataLayer({
    event,
    ...params,
  });
}

export function trackPageView(params: {
  page_path: string;
  page_title?: string;
  page_location?: string;
}) {
  trackEvent("page_view", {
    page_path: params.page_path,
    page_title: params.page_title ?? (typeof document !== "undefined" ? document.title : undefined),
    page_location: params.page_location ?? (typeof window !== "undefined" ? window.location.href : undefined),
  });
}

export function trackScrollDepth(percent: 25 | 50 | 75 | 100, extra?: GTMEventPayload) {
  trackEvent("scroll_depth", {
    scroll_percent: percent,
    ...extra,
  });
}

export function useScrollDepthTracking(options?: {
  /** page identifier for debugging / reporting */
  page?: string;
}) {
  useEffect(() => {
    const seen = new Set<number>();
    const milestones = [25, 50, 75, 100] as const;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight <= 0) return;

      const percent = Math.round((scrollTop / scrollHeight) * 100);
      for (const m of milestones) {
        if (!seen.has(m) && percent >= m) {
          seen.add(m);
          trackScrollDepth(m, options?.page ? { page: options.page } : undefined);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [options?.page]);
}

export function useViewTracking(
  ref: RefObject<Element | null>,
  eventName: string,
  params?: GTMEventPayload,
  options?: {
    once?: boolean;
    threshold?: number;
  }
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fired = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio >= (options?.threshold ?? 0.25)) {
          if (options?.once === false || !fired) {
            trackEvent(eventName, params ?? {});
            fired = true;
          }
          if (options?.once !== false) observer.disconnect();
        }
      },
      { threshold: [options?.threshold ?? 0.25] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, eventName, options?.once, options?.threshold, params]);
}
