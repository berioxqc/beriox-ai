"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Icon from "@/components/ui/Icon"

export default function HomePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Simuler le chargement
    setTimeout(() => {
      setLoading(false)
    }, 800)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200/30 border-t-purple-400 mx-auto" />
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400/50" />
          </div>
          <p className="mt-6 text-white text-lg font-medium">Chargement de Beriox AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="relative bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="zap" className="text-white" size={16} />
              </div>
              <h1 className="text-2xl font-bold text-white">Beriox AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link 
                    href="/missions"
                    className="text-white hover:text-purple-200 transition-colors duration-200 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile"
                    className="text-white hover:text-purple-200 transition-colors duration-200 font-medium"
                  >
                    Profil
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin"
                    className="text-white hover:text-purple-200 transition-colors duration-200 font-medium"
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
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
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-500/20 text-purple-200 border border-purple-500/30">
              <Icon name="star" className="mr-2" size={16} />
              IA de nouvelle génération
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Votre équipe d'
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              agents IA
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-200 mb-12 max-w-4xl mx-auto leading-relaxed">
            Automatisez et optimisez vos processus business avec l'intelligence artificielle avancée
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            {session ? (
              <Link 
                href="/missions"
                className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
              >
                <span className="flex items-center justify-center">
                  Accéder au Dashboard
                  <Icon name="arrow-right" className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </span>
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/signup"
                  className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
                >
                  <span className="flex items-center justify-center">
                    Commencer gratuitement
                    <Icon name="arrow-right" className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </span>
                </Link>
                <Link 
                  href="/auth/signin"
                  className="group bg-white/10 backdrop-blur-lg text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    Se connecter
                    <Icon name="log-in" className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Icon name="zap" className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Automatisation IA</h3>
            <p className="text-purple-200 text-lg leading-relaxed">
              Automatisez vos tâches répétitives avec nos agents IA spécialisés et intelligents
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10">
            <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Icon name="users" className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Équipe IA</h3>
            <p className="text-purple-200 text-lg leading-relaxed">
              Une équipe d'agents IA spécialisés pour chaque domaine d'expertise métier
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Icon name="trending-up" className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Optimisation</h3>
            <p className="text-purple-200 text-lg leading-relaxed">
              Optimisez vos processus et augmentez votre productivité de manière significative
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">99%</div>
            <div className="text-purple-200">Précision IA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-purple-200">Disponibilité</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">10x</div>
            <div className="text-purple-200">Productivité</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-purple-200">Agents IA</div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Plans d'abonnement</h2>
          <p className="text-purple-200 text-xl mb-10 max-w-2xl mx-auto">
            Choisissez le plan qui correspond parfaitement à vos besoins et commencez dès aujourd'hui
          </p>
          <Link 
            href="/pricing"
            className="group inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
          >
            <span className="flex items-center">
              Voir les prix
              <Icon name="external-link" className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-black/20 border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-purple-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Icon name="zap" className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-white">Beriox AI</span>
            </div>
            <p className="text-lg mb-6">&copy; 2024 Beriox AI. Tous droits réservés.</p>
            <div className="flex justify-center space-x-8">
              <Link href="/privacy" className="hover:text-white transition-colors duration-200 font-medium">
                Confidentialité
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors duration-200 font-medium">
                Cookies
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-200 font-medium">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
