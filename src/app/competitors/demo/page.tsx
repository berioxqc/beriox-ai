'apos;use client'apos;;

import { useState } from 'apos;react'apos;;
import { useRouter } from 'apos;next/navigation'apos;;
import Layout from 'apos;@/components/Layout'apos;;
import { useTheme } from 'apos;@/hooks/useTheme'apos;;

export default function CompetitorsDemoPage() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('apos;dashboard'apos;);

  const demoData = {
    domains: ['apos;amazon.ca'apos;, 'apos;walmart.ca'apos;, 'apos;bestbuy.ca'apos;, 'apos;canadiantire.ca'apos;],
    recentReports: [
      {
        id: 'apos;1'apos;,
        domain: 'apos;amazon.ca'apos;,
        timestamp: 'apos;2024-01-15T10:30:00Z'apos;,
        promotions: 12,
        priceChanges: 8,
        opportunities: 3
      },
      {
        id: 'apos;2'apos;,
        domain: 'apos;walmart.ca'apos;,
        timestamp: 'apos;2024-01-15T09:15:00Z'apos;,
        promotions: 8,
        priceChanges: 5,
        opportunities: 2
      },
      {
        id: 'apos;3'apos;,
        domain: 'apos;bestbuy.ca'apos;,
        timestamp: 'apos;2024-01-15T08:45:00Z'apos;,
        promotions: 15,
        priceChanges: 12,
        opportunities: 4
      }
    ],
    opportunities: [
      {
        id: 'apos;1'apos;,
        type: 'apos;price_drop'apos;,
        domain: 'apos;amazon.ca'apos;,
        product: 'apos;iPhone 15 Pro'apos;,
        oldPrice: 1299,
        newPrice: 1199,
        savings: 100,
        urgency: 'apos;high'apos;
      },
      {
        id: 'apos;2'apos;,
        type: 'apos;promotion'apos;,
        domain: 'apos;walmart.ca'apos;,
        product: 'apos;Samsung TV 55"'apos;,
        oldPrice: 899,
        newPrice: 699,
        savings: 200,
        urgency: 'apos;medium'apos;
      },
      {
        id: 'apos;3'apos;,
        type: 'apos;new_product'apos;,
        domain: 'apos;bestbuy.ca'apos;,
        product: 'apos;MacBook Air M3'apos;,
        price: 1499,
        category: 'apos;Computers'apos;,
        urgency: 'apos;low'apos;
      }
    ]
  };

  return (
    <Layout>
      <div style={{ maxWidth: 'apos;1200px'apos;, margin: 'apos;0 auto'apos;, padding: theme.spacing.xl }}>
        {/* Header */}
        <div style={{
          background: 'apos;linear-gradient(135deg, #10b981 0%, #059669 100%)'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.xl,
          color: 'apos;white'apos;,
          textAlign: 'apos;center'apos;,
          marginBottom: theme.spacing.xl
        }}>
          <h1 style={{
            fontSize: 'apos;3rem'apos;,
            fontWeight: 'apos;bold'apos;,
            marginBottom: theme.spacing.md
          }}>
            🔍 Démonstration : Veille Concurrentielle
          </h1>
          <p style={{
            fontSize: 'apos;1.2rem'apos;,
            opacity: 0.95,
            marginBottom: theme.spacing.lg,
            lineHeight: 'apos;1.6'apos;
          }}>
            Découvrez comment notre IA surveille vos concurrents en temps réel
          </p>
          <button
            onClick={() => router.push('apos;/pricing'apos;)}
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
            🚀 Commencer maintenant
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'apos;flex'apos;,
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xl,
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          paddingBottom: theme.spacing.md
        }}>
          {[
            { id: 'apos;dashboard'apos;, label: 'apos;Dashboard'apos;, icon: 'apos;📊'apos; },
            { id: 'apos;monitoring'apos;, label: 'apos;Monitoring'apos;, icon: 'apos;🔍'apos; },
            { id: 'apos;opportunities'apos;, label: 'apos;Opportunités'apos;, icon: 'apos;🎯'apos; },
            { id: 'apos;analytics'apos;, label: 'apos;Analytics'apos;, icon: 'apos;📈'apos; }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                background: activeTab === tab.id ? theme.colors.primary.main : 'apos;transparent'apos;,
                color: activeTab === tab.id ? 'apos;white'apos; : theme.colors.neutral[600],
                border: 'apos;none'apos;,
                borderRadius: 'apos;8px'apos;,
                cursor: 'apos;pointer'apos;,
                fontWeight: activeTab === tab.id ? 'apos;600'apos; : 'apos;500'apos;,
                transition: 'apos;all 0.2s'apos;
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'apos;dashboard'apos; && (
          <div>
            <h2 style={{
              fontSize: 'apos;2rem'apos;,
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Dashboard Principal
            </h2>
            
            {/* Stats Cards */}
            <div style={{
              display: 'apos;grid'apos;,
              gridTemplateColumns: 'apos;repeat(auto-fit, minmax(250px, 1fr))'apos;,
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.xl
            }}>
              <div style={{
                background: 'apos;white'apos;,
                padding: theme.spacing.lg,
                borderRadius: 'apos;12px'apos;,
                border: `1px solid ${theme.colors.neutral[200]}`,
                boxShadow: 'apos;0 2px 8px rgba(0, 0, 0, 0.05)'apos;
              }}>
                <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, marginBottom: theme.spacing.sm }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginRight: theme.spacing.sm }}>🔍</div>
                  <div>
                    <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                      Domaines Surveillés
                    </h3>
                    <p style={{ fontSize: 'apos;2rem'apos;, fontWeight: 'apos;bold'apos;, color: theme.colors.primary.main }}>
                      {demoData.domains.length}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'apos;white'apos;,
                padding: theme.spacing.lg,
                borderRadius: 'apos;12px'apos;,
                border: `1px solid ${theme.colors.neutral[200]}`,
                boxShadow: 'apos;0 2px 8px rgba(0, 0, 0, 0.05)'apos;
              }}>
                <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, marginBottom: theme.spacing.sm }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginRight: theme.spacing.sm }}>🎯</div>
                  <div>
                    <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                      Opportunités Détectées
                    </h3>
                    <p style={{ fontSize: 'apos;2rem'apos;, fontWeight: 'apos;bold'apos;, color: 'apos;#10b981'apos; }}>
                      {demoData.opportunities.length}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'apos;white'apos;,
                padding: theme.spacing.lg,
                borderRadius: 'apos;12px'apos;,
                border: `1px solid ${theme.colors.neutral[200]}`,
                boxShadow: 'apos;0 2px 8px rgba(0, 0, 0, 0.05)'apos;
              }}>
                <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, marginBottom: theme.spacing.sm }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginRight: theme.spacing.sm }}>⚡</div>
                  <div>
                    <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                      Alertes Aujourd'apos;hui
                    </h3>
                    <p style={{ fontSize: 'apos;2rem'apos;, fontWeight: 'apos;bold'apos;, color: 'apos;#f59e0b'apos; }}>
                      12
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              border: `1px solid ${theme.colors.neutral[200]}`,
              overflow: 'apos;hidden'apos;
            }}>
              <div style={{
                padding: theme.spacing.lg,
                borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                background: theme.colors.neutral[50]
              }}>
                <h3 style={{ fontSize: 'apos;1.2rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                  Activité Récente
                </h3>
              </div>
              <div>
                {demoData.recentReports.map(report => (
                  <div key={report.id} style={{
                    padding: theme.spacing.lg,
                    borderBottom: `1px solid ${theme.colors.neutral[100]}`,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    justifyContent: 'apos;space-between'apos;
                  }}>
                    <div>
                      <h4 style={{ fontSize: 'apos;1rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                        {report.domain}
                      </h4>
                      <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>
                        {new Date(report.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'apos;flex'apos;, gap: theme.spacing.md }}>
                      <span style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: 'apos;#10b98120'apos;,
                        color: 'apos;#10b981'apos;,
                        borderRadius: 'apos;6px'apos;,
                        fontSize: 'apos;0.8rem'apos;,
                        fontWeight: 'apos;500'apos;
                      }}>
                        {report.promotions} promotions
                      </span>
                      <span style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: 'apos;#f59e0b20'apos;,
                        color: 'apos;#f59e0b'apos;,
                        borderRadius: 'apos;6px'apos;,
                        fontSize: 'apos;0.8rem'apos;,
                        fontWeight: 'apos;500'apos;
                      }}>
                        {report.priceChanges} changements
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'apos;monitoring'apos; && (
          <div>
            <h2 style={{
              fontSize: 'apos;2rem'apos;,
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Monitoring en Temps Réel
            </h2>
            
            <div style={{
              background: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              border: `1px solid ${theme.colors.neutral[200]}`,
              overflow: 'apos;hidden'apos;
            }}>
              <div style={{
                padding: theme.spacing.lg,
                borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                background: theme.colors.neutral[50]
              }}>
                <h3 style={{ fontSize: 'apos;1.2rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                  Domaines Surveillés
                </h3>
              </div>
              <div>
                {demoData.domains.map((domain, index) => (
                  <div key={domain} style={{
                    padding: theme.spacing.lg,
                    borderBottom: `1px solid ${theme.colors.neutral[100]}`,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    justifyContent: 'apos;space-between'apos;
                  }}>
                    <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.md }}>
                      <div style={{
                        width: 'apos;12px'apos;,
                        height: 'apos;12px'apos;,
                        borderRadius: 'apos;50%'apos;,
                        background: 'apos;#10b981'apos;,
                        animation: 'apos;pulse 2s infinite'apos;
                      }} />
                      <div>
                        <h4 style={{ fontSize: 'apos;1rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                          {domain}
                        </h4>
                        <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>
                          Dernière analyse: {new Date(Date.now() - index * 60000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      background: 'apos;#10b98120'apos;,
                      color: 'apos;#10b981'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;0.8rem'apos;,
                      fontWeight: 'apos;500'apos;
                    }}>
                      Actif
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'apos;opportunities'apos; && (
          <div>
            <h2 style={{
              fontSize: 'apos;2rem'apos;,
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Opportunités Détectées
            </h2>
            
            <div style={{
              display: 'apos;grid'apos;,
              gap: theme.spacing.lg
            }}>
              {demoData.opportunities.map(opportunity => (
                <div key={opportunity.id} style={{
                  background: 'apos;white'apos;,
                  borderRadius: 'apos;12px'apos;,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  padding: theme.spacing.lg,
                  boxShadow: 'apos;0 2px 8px rgba(0, 0, 0, 0.05)'apos;
                }}>
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, justifyContent: 'apos;space-between'apos;, marginBottom: theme.spacing.md }}>
                    <div>
                      <h3 style={{ fontSize: 'apos;1.1rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900] }}>
                        {opportunity.product}
                      </h3>
                      <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>
                        {opportunity.domain}
                      </p>
                    </div>
                    <span style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      background: opportunity.urgency === 'apos;high'apos; ? 'apos;#ef444420'apos; : 
                                opportunity.urgency === 'apos;medium'apos; ? 'apos;#f59e0b20'apos; : 'apos;#10b98120'apos;,
                      color: opportunity.urgency === 'apos;high'apos; ? 'apos;#ef4444'apos; : 
                             opportunity.urgency === 'apos;medium'apos; ? 'apos;#f59e0b'apos; : 'apos;#10b981'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;0.8rem'apos;,
                      fontWeight: 'apos;500'apos;,
                      textTransform: 'apos;capitalize'apos;
                    }}>
                      {opportunity.urgency}
                    </span>
                  </div>
                  
                  <div style={{ display: 'apos;flex'apos;, alignItems: 'apos;center'apos;, gap: theme.spacing.lg }}>
                    {opportunity.type === 'apos;price_drop'apos; && (
                      <>
                        <div style={{ textAlign: 'apos;center'apos; }}>
                          <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>Ancien prix</p>
                          <p style={{ fontSize: 'apos;1.2rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[400], textDecoration: 'apos;line-through'apos; }}>
                            ${opportunity.oldPrice}
                          </p>
                        </div>
                        <div style={{ fontSize: 'apos;1.5rem'apos;, color: theme.colors.neutral[400] }}>→</div>
                        <div style={{ textAlign: 'apos;center'apos; }}>
                          <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>Nouveau prix</p>
                          <p style={{ fontSize: 'apos;1.2rem'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                            ${opportunity.newPrice}
                          </p>
                        </div>
                        <div style={{ textAlign: 'apos;center'apos; }}>
                          <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>Économies</p>
                          <p style={{ fontSize: 'apos;1.2rem'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                            ${opportunity.savings}
                          </p>
                        </div>
                      </>
                    )}
                    {opportunity.type === 'apos;new_product'apos; && (
                      <div style={{ textAlign: 'apos;center'apos; }}>
                        <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>Prix</p>
                        <p style={{ fontSize: 'apos;1.2rem'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#10b981'apos; }}>
                          ${opportunity.price}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'apos;analytics'apos; && (
          <div>
            <h2 style={{
              fontSize: 'apos;2rem'apos;,
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Analytics et Rapports
            </h2>
            
            <div style={{
              background: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              border: `1px solid ${theme.colors.neutral[200]}`,
              padding: theme.spacing.xl,
              textAlign: 'apos;center'apos;
            }}>
              <div style={{ fontSize: 'apos;4rem'apos;, marginBottom: theme.spacing.lg }}>📊</div>
              <h3 style={{ fontSize: 'apos;1.5rem'apos;, fontWeight: 'apos;600'apos;, color: theme.colors.neutral[900], marginBottom: theme.spacing.md }}>
                Rapports Détaillés
              </h3>
              <p style={{ fontSize: 'apos;1.1rem'apos;, color: theme.colors.neutral[600], marginBottom: theme.spacing.lg }}>
                Accédez à des analyses approfondies, des graphiques interactifs et des exports personnalisés
              </p>
              <div style={{
                display: 'apos;grid'apos;,
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
                gap: theme.spacing.lg,
                marginTop: theme.spacing.lg
              }}>
                <div style={{
                  padding: theme.spacing.lg,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: 'apos;8px'apos;
                }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginBottom: theme.spacing.sm }}>📈</div>
                  <h4 style={{ fontSize: 'apos;1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm }}>Tendances</h4>
                  <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>Évolution des prix dans le temps</p>
                </div>
                <div style={{
                  padding: theme.spacing.lg,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: 'apos;8px'apos;
                }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginBottom: theme.spacing.sm }}>📊</div>
                  <h4 style={{ fontSize: 'apos;1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm }}>Comparaisons</h4>
                  <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>Analyse concurrentielle détaillée</p>
                </div>
                <div style={{
                  padding: theme.spacing.lg,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: 'apos;8px'apos;
                }}>
                  <div style={{ fontSize: 'apos;2rem'apos;, marginBottom: theme.spacing.sm }}>📧</div>
                  <h4 style={{ fontSize: 'apos;1rem'apos;, fontWeight: 'apos;600'apos;, marginBottom: theme.spacing.sm }}>Exports</h4>
                  <p style={{ fontSize: 'apos;0.9rem'apos;, color: theme.colors.neutral[600] }}>Excel, PDF et rapports automatisés</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div style={{
          background: 'apos;linear-gradient(135deg, #10b981 0%, #059669 100%)'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.xl,
          color: 'apos;white'apos;,
          textAlign: 'apos;center'apos;,
          marginTop: theme.spacing.xl
        }}>
          <h2 style={{
            fontSize: 'apos;2rem'apos;,
            fontWeight: 'apos;bold'apos;,
            marginBottom: theme.spacing.md
          }}>
            Prêt à commencer ?
          </h2>
          <p style={{
            fontSize: 'apos;1.1rem'apos;,
            opacity: 0.95,
            marginBottom: theme.spacing.lg
          }}>
            Rejoignez des centaines d'apos;entreprises qui utilisent notre veille concurrentielle
          </p>
          <button
            onClick={() => router.push('apos;/pricing'apos;)}
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
            🚀 Commencer maintenant
          </button>
        </div>
      </div>
    </Layout>
  );
}
