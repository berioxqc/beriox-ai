'apos;use client'apos;;

import { useEffect, useState, Suspense } from 'apos;react'apos;;
import { useSearchParams } from 'apos;next/navigation'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import { useTheme } from 'apos;@/hooks/useTheme'apos;;
import Link from 'apos;next/link'apos;;

function SuccessContent() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('apos;session_id'apos;);
    setSessionId(sessionIdParam);
  }, [searchParams]);

  return (
    <div style={{ 
      minHeight: 'apos;100vh'apos;,
      display: 'apos;flex'apos;,
      alignItems: 'apos;center'apos;,
      justifyContent: 'apos;center'apos;,
      backgroundColor: theme.colors.neutral[50],
      padding: theme.spacing.lg
    }}>
      <div style={{
        backgroundColor: 'apos;white'apos;,
        borderRadius: 'apos;16px'apos;,
        padding: theme.spacing.xl,
        boxShadow: 'apos;0 10px 30px rgba(0, 0, 0, 0.1)'apos;,
        maxWidth: 'apos;500px'apos;,
        width: 'apos;100%'apos;,
        textAlign: 'apos;center'apos;
      }}>
        <div style={{
          width: 'apos;80px'apos;,
          height: 'apos;80px'apos;,
          backgroundColor: theme.colors.success,
          borderRadius: 'apos;50%'apos;,
          display: 'apos;flex'apos;,
          alignItems: 'apos;center'apos;,
          justifyContent: 'apos;center'apos;,
          margin: `0 auto ${theme.spacing.lg} auto`
        }}>
          <FontAwesomeIcon icon="check" style={{ color: 'apos;white'apos;, fontSize: 'apos;32px'apos; }} />
        </div>

        <h1 style={{
          fontSize: 'apos;2.5rem'apos;,
          fontWeight: 'apos;bold'apos;,
          color: theme.colors.success,
          marginBottom: theme.spacing.md
        }}>
          Paiement réussi !
        </h1>

        <p style={{
          fontSize: 'apos;1.2rem'apos;,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing.xl,
          lineHeight: 'apos;1.6'apos;
        }}>
          Félicitations ! Votre abonnement Beriox AI est maintenant actif.
          Vous avez accès à toutes les fonctionnalités premium.
        </p>

        <div style={{
          backgroundColor: theme.colors.primary.light,
          borderRadius: 'apos;12px'apos;,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl
        }}>
          <h3 style={{
            fontSize: 'apos;1.3rem'apos;,
            fontWeight: 'apos;600'apos;,
            color: theme.colors.primary.dark,
            marginBottom: theme.spacing.sm
          }}>
            Prochaines étapes
          </h3>
          <ul style={{
            listStyle: 'apos;none'apos;,
            padding: 0,
            margin: 0,
            textAlign: 'apos;left'apos;
          }}>
            <li style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
              color: theme.colors.primary.dark
            }}>
              <FontAwesomeIcon icon="rocket" />
              Créez votre première mission premium
            </li>
            <li style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
              color: theme.colors.primary.dark
            }}>
              <FontAwesomeIcon icon="bullseye" />
              Explorez l'apos;Opportunity Radar
            </li>
            <li style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: theme.spacing.sm,
              color: theme.colors.primary.dark
            }}>
              <FontAwesomeIcon icon="chart-line" />
              Découvrez vos KPIs Beriox uniques
            </li>
          </ul>
        </div>

        <div style={{ display: 'apos;flex'apos;, gap: theme.spacing.md, justifyContent: 'apos;center'apos; }}>
          <Link href="/" style={{
            display: 'apos;inline-block'apos;,
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            backgroundColor: theme.colors.primary.main,
            color: 'apos;white'apos;,
            textDecoration: 'apos;none'apos;,
            borderRadius: 'apos;12px'apos;,
            fontWeight: 'apos;600'apos;,
            fontSize: 'apos;16px'apos;
          }}>
            Créer une mission
          </Link>
          
          <Link href="/profile" style={{
            display: 'apos;inline-block'apos;,
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            backgroundColor: 'apos;white'apos;,
            color: theme.colors.primary.main,
            textDecoration: 'apos;none'apos;,
            border: `2px solid ${theme.colors.primary.main}`,
            borderRadius: 'apos;12px'apos;,
            fontWeight: 'apos;600'apos;,
            fontSize: 'apos;16px'apos;
          }}>
            Mon profil
          </Link>
        </div>

        {sessionId && (
          <div style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.neutral[100],
            borderRadius: 'apos;8px'apos;,
            fontSize: 'apos;12px'apos;,
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
        minHeight: 'apos;100vh'apos;,
        display: 'apos;flex'apos;,
        alignItems: 'apos;center'apos;,
        justifyContent: 'apos;center'apos;
      }}>
        <FontAwesomeIcon icon="spinner" spin style={{ fontSize: 'apos;32px'apos; }} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
