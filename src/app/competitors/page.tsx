"use client"
import { useSession } from "next-auth/react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
import AccessGuard from "@/components/AccessGuard"
import Icon from "@/components/ui/Icon"
export default function CompetitorsPage() {
  const { data: session } = useSession()
  return (
    <AuthGuard>
      <AccessGuard requiredPlan={['competitor-intelligence', 'enterprise']}>
        <Layout>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  color: '#0a2540'
                }}>
                  Veille Concurrentielle
                </h1>
                <p style={{
                  color: '#6b7280',
                  fontSize: '16px',
                  margin: 0
                }}>
                  Analysez vos concurrents et surveillez le marché
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '24px', color: '#635bff' }}>
                  <Icon name="search" />
                </div>
              </div>
            </div>

            {/* Contenu de la page */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#635bff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  🔍
                </div>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    color: '#0a2540'
                  }}>
                    Analyse Concurrentielle
                  </h2>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0
                  }}>
                    Surveillez vos concurrents en temps réel
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {/* Carte de fonctionnalité */}
                <div style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: '#0a2540'
                  }}>
                    Surveillance des Prix
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: '0 0 16px 0'
                  }}>
                    Suivez les changements de prix de vos concurrents
                  </p>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#635bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ marginRight: '8px' }}>
                      <Icon name="chart-line" />
                    </div>
                    Configurer l'alerte
                  </button>
                </div>

                <div style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: '#0a2540'
                  }}>
                    Analyse des Produits
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: '0 0 16px 0'
                  }}>
                    Comparez vos produits avec ceux de la concurrence
                  </p>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#635bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ marginRight: '8px' }}>
                      <Icon name="balance-scale" />
                    </div>
                    Comparer
                  </button>
                </div>

                <div style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: '#0a2540'
                  }}>
                    Rapports Automatiques
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: '0 0 16px 0'
                  }}>
                    Recevez des rapports hebdomadaires par email
                  </p>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#635bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ marginRight: '8px' }}>
                      <Icon name="envelope" />
                    </div>
                    S'abonner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </AccessGuard>
    </AuthGuard>
  )
}
