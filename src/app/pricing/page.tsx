'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from '@/hooks/useTheme'
import Layout from '@/components/Layout'
export default function PremiumPricingPage() {
  const { data: session } = useSession()
  const theme = useTheme()
  const [loading, setLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const handleSubscribe = async (planId: string) => {
    if (!session) {
      alert('Veuillez vous connecter pour souscrire')
      return
    }

    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erreur lors de la redirection')
      }
    } catch (error: any) {
      console.error('Erreur souscription:', error)
      alert('Erreur lors de la souscription: ' + error.message)
    } finally {
      setLoading(null)
    }
  }
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
        'Pas de vue 360° multi-sources',
        'Pas de veille concurrentielle'
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
        'Pas de flux navigation avancé',
        'Pas de veille concurrentielle avancée'
      ],
      buttonText: 'Essayer Pro',
      buttonColor: theme.colors.primary.main
    },
    {
      id: 'competitor-intelligence',
      name: 'Competitor Intelligence',
      description: 'Veille concurrentielle avancée',
      price: billingPeriod === 'monthly' ? 45 : 36,
      originalPrice: billingPeriod === 'monthly' ? 65 : 52,
      period: billingPeriod === 'monthly' ? '/mois' : '/mois (facturé annuellement)',
      isPopular: false,
      features: [
        'Tout du plan Pro',
        '🔍 Veille concurrentielle complète',
        '📊 Scraping automatisé multi-sites',
        '🤖 IA pour détection de promotions',
        '📈 Analytics et rapports avancés',
        '⚡ Alertes temps réel',
        '📋 Comparaison de prix intelligente',
        '🎯 Détection d\'opportunités',
        '📧 Notifications par email',
        '📱 Dashboard responsive',
        '🔐 Sécurité RGPD complète',
        '📊 Export Excel/PDF'
      ],
      limitations: [
        'Pas d\'alertes proactives temps réel',
        'Pas de heatmaps intégrées',
        'Pas de flux navigation avancé'
      ],
      buttonText: 'Démarrer la veille',
      buttonColor: '#10b981'
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
        'Tout des plans Pro + Competitor Intelligence',
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
      buttonColor: '#8b5cf6'
    }
  ]
  return (
    <Layout>
      {/* Bandeau Call-to-Action */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        padding: theme.spacing.lg,
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: theme.spacing.sm,
            margin: 0
          }}>
            🚀 Transformez votre stratégie digitale dès aujourd'hui !
          </h2>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.95,
            margin: `${theme.spacing.sm} 0 ${theme.spacing.md} 0`
          }}>
            Rejoignez plus de 500+ professionnels qui utilisent Beriox AI pour optimiser leurs performances
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: theme.spacing.md
          }}>
            <button
              onClick={() => handleSubscribe('pro')}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                backgroundColor: 'white',
                color: theme.colors.primary.main,
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              Essayer gratuitement
            </button>
            <span style={{
              fontSize: '14px',
              opacity: 0.9
            }}>
              ✨ Aucune carte de crédit requise
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: theme.spacing.xl }}>
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

          {/* Section Veille Concurrentielle */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: theme.spacing.md,
                margin: 0
              }}>
                🔍 Nouveau : Veille Concurrentielle Avancée
              </h2>
              <p style={{
                fontSize: '1.2rem',
                opacity: 0.95,
                marginBottom: theme.spacing.lg,
                lineHeight: '1.6'
              }}>
                Surveillez vos concurrents en temps réel avec notre IA spécialisée. 
                Détectez automatiquement les promotions, analysez les prix et identifiez les opportunités.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: theme.spacing.lg,
                marginBottom: theme.spacing.lg
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: theme.spacing.lg,
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>🤖</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: theme.spacing.sm }}>IA Intelligente</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Détection automatique des promotions et changements de prix</p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: theme.spacing.lg,
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>⚡</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: theme.spacing.sm }}>Temps Réel</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Alertes instantanées et monitoring continu</p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: theme.spacing.lg,
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>📊</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: theme.spacing.sm }}>Analytics Avancés</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Rapports détaillés et comparaisons intelligentes</p>
                </div>
              </div>
              
              <button
                onClick={() => handleSubscribe('competitor-intelligence')}
                style={{
                  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}
              >
                🚀 Démarrer la veille concurrentielle
              </button>
            </div>
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

        {/* Plans Grid - Amélioré pour 3 colonnes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          '@media (max-width: 1200px)': {
            gridTemplateColumns: 'repeat(2, 1fr)'
          },
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: theme.spacing.xl,
                boxShadow: plan.isPopular 
                  ? '0 25px 50px rgba(90, 95, 202, 0.2), 0 0 0 1px rgba(90, 95, 202, 0.1)' 
                  : '0 8px 25px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                border: plan.isPopular ? `3px solid ${theme.colors.primary.main}` : 'none',
                position: 'relative',
                transform: plan.isPopular ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.3s ease-in-out',
                background: plan.isPopular 
                  ? 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)' 
                  : 'white',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                if (!plan.isPopular) {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.12)'
                }
              }}
              onMouseOut={(e) => {
                if (!plan.isPopular) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  color: 'white',
                  padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
                  borderRadius: '25px',
                  fontSize: '13px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
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
                        {plan.originalPrice}$
                      </span>
                    )}
                    <span style={{
                      fontSize: plan.price === 0 ? '2.5rem' : '3rem',
                      fontWeight: 'bold',
                      color: plan.price === 0 ? theme.colors.neutral[600] : theme.colors.primary.main
                    }}>
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}$`}
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
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: '16px',
                  border: 'none',
                  background: plan.id === 'free' 
                    ? theme.colors.neutral[200] 
                    : plan.isPopular 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : plan.buttonColor,
                  color: plan.id === 'free' ? theme.colors.neutral[600] : 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: plan.id === 'free' ? 'default' : 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  opacity: loading === plan.id ? 0.7 : 1,
                  boxShadow: plan.id !== 'free' 
                    ? '0 6px 20px rgba(99, 102, 241, 0.25)' 
                    : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => {
                  if (plan.id !== 'free') {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.35)'
                  }
                }}
                onMouseOut={(e) => {
                  if (plan.id !== 'free') {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.25)'
                  }
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
            Commencer avec Pro - 25$/mois
          </button>
        </div>
      </div>
    </Layout>
  )
}
