'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/hooks/useTheme';
import Layout from '@/components/Layout';

export default function PremiumPricingPage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

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

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      description: 'Parfait pour découvrir Beriox',
      price: billingPeriod === 'monthly' ? 0 : 0,
      originalPrice: null,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      isPopular: false,
      features: [
        '10 missions par mois',
        'Rapports basiques (3 APIs)',
        'Beriox Performance Index (BPI)',
        'Beriox Trust Score',
        'Support communautaire',
        'Analyses de sécurité de base'
      ],
      limitations: [
        'Pas de prédictions IA',
        'Pas d\'Opportunity Radar',
        'Pas d\'alertes proactives',
        'Pas de vue 360° multi-sources'
      ],
      buttonText: 'Commencer gratuitement',
      buttonColor: theme.colors.neutral[600]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Pour les professionnels du marketing',
      price: billingPeriod === 'monthly' ? 25 : 20,
      originalPrice: billingPeriod === 'monthly' ? 45 : 36,
      period: billingPeriod === 'monthly' ? '/mois' : '/mois (facturé annuellement)',
      isPopular: true,
      features: [
        '50 missions par mois',
        'Rapports détaillés (8 APIs)',
        'Vue 360° multi-sources',
        'KPIs prévisionnels avec IA',
        'Opportunity Radar (Top 5 actions)',
        'Prédictions trafic 30 jours',
        'Score risque SEO',
        'Corrélations SEO + Performance',
        'Support prioritaire'
      ],
      limitations: [
        'Pas d\'alertes proactives temps réel',
        'Pas de heatmaps intégrées',
        'Pas de flux navigation avancé'
      ],
      buttonText: 'Essayer Pro',
      buttonColor: theme.colors.primary.main
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Solution complète pour les experts',
      price: billingPeriod === 'monthly' ? 65 : 52,
      originalPrice: billingPeriod === 'monthly' ? 125 : 100,
      period: billingPeriod === 'monthly' ? '/mois' : '/mois (facturé annuellement)',
      isPopular: false,
      features: [
        'Missions illimitées',
        'Rapports ultra-complets (toutes APIs)',
        'Alertes proactives intelligentes',
        'Détection chutes de trafic temps réel',
        'Heatmaps intégrées (Hotjar/Clarity)',
        'Flux navigation utilisateur',
        'Données invisibles concurrents',
        'Beriox Opportunity Radar avancé',
        'Prédictions IA multi-métriques',
        'Support dédié + consulting',
        'Accès API complet',
        'Rapports personnalisés'
      ],
      limitations: [],
      buttonText: 'Passer à Enterprise',
      buttonColor: theme.colors.secondary
    }
  ];

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: theme.spacing.xl }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.md
          }}>
            Tarifs Beriox AI
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: theme.colors.neutral[600],
            marginBottom: theme.spacing.lg,
            maxWidth: '600px',
            margin: `0 auto ${theme.spacing.lg} auto`
          }}>
            Choisissez le plan qui correspond à vos besoins. 
            Tous les plans incluent nos KPIs uniques Beriox.
          </p>

          {/* Badge Promo */}
          <div style={{
            display: 'inline-block',
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.success + '20',
            color: theme.colors.success,
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: theme.spacing.lg
          }}>
            🎉 Offre de lancement : -50% sur tous les plans pendant 3 mois !
          </div>

          {/* Toggle Billing */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.xl
          }}>
            <span style={{ 
              color: billingPeriod === 'monthly' ? theme.colors.neutral[900] : theme.colors.neutral[500],
              fontWeight: '500'
            }}>
              Mensuel
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: billingPeriod === 'yearly' ? theme.colors.primary.main : theme.colors.neutral[300],
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '4px',
                left: billingPeriod === 'yearly' ? '26px' : '4px',
                transition: 'all 0.3s'
              }} />
            </button>
            <span style={{ 
              color: billingPeriod === 'yearly' ? theme.colors.neutral[900] : theme.colors.neutral[500],
              fontWeight: '500'
            }}>
              Annuel
            </span>
            {billingPeriod === 'yearly' && (
              <span style={{
                fontSize: '12px',
                backgroundColor: theme.colors.primary.light,
                color: theme.colors.primary.dark,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                -20%
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: theme.spacing.xl,
          marginBottom: theme.spacing.xl
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: theme.spacing.xl,
                boxShadow: plan.isPopular ? '0 20px 40px rgba(90, 95, 202, 0.15)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
                border: plan.isPopular ? `2px solid ${theme.colors.primary.main}` : `1px solid ${theme.colors.neutral[200]}`,
                position: 'relative',
                transform: plan.isPopular ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s'
              }}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: theme.colors.primary.main,
                  color: 'white',
                  padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ⭐ PLUS POPULAIRE
                </div>
              )}

              {/* Plan Header */}
              <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.sm
                }}>
                  {plan.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing.lg
                }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: theme.spacing.sm }}>
                    {plan.originalPrice && (
                      <span style={{
                        fontSize: '1.5rem',
                        color: theme.colors.neutral[400],
                        textDecoration: 'line-through'
                      }}>
                        {plan.originalPrice} CAD
                      </span>
                    )}
                    <span style={{
                      fontSize: plan.price === 0 ? '2.5rem' : '3rem',
                      fontWeight: 'bold',
                      color: plan.price === 0 ? theme.colors.neutral[600] : theme.colors.primary.main
                    }}>
                      {plan.price === 0 ? 'Gratuit' : `${plan.price} CAD`}
                    </span>
                  </div>
                  {plan.price > 0 && (
                    <span style={{
                      fontSize: '14px',
                      color: theme.colors.neutral[500]
                    }}>
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.md
                }}>
                  ✅ Inclus :
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: theme.spacing.sm,
                      marginBottom: theme.spacing.sm,
                      fontSize: '14px',
                      color: theme.colors.neutral[700]
                    }}>
                      <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, marginTop: '2px', fontSize: '12px' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.neutral[600],
                    marginBottom: theme.spacing.md
                  }}>
                    ⚠️ Limitations :
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                        fontSize: '14px',
                        color: theme.colors.neutral[500]
                      }}>
                        <FontAwesomeIcon icon="times" style={{ color: theme.colors.neutral[400], marginTop: '2px', fontSize: '12px' }} />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => plan.id !== 'free' && handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: plan.id === 'free' ? theme.colors.neutral[200] : plan.buttonColor,
                  color: plan.id === 'free' ? theme.colors.neutral[600] : 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: plan.id === 'free' ? 'default' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: loading === plan.id ? 0.7 : 1
                }}
              >
                {loading === plan.id ? (
                  <FontAwesomeIcon icon="spinner" spin />
                ) : (
                  plan.buttonText
                )}
              </button>

              {plan.id === 'free' && (
                <p style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: theme.colors.neutral[500],
                  marginTop: theme.spacing.sm
                }}>
                  Déjà inclus dans votre compte
                </p>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: theme.spacing.xl,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
            color: theme.colors.neutral[900]
          }}>
            Questions Fréquentes
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: theme.spacing.lg
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Qu'est-ce que le Beriox Performance Index (BPI) ?
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.neutral[600], lineHeight: '1.6' }}>
                Le BPI est notre score propriétaire qui combine SEO (30%), Performance (25%), Conversion (25%) et Sécurité (20%) 
                pour donner une vision globale de la santé de votre site web.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Comment fonctionne l'Opportunity Radar ?
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.neutral[600], lineHeight: '1.6' }}>
                Notre IA analyse vos données et identifie automatiquement les 5 actions prioritaires avec le meilleur ROI 
                pour améliorer vos performances.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Puis-je changer de plan à tout moment ?
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.neutral[600], lineHeight: '1.6' }}>
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Les APIs sont-elles incluses dans le prix ?
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.neutral[600], lineHeight: '1.6' }}>
                Oui, tous les coûts d'APIs sont inclus dans votre abonnement. Nous gérons tous les quotas et optimisations 
                pour vous offrir le meilleur service au meilleur prix.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div style={{
          textAlign: 'center',
          marginTop: theme.spacing.xl,
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.primary.light,
          borderRadius: '16px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: theme.colors.primary.dark,
            marginBottom: theme.spacing.md
          }}>
            Prêt à optimiser votre présence digitale ?
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: theme.colors.primary.dark,
            marginBottom: theme.spacing.lg
          }}>
            Rejoignez les professionnels qui font confiance à Beriox AI pour leurs analyses.
          </p>
          <button
            onClick={() => handleSubscribe('pro')}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              borderRadius: '12px',
              border: 'none',
              backgroundColor: theme.colors.primary.main,
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(90, 95, 202, 0.3)'
            }}
          >
            Commencer avec Pro - 25 CAD/mois
          </button>
        </div>
      </div>
    </Layout>
  );
}
