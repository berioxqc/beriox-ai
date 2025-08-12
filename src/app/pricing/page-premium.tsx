'apos;use client'apos;;

import { useState } from 'apos;react'apos;;
import { useSession } from 'apos;next-auth/react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import { useTheme } from 'apos;@/hooks/useTheme'apos;;
import Layout from 'apos;@/components/Layout'apos;;

export default function PremiumPricingPage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'apos;monthly'apos; | 'apos;yearly'apos;>('apos;monthly'apos;);

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

  const plans = [
    {
      id: 'apos;free'apos;,
      name: 'apos;Gratuit'apos;,
      description: 'apos;Parfait pour découvrir Beriox'apos;,
      price: billingPeriod === 'apos;monthly'apos; ? 0 : 0,
      originalPrice: null,
      period: billingPeriod === 'apos;monthly'apos; ? 'apos;/mois'apos; : 'apos;/an'apos;,
      isPopular: false,
      features: [
        'apos;10 missions par mois'apos;,
        'apos;Rapports basiques (3 APIs)'apos;,
        'apos;Beriox Performance Index (BPI)'apos;,
        'apos;Beriox Trust Score'apos;,
        'apos;Support communautaire'apos;,
        'apos;Analyses de sécurité de base'apos;
      ],
      limitations: [
        'apos;Pas de prédictions IA'apos;,
        'apos;Pas d\'apos;Opportunity Radar'apos;,
        'apos;Pas d\'apos;alertes proactives'apos;,
        'apos;Pas de vue 360° multi-sources'apos;
      ],
      buttonText: 'apos;Commencer gratuitement'apos;,
      buttonColor: theme.colors.neutral[600]
    },
    {
      id: 'apos;pro'apos;,
      name: 'apos;Pro'apos;,
      description: 'apos;Pour les professionnels du marketing'apos;,
      price: billingPeriod === 'apos;monthly'apos; ? 25 : 20,
      originalPrice: billingPeriod === 'apos;monthly'apos; ? 45 : 36,
      period: billingPeriod === 'apos;monthly'apos; ? 'apos;/mois'apos; : 'apos;/mois (facturé annuellement)'apos;,
      isPopular: true,
      features: [
        'apos;50 missions par mois'apos;,
        'apos;Rapports détaillés (8 APIs)'apos;,
        'apos;Vue 360° multi-sources'apos;,
        'apos;KPIs prévisionnels avec IA'apos;,
        'apos;Opportunity Radar (Top 5 actions)'apos;,
        'apos;Prédictions trafic 30 jours'apos;,
        'apos;Score risque SEO'apos;,
        'apos;Corrélations SEO + Performance'apos;,
        'apos;Support prioritaire'apos;
      ],
      limitations: [
        'apos;Pas d\'apos;alertes proactives temps réel'apos;,
        'apos;Pas de heatmaps intégrées'apos;,
        'apos;Pas de flux navigation avancé'apos;
      ],
      buttonText: 'apos;Essayer Pro'apos;,
      buttonColor: theme.colors.primary.main
    },
    {
      id: 'apos;enterprise'apos;,
      name: 'apos;Enterprise'apos;,
      description: 'apos;Solution complète pour les experts'apos;,
      price: billingPeriod === 'apos;monthly'apos; ? 65 : 52,
      originalPrice: billingPeriod === 'apos;monthly'apos; ? 125 : 100,
      period: billingPeriod === 'apos;monthly'apos; ? 'apos;/mois'apos; : 'apos;/mois (facturé annuellement)'apos;,
      isPopular: false,
      features: [
        'apos;Missions illimitées'apos;,
        'apos;Rapports ultra-complets (toutes APIs)'apos;,
        'apos;Alertes proactives intelligentes'apos;,
        'apos;Détection chutes de trafic temps réel'apos;,
        'apos;Heatmaps intégrées (Hotjar/Clarity)'apos;,
        'apos;Flux navigation utilisateur'apos;,
        'apos;Données invisibles concurrents'apos;,
        'apos;Beriox Opportunity Radar avancé'apos;,
        'apos;Prédictions IA multi-métriques'apos;,
        'apos;Support dédié + consulting'apos;,
        'apos;Accès API complet'apos;,
        'apos;Rapports personnalisés'apos;
      ],
      limitations: [],
      buttonText: 'apos;Passer à Enterprise'apos;,
      buttonColor: theme.colors.secondary
    }
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 'apos;1200px'apos;, margin: 'apos;0 auto'apos;, padding: theme.spacing.xl }}>
        {/* Header */}
        <div style={{ textAlign: 'apos;center'apos;, marginBottom: theme.spacing.xl }}>
          <h1 style={{
            fontSize: 'apos;3rem'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.md
          }}>
            Tarifs Beriox AI
          </h1>
          <p style={{
            fontSize: 'apos;1.25rem'apos;,
            color: theme.colors.neutral[600],
            marginBottom: theme.spacing.lg,
            maxWidth: 'apos;600px'apos;,
            margin: `0 auto ${theme.spacing.lg} auto`
          }}>
            Choisissez le plan qui correspond à vos besoins. 
            Tous les plans incluent nos KPIs uniques Beriox.
          </p>

          {/* Badge Promo */}
          <div style={{
            display: 'apos;inline-block'apos;,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.success + 'apos;20'apos;,
            color: theme.colors.success,
            borderRadius: 'apos;25px'apos;,
            fontSize: 'apos;14px'apos;,
            fontWeight: 'apos;600'apos;,
            marginBottom: theme.spacing.lg
          }}>
            🎉 Offre de lancement : -50% sur tous les plans pendant 3 mois !
          </div>

          {/* Toggle Billing */}
          <div style={{
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            gap: theme.spacing.md,
            marginBottom: theme.spacing.xl
          }}>
            <span style={{ 
              color: billingPeriod === 'apos;monthly'apos; ? theme.colors.neutral[900] : theme.colors.neutral[500],
              fontWeight: 'apos;500'apos;
            }}>
              Mensuel
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'apos;monthly'apos; ? 'apos;yearly'apos; : 'apos;monthly'apos;)}
              style={{
                width: 'apos;50px'apos;,
                height: 'apos;28px'apos;,
                borderRadius: 'apos;14px'apos;,
                border: 'apos;none'apos;,
                backgroundColor: billingPeriod === 'apos;yearly'apos; ? theme.colors.primary.main : theme.colors.neutral[300],
                position: 'apos;relative'apos;,
                cursor: 'apos;pointer'apos;,
                transition: 'apos;all 0.3s'apos;
              }}
            >
              <div style={{
                width: 'apos;20px'apos;,
                height: 'apos;20px'apos;,
                borderRadius: 'apos;50%'apos;,
                backgroundColor: 'apos;white'apos;,
                position: 'apos;absolute'apos;,
                top: 'apos;4px'apos;,
                left: billingPeriod === 'apos;yearly'apos; ? 'apos;26px'apos; : 'apos;4px'apos;,
                transition: 'apos;all 0.3s'apos;
              }} />
            </button>
            <span style={{ 
              color: billingPeriod === 'apos;yearly'apos; ? theme.colors.neutral[900] : theme.colors.neutral[500],
              fontWeight: 'apos;500'apos;
            }}>
              Annuel
            </span>
            {billingPeriod === 'apos;yearly'apos; && (
              <span style={{
                fontSize: 'apos;12px'apos;,
                backgroundColor: theme.colors.primary.light,
                color: theme.colors.primary.dark,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: 'apos;12px'apos;,
                fontWeight: 'apos;500'apos;
              }}>
                -20%
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div style={{
          display: 'apos;grid'apos;,
          gridTemplateColumns: 'apos;repeat(auto-fit, minmax(350px, 1fr))'apos;,
          gap: theme.spacing.xl,
          marginBottom: theme.spacing.xl
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: 'apos;white'apos;,
                borderRadius: 'apos;20px'apos;,
                padding: theme.spacing.xl,
                boxShadow: plan.isPopular ? 'apos;0 20px 40px rgba(90, 95, 202, 0.15)'apos; : 'apos;0 10px 30px rgba(0, 0, 0, 0.1)'apos;,
                border: plan.isPopular ? `2px solid ${theme.colors.primary.main}` : `1px solid ${theme.colors.neutral[200]}`,
                position: 'apos;relative'apos;,
                transform: plan.isPopular ? 'apos;scale(1.05)'apos; : 'apos;scale(1)'apos;,
                transition: 'apos;all 0.3s'apos;
              }}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div style={{
                  position: 'apos;absolute'apos;,
                  top: 'apos;-12px'apos;,
                  left: 'apos;50%'apos;,
                  transform: 'apos;translateX(-50%)'apos;,
                  backgroundColor: theme.colors.primary.main,
                  color: 'apos;white'apos;,
                  padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
                  borderRadius: 'apos;20px'apos;,
                  fontSize: 'apos;12px'apos;,
                  fontWeight: 'apos;600'apos;
                }}>
                  ⭐ PLUS POPULAIRE
                </div>
              )}

              {/* Plan Header */}
              <div style={{ textAlign: 'apos;center'apos;, marginBottom: theme.spacing.lg }}>
                <h3 style={{
                  fontSize: 'apos;1.5rem'apos;,
                  fontWeight: 'apos;bold'apos;,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.sm
                }}>
                  {plan.name}
                </h3>
                <p style={{
                  fontSize: 'apos;14px'apos;,
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing.lg
                }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;baseline'apos;, justifyContent: 'apos;center'apos;, gap: theme.spacing.sm }}>
                    {plan.originalPrice && (
                      <span style={{
                        fontSize: 'apos;1.5rem'apos;,
                        color: theme.colors.neutral[400],
                        textDecoration: 'apos;line-through'apos;
                      }}>
                        {plan.originalPrice} CAD
                      </span>
                    )}
                    <span style={{
                      fontSize: plan.price === 0 ? 'apos;2.5rem'apos; : 'apos;3rem'apos;,
                      fontWeight: 'apos;bold'apos;,
                      color: plan.price === 0 ? theme.colors.neutral[600] : theme.colors.primary.main
                    }}>
                      {plan.price === 0 ? 'apos;Gratuit'apos; : `${plan.price} CAD`}
                    </span>
                  </div>
                  {plan.price > 0 && (
                    <span style={{
                      fontSize: 'apos;14px'apos;,
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
                  fontSize: 'apos;14px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.md
                }}>
                  ✅ Inclus :
                </h4>
                <ul style={{ listStyle: 'apos;none'apos;, padding: 0, margin: 0 }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{
                      display: 'apos;flex'apos;,
                      alignItems: 'apos;flex-start'apos;,
                      gap: theme.spacing.sm,
                      marginBottom: theme.spacing.sm,
                      fontSize: 'apos;14px'apos;,
                      color: theme.colors.neutral[700]
                    }}>
                      <FontAwesomeIcon icon="check" style={{ color: theme.colors.success, marginTop: 'apos;2px'apos;, fontSize: 'apos;12px'apos; }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <h4 style={{
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[600],
                    marginBottom: theme.spacing.md
                  }}>
                    ⚠️ Limitations :
                  </h4>
                  <ul style={{ listStyle: 'apos;none'apos;, padding: 0, margin: 0 }}>
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} style={{
                        display: 'apos;flex'apos;,
                        alignItems: 'apos;flex-start'apos;,
                        gap: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                        fontSize: 'apos;14px'apos;,
                        color: theme.colors.neutral[500]
                      }}>
                        <FontAwesomeIcon icon="times" style={{ color: theme.colors.neutral[400], marginTop: 'apos;2px'apos;, fontSize: 'apos;12px'apos; }} />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => plan.id !== 'apos;free'apos; && handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                style={{
                  width: 'apos;100%'apos;,
                  padding: theme.spacing.md,
                  borderRadius: 'apos;12px'apos;,
                  border: 'apos;none'apos;,
                  backgroundColor: plan.id === 'apos;free'apos; ? theme.colors.neutral[200] : plan.buttonColor,
                  color: plan.id === 'apos;free'apos; ? theme.colors.neutral[600] : 'apos;white'apos;,
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  cursor: plan.id === 'apos;free'apos; ? 'apos;default'apos; : 'apos;pointer'apos;,
                  transition: 'apos;all 0.3s'apos;,
                  opacity: loading === plan.id ? 0.7 : 1
                }}
              >
                {loading === plan.id ? (
                  <FontAwesomeIcon icon="spinner" spin />
                ) : (
                  plan.buttonText
                )}
              </button>

              {plan.id === 'apos;free'apos; && (
                <p style={{
                  textAlign: 'apos;center'apos;,
                  fontSize: 'apos;12px'apos;,
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
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.xl,
          boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.05)'apos;
        }}>
          <h2 style={{
            fontSize: 'apos;2rem'apos;,
            fontWeight: 'apos;bold'apos;,
            textAlign: 'apos;center'apos;,
            marginBottom: theme.spacing.xl,
            color: theme.colors.neutral[900]
          }}>
            Questions Fréquentes
          </h2>

          <div style={{
            display: 'apos;grid'apos;,
            gridTemplateColumns: 'apos;repeat(auto-fit, minmax(400px, 1fr))'apos;,
            gap: theme.spacing.lg
          }}>
            <div>
              <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Qu'apos;est-ce que le Beriox Performance Index (BPI) ?
              </h3>
              <p style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600], lineHeight: 'apos;1.6'apos; }}>
                Le BPI est notre score propriétaire qui combine SEO (30%), Performance (25%), Conversion (25%) et Sécurité (20%) 
                pour donner une vision globale de la santé de votre site web.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Comment fonctionne l'apos;Opportunity Radar ?
              </h3>
              <p style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600], lineHeight: 'apos;1.6'apos; }}>
                Notre IA analyse vos données et identifie automatiquement les 5 actions prioritaires avec le meilleur ROI 
                pour améliorer vos performances.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Puis-je changer de plan à tout moment ?
              </h3>
              <p style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600], lineHeight: 'apos;1.6'apos; }}>
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm, color: theme.colors.neutral[900] }}>
                Les APIs sont-elles incluses dans le prix ?
              </h3>
              <p style={{ fontSize: 'apos;14px'apos;, color: theme.colors.neutral[600], lineHeight: 'apos;1.6'apos; }}>
                Oui, tous les coûts d'apos;APIs sont inclus dans votre abonnement. Nous gérons tous les quotas et optimisations 
                pour vous offrir le meilleur service au meilleur prix.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div style={{
          textAlign: 'apos;center'apos;,
          marginTop: theme.spacing.xl,
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.primary.light,
          borderRadius: 'apos;16px'apos;
        }}>
          <h2 style={{
            fontSize: 'apos;2rem'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.primary.dark,
            marginBottom: theme.spacing.md
          }}>
            Prêt à optimiser votre présence digitale ?
          </h2>
          <p style={{
            fontSize: 'apos;1.1rem'apos;,
            color: theme.colors.primary.dark,
            marginBottom: theme.spacing.lg
          }}>
            Rejoignez les professionnels qui font confiance à Beriox AI pour leurs analyses.
          </p>
          <button
            onClick={() => handleSubscribe('apos;pro'apos;)}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              borderRadius: 'apos;12px'apos;,
              border: 'apos;none'apos;,
              backgroundColor: theme.colors.primary.main,
              color: 'apos;white'apos;,
              fontSize: 'apos;18px'apos;,
              fontWeight: 'apos;600'apos;,
              cursor: 'apos;pointer'apos;,
              boxShadow: 'apos;0 4px 12px rgba(90, 95, 202, 0.3)'apos;
            }}
          >
            Commencer avec Pro - 25 CAD/mois
          </button>
        </div>
      </div>
    </Layout>
  );
}
