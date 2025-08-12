"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Icon from "@/components/ui/Icon"
export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [premiumInfo, setPremiumInfo] = useState<{
    hasAccess: boolean
    planId?: string
    daysLeft?: number
  } | null>(null)
  // Récupérer les informations utilisateur
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            setUserRole(data.user?.role || 'USER')
            // Calculer les infos premium
            if (data.user?.premiumAccess && data.user.premiumAccess.isActive) {
              const endDate = new Date(data.user.premiumAccess.endDate)
              const now = new Date()
              if (endDate > now) {
                const diffTime = endDate.getTime() - now.getTime()
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                setPremiumInfo({
                  hasAccess: true,
                  planId: data.user.premiumAccess.planId,
                  daysLeft
                })
              } else {
                setPremiumInfo({ hasAccess: false })
              }
            } else {
              setPremiumInfo({ hasAccess: false })
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des infos utilisateur:', error)
        }
      }
    }
    fetchUserInfo()
  }, [session])
  // Structure du menu organisée par catégories
  const menuStructure = [
    {
      category: "Principal",
      items: [
        { 
          href: "/", 
          label: "Tableau de bord", 
          icon: "home",
          description: "Vue d'ensemble de vos activités"
        },
        { 
          href: "/missions", 
          label: "Missions", 
          icon: "tasks",
          description: "Gérer vos missions en cours"
        }
      ]
    },
    {
      category: "Outils IA",
      items: [
        { 
          href: "/agents", 
          label: "Équipe IA", 
          icon: "users",
          description: "Vos agents intelligents"
        },
        { 
          href: "/novabot", 
          label: "NovaBot", 
          icon: "brain",
          description: "Assistant conversationnel"
        },
        ...(premiumInfo?.hasAccess && (premiumInfo.planId === 'competitor-intelligence' || premiumInfo.planId === 'enterprise') ? [{
          href: "/competitors",
          label: "Veille Concurrentielle",
          icon: "search",
          description: "Surveillez vos concurrents en temps réel",
          isPremium: true
        }] : [])
      ]
    },
    {
      category: "Compte",
      items: [
        { 
          href: "/profile", 
          label: "Mon profil", 
          icon: "user",
          description: "Informations personnelles"
        },
        { 
          href: "/pricing", 
          label: "Abonnements", 
          icon: "credit-card",
          description: "Gérer votre abonnement"
        },
        {
          href: "/coupon",
          label: "Utiliser un coupon",
          icon: "gift",
          description: "Activer un code promo"
        },
        {
          href: "/refunds",
          label: "Remboursements",
          icon: "receipt",
          description: "Demander un remboursement"
        },
        { 
          href: "/settings", 
          label: "Paramètres", 
          icon: "cog",
          description: "Configuration de l'application"
        }
      ]
    }
  ]
  const closeMenu = () => setIsOpen(false)
  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  return (
    <>
      {/* Bouton hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-center items-center w-9 h-9 bg-transparent border-none cursor-pointer p-1.5 rounded-lg transition-colors duration-200 hover:bg-purple-50"
        aria-label="Menu mobile"
      >
        <div
          className={`w-4 h-0.5 bg-gray-600 mb-1 transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-1' : 'rotate-0'
          }`}
        />
        <div
          className={`w-4 h-0.5 bg-gray-600 mb-1 transition-all duration-300 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <div
          className={`w-4 h-0.5 bg-gray-600 transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-1' : 'rotate-0'
          }`}
        />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Menu mobile */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white p-6 relative overflow-hidden">
            {/* Effet de fond */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30">
                    <Icon name="bolt" className="text-white" size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Beriox AI</h1>
                    <p className="text-purple-100 text-sm">Menu de navigation</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200 ring-1 ring-white/30"
                  aria-label="Fermer le menu"
                >
                  <Icon name="times" className="text-white" size={18} />
                </button>
              </div>
            
            {/* Statut utilisateur */}
            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/30">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-lg">
                  {session?.user?.name || "Utilisateur"}
                </div>
                <div className="text-purple-100 text-sm truncate">
                  {session?.user?.email || "Non connecté"}
                </div>
                {premiumInfo?.hasAccess && (
                  <div className="text-xs text-yellow-300 font-semibold mt-2 flex items-center gap-2 bg-yellow-500/20 px-2 py-1 rounded-lg">
                    <Icon name="star" size={12} />
                    {premiumInfo.planId?.toUpperCase()} • {premiumInfo.daysLeft}j restants
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 bg-gray-50/50">
            {menuStructure.map((section, sectionIndex) => (
              <div key={section.category} className="mb-8">
                {/* Titre de section */}
                <div className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider bg-white/80 backdrop-blur-sm border-b border-gray-100/50">
                  {section.category}
                </div>
                
                {/* Items de la section */}
                <div className="bg-white/60 backdrop-blur-sm">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-4 px-6 py-5 text-sm font-medium transition-all duration-300 border-l-4 hover:bg-white/80 ${
                          isActive
                            ? 'bg-purple-50/80 text-purple-700 border-purple-500 shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 border-transparent'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'bg-purple-100 text-purple-600 shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                          <Icon
                            name={item.icon}
                            size={20}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</div>
                        </div>
                        
                        {/* Indicateur pour les éléments spéciaux */}
                        {(item.href === "/pricing" && !premiumInfo?.hasAccess) || item.isPremium ? (
                          <div className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-sm">
                            PRO
                          </div>
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-6">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-2xl hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transform"
            >
              <Icon name="sign-out-alt" size={18} />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
