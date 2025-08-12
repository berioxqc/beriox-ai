"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Icon from "@/components/ui/Icon"
import { useTheme, useStyles } from "@/hooks/useTheme"
import { 
  hasRouteAccess, 
  getAccessDeniedMessage, 
  UserPermissions 
} from "@/lib/access-control"
interface AccessGuardProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  requiredPlan?: string[]
  premiumOnly?: boolean
  superAdminOnly?: boolean
  fallback?: React.ReactNode
}

export default function AccessGuard({ 
  children, 
  requiredRole,
  requiredPlan,
  premiumOnly,
  superAdminOnly,
  fallback
}: AccessGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const styles = useStyles()
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchUserPermissions()
  }, [session, status, router])
  const fetchUserPermissions = async () => {
    try {
      setLoading(true)
      // Récupérer les informations utilisateur
      const [profileRes, premiumRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/premium-info')
      ])
      const profile = profileRes.ok ? await profileRes.json() : null
      const premiumInfo = premiumRes.ok ? await premiumRes.json() : null
      const permissions: UserPermissions = {
        role: profile?.user?.role || 'USER',
        plan: premiumInfo?.planId,
        hasAccess: premiumInfo?.hasAccess || false
      }
      setUserPermissions(permissions)
      // Vérifier l'accès
      const access = hasRouteAccess(window.location.pathname, permissions)
      setHasAccess(access)
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }
  // Loading state
  if (status === "loading" || loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        gap: '20px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e3e8ee',
          borderTop: '4px solid #635bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0a2540',
            margin: '0 0 8px 0'
          }}>
            Vérification des permissions
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Validation de votre accès...
          </p>
        </div>
      </div>
    )
  }

  // Accès refusé
  if (!hasAccess && userPermissions) {
    const errorMessage = getAccessDeniedMessage(window.location.pathname, userPermissions)
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        gap: '24px',
        padding: '24px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          🚫
        </div>
        
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#dc2626',
            margin: '0 0 12px 0'
          }}>
            Accès Refusé
          </h1>
          
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0 0 32px 0',
            lineHeight: '1.5'
          }}>
            {errorMessage}
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                ...styles.button,
                backgroundColor: theme.primary,
                color: 'white'
              }}
            >
              <Icon name="home" style={{ marginRight: '8px' }} />
              Retour à l'accueil
            </button>
            
            <button
              onClick={() => router.push('/pricing')}
              style={{
                ...styles.button,
                backgroundColor: theme.border,
                color: theme.text
              }}
            >
              <Icon name="dollar-sign" style={{ marginRight: '8px' }} />
              Voir les abonnements
            </button>
          </div>
        </div>

        {/* Informations supplémentaires selon le type d'accès refusé */}
        {userPermissions.role === 'USER' && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: theme.text
            }}>
              Besoin d'un accès premium ?
            </h3>
            <p style={{
              color: theme.textSecondary,
              fontSize: '14px',
              margin: '0 0 16px 0'
            }}>
              Contactez votre administrateur ou passez à un plan supérieur pour accéder à cette fonctionnalité.
            </p>
            <button
              onClick={() => router.push('/profile')}
              style={{
                ...styles.button,
                backgroundColor: theme.primary,
                color: 'white',
                fontSize: '14px'
              }}
            >
              <Icon name="user" style={{ marginRight: '8px' }} />
              Mon profil
            </button>
          </div>
        )}
      </div>
    )
  }

  // Accès autorisé
  return <>{children}</>
}
