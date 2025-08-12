"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = "/auth/signin" 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      console.log("ProtectedRoute: Utilisateur non authentifié, redirection vers:", redirectTo)
      setIsRedirecting(true)
      router.push(redirectTo)
    }
  }, [status, session, router, redirectTo])
  // État de chargement
  if (status === "loading") {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Utilisateur non authentifié - afficher le fallback ou rediriger
  if (status === "unauthenticated") {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Redirection vers la page de connexion...</p>
          <p className="mt-2 text-sm text-gray-500">Vous devez être connecté pour accéder à cette page</p>
        </div>
      </div>
    )
  }

  // Utilisateur authentifié - afficher le contenu
  return <>{children}</>
}
