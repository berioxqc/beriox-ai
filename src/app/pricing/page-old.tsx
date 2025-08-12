'apos;use client'apos;;

import { useState } from 'apos;react'apos;;
import { useSession } from 'apos;next-auth/react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import { useTheme } from 'apos;@/hooks/useTheme'apos;;
import { stripePlans } from 'apos;@/lib/stripe'apos;;

export default function PricingPage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      alert('apos;Veuillez vous connecter pour souscrire'apos;);
      return;
    }

    setLoading(planId);

    try {
      const res = await fetch('apos;/api/stripe/checkout'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'apos;Erreur lors de la redirection'apos;);
      }
    } catch (error: any) {
      console.error('apos;Erreur souscription:'apos;, error);
      alert('apos;Erreur lors de la souscription: 'apos; + error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('apos;/api/stripe/portal'apos;, {
        method: 'apos;POST'apos;,
        headers: { 'apos;Content-Type'apos;: 'apos;application/json'apos; },
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'apos;Erreur lors de la redirection'apos;);
      }
    } catch (error: any) {
      console.error('apos;Erreur portail:'apos;, error);
      alert('apos;Erreur: 'apos; + error.message);
    }
  };

  return (
    <div style={{ 
      minHeight: 'apos;100vh'apos;,
      backgroundColor: theme.colors.neutral[50],
      padding: theme.spacing.xl
    }}>
      <div style={{ 
        maxWidth: 'apos;1200px'apos;,
        margin: 'apos;0 auto'apos;
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'apos;center'apos;,
          marginBottom: theme.spacing.xxxl
        }}>
          <h1 style={{
            fontSize: 'apos;3rem'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.md
          }}>
            Choisissez votre plan Beriox AI
          </h1>
          <p style={{
            fontSize: 'apos;1.25rem'apos;,
            color: theme.colors.neutral[600],
            maxWidth: 'apos;600px'apos;,
            margin: 'apos;0 auto'apos;
          }}>
            Libérez le potentiel de l'apos;IA collaborative pour vos projets. 
            Nos agents spécialisés travaillent ensemble pour des résultats exceptionnels.
          </p>
        </div>

        {/* Free Trial Banner */}
        <div style={{
          backgroundColor: theme.colors.primary.light,
          border: `1px solid ${theme.colors.primary.main}`,
          borderRadius: 'apos;12px'apos;,
          padding: theme.spacing.lg,
          textAlign: 'apos;center'apos;,
          marginBottom: theme.spacing.xl
        }}>
          <FontAwesomeIcon icon="gift" style={{ 
            color: theme.colors.primary.main,
            fontSize: 'apos;24px'apos;,
            marginBottom: theme.spacing.sm
          }} />
          <h3 style={{ 
            color: theme.colors.primary.dark,
            marginBottom: theme.spacing.xs
          }}>
            Essai gratuit inclus
          </h3>
          <p style={{ color: theme.colors.neutral[700] }}>
            10 missions gratuites pour découvrir la puissance de nos agents IA
          </p>
        </div>

        {/* Plans Grid */}
        <div style={{
          display: 'apos;grid'apos;,
          gridTemplateColumns: 'apos;repeat(auto-fit, minmax(350px, 1fr))'apos;,
          gap: theme.spacing.xl,
          marginBottom: theme.spacing.xl
        }}>
          {/* Free Plan */}
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.xl,
            boxShadow: 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
            border: `2px solid ${theme.colors.neutral[200]}`,
            position: 'apos;relative'apos;
          }}>
            <div style={{ textAlign: 'apos;center'apos;, marginBottom: theme.spacing.lg }}>
              <FontAwesomeIcon icon="rocket" style={{ 
                color: theme.colors.neutral[500],
                fontSize: 'apos;32px'apos;,
                marginBottom: theme.spacing.md
              }} />
              <h3 style={{ 
                fontSize: 'apos;1.5rem'apos;,
                fontWeight: 'apos;bold'apos;,
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing.sm
              }}>
                Essai Gratuit
              </h3>
              <div style={{ marginBottom: theme.spacing.md }}>
                <span style={{ 
                  fontSize: 'apos;2.5rem'apos;,
                  fontWeight: 'apos;bold'apos;,
                  color: theme.colors.neutral[900]
                }}>
                  0$
                </span>
                <span style={{ color: theme.colors.neutral[600] }}> CAD</span>
              </div>
              <p style={{ color: theme.colors.neutral[600] }}>
                Parfait pour découvrir nos agents IA
              </p>
            </div>

            <ul style={{ 
              listStyle: 'apos;none'apos;,
              padding: 0,
              marginBottom: theme.spacing.lg
            }}>
              {[
                'apos;10 missions gratuites'apos;,
                'apos;Accès aux agents standards'apos;,
                'apos;Rapports de base'apos;,
                'apos;Support communautaire'apos;
              ].map((feature, idx) => (
                <li key={idx} style={{
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  marginBottom: theme.spacing.sm
                }}>
                  <FontAwesomeIcon icon="check" style={{ 
                    color: theme.colors.success,
                    marginRight: theme.spacing.sm
                  }} />
                  <span style={{ color: theme.colors.neutral[700] }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled
              style={{
                width: 'apos;100%'apos;,
                padding: theme.spacing.md,
                borderRadius: 'apos;8px'apos;,
                border: 'apos;none'apos;,
                backgroundColor: theme.colors.neutral[200],
                color: theme.colors.neutral[500],
                fontWeight: 'apos;bold'apos;,
                cursor: 'apos;not-allowed'apos;
              }}
            >
              Déjà inclus
            </button>
          </div>

          {/* Paid Plans */}
          {stripePlans.map((plan, idx) => (
            <div key={plan.id} style={{
              backgroundColor: 'apos;white'apos;,
              borderRadius: 'apos;16px'apos;,
              padding: theme.spacing.xl,
              boxShadow: plan.id === 'apos;pro'apos; 
                ? `0 8px 25px rgba(90, 95, 202, 0.15)` 
                : 'apos;0 4px 6px rgba(0, 0, 0, 0.05)'apos;,
              border: plan.id === 'apos;pro'apos; 
                ? `2px solid ${theme.colors.primary.main}` 
                : `2px solid ${theme.colors.neutral[200]}`,
              position: 'apos;relative'apos;,
              transform: plan.id === 'apos;pro'apos; ? 'apos;scale(1.05)'apos; : 'apos;scale(1)'apos;
            }}>
              {plan.id === 'apos;pro'apos; && (
                <div style={{
                  position: 'apos;absolute'apos;,
                  top: 'apos;-12px'apos;,
                  left: 'apos;50%'apos;,
                  transform: 'apos;translateX(-50%)'apos;,
                  backgroundColor: theme.colors.primary.main,
                  color: 'apos;white'apos;,
                  padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                  borderRadius: 'apos;20px'apos;,
                  fontSize: 'apos;0.875rem'apos;,
                  fontWeight: 'apos;bold'apos;
                }}>
                  ⭐ Populaire
                </div>
              )}

              <div style={{ textAlign: 'apos;center'apos;, marginBottom: theme.spacing.lg }}>
                <FontAwesomeIcon icon={plan.id === 'apos;pro'apos; ? 'apos;star'apos; : 'apos;crown'apos;} style={{ 
                  color: plan.id === 'apos;pro'apos; ? theme.colors.primary.main : theme.colors.warning,
                  fontSize: 'apos;32px'apos;,
                  marginBottom: theme.spacing.md
                }} />
                <h3 style={{ 
                  fontSize: 'apos;1.5rem'apos;,
                  fontWeight: 'apos;bold'apos;,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.sm
                }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: theme.spacing.md }}>
                  <span style={{ 
                    fontSize: 'apos;2.5rem'apos;,
                    fontWeight: 'apos;bold'apos;,
                    color: theme.colors.neutral[900]
                  }}>
                    {plan.price}$
                  </span>
                  <span style={{ color: theme.colors.neutral[600] }}> CAD/mois</span>
                </div>
                <p style={{ color: theme.colors.neutral[600] }}>
                  {plan.id === 'apos;pro'apos; 
                    ? 'apos;Idéal pour les professionnels'apos; 
                    : 'apos;Pour les équipes et entreprises'apos;
                  }
                </p>
              </div>

              <ul style={{ 
                listStyle: 'apos;none'apos;,
                padding: 0,
                marginBottom: theme.spacing.lg
              }}>
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} style={{
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    marginBottom: theme.spacing.sm
                  }}>
                    <FontAwesomeIcon icon="check" style={{ 
                      color: theme.colors.success,
                      marginRight: theme.spacing.sm
                    }} />
                    <span style={{ color: theme.colors.neutral[700] }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                style={{
                  width: 'apos;100%'apos;,
                  padding: theme.spacing.md,
                  borderRadius: 'apos;8px'apos;,
                  border: 'apos;none'apos;,
                  backgroundColor: plan.id === 'apos;pro'apos; 
                    ? theme.colors.primary.main 
                    : theme.colors.neutral[800],
                  color: 'apos;white'apos;,
                  fontWeight: 'apos;bold'apos;,
                  cursor: loading === plan.id ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
                  opacity: loading === plan.id ? 0.7 : 1,
                  transition: 'apos;all 0.2s'apos;
                }}
              >
                {loading === plan.id ? (
                  <>
                    <FontAwesomeIcon icon="spinner" spin style={{ marginRight: theme.spacing.sm }} />
                    Redirection...
                  </>
                ) : (
                  'apos;Souscrire maintenant'apos;
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Manage Subscription */}
        {session && (
          <div style={{
            textAlign: 'apos;center'apos;,
            padding: theme.spacing.lg,
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;12px'apos;,
            boxShadow: 'apos;0 2px 4px rgba(0, 0, 0, 0.05)'apos;
          }}>
            <p style={{ 
              color: theme.colors.neutral[600],
              marginBottom: theme.spacing.md
            }}>
              Vous avez déjà un abonnement ?
            </p>
            <button
              onClick={handleManageSubscription}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                borderRadius: 'apos;8px'apos;,
                border: `1px solid ${theme.colors.neutral[300]}`,
                backgroundColor: 'apos;white'apos;,
                color: theme.colors.neutral[700],
                fontWeight: 'apos;medium'apos;,
                cursor: 'apos;pointer'apos;
              }}
            >
              <FontAwesomeIcon icon="cog" style={{ marginRight: theme.spacing.sm }} />
              Gérer mon abonnement
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div style={{ 
          marginTop: theme.spacing.xxxl,
          textAlign: 'apos;center'apos;
        }}>
          <h2 style={{
            fontSize: 'apos;2rem'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.xl
          }}>
            Questions fréquentes
          </h2>
          <div style={{
            display: 'apos;grid'apos;,
            gridTemplateColumns: 'apos;repeat(auto-fit, minmax(300px, 1fr))'apos;,
            gap: theme.spacing.lg,
            textAlign: 'apos;left'apos;
          }}>
            {[
              {
                q: 'apos;Puis-je annuler à tout moment ?'apos;,
                a: 'apos;Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client.'apos;
              },
              {
                q: 'apos;Les prix sont-ils en dollars canadiens ?'apos;,
                a: 'apos;Oui, tous nos prix sont affichés en dollars canadiens (CAD).'apos;
              },
              {
                q: 'apos;Que se passe-t-il après l\'apos;essai gratuit ?'apos;,
                a: 'apos;Après 10 missions, vous devrez choisir un plan payant pour continuer à utiliser nos agents.'apos;
              }
            ].map((faq, idx) => (
              <div key={idx} style={{
                backgroundColor: 'apos;white'apos;,
                padding: theme.spacing.lg,
                borderRadius: 'apos;12px'apos;,
                boxShadow: 'apos;0 2px 4px rgba(0, 0, 0, 0.05)'apos;
              }}>
                <h4 style={{
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.sm,
                  fontWeight: 'apos;bold'apos;
                }}>
                  {faq.q}
                </h4>
                <p style={{ color: theme.colors.neutral[600] }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
