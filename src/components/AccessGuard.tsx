"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useTheme, useStyles } from "@/hooks/useTheme";
import { 
  hasRouteAccess, 
  getAccessDeniedMessage, 
  UserPermissions 
} from "@/lib/access-control";

interface AccessGuardProps {
  children: React.ReactNode;
  requiredRole?: 'apos;USER'apos; | 'apos;ADMIN'apos; | 'apos;SUPER_ADMIN'apos;;
  requiredPlan?: string[];
  premiumOnly?: boolean;
  superAdminOnly?: boolean;
  fallback?: React.ReactNode;
}

export default function AccessGuard({ 
  children, 
  requiredRole,
  requiredPlan,
  premiumOnly,
  superAdminOnly,
  fallback
}: AccessGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useStyles();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchUserPermissions();
  }, [session, status, router]);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      
      // Récupérer les informations utilisateur
      const [profileRes, premiumRes] = await Promise.all([
        fetch('apos;/api/user/profile'apos;),
        fetch('apos;/api/user/premium-info'apos;)
      ]);

      const profile = profileRes.ok ? await profileRes.json() : null;
      const premiumInfo = premiumRes.ok ? await premiumRes.json() : null;

      const permissions: UserPermissions = {
        role: profile?.user?.role || 'apos;USER'apos;,
        plan: premiumInfo?.planId,
        hasAccess: premiumInfo?.hasAccess || false
      };

      setUserPermissions(permissions);

      // Vérifier l'apos;accès
      const access = hasRouteAccess(window.location.pathname, permissions);
      setHasAccess(access);

    } catch (error) {
      console.error('apos;Erreur lors de la vérification des permissions:'apos;, error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div style={{
        display: 'apos;flex'apos;,
        flexDirection: 'apos;column'apos;,
        alignItems: 'apos;center'apos;,
        justifyContent: 'apos;center'apos;,
        minHeight: 'apos;100vh'apos;,
        backgroundColor: 'apos;#f8fafc'apos;,
        gap: 'apos;20px'apos;
      }}>
        <div style={{
          width: 'apos;48px'apos;,
          height: 'apos;48px'apos;,
          border: 'apos;4px solid #e3e8ee'apos;,
          borderTop: 'apos;4px solid #635bff'apos;,
          borderRadius: 'apos;50%'apos;,
          animation: 'apos;spin 1s linear infinite'apos;
        }}></div>
        <div style={{ textAlign: 'apos;center'apos; }}>
          <h2 style={{
            fontSize: 'apos;18px'apos;,
            fontWeight: 'apos;600'apos;,
            color: 'apos;#0a2540'apos;,
            margin: 'apos;0 0 8px 0'apos;
          }}>
            Vérification des permissions
          </h2>
          <p style={{
            color: 'apos;#6b7280'apos;,
            fontSize: 'apos;14px'apos;,
            margin: 0
          }}>
            Validation de votre accès...
          </p>
        </div>
      </div>
    );
  }

  // Accès refusé
  if (!hasAccess && userPermissions) {
    const errorMessage = getAccessDeniedMessage(window.location.pathname, userPermissions);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div style={{
        display: 'apos;flex'apos;,
        flexDirection: 'apos;column'apos;,
        alignItems: 'apos;center'apos;,
        justifyContent: 'apos;center'apos;,
        minHeight: 'apos;100vh'apos;,
        backgroundColor: 'apos;#f8fafc'apos;,
        gap: 'apos;24px'apos;,
        padding: 'apos;24px'apos;
      }}>
        <div style={{
          width: 'apos;80px'apos;,
          height: 'apos;80px'apos;,
          borderRadius: 'apos;50%'apos;,
          backgroundColor: 'apos;#fee2e2'apos;,
          display: 'apos;flex'apos;,
          alignItems: 'apos;center'apos;,
          justifyContent: 'apos;center'apos;,
          fontSize: 'apos;32px'apos;
        }}>
          🚫
        </div>
        
        <div style={{ textAlign: 'apos;center'apos;, maxWidth: 'apos;500px'apos; }}>
          <h1 style={{
            fontSize: 'apos;24px'apos;,
            fontWeight: 'apos;700'apos;,
            color: 'apos;#dc2626'apos;,
            margin: 'apos;0 0 12px 0'apos;
          }}>
            Accès Refusé
          </h1>
          
          <p style={{
            color: 'apos;#6b7280'apos;,
            fontSize: 'apos;16px'apos;,
            margin: 'apos;0 0 32px 0'apos;,
            lineHeight: 'apos;1.5'apos;
          }}>
            {errorMessage}
          </p>

          <div style={{
            display: 'apos;flex'apos;,
            gap: 'apos;12px'apos;,
            justifyContent: 'apos;center'apos;,
            flexWrap: 'apos;wrap'apos;
          }}>
            <button
              onClick={() => router.push('apos;/'apos;)}
              style={{
                ...styles.button,
                backgroundColor: theme.primary,
                color: 'apos;white'apos;
              }}
            >
              <Icon name="home" style={{ marginRight: 'apos;8px'apos; }} />
              Retour à l'apos;accueil
            </button>
            
            <button
              onClick={() => router.push('apos;/pricing'apos;)}
              style={{
                ...styles.button,
                backgroundColor: theme.border,
                color: theme.text
              }}
            >
              <Icon name="dollar-sign" style={{ marginRight: 'apos;8px'apos; }} />
              Voir les abonnements
            </button>
          </div>
        </div>

        {/* Informations supplémentaires selon le type d'apos;accès refusé */}
        {userPermissions.role === 'apos;USER'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            border: 'apos;1px solid #e5e7eb'apos;,
            borderRadius: 'apos;12px'apos;,
            padding: 'apos;20px'apos;,
            maxWidth: 'apos;500px'apos;,
            textAlign: 'apos;center'apos;
          }}>
            <h3 style={{
              fontSize: 'apos;16px'apos;,
              fontWeight: 'apos;600'apos;,
              margin: 'apos;0 0 12px 0'apos;,
              color: theme.text
            }}>
              Besoin d'apos;un accès premium ?
            </h3>
            <p style={{
              color: theme.textSecondary,
              fontSize: 'apos;14px'apos;,
              margin: 'apos;0 0 16px 0'apos;
            }}>
              Contactez votre administrateur ou passez à un plan supérieur pour accéder à cette fonctionnalité.
            </p>
            <button
              onClick={() => router.push('apos;/profile'apos;)}
              style={{
                ...styles.button,
                backgroundColor: theme.primary,
                color: 'apos;white'apos;,
                fontSize: 'apos;14px'apos;
              }}
            >
              <Icon name="user" style={{ marginRight: 'apos;8px'apos; }} />
              Mon profil
            </button>
          </div>
        )}
      </div>
    );
  }

  // Accès autorisé
  return <>{children}</>;
}
