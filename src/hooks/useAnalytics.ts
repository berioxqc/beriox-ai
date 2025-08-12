import { useEffect } from 'react'
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const useAnalytics = () => {
  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-4BNMH2FQMZ', {
        page_path: url,
      })
    }
  }
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }
  const trackConversion = (conversionId: string, conversionLabel: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${conversionId}/${conversionLabel}`,
      })
    }
  }
  const trackSignUp = (method: string) => {
    trackEvent('sign_up', 'engagement', method)
  }
  const trackLogin = (method: string) => {
    trackEvent('login', 'engagement', method)
  }
  const trackPurchase = (value: number, currency: string = 'CAD') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        value: value,
        currency: currency,
      })
    }
  }
  const trackButtonClick = (buttonName: string, page: string) => {
    trackEvent('click', 'button', `${page}_${buttonName}`)
  }
  const trackFormSubmission = (formName: string) => {
    trackEvent('form_submit', 'engagement', formName)
  }
  return {
    trackPageView,
    trackEvent,
    trackConversion,
    trackSignUp,
    trackLogin,
    trackPurchase,
    trackButtonClick,
    trackFormSubmission,
  }
}