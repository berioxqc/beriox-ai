"use client"
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await signIn('google', { 
        callbackUrl: '/missions',
        redirect: false 
      })
      if (result?.error) {
        setError('Erreur lors de la connexion avec Google')
      } else if (result?.ok) {
        router.push('/missions')
      }
    } catch (error) {
      setError('Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Beriox AI</h1>
          <p className="text-gray-300">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Connexion Google uniquement */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-4 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="chrome" className="w-6 h-6" />
            {isLoading ? 'Connexion...' : 'Continuer avec Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              En vous connectant, vous acceptez nos{' '}
              <Link 
                href="/terms"
                className="text-purple-300 hover:text-purple-200 transition-colors"
              >
                conditions d'utilisation
              </Link>
              {' '}et notre{' '}
              <Link 
                href="/privacy"
                className="text-purple-300 hover:text-purple-200 transition-colors"
              >
                politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
