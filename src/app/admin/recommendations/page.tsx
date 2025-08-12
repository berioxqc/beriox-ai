"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "@/hooks/useTheme";

interface CostMetrics {
  totalTokens: number;
  totalCost: number;
  averageCostPerUser: number;
  topUsers: Array<{
    email: string;
    tokens: number;
    cost: number;
  }>;
}

interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  averageUsagePerUser: number;
}

export default function AdminRecommendationsPage() {
  const [costMetrics, setCostMetrics] = useState<CostMetrics | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'apos;monitoring'apos; | 'apos;limits'apos; | 'apos;billing'apos;>('apos;monitoring'apos;);
  
  const theme = useTheme();

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setCostMetrics({
        totalTokens: 1542000,
        totalCost: 23.15,
        averageCostPerUser: 0.85,
        topUsers: [
          { email: "user1@example.com", tokens: 125000, cost: 1.88 },
          { email: "user2@example.com", tokens: 98000, cost: 1.47 },
          { email: "user3@example.com", tokens: 75000, cost: 1.13 }
        ]
      });
      
      setUsageMetrics({
        totalUsers: 125,
        activeUsers: 89,
        premiumUsers: 34,
        averageUsagePerUser: 12336
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  const recommendations = {
    monitoring: [
      {
        title: "Dashboard de Suivi en Temps Réel",
        description: "Interface pour surveiller les coûts OpenAI en temps réel",
        priority: "Haute",
        effort: "2-3 jours",
        impact: "Élevé",
        status: "À implémenter"
      },
      {
        title: "Système d'apos;Alertes Automatiques",
        description: "Notifications quand un utilisateur dépasse ses limites",
        priority: "Haute",
        effort: "1-2 jours",
        impact: "Élevé",
        status: "À implémenter"
      },
      {
        title: "Suggestions d'apos;Optimisation",
        description: "Recommandations automatiques pour réduire les coûts",
        priority: "Moyenne",
        effort: "3-4 jours",
        impact: "Moyen",
        status: "Planifié"
      }
    ],
    limits: [
      {
        title: "Rate Limiting Intelligent",
        description: "Limiter les appels API selon le plan utilisateur",
        priority: "Haute",
        effort: "2 jours",
        impact: "Élevé",
        status: "À implémenter"
      },
      {
        title: "Gestion Dynamique des Quotas",
        description: "Ajuster automatiquement les limites selon l'apos;usage",
        priority: "Moyenne",
        effort: "3 jours",
        impact: "Moyen",
        status: "Planifié"
      },
      {
        title: "Prompts d'apos;Upgrade Contextuels",
        description: "Suggérer l'apos;amélioration de plan au bon moment",
        priority: "Basse",
        effort: "1 jour",
        impact: "Faible",
        status: "Idée"
      }
    ],
    billing: [
      {
        title: "Métriques Détaillées par Fonctionnalité",
        description: "Suivre les tokens utilisés par fonctionnalité",
        priority: "Haute",
        effort: "2-3 jours",
        impact: "Élevé",
        status: "À implémenter"
      },
      {
        title: "Historique d'apos;Évolution des Coûts",
        description: "Graphiques montrant l'apos;évolution des coûts dans le temps",
        priority: "Moyenne",
        effort: "2 jours",
        impact: "Moyen",
        status: "Planifié"
      },
      {
        title: "Prédictions de Coûts Futurs",
        description: "Estimer les coûts futurs basés sur les tendances",
        priority: "Basse",
        effort: "4-5 jours",
        impact: "Faible",
        status: "Idée"
      }
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute": return "#ef4444";
      case "Moyenne": return "#f59e0b";
      case "Basse": return "#10b981";
      default: return "#6b7280";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "À implémenter": return "#ef4444";
      case "Planifié": return "#f59e0b";
      case "Idée": return "#6b7280";
      default: return "#6b7280";
    }
  };

  if (loading) {
    return (
      <Layout title="Recommandations d'apos;Implémentation" subtitle="Stratégies de monétisation et optimisation">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "24px", color: theme.colors.primary.main }} />
          <p style={{ marginTop: "16px", color: theme.colors.neutral[600] }}>Chargement des recommandations...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Recommandations d'apos;Implémentation" subtitle="Stratégies de monétisation et optimisation">
      <div style={{ display: "grid", gap: theme.spacing.xl }}>
        {/* Métriques actuelles */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: theme.spacing.lg,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e3e8ee"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.md
          }}>
            📊 Métriques Actuelles
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: theme.spacing.md }}>
            <div style={{
              background: "#f8fafc",
              padding: theme.spacing.md,
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: "12px", color: theme.colors.neutral[600], marginBottom: "4px" }}>
                Coût total OpenAI
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: theme.colors.neutral[900] }}>
                ${costMetrics?.totalCost.toFixed(2)}
              </div>
            </div>
            
            <div style={{
              background: "#f8fafc",
              padding: theme.spacing.md,
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: "12px", color: theme.colors.neutral[600], marginBottom: "4px" }}>
                Tokens utilisés
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: theme.colors.neutral[900] }}>
                {(costMetrics?.totalTokens || 0).toLocaleString()}
              </div>
            </div>
            
            <div style={{
              background: "#f8fafc",
              padding: theme.spacing.md,
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: "12px", color: theme.colors.neutral[600], marginBottom: "4px" }}>
                Utilisateurs actifs
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: theme.colors.neutral[900] }}>
                {usageMetrics?.activeUsers}
              </div>
            </div>
            
            <div style={{
              background: "#f8fafc",
              padding: theme.spacing.md,
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: "12px", color: theme.colors.neutral[600], marginBottom: "4px" }}>
                Utilisateurs premium
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: theme.colors.neutral[900] }}>
                {usageMetrics?.premiumUsers}
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: theme.spacing.lg,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e3e8ee"
        }}>
          <div style={{
            display: "flex",
            gap: theme.spacing.md,
            marginBottom: theme.spacing.lg,
            borderBottom: "1px solid #e3e8ee",
            paddingBottom: theme.spacing.md
          }}>
            <button
              onClick={() => setActiveTab('apos;monitoring'apos;)}
              style={{
                padding: "8px 16px",
                background: activeTab === 'apos;monitoring'apos; ? theme.colors.primary.main : "transparent",
                color: activeTab === 'apos;monitoring'apos; ? "white" : theme.colors.neutral[600],
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              📊 Monitoring des Coûts
            </button>
            
            <button
              onClick={() => setActiveTab('apos;limits'apos;)}
              style={{
                padding: "8px 16px",
                background: activeTab === 'apos;limits'apos; ? theme.colors.primary.main : "transparent",
                color: activeTab === 'apos;limits'apos; ? "white" : theme.colors.neutral[600],
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              🚦 Limites Dynamiques
            </button>
            
            <button
              onClick={() => setActiveTab('apos;billing'apos;)}
              style={{
                padding: "8px 16px",
                background: activeTab === 'apos;billing'apos; ? theme.colors.primary.main : "transparent",
                color: activeTab === 'apos;billing'apos; ? "white" : theme.colors.neutral[600],
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              💰 Facturation Transparente
            </button>
          </div>

          {/* Contenu des onglets */}
          <div>
            {activeTab === 'apos;monitoring'apos; && (
              <div>
                <h4 style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.md
                }}>
                  🎯 Monitoring des Coûts
                </h4>
                
                <div style={{ display: "grid", gap: theme.spacing.md }}>
                  {recommendations.monitoring.map((rec, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: theme.spacing.md,
                        background: "#f8fafc"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px"
                      }}>
                        <h5 style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: theme.colors.neutral[900],
                          margin: 0
                        }}>
                          {rec.title}
                        </h5>
                        
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "white",
                            background: getPriorityColor(rec.priority)
                          }}>
                            {rec.priority}
                          </span>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "white",
                            background: getStatusColor(rec.status)
                          }}>
                            {rec.status}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{
                        fontSize: "13px",
                        color: theme.colors.neutral[700],
                        marginBottom: "8px"
                      }}>
                        {rec.description}
                      </p>
                      
                      <div style={{
                        display: "flex",
                        gap: theme.spacing.md,
                        fontSize: "12px",
                        color: theme.colors.neutral[600]
                      }}>
                        <span><strong>Effort:</strong> {rec.effort}</span>
                        <span><strong>Impact:</strong> {rec.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'apos;limits'apos; && (
              <div>
                <h4 style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.md
                }}>
                  🚦 Limites Dynamiques
                </h4>
                
                <div style={{ display: "grid", gap: theme.spacing.md }}>
                  {recommendations.limits.map((rec, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: theme.spacing.md,
                        background: "#f8fafc"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px"
                      }}>
                        <h5 style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: theme.colors.neutral[900],
                          margin: 0
                        }}>
                          {rec.title}
                        </h5>
                        
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "white",
                            background: getPriorityColor(rec.priority)
                          }}>
                            {rec.priority}
                          </span>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "white",
                            background: getStatusColor(rec.status)
                          }}>
                            {rec.status}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{
                        fontSize: "13px",
                        color: theme.colors.neutral[700],
                        marginBottom: "8px"
                      }}>
                        {rec.description}
                      </p>
                      
                      <div style={{
                        display: "flex",
                        gap: theme.spacing.md,
                        fontSize: "12px",
                        color: theme.colors.neutral[600]
                      }}>
                        <span><strong>Effort:</strong> {rec.effort}</span>
                        <span><strong>Impact:</strong> {rec.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'apos;billing'apos; && (
              <div>
                <h4 style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.md
                }}>
                  💰 Facturation Transparente
                </h4>
                
                <div style={{ display: "grid", gap: theme.spacing.md }}>
                  {recommendations.billing.map((rec, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: theme.spacing.md,
                        background: "#f8fafc"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px"
                      }}>
                        <h5 style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: theme.colors.neutral[900],
                          margin: 0
                        }}>
                          {rec.title}
                        </h5>
                        
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "white",
                            background: getPriorityColor(rec.priority)
                          }}>
                            {rec.priority}
                          </span>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "white",
                            background: getStatusColor(rec.status)
                          }}>
                            {rec.status}
                          </span>
                        </div>
                      </div>
                      
                      <p style={{
                        fontSize: "13px",
                        color: theme.colors.neutral[700],
                        marginBottom: "8px"
                      }}>
                        {rec.description}
                      </p>
                      
                      <div style={{
                        display: "flex",
                        gap: theme.spacing.md,
                        fontSize: "12px",
                        color: theme.colors.neutral[600]
                      }}>
                        <span><strong>Effort:</strong> {rec.effort}</span>
                        <span><strong>Impact:</strong> {rec.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top utilisateurs par coût */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: theme.spacing.lg,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e3e8ee"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.md
          }}>
            👥 Top Utilisateurs par Coût
          </h3>
          
          <div style={{ display: "grid", gap: theme.spacing.sm }}>
            {costMetrics?.topUsers.map((user, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: theme.spacing.sm,
                  background: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: theme.colors.neutral[900] }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: "12px", color: theme.colors.neutral[600] }}>
                    {user.tokens.toLocaleString()} tokens
                  </div>
                </div>
                
                <div style={{ fontSize: "16px", fontWeight: "600", color: theme.colors.neutral[900] }}>
                  ${user.cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
