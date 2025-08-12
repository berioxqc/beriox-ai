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
        'apos;Pas de vue 360° multi-sources'apos;,
        'apos;Pas de veille concurrentielle'apos;
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
        'apos;Pas de flux navigation avancé'apos;,
        'apos;Pas de veille concurrentielle avancée'apos;
      ],
      buttonText: 'apos;Essayer Pro'apos;,
      buttonColor: theme.colors.primary.main
    },
    {
      id: 'apos;competitor-intelligence'apos;,
      name: 'apos;Competitor Intelligence'apos;,
      description: 'apos;Veille concurrentielle avancée'apos;,
      price: billingPeriod === 'apos;monthly'apos; ? 45 : 36,
      originalPrice: billingPeriod === 'apos;monthly'apos; ? 65 : 52,
      period: billingPeriod === 'apos;monthly'apos; ? 'apos;/mois'apos; : 'apos;/mois (facturé annuellement)'apos;,
      isPopular: false,
      features: [
        'apos;Tout du plan Pro'apos;,
        'apos;🔍 Veille concurrentielle complète'apos;,
        'apos;📊 Scraping automatisé multi-sites'apos;,
        'apos;🤖 IA pour détection de promotions'apos;,
        'apos;📈 Analytics et rapports avancés'apos;,
        'apos;⚡ Alertes temps réel'apos;,
        'apos;📋 Comparaison de prix intelligente'apos;,
        'apos;🎯 Détection d\'apos;opportunités'apos;,
        'apos;📧 Notifications par email'apos;,
        'apos;📱 Dashboard responsive'apos;,
        'apos;🔐 Sécurité RGPD complète'apos;,
        'apos;📊 Export Excel/PDF'apos;
      ],
      limitations: [
        'apos;Pas d\'apos;alertes proactives temps réel'apos;,
        'apos;Pas de heatmaps intégrées'apos;,
        'apos;Pas de flux navigation avancé'apos;
      ],
      buttonText: 'apos;Démarrer la veille'apos;,
      buttonColor: 'apos;#10b981'apos;
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
        'apos;Tout des plans Pro + Competitor Intelligence'apos;,
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
      buttonColor: 'apos;#8b5cf6'apos;
    }
  ];

  return (
    <Layout>
      {/* Bandeau Call-to-Action */}
      <div style={{
        background: 'apos;linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'apos;,
        padding: theme.spacing.lg,
        textAlign: 'apos;center'apos;,
        color: 'apos;white'apos;,
        boxShadow: 'apos;0 4px 12px rgba(99, 102, 241, 0.3)'apos;
      }}>
        <div style={{ maxWidth: 'apos;800px'apos;, margin: 'apos;0 auto'apos; }}>
          <h2 style={{
            fontSize: 'apos;1.8rem'apos;,
            fontWeight: 'apos;bold'apos;,
            marginBottom: theme.spacing.sm,
            margin: 0
          }}>
            🚀 Transformez votre stratégie digitale dès aujourd'apos;hui !
          </h2>
          <p style={{
            fontSize: 'apos;1.1rem'apos;,
            opacity: 0.95,
            margin: `${theme.spacing.sm} 0 ${theme.spacing.md} 0`
          }}>
            Rejoignez plus de 500+ professionnels qui utilisent Beriox AI pour optimiser leurs performances
          </p>
          <div style={{
            display: 'apos;inline-flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: theme.spacing.md
          }}>
            <button
              onClick={() => handleSubscribe('apos;pro'apos;)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                backgroundColor: 'apos;white'apos;,
                color: theme.colors.primary.main,
                border: 'apos;none'apos;,
                borderRadius: 'apos;8px'apos;,
                fontWeight: 'apos;600'apos;,
                fontSize: 'apos;16px'apos;,
                cursor: 'apos;pointer'apos;,
                transition: 'apos;all 0.3s'apos;,
                boxShadow: 'apos;0 2px 8px rgba(0, 0, 0, 0.1)'apos;
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'apos;translateY(-2px)'apos;;
                e.currentTarget.style.boxShadow = 'apos;0 4px 16px rgba(0, 0, 0, 0.15)'apos;;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
                e.currentTarget.style.boxShadow = 'apos;0 2px 8px rgba(0, 0, 0, 0.1)'apos;;
              }}
            >
              Essayer gratuitement
            </button>
            <span style={{
              fontSize: 'apos;14px'apos;,
              opacity: 0.9
            }}>
              ✨ Aucune carte de crédit requise
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 'apos;1400px'apos;, margin: 'apos;0 auto'apos;, padding: theme.spacing.xl }}>
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

          {/* Section Veille Concurrentielle */}
          <div style={{
            background: 'apos;linear-gradient(135deg, #10b981 0%, #059669 100%)'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
            color: 'apos;white'apos;,
            textAlign: 'apos;center'apos;,
            boxShadow: 'apos;0 8px 32px rgba(16, 185, 129, 0.3)'apos;
          }}>
            <div style={{ maxWidth: 'apos;800px'apos;, margin: 'apos;0 auto'apos; }}>
              <h2 style={{
                fontSize: 'apos;2.5rem'apos;,
                fontWeight: 'apos;bold'apos;,
                marginBottom: theme.spacing.md,
                margin: 0
              }}>
                🔍 Nouveau : Veille Concurrentielle Avancée
              </h2>
              <p style={{
                fontSize: 'apos;1.2rem'apos;,
                opacity: 0.95,
                marginBottom: theme.spacing.lg,
                lineHeight: 'apos;1.6'apos;
              }}>
                Surveillez vos concurrents en temps réel avec notre IA spécialisée. 
                Détectez automatiquement les promotions, analysez les prix et identifiez les opportunités.
              </p>
              
              <div style={{
                display: 'apos;grid'apos;,
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(250px, 1fr))'apos;,
                gap: theme.spacing.lg,
                marginBottom: theme.spacing.lg
              }}>
                <div style={{
                  background: 'apos;rgba(255, 255, 255, 0.1)'apos;,
                  padding: theme.spacing.lg,
                  borderRadius: 'apos;12px'apos;,
                  backdropFilter: 'apos;blur(10px)'apos;
                }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginBottom: theme.spacing.sm }}>🤖</div>
                  <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm }}>IA Intelligente</h3>
                  <p style={{ fontSize: 'apos;0.9rem'apos;, opacity: 0.9 }}>Détection automatique des promotions et changements de prix</p>
                </div>
                
                <div style={{
                  background: 'apos;rgba(255, 255, 255, 0.1)'apos;,
                  padding: theme.spacing.lg,
                  borderRadius: 'apos;12px'apos;,
                  backdropFilter: 'apos;blur(10px)'apos;
                }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginBottom: theme.spacing.sm }}>⚡</div>
                  <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm }}>Temps Réel</h3>
                  <p style={{ fontSize: 'apos;0.9rem'apos;, opacity: 0.9 }}>Alertes instantanées et monitoring continu</p>
                </div>
                
                <div style={{
                  background: 'apos;rgba(255, 255, 255, 0.1)'apos;,
                  padding: theme.spacing.lg,
                  borderRadius: 'apos;12px'apos;,
                  backdropFilter: 'apos;blur(10px)'apos;
                }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginBottom: theme.spacing.sm }}>📊</div>
                  <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm }}>Analytics Avancés</h3>
                  <p style={{ fontSize: 'apos;0.9rem'apos;, opacity: 0.9 }}>Rapports détaillés et comparaisons intelligentes</p>
                </div>
              </div>
              
              <button
                onClick={() => handleSubscribe('apos;competitor-intelligence'apos;)}
                style={{
                  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                  backgroundColor: 'apos;white'apos;,
                  color: 'apos;#10b981'apos;,
                  border: 'apos;none'apos;,
                  borderRadius: 'apos;12px'apos;,
                  fontWeight: 'apos;700'apos;,
                  fontSize: 'apos;18px'apos;,
                  cursor: 'apos;pointer'apos;,
                  transition: 'apos;all 0.3s'apos;,
                  boxShadow: 'apos;0 4px 16px rgba(0, 0, 0, 0.2)'apos;
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'apos;translateY(-2px)'apos;;
                  e.currentTarget.style.boxShadow = 'apos;0 8px 24px rgba(0, 0, 0, 0.3)'apos;;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
                  e.currentTarget.style.boxShadow = 'apos;0 4px 16px rgba(0, 0, 0, 0.2)'apos;;
                }}
              >
                🚀 Démarrer la veille concurrentielle
              </button>
            </div>
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

        {/* Plans Grid - Amélioré pour 3 colonnes */}
        <div style={{
          display: 'apos;grid'apos;,
          gridTemplateColumns: 'apos;repeat(3, 1fr)'apos;,
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          'apos;@media (max-width: 1200px)'apos;: {
            gridTemplateColumns: 'apos;repeat(2, 1fr)'apos;
          },
          'apos;@media (max-width: 768px)'apos;: {
            gridTemplateColumns: 'apos;1fr'apos;
          }
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: 'apos;white'apos;,
                borderRadius: 'apos;24px'apos;,
                padding: theme.spacing.xl,
                boxShadow: plan.isPopular 
                  ? 'apos;0 25px 50px rgba(90, 95, 202, 0.2), 0 0 0 1px rgba(90, 95, 202, 0.1)'apos; 
                  : 'apos;0 8px 25px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)'apos;,
                border: plan.isPopular ? `3px solid ${theme.colors.primary.main}` : 'apos;none'apos;,
                position: 'apos;relative'apos;,
                transform: plan.isPopular ? 'apos;scale(1.08)'apos; : 'apos;scale(1)'apos;,
                transition: 'apos;all 0.3s ease-in-out'apos;,
                background: plan.isPopular 
                  ? 'apos;linear-gradient(145deg, #ffffff 0%, #f8faff 100%)'apos; 
                  : 'apos;white'apos;,
                cursor: 'apos;pointer'apos;
              }}
              onMouseOver={(e) => {
                if (!plan.isPopular) {
                  e.currentTarget.style.transform = 'apos;scale(1.02)'apos;;
                  e.currentTarget.style.boxShadow = 'apos;0 15px 35px rgba(0, 0, 0, 0.12)'apos;;
                }
              }}
              onMouseOut={(e) => {
                if (!plan.isPopular) {
                  e.currentTarget.style.transform = 'apos;scale(1)'apos;;
                  e.currentTarget.style.boxShadow = 'apos;0 8px 25px rgba(0, 0, 0, 0.08)'apos;;
                }
              }}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div style={{
                  position: 'apos;absolute'apos;,
                  top: 'apos;-15px'apos;,
                  left: 'apos;50%'apos;,
                  transform: 'apos;translateX(-50%)'apos;,
                  background: 'apos;linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'apos;,
                  color: 'apos;white'apos;,
                  padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
                  borderRadius: 'apos;25px'apos;,
                  fontSize: 'apos;13px'apos;,
                  fontWeight: 'apos;700'apos;,
                  boxShadow: 'apos;0 4px 12px rgba(255, 107, 107, 0.3)'apos;,
                  textTransform: 'apos;uppercase'apos;,
                  letterSpacing: 'apos;0.5px'apos;
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
                        {plan.originalPrice}$
                      </span>
                    )}
                    <span style={{
                      fontSize: plan.price === 0 ? 'apos;2.5rem'apos; : 'apos;3rem'apos;,
                      fontWeight: 'apos;bold'apos;,
                      color: plan.price === 0 ? theme.colors.neutral[600] : theme.colors.primary.main
                    }}>
                      {plan.price === 0 ? 'apos;Gratuit'apos; : `${plan.price}$`}
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
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: 'apos;16px'apos;,
                  border: 'apos;none'apos;,
                  background: plan.id === 'apos;free'apos; 
                    ? theme.colors.neutral[200] 
                    : plan.isPopular 
                      ? 'apos;linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'apos;
                      : plan.buttonColor,
                  color: plan.id === 'apos;free'apos; ? theme.colors.neutral[600] : 'apos;white'apos;,
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;700'apos;,
                  cursor: plan.id === 'apos;free'apos; ? 'apos;default'apos; : 'apos;pointer'apos;,
                  transition: 'apos;all 0.3s ease-in-out'apos;,
                  opacity: loading === plan.id ? 0.7 : 1,
                  boxShadow: plan.id !== 'apos;free'apos; 
                    ? 'apos;0 6px 20px rgba(99, 102, 241, 0.25)'apos; 
                    : 'apos;none'apos;,
                  textTransform: 'apos;uppercase'apos;,
                  letterSpacing: 'apos;0.5px'apos;
                }}
                onMouseOver={(e) => {
                  if (plan.id !== 'apos;free'apos;) {
                    e.currentTarget.style.transform = 'apos;translateY(-2px)'apos;;
                    e.currentTarget.style.boxShadow = 'apos;0 8px 25px rgba(99, 102, 241, 0.35)'apos;;
                  }
                }}
                onMouseOut={(e) => {
                  if (plan.id !== 'apos;free'apos;) {
                    e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
                    e.currentTarget.style.boxShadow = 'apos;0 6px 20px rgba(99, 102, 241, 0.25)'apos;;
                  }
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
            Commencer avec Pro - 25$/mois
          </button>
        </div>
      </div>
    </Layout>
  );
}
