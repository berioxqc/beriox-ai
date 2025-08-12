'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/hooks/useTheme';
import { stripePlans } from '@/lib/stripe';

export default function PricingPage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      alert('Veuillez vous connecter pour souscrire');
      return;
    }

    setLoading(planId);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la redirection');
      }
    } catch (error: any) {
      console.error('Erreur souscription:', error);
      alert('Erreur lors de la souscription: ' + error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la redirection');
      }
    } catch (error: any) {
      console.error('Erreur portail:', error);
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: theme.colors.neutral[50],
      padding: theme.spacing.xl
    }}>
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: theme.spacing.xxxl
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.md
          }}>
            Choisissez votre plan Beriox AI
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: theme.colors.neutral[600],
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Libérez le potentiel de l'IA collaborative pour vos projets. 
            Nos agents spécialisés travaillent ensemble pour des résultats exceptionnels.
          </p>
        </div>

        {/* Free Trial Banner */}
        <div style={{
          backgroundColor: theme.colors.primary.light,
          border: `1px solid ${theme.colors.primary.main}`,
          borderRadius: '12px',
          padding: theme.spacing.lg,
          textAlign: 'center',
          marginBottom: theme.spacing.xl
        }}>
          <FontAwesomeIcon icon="gift" style={{ 
            color: theme.colors.primary.main,
            fontSize: '24px',
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: theme.spacing.xl,
          marginBottom: theme.spacing.xl
        }}>
          {/* Free Plan */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.xl,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${theme.colors.neutral[200]}`,
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
              <FontAwesomeIcon icon="rocket" style={{ 
                color: theme.colors.neutral[500],
                fontSize: '32px',
                marginBottom: theme.spacing.md
              }} />
              <h3 style={{ 
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing.sm
              }}>
                Essai Gratuit
              </h3>
              <div style={{ marginBottom: theme.spacing.md }}>
                <span style={{ 
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
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
              listStyle: 'none',
              padding: 0,
              marginBottom: theme.spacing.lg
            }}>
              {[
                '10 missions gratuites',
                'Accès aux agents standards',
                'Rapports de base',
                'Support communautaire'
              ].map((feature, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
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
                width: '100%',
                padding: theme.spacing.md,
                borderRadius: '8px',
                border: 'none',
                backgroundColor: theme.colors.neutral[200],
                color: theme.colors.neutral[500],
                fontWeight: 'bold',
                cursor: 'not-allowed'
              }}
            >
              Déjà inclus
            </button>
          </div>

          {/* Paid Plans */}
          {stripePlans.map((plan, idx) => (
            <div key={plan.id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: theme.spacing.xl,
              boxShadow: plan.id === 'pro' 
                ? `0 8px 25px rgba(90, 95, 202, 0.15)` 
                : '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: plan.id === 'pro' 
                ? `2px solid ${theme.colors.primary.main}` 
                : `2px solid ${theme.colors.neutral[200]}`,
              position: 'relative',
              transform: plan.id === 'pro' ? 'scale(1.05)' : 'scale(1)'
            }}>
              {plan.id === 'pro' && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: theme.colors.primary.main,
                  color: 'white',
                  padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  ⭐ Populaire
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
                <FontAwesomeIcon icon={plan.id === 'pro' ? 'star' : 'crown'} style={{ 
                  color: plan.id === 'pro' ? theme.colors.primary.main : theme.colors.warning,
                  fontSize: '32px',
                  marginBottom: theme.spacing.md
                }} />
                <h3 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.sm
                }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: theme.spacing.md }}>
                  <span style={{ 
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: theme.colors.neutral[900]
                  }}>
                    {plan.price}$
                  </span>
                  <span style={{ color: theme.colors.neutral[600] }}> CAD/mois</span>
                </div>
                <p style={{ color: theme.colors.neutral[600] }}>
                  {plan.id === 'pro' 
                    ? 'Idéal pour les professionnels' 
                    : 'Pour les équipes et entreprises'
                  }
                </p>
              </div>

              <ul style={{ 
                listStyle: 'none',
                padding: 0,
                marginBottom: theme.spacing.lg
              }}>
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} style={{
                    display: 'flex',
                    alignItems: 'center',
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
                  width: '100%',
                  padding: theme.spacing.md,
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: plan.id === 'pro' 
                    ? theme.colors.primary.main 
                    : theme.colors.neutral[800],
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: loading === plan.id ? 'not-allowed' : 'pointer',
                  opacity: loading === plan.id ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading === plan.id ? (
                  <>
                    <FontAwesomeIcon icon="spinner" spin style={{ marginRight: theme.spacing.sm }} />
                    Redirection...
                  </>
                ) : (
                  'Souscrire maintenant'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Manage Subscription */}
        {session && (
          <div style={{
            textAlign: 'center',
            padding: theme.spacing.lg,
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
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
                borderRadius: '8px',
                border: `1px solid ${theme.colors.neutral[300]}`,
                backgroundColor: 'white',
                color: theme.colors.neutral[700],
                fontWeight: 'medium',
                cursor: 'pointer'
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
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.xl
          }}>
            Questions fréquentes
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: theme.spacing.lg,
            textAlign: 'left'
          }}>
            {[
              {
                q: 'Puis-je annuler à tout moment ?',
                a: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client.'
              },
              {
                q: 'Les prix sont-ils en dollars canadiens ?',
                a: 'Oui, tous nos prix sont affichés en dollars canadiens (CAD).'
              },
              {
                q: 'Que se passe-t-il après l\'essai gratuit ?',
                a: 'Après 10 missions, vous devrez choisir un plan payant pour continuer à utiliser nos agents.'
              }
            ].map((faq, idx) => (
              <div key={idx} style={{
                backgroundColor: 'white',
                padding: theme.spacing.lg,
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}>
                <h4 style={{
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.sm,
                  fontWeight: 'bold'
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
