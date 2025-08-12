"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'apos;ADMIN'apos; | 'apos;SUPER_ADMIN'apos;;
}

interface UserProfile {
  role: string;
}

export default function AdminGuard({ children, requiredRole = 'apos;SUPER_ADMIN'apos; }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Récupérer le rôle de l'apos;utilisateur
    fetchUserRole();
  }, [session, status, router]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('apos;/api/user/profile'apos;);
      
      if (!response.ok) {
        throw new Error('apos;Erreur lors de la vérification des permissions'apos;);
      }
      
      const data = await response.json();
      setUserRole(data.user?.role);
      
      // Vérifier si l'apos;utilisateur a les permissions requises
      if (requiredRole === 'apos;SUPER_ADMIN'apos; && data.user?.role !== 'apos;SUPER_ADMIN'apos;) {
        setError('apos;Accès refusé - Permissions super administrateur requises'apos;);
      } else if (requiredRole === 'apos;ADMIN'apos; && !['apos;ADMIN'apos;, 'apos;SUPER_ADMIN'apos;].includes(data.user?.role || 'apos;'apos;)) {
        setError('apos;Accès refusé - Permissions administrateur requises'apos;);
      }
      
    } catch (error) {
      console.error('apos;Erreur vérification rôle:'apos;, error);
      setError('apos;Erreur lors de la vérification des permissions'apos;);
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
            Validation de votre accès administrateur...
          </p>
        </div>
      </div>
    );
  }

  // Error state (no permissions)
  if (error) {
    return (
      <div style={{
        display: 'apos;flex'apos;,
        flexDirection: 'apos;column'apos;,
        alignItems: 'apos;center'apos;,
        justifyContent: 'apos;center'apos;,
        minHeight: 'apos;100vh'apos;,
        backgroundColor: 'apos;#f8fafc'apos;,
        textAlign: 'apos;center'apos;,
        gap: 'apos;24px'apos;,
        padding: 'apos;32px'apos;
      }}>
        <div style={{
          width: 'apos;80px'apos;,
          height: 'apos;80px'apos;,
          borderRadius: 'apos;50%'apos;,
          backgroundColor: 'apos;#ef444420'apos;,
          display: 'apos;flex'apos;,
          alignItems: 'apos;center'apos;,
          justifyContent: 'apos;center'apos;,
          marginBottom: 'apos;8px'apos;
        }}>
          <Icon 
            name="shield-alt" 
            style={{ 
              fontSize: 'apos;32px'apos;,
              color: 'apos;#ef4444'apos;
            }} 
          />
        </div>
        
        <div>
          <h1 style={{
            fontSize: 'apos;24px'apos;,
            fontWeight: 'apos;700'apos;,
            color: 'apos;#ef4444'apos;,
            margin: 'apos;0 0 12px 0'apos;
          }}>
            Accès non autorisé
          </h1>
          <p style={{
            color: 'apos;#6b7280'apos;,
            fontSize: 'apos;16px'apos;,
            margin: 'apos;0 0 32px 0'apos;,
            maxWidth: 'apos;400px'apos;,
            lineHeight: 'apos;1.5'apos;
          }}>
            {error}
          </p>
        </div>

        <div style={{
          display: 'apos;flex'apos;,
          gap: 'apos;16px'apos;,
          flexWrap: 'apos;wrap'apos;,
          justifyContent: 'apos;center'apos;
        }}>
          <button
            onClick={() => router.push('apos;/'apos;)}
            style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;,
              padding: 'apos;12px 24px'apos;,
              backgroundColor: 'apos;#635bff'apos;,
              color: 'apos;white'apos;,
              border: 'apos;none'apos;,
              borderRadius: 'apos;8px'apos;,
              fontWeight: 'apos;600'apos;,
              cursor: 'apos;pointer'apos;,
              fontSize: 'apos;14px'apos;,
              transition: 'apos;background-color 0.2s'apos;
            }}
          >
            <Icon name="home" />
            Retour à l'apos;accueil
          </button>
          
          <button
            onClick={() => router.push('apos;/missions'apos;)}
            style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;,
              padding: 'apos;12px 24px'apos;,
              backgroundColor: 'apos;white'apos;,
              color: 'apos;#6b7280'apos;,
              border: 'apos;1px solid #d1d5db'apos;,
              borderRadius: 'apos;8px'apos;,
              fontWeight: 'apos;600'apos;,
              cursor: 'apos;pointer'apos;,
              fontSize: 'apos;14px'apos;,
              transition: 'apos;all 0.2s'apos;
            }}
          >
            <Icon name="tasks" />
            Mes missions
          </button>
        </div>

        <div style={{
          marginTop: 'apos;24px'apos;,
          padding: 'apos;16px'apos;,
          backgroundColor: 'apos;#fef3c7'apos;,
          borderRadius: 'apos;8px'apos;,
          border: 'apos;1px solid #fbbf24'apos;,
          maxWidth: 'apos;500px'apos;
        }}>
          <div style={{
            display: 'apos;flex'apos;,
            alignItems: 'apos;flex-start'apos;,
            gap: 'apos;8px'apos;
          }}>
            <Icon 
              name="info-circle" 
              style={{ 
                color: 'apos;#92400e'apos;,
                fontSize: 'apos;16px'apos;,
                marginTop: 'apos;2px'apos;,
                flexShrink: 0
              }} 
            />
            <div>
              <h4 style={{
                fontSize: 'apos;14px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#92400e'apos;,
                margin: 'apos;0 0 4px 0'apos;
              }}>
                Besoin d'apos;un accès administrateur ?
              </h4>
              <p style={{
                fontSize: 'apos;13px'apos;,
                color: 'apos;#92400e'apos;,
                margin: 0,
                lineHeight: 'apos;1.4'apos;
              }}>
                Contactez un super administrateur pour obtenir les permissions nécessaires.
                Votre rôle actuel : <strong>{userRole || 'apos;Utilisateur'apos;}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success - user has required permissions
  return <>{children}</>;
}
