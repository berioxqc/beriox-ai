import { useEffect, useCallback } from 'apos;react'apos;;
import * as Sentry from 'apos;@sentry/nextjs'apos;;

interface MonitoringEvent {
  name: string;
  properties?: Record<string, any>;
  level?: 'apos;info'apos; | 'apos;warning'apos; | 'apos;error'apos;;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

export function useMonitoring() {
  // Track custom events
  const trackEvent = useCallback((event: MonitoringEvent) => {
    try {
      Sentry.addBreadcrumb({
        category: 'apos;user-action'apos;,
        message: event.name,
        data: event.properties,
        level: event.level || 'apos;info'apos;,
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'apos;development'apos;) {
        console.log('apos;📊 Event tracked:'apos;, event);
      }
    } catch (error) {
      console.error('apos;Failed to track event:'apos;, error);
    }
  }, []);

  // Track performance metrics
  const trackPerformance = useCallback((metric: PerformanceMetric) => {
    try {
      Sentry.metrics.gauge(metric.name, metric.value, {
        unit: metric.unit,
        tags: metric.tags,
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'apos;development'apos;) {
        console.log('apos;⚡ Performance metric:'apos;, metric);
      }
    } catch (error) {
      console.error('apos;Failed to track performance metric:'apos;, error);
    }
  }, []);

  // Track errors
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    try {
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });

      console.error('apos;🚨 Error tracked:'apos;, error, context);
    } catch (err) {
      console.error('apos;Failed to track error:'apos;, err);
    }
  }, []);

  // Track page views
  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    try {
      Sentry.addBreadcrumb({
        category: 'apos;navigation'apos;,
        message: `Page view: ${page}`,
        data: properties,
        level: 'apos;info'apos;,
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'apos;development'apos;) {
        console.log('apos;📄 Page view:'apos;, page, properties);
      }
    } catch (error) {
      console.error('apos;Failed to track page view:'apos;, error);
    }
  }, []);

  // Track user actions
  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackEvent({
      name: `user_action_${action}`,
      properties,
      level: 'apos;info'apos;,
    });
  }, [trackEvent]);

  // Track API calls
  const trackApiCall = useCallback((endpoint: string, method: string, duration: number, status: number) => {
    trackPerformance({
      name: 'apos;api_call_duration'apos;,
      value: duration,
      unit: 'apos;ms'apos;,
      tags: {
        endpoint,
        method,
        status: status.toString(),
      },
    });

    if (status >= 400) {
      trackEvent({
        name: 'apos;api_error'apos;,
        properties: {
          endpoint,
          method,
          status,
          duration,
        },
        level: 'apos;error'apos;,
      });
    }
  }, [trackPerformance, trackEvent]);

  // Auto-track performance metrics
  useEffect(() => {
    if (typeof window !== 'apos;undefined'apos;) {
      // Track Core Web Vitals
      const trackCoreWebVitals = () => {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          trackPerformance({
            name: 'apos;lcp'apos;,
            value: lastEntry.startTime,
            unit: 'apos;ms'apos;,
          });
        }).observe({ entryTypes: ['apos;largest-contentful-paint'apos;] });

        // FID (First Input Delay)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            trackPerformance({
              name: 'apos;fid'apos;,
              value: entry.processingStart - entry.startTime,
              unit: 'apos;ms'apos;,
            });
          });
        }).observe({ entryTypes: ['apos;first-input'apos;] });

        // CLS (Cumulative Layout Shift)
        new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          trackPerformance({
            name: 'apos;cls'apos;,
            value: clsValue,
          });
        }).observe({ entryTypes: ['apos;layout-shift'apos;] });
      };

      trackCoreWebVitals();
    }
  }, [trackPerformance]);

  return {
    trackEvent,
    trackPerformance,
    trackError,
    trackPageView,
    trackUserAction,
    trackApiCall,
  };
}
