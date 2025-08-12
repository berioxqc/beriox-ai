"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Icon from "@/components/ui/Icon"
export default function HomePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Simuler le chargement
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Beriox AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link 
                    href="/missions"
                    className="text-white hover:text-purple-200 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile"
                    className="text-white hover:text-purple-200 transition-colors"
                  >
                    Profil
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin"
                    className="text-white hover:text-purple-200 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="bg-white text-purple-900 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Votre équipe d'agents IA
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Automatisez et optimisez vos processus business avec l'intelligence artificielle avancée
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {session ? (
              <Link 
                href="/missions"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Accéder au Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  Commencer gratuitement
                </Link>
                <Link 
                  href="/auth/signin"
                  className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Icon name="zap" className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Automatisation IA</h3>
            <p className="text-purple-200">
              Automatisez vos tâches répétitives avec nos agents IA spécialisés
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
              <Icon name="users" className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Équipe IA</h3>
            <p className="text-purple-200">
              Une équipe d'agents IA spécialisés pour chaque domaine d'expertise
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
              <Icon name="trending-up" className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Optimisation</h3>
            <p className="text-purple-200">
              Optimisez vos processus et augmentez votre productivité
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Plans d'abonnement</h2>
          <p className="text-purple-200 mb-8">
            Choisissez le plan qui correspond à vos besoins
          </p>
          <Link 
            href="/pricing"
            className="bg-white/10 backdrop-blur-lg text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
          >
            Voir les prix
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-purple-200">
            <p>&copy; 2024 Beriox AI. Tous droits réservés.</p>
            <div className="mt-4 space-x-4">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
