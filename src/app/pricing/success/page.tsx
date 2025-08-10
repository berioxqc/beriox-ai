'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/hooks/useTheme';
import Link from 'next/link';

function SuccessContent() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    setSessionId(sessionIdParam);
  }, [searchParams]);

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.neutral[50],
      padding: theme.spacing.lg
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: theme.spacing.xl,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: theme.colors.success,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: `0 auto ${theme.spacing.lg} auto`
        }}>
          <FontAwesomeIcon icon="check" style={{ color: 'white', fontSize: '32px' }} />
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: theme.colors.success,
          marginBottom: theme.spacing.md
        }}>
          Paiement réussi !
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing.xl,
          lineHeight: '1.6'
        }}>
          Félicitations ! Votre abonnement Beriox AI est maintenant actif.
          Vous avez accès à toutes les fonctionnalités premium.
        </p>

        <div style={{
          backgroundColor: theme.colors.primary.light,
          borderRadius: '12px',
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: theme.colors.primary.dark,
            marginBottom: theme.spacing.sm
          }}>
            Prochaines étapes
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            textAlign: 'left'
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
              color: theme.colors.primary.dark
            }}>
              <FontAwesomeIcon icon="rocket" />
              Créez votre première mission premium
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
              color: theme.colors.primary.dark
            }}>
              <FontAwesomeIcon icon="bullseye" />
              Explorez l'Opportunity Radar
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              color: theme.colors.primary.dark
            }}>
              <FontAwesomeIcon icon="chart-line" />
              Découvrez vos KPIs Beriox uniques
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'center' }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            backgroundColor: theme.colors.primary.main,
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Créer une mission
          </Link>
          
          <Link href="/profile" style={{
            display: 'inline-block',
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            backgroundColor: 'white',
            color: theme.colors.primary.main,
            textDecoration: 'none',
            border: `2px solid ${theme.colors.primary.main}`,
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Mon profil
          </Link>
        </div>

        {sessionId && (
          <div style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.neutral[100],
            borderRadius: '8px',
            fontSize: '12px',
            color: theme.colors.neutral[500]
          }}>
            ID de session : {sessionId}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FontAwesomeIcon icon="spinner" spin style={{ fontSize: '32px' }} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
