"use client";

import { useState } from 'apos;react'apos;;
import { signIn } from 'apos;next-auth/react'apos;;
import { useRouter } from 'apos;next/navigation'apos;;
import Link from 'apos;next/link'apos;;
import Icon from 'apos;@/components/ui/Icon'apos;;

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('apos;'apos;);
  const [success, setSuccess] = useState('apos;'apos;);
  const [formData, setFormData] = useState({
    name: 'apos;'apos;,
    email: 'apos;'apos;,
    password: 'apos;'apos;,
    confirmPassword: 'apos;'apos;
  });
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('apos;'apos;);
    
    try {
      const result = await signIn('apos;google'apos;, { 
        callbackUrl: 'apos;/missions'apos;,
        redirect: false 
      });
      
      if (result?.error) {
        setError('apos;Erreur lors de l\'apos;inscription avec Google'apos;);
      } else if (result?.ok) {
        router.push('apos;/missions'apos;);
      }
    } catch (error) {
      setError('apos;Erreur lors de l\'apos;inscription'apos;);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('apos;'apos;);
    setSuccess('apos;'apos;);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('apos;Les mots de passe ne correspondent pas'apos;);
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('apos;Le mot de passe doit contenir au moins 8 caractères'apos;);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('apos;/api/auth/register'apos;, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'apos;Erreur lors de l\'apos;inscription'apos;);
      } else {
        setSuccess(data.message);
        setFormData({ name: 'apos;'apos;, email: 'apos;'apos;, password: 'apos;'apos;, confirmPassword: 'apos;'apos; });
      }
    } catch (error) {
      setError('apos;Erreur lors de l\'apos;inscription'apos;);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Beriox AI</h1>
          <p className="text-gray-300">Créez votre compte</p>
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

          {/* Inscription Google */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <Icon name="chrome" className="w-5 h-5" />
            Continuer avec Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-300">ou</span>
            </div>
          </div>

          {/* Inscription par email */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'apos;Création du compte...'apos; : 'apos;Créer mon compte'apos;}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-400">
              Déjà un compte ?{'apos; 'apos;}
              <Link 
                href="/auth/signin"
                className="text-purple-300 hover:text-purple-200 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
