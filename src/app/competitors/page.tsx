"use client";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import AccessGuard from "@/components/AccessGuard";
import Icon from "@/components/ui/Icon";

export default function CompetitorsPage() {
  const { data: session } = useSession();

  return (
    <AuthGuard>
      <AccessGuard requiredPlan={['apos;competitor-intelligence'apos;, 'apos;enterprise'apos;]}>
        <Layout>
          <div style={{
            maxWidth: 'apos;1200px'apos;,
            margin: 'apos;0 auto'apos;,
            padding: 'apos;24px'apos;
          }}>
            {/* Header */}
            <div style={{
              display: 'apos;flex'apos;,
              justifyContent: 'apos;space-between'apos;,
              alignItems: 'apos;center'apos;,
              marginBottom: 'apos;32px'apos;,
              paddingBottom: 'apos;16px'apos;,
              borderBottom: 'apos;1px solid #e5e7eb'apos;
            }}>
              <div>
                <h1 style={{
                  fontSize: 'apos;32px'apos;,
                  fontWeight: 'apos;700'apos;,
                  margin: 'apos;0 0 8px 0'apos;,
                  color: 'apos;#0a2540'apos;
                }}>
                  Veille Concurrentielle
                </h1>
                <p style={{
                  color: 'apos;#6b7280'apos;,
                  fontSize: 'apos;16px'apos;,
                  margin: 0
                }}>
                  Analysez vos concurrents et surveillez le marché
                </p>
              </div>
              <div style={{
                display: 'apos;flex'apos;,
                gap: 'apos;12px'apos;,
                alignItems: 'apos;center'apos;
              }}>
                <div style={{ fontSize: 'apos;24px'apos;, color: 'apos;#635bff'apos; }}>
                  <Icon name="search" />
                </div>
              </div>
            </div>

            {/* Contenu de la page */}
            <div style={{
              backgroundColor: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              border: 'apos;1px solid #e5e7eb'apos;,
              padding: 'apos;24px'apos;,
              boxShadow: 'apos;0 1px 3px rgba(0,0,0,0.1)'apos;
            }}>
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: 'apos;16px'apos;,
                marginBottom: 'apos;24px'apos;
              }}>
                <div style={{
                  width: 'apos;48px'apos;,
                  height: 'apos;48px'apos;,
                  borderRadius: 'apos;50%'apos;,
                  backgroundColor: 'apos;#635bff'apos;,
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  justifyContent: 'apos;center'apos;,
                  color: 'apos;white'apos;,
                  fontSize: 'apos;20px'apos;
                }}>
                  🔍
                </div>
                <div>
                  <h2 style={{
                    fontSize: 'apos;20px'apos;,
                    fontWeight: 'apos;600'apos;,
                    margin: 'apos;0 0 4px 0'apos;,
                    color: 'apos;#0a2540'apos;
                  }}>
                    Analyse Concurrentielle
                  </h2>
                  <p style={{
                    color: 'apos;#6b7280'apos;,
                    fontSize: 'apos;14px'apos;,
                    margin: 0
                  }}>
                    Surveillez vos concurrents en temps réel
                  </p>
                </div>
              </div>

              <div style={{
                display: 'apos;grid'apos;,
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(300px, 1fr))'apos;,
                gap: 'apos;20px'apos;
              }}>
                {/* Carte de fonctionnalité */}
                <div style={{
                  padding: 'apos;20px'apos;,
                  border: 'apos;1px solid #e5e7eb'apos;,
                  borderRadius: 'apos;12px'apos;,
                  backgroundColor: 'apos;white'apos;
                }}>
                  <h3 style={{
                    fontSize: 'apos;16px'apos;,
                    fontWeight: 'apos;600'apos;,
                    margin: 'apos;0 0 12px 0'apos;,
                    color: 'apos;#0a2540'apos;
                  }}>
                    Surveillance des Prix
                  </h3>
                  <p style={{
                    color: 'apos;#6b7280'apos;,
                    fontSize: 'apos;14px'apos;,
                    margin: 'apos;0 0 16px 0'apos;
                  }}>
                    Suivez les changements de prix de vos concurrents
                  </p>
                  <button style={{
                    padding: 'apos;8px 16px'apos;,
                    backgroundColor: 'apos;#635bff'apos;,
                    color: 'apos;white'apos;,
                    border: 'apos;none'apos;,
                    borderRadius: 'apos;8px'apos;,
                    fontSize: 'apos;14px'apos;,
                    cursor: 'apos;pointer'apos;,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    gap: 'apos;8px'apos;
                  }}>
                    <div style={{ marginRight: 'apos;8px'apos; }}>
                      <Icon name="chart-line" />
                    </div>
                    Configurer l'apos;alerte
                  </button>
                </div>

                <div style={{
                  padding: 'apos;20px'apos;,
                  border: 'apos;1px solid #e5e7eb'apos;,
                  borderRadius: 'apos;12px'apos;,
                  backgroundColor: 'apos;white'apos;
                }}>
                  <h3 style={{
                    fontSize: 'apos;16px'apos;,
                    fontWeight: 'apos;600'apos;,
                    margin: 'apos;0 0 12px 0'apos;,
                    color: 'apos;#0a2540'apos;
                  }}>
                    Analyse des Produits
                  </h3>
                  <p style={{
                    color: 'apos;#6b7280'apos;,
                    fontSize: 'apos;14px'apos;,
                    margin: 'apos;0 0 16px 0'apos;
                  }}>
                    Comparez vos produits avec ceux de la concurrence
                  </p>
                  <button style={{
                    padding: 'apos;8px 16px'apos;,
                    backgroundColor: 'apos;#635bff'apos;,
                    color: 'apos;white'apos;,
                    border: 'apos;none'apos;,
                    borderRadius: 'apos;8px'apos;,
                    fontSize: 'apos;14px'apos;,
                    cursor: 'apos;pointer'apos;,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    gap: 'apos;8px'apos;
                  }}>
                    <div style={{ marginRight: 'apos;8px'apos; }}>
                      <Icon name="balance-scale" />
                    </div>
                    Comparer
                  </button>
                </div>

                <div style={{
                  padding: 'apos;20px'apos;,
                  border: 'apos;1px solid #e5e7eb'apos;,
                  borderRadius: 'apos;12px'apos;,
                  backgroundColor: 'apos;white'apos;
                }}>
                  <h3 style={{
                    fontSize: 'apos;16px'apos;,
                    fontWeight: 'apos;600'apos;,
                    margin: 'apos;0 0 12px 0'apos;,
                    color: 'apos;#0a2540'apos;
                  }}>
                    Rapports Automatiques
                  </h3>
                  <p style={{
                    color: 'apos;#6b7280'apos;,
                    fontSize: 'apos;14px'apos;,
                    margin: 'apos;0 0 16px 0'apos;
                  }}>
                    Recevez des rapports hebdomadaires par email
                  </p>
                  <button style={{
                    padding: 'apos;8px 16px'apos;,
                    backgroundColor: 'apos;#635bff'apos;,
                    color: 'apos;white'apos;,
                    border: 'apos;none'apos;,
                    borderRadius: 'apos;8px'apos;,
                    fontSize: 'apos;14px'apos;,
                    cursor: 'apos;pointer'apos;,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    gap: 'apos;8px'apos;
                  }}>
                    <div style={{ marginRight: 'apos;8px'apos; }}>
                      <Icon name="envelope" />
                    </div>
                    S'apos;abonner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </AccessGuard>
    </AuthGuard>
  );
}
