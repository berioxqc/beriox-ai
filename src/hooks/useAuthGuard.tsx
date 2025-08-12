import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import React from 'react'
interface UseAuthGuardOptions {
  requireAuth?: boolean
  redirectTo?: string
  showLimitedContent?: boolean
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showLimitedContent, setShowLimitedContent] = useState(false)
  const {
    requireAuth = false,
    redirectTo = '/auth/signin',
    showLimitedContent: defaultShowLimited = true
  } = options
  useEffect(() => {
    if (status === 'loading') return
    if (requireAuth && !session) {
      // Redirection pour les pages qui nécessitent une authentification stricte
      router.push(redirectTo)
      return
    }

    if (!session && defaultShowLimited) {
      // Afficher le contenu limité pour les utilisateurs non connectés
      setShowLimitedContent(true)
    }

    setIsLoading(false)
  }, [session, status, requireAuth, redirectTo, router, defaultShowLimited])
  return {
    session,
    status,
    isLoading,
    isAuthenticated: !!session,
    showLimitedContent,
    user: session?.user
  }
}

// Composant pour afficher le contenu limité
export function LimitedContentWrapper({ 
  children, 
  limitedContent,
  isAuthenticated 
}: {
  children: React.ReactNode
  limitedContent: React.ReactNode
  isAuthenticated: boolean
}) {
  if (!isAuthenticated) {
    return <>{limitedContent}</>
  }

  return <>{children}</>
}

// Composant pour afficher un message de connexion
export function LoginPrompt({ 
  message = "Connectez-vous pour accéder à toutes les fonctionnalités",
  showSignUp = true 
}: {
  message?: string
  showSignUp?: boolean
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Beriox AI</h1>
          <p className="text-gray-300 mb-8">{message}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="space-y-4">
            <a 
              href="/auth/signin"
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-3-3 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
              </svg>
              Se connecter
            </a>
            
            {showSignUp && (
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Pas encore de compte ?{' '}
                  <a href="/auth/signup" className="text-purple-300 hover:text-purple-200 transition-colors">
                    Créer un compte
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
