"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN';
}

interface UserProfile {
  role: string;
}

export default function AdminGuard({ children, requiredRole = 'SUPER_ADMIN' }: AdminGuardProps) {
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

    // Récupérer le rôle de l'utilisateur
    fetchUserRole();
  }, [session, status, router]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification des permissions');
      }
      
      const data = await response.json();
      setUserRole(data.user?.role);
      
      // Vérifier si l'utilisateur a les permissions requises
      if (requiredRole === 'SUPER_ADMIN' && data.user?.role !== 'SUPER_ADMIN') {
        setError('Accès refusé - Permissions super administrateur requises');
      } else if (requiredRole === 'ADMIN' && !['ADMIN', 'SUPER_ADMIN'].includes(data.user?.role || '')) {
        setError('Accès refusé - Permissions administrateur requises');
      }
      
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      setError('Erreur lors de la vérification des permissions');
    } finally {
      setLoading(false);
    }
  };

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
        }}></div>
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        gap: '24px',
        padding: '32px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#ef444420',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px'
        }}>
          <Icon 
            name="shield-alt" 
            style={{ 
              fontSize: '32px',
              color: '#ef4444'
            }} 
          />
        </div>
        
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ef4444',
            margin: '0 0 12px 0'
          }}>
            Accès non autorisé
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0 0 32px 0',
            maxWidth: '400px',
            lineHeight: '1.5'
          }}>
            {error}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#635bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
          >
            <Icon name="home" />
            Retour à l&apos;accueil
          </button>
          
          <button
            onClick={() => router.push('/missions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            <Icon name="tasks" />
            Mes missions
          </button>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fbbf24',
          maxWidth: '500px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Icon 
              name="info-circle" 
              style={{ 
                color: '#92400e',
                fontSize: '16px',
                marginTop: '2px',
                flexShrink: 0
              }} 
            />
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#92400e',
                margin: '0 0 4px 0'
              }}>
                Besoin d&apos;un accès administrateur ?
              </h4>
              <p style={{
                fontSize: '13px',
                color: '#92400e',
                margin: 0,
                lineHeight: '1.4'
              }}>
                Contactez un super administrateur pour obtenir les permissions nécessaires.
                Votre rôle actuel : <strong>{userRole || &apos;Utilisateur&apos;}</strong>
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
