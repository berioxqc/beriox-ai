import { useEffect } from 'apos;react'apos;;

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useAnalytics = () => {
  const trackPageView = (url: string) => {
    if (typeof window !== 'apos;undefined'apos; && window.gtag) {
      window.gtag('apos;config'apos;, 'apos;G-4BNMH2FQMZ'apos;, {
        page_path: url,
      });
    }
  };

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'apos;undefined'apos; && window.gtag) {
      window.gtag('apos;event'apos;, action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackConversion = (conversionId: string, conversionLabel: string) => {
    if (typeof window !== 'apos;undefined'apos; && window.gtag) {
      window.gtag('apos;event'apos;, 'apos;conversion'apos;, {
        send_to: `${conversionId}/${conversionLabel}`,
      });
    }
  };

  const trackSignUp = (method: string) => {
    trackEvent('apos;sign_up'apos;, 'apos;engagement'apos;, method);
  };

  const trackLogin = (method: string) => {
    trackEvent('apos;login'apos;, 'apos;engagement'apos;, method);
  };

  const trackPurchase = (value: number, currency: string = 'apos;CAD'apos;) => {
    if (typeof window !== 'apos;undefined'apos; && window.gtag) {
      window.gtag('apos;event'apos;, 'apos;purchase'apos;, {
        value: value,
        currency: currency,
      });
    }
  };

  const trackButtonClick = (buttonName: string, page: string) => {
    trackEvent('apos;click'apos;, 'apos;button'apos;, `${page}_${buttonName}`);
  };

  const trackFormSubmission = (formName: string) => {
    trackEvent('apos;form_submit'apos;, 'apos;engagement'apos;, formName);
  };

  return {
    trackPageView,
    trackEvent,
    trackConversion,
    trackSignUp,
    trackLogin,
    trackPurchase,
    trackButtonClick,
    trackFormSubmission,
  };
};
