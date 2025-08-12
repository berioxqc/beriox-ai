import { useEffect, useCallback } from 'react'
import * as Sentry from '@sentry/nextjs'
interface MonitoringEvent {
  name: string
  properties?: Record<string, any>
  level?: 'info' | 'warning' | 'error'
}

interface PerformanceMetric {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
}

export function useMonitoring() {
  // Track custom events
  const trackEvent = useCallback((event: MonitoringEvent) => {
    try {
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: event.name,
        data: event.properties,
        level: event.level || 'info',
      })
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Event tracked:', event)
      }
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }, [])
  // Track performance metrics
  const trackPerformance = useCallback((metric: PerformanceMetric) => {
    try {
      Sentry.metrics.gauge(metric.name, metric.value, {
        unit: metric.unit,
        tags: metric.tags,
      })
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('⚡ Performance metric:', metric)
      }
    } catch (error) {
      console.error('Failed to track performance metric:', error)
    }
  }, [])
  // Track errors
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    try {
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      })
      console.error('🚨 Error tracked:', error, context)
    } catch (err) {
      console.error('Failed to track error:', err)
    }
  }, [])
  // Track page views
  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    try {
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Page view: ${page}`,
        data: properties,
        level: 'info',
      })
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 Page view:', page, properties)
      }
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }, [])
  // Track user actions
  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackEvent({
      name: `user_action_${action}`,
      properties,
      level: 'info',
    })
  }, [trackEvent])
  // Track API calls
  const trackApiCall = useCallback((endpoint: string, method: string, duration: number, status: number) => {
    trackPerformance({
      name: 'api_call_duration',
      value: duration,
      unit: 'ms',
      tags: {
        endpoint,
        method,
        status: status.toString(),
      },
    })
    if (status >= 400) {
      trackEvent({
        name: 'api_error',
        properties: {
          endpoint,
          method,
          status,
          duration,
        },
        level: 'error',
      })
    }
  }, [trackPerformance, trackEvent])
  // Auto-track performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track Core Web Vitals
      const trackCoreWebVitals = () => {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          trackPerformance({
            name: 'lcp',
            value: lastEntry.startTime,
            unit: 'ms',
          })
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        // FID (First Input Delay)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            trackPerformance({
              name: 'fid',
              value: entry.processingStart - entry.startTime,
              unit: 'ms',
            })
          })
        }).observe({ entryTypes: ['first-input'] })
        // CLS (Cumulative Layout Shift)
        new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          trackPerformance({
            name: 'cls',
            value: clsValue,
          })
        }).observe({ entryTypes: ['layout-shift'] })
      }
      trackCoreWebVitals()
    }
  }, [trackPerformance])
  return {
    trackEvent,
    trackPerformance,
    trackError,
    trackPageView,
    trackUserAction,
    trackApiCall,
  }
}
