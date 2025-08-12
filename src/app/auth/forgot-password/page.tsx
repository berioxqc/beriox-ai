"use client";

import { useState } from 'apos;react'apos;;
import Link from 'apos;next/link'apos;;
import Icon from 'apos;@/components/ui/Icon'apos;;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('apos;'apos;);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('apos;'apos;);
  const [success, setSuccess] = useState('apos;'apos;);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('apos;'apos;);
    setSuccess('apos;'apos;);

    try {
      const response = await fetch('apos;/api/auth/forgot-password'apos;, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'apos;Erreur lors de l\'apos;envoi de l\'apos;email'apos;);
      } else {
        setSuccess(data.message);
        setEmail('apos;'apos;);
      }
    } catch (error) {
      setError('apos;Erreur lors de l\'apos;envoi de l\'apos;email'apos;);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Beriox AI</h1>
          <p className="text-gray-300">Mot de passe oublié</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'apos;Envoi...'apos; : 'apos;Envoyer le lien de réinitialisation'apos;}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin"
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
