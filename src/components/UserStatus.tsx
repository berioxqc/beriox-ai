"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Icon from "@/components/ui/Icon"
export default function UserStatus() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            setProfile(data)
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error)
        }
      }
    }
    fetchProfile()
  }, [session])
  // Déterminer l'accès premium basé sur le rôle et les crédits
  let hasAccess = false
  let plan = undefined
  if (profile?.user?.role === 'SUPER_ADMIN' || profile?.user?.role === 'ADMIN') {
    hasAccess = true
    plan = 'enterprise'
  } else if (profile?.user?.credits && profile.user.credits > 0) {
    hasAccess = true
    plan = 'basic'
  }

  const getRoleColor = () => {
    switch (profile?.user?.role) {
      case 'SUPER_ADMIN':
        return 'text-red-600 bg-red-50'
      case 'ADMIN':
        return 'text-orange-600 bg-orange-50'
      case 'USER':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }
  const getPlanColor = () => {
    switch (plan) {
      case 'enterprise':
        return 'text-purple-600 bg-purple-50'
      case 'basic':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }
  return (
    <div className="flex items-center gap-3">
      {/* Statut Premium */}
      {hasAccess && (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getPlanColor()}`}>
          <Icon name="crown" size={12} />
          <span>{plan?.toUpperCase()}</span>
        </div>
      )}

      {/* Rôle utilisateur */}
      {profile?.user?.role && (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
          <Icon name="user" size={12} />
          <span>{profile.user.role.replace('_', ' ')}</span>
        </div>
      )}

      {/* Crédits */}
      {profile?.user?.credits !== undefined && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-600">
          <Icon name="star" size={12} />
          <span>{profile.user.credits} crédits</span>
        </div>
      )}

      {/* Avatar utilisateur */}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm text-white font-semibold bg-cover bg-center"
          style={{
            backgroundImage: session?.user?.image ? `url(${session.user.image})` : 'none'
          }}
        >
          {!session?.user?.image && (session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U")}
        </div>
        <div className="hidden md:block">
          <div className="text-sm font-medium text-gray-900">
            {session?.user?.name || "Utilisateur"}
          </div>
          <div className="text-xs text-gray-500">
            {session?.user?.email || "Non connecté"}
          </div>
        </div>
      </div>
    </div>
  )
}
