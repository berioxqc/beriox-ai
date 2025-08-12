"use client"
import { useState, useEffect } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const analytics = useAnalytics()
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowConsent(true)
    }
  }, [])
  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    setShowConsent(false)
    // Track consent event
    analytics.trackEvent('cookie_consent', 'engagement', 'accept_all')
    // Enable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      })
    }
  }
  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', 'necessary')
    setShowConsent(false)
    // Track consent event
    analytics.trackEvent('cookie_consent', 'engagement', 'necessary_only')
    // Disable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      })
    }
  }
  if (!showConsent) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🍪 Nous utilisons des cookies
          </h3>
          <p className="text-sm text-gray-600">
            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
            En continuant à utiliser notre site, vous acceptez notre utilisation des cookies.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={acceptNecessary}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cookies essentiels uniquement
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Accepter tout
          </button>
        </div>
      </div>
    </div>
  )
}
