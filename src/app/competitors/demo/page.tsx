'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useTheme } from '@/hooks/useTheme';

export default function CompetitorsDemoPage() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const demoData = {
    domains: ['amazon.ca', 'walmart.ca', 'bestbuy.ca', 'canadiantire.ca'],
    recentReports: [
      {
        id: '1',
        domain: 'amazon.ca',
        timestamp: '2024-01-15T10:30:00Z',
        promotions: 12,
        priceChanges: 8,
        opportunities: 3
      },
      {
        id: '2',
        domain: 'walmart.ca',
        timestamp: '2024-01-15T09:15:00Z',
        promotions: 8,
        priceChanges: 5,
        opportunities: 2
      },
      {
        id: '3',
        domain: 'bestbuy.ca',
        timestamp: '2024-01-15T08:45:00Z',
        promotions: 15,
        priceChanges: 12,
        opportunities: 4
      }
    ],
    opportunities: [
      {
        id: '1',
        type: 'price_drop',
        domain: 'amazon.ca',
        product: 'iPhone 15 Pro',
        oldPrice: 1299,
        newPrice: 1199,
        savings: 100,
        urgency: 'high'
      },
      {
        id: '2',
        type: 'promotion',
        domain: 'walmart.ca',
        product: 'Samsung TV 55"',
        oldPrice: 899,
        newPrice: 699,
        savings: 200,
        urgency: 'medium'
      },
      {
        id: '3',
        type: 'new_product',
        domain: 'bestbuy.ca',
        product: 'MacBook Air M3',
        price: 1499,
        category: 'Computers',
        urgency: 'low'
      }
    ]
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: theme.spacing.xl }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: theme.spacing.xl,
          color: 'white',
          textAlign: 'center',
          marginBottom: theme.spacing.xl
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: theme.spacing.md
          }}>
            🔍 Démonstration : Veille Concurrentielle
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.95,
            marginBottom: theme.spacing.lg,
            lineHeight: '1.6'
          }}>
            Découvrez comment notre IA surveille vos concurrents en temps réel
          </p>
          <button
            onClick={() => router.push('/pricing')}
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
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
          >
            🚀 Commencer maintenant
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xl,
          borderBottom: `1px solid ${theme.colors.neutral[200]}`,
          paddingBottom: theme.spacing.md
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'monitoring', label: 'Monitoring', icon: '🔍' },
            { id: 'opportunities', label: 'Opportunités', icon: '🎯' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                background: activeTab === tab.id ? theme.colors.primary.main : 'transparent',
                color: activeTab === tab.id ? 'white' : theme.colors.neutral[600],
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '600' : '500',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Dashboard Principal
            </h2>
            
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.xl
            }}>
              <div style={{
                background: 'white',
                padding: theme.spacing.lg,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.neutral[200]}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                  <div style={{ fontSize: '2rem', marginRight: theme.spacing.sm }}>🔍</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                      Domaines Surveillés
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.primary.main }}>
                      {demoData.domains.length}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: theme.spacing.lg,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.neutral[200]}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                  <div style={{ fontSize: '2rem', marginRight: theme.spacing.sm }}>🎯</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                      Opportunités Détectées
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                      {demoData.opportunities.length}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: theme.spacing.lg,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.neutral[200]}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                  <div style={{ fontSize: '2rem', marginRight: theme.spacing.sm }}>⚡</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                      Alertes Aujourd'hui
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      12
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.neutral[200]}`,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: theme.spacing.lg,
                borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                background: theme.colors.neutral[50]
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                  Activité Récente
                </h3>
              </div>
              <div>
                {demoData.recentReports.map(report => (
                  <div key={report.id} style={{
                    padding: theme.spacing.lg,
                    borderBottom: `1px solid ${theme.colors.neutral[100]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                        {report.domain}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>
                        {new Date(report.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.md }}>
                      <span style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: '#10b98120',
                        color: '#10b981',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {report.promotions} promotions
                      </span>
                      <span style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: '#f59e0b20',
                        color: '#f59e0b',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
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
        {activeTab === 'monitoring' && (
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Monitoring en Temps Réel
            </h2>
            
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.neutral[200]}`,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: theme.spacing.lg,
                borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                background: theme.colors.neutral[50]
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                  Domaines Surveillés
                </h3>
              </div>
              <div>
                {demoData.domains.map((domain, index) => (
                  <div key={domain} style={{
                    padding: theme.spacing.lg,
                    borderBottom: `1px solid ${theme.colors.neutral[100]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#10b981',
                        animation: 'pulse 2s infinite'
                      }} />
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                          {domain}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>
                          Dernière analyse: {new Date(Date.now() - index * 60000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      background: '#10b98120',
                      color: '#10b981',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
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
        {activeTab === 'opportunities' && (
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Opportunités Détectées
            </h2>
            
            <div style={{
              display: 'grid',
              gap: theme.spacing.lg
            }}>
              {demoData.opportunities.map(opportunity => (
                <div key={opportunity.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  padding: theme.spacing.lg,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.colors.neutral[900] }}>
                        {opportunity.product}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>
                        {opportunity.domain}
                      </p>
                    </div>
                    <span style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      background: opportunity.urgency === 'high' ? '#ef444420' : 
                                opportunity.urgency === 'medium' ? '#f59e0b20' : '#10b98120',
                      color: opportunity.urgency === 'high' ? '#ef4444' : 
                             opportunity.urgency === 'medium' ? '#f59e0b' : '#10b981',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {opportunity.urgency}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
                    {opportunity.type === 'price_drop' && (
                      <>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>Ancien prix</p>
                          <p style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.colors.neutral[400], textDecoration: 'line-through' }}>
                            ${opportunity.oldPrice}
                          </p>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: theme.colors.neutral[400] }}>→</div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>Nouveau prix</p>
                          <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#10b981' }}>
                            ${opportunity.newPrice}
                          </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>Économies</p>
                          <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#10b981' }}>
                            ${opportunity.savings}
                          </p>
                        </div>
                      </>
                    )}
                    {opportunity.type === 'new_product' && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>Prix</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#10b981' }}>
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
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.lg
            }}>
              Analytics et Rapports
            </h2>
            
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.neutral[200]}`,
              padding: theme.spacing.xl,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: theme.colors.neutral[900], marginBottom: theme.spacing.md }}>
                Rapports Détaillés
              </h3>
              <p style={{ fontSize: '1.1rem', color: theme.colors.neutral[600], marginBottom: theme.spacing.lg }}>
                Accédez à des analyses approfondies, des graphiques interactifs et des exports personnalisés
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: theme.spacing.lg,
                marginTop: theme.spacing.lg
              }}>
                <div style={{
                  padding: theme.spacing.lg,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>📈</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: theme.spacing.sm }}>Tendances</h4>
                  <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>Évolution des prix dans le temps</p>
                </div>
                <div style={{
                  padding: theme.spacing.lg,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>📊</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: theme.spacing.sm }}>Comparaisons</h4>
                  <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>Analyse concurrentielle détaillée</p>
                </div>
                <div style={{
                  padding: theme.spacing.lg,
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>📧</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: theme.spacing.sm }}>Exports</h4>
                  <p style={{ fontSize: '0.9rem', color: theme.colors.neutral[600] }}>Excel, PDF et rapports automatisés</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: theme.spacing.xl,
          color: 'white',
          textAlign: 'center',
          marginTop: theme.spacing.xl
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: theme.spacing.md
          }}>
            Prêt à commencer ?
          </h2>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.95,
            marginBottom: theme.spacing.lg
          }}>
            Rejoignez des centaines d'entreprises qui utilisent notre veille concurrentielle
          </p>
          <button
            onClick={() => router.push('/pricing')}
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
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
          >
            🚀 Commencer maintenant
          </button>
        </div>
      </div>
    </Layout>
  );
}
