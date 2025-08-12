'apos;use client'apos;;

import { useState, useEffect } from 'apos;react'apos;;
import { FontAwesomeIcon } from 'apos;@fortawesome/react-fontawesome'apos;;
import { useTheme } from 'apos;@/hooks/useTheme'apos;;
import { BerioxKPIs, OpportunityItem, RiskAlert } from 'apos;@/lib/premium-analytics'apos;;

interface PremiumDashboardProps {
  missionId: string;
  userPlan: 'apos;free'apos; | 'apos;pro'apos; | 'apos;enterprise'apos;;
}

export default function PremiumDashboard({ missionId, userPlan }: PremiumDashboardProps) {
  const theme = useTheme();
  const [kpis, setKpis] = useState<BerioxKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPremiumData();
  }, [missionId, userPlan]);

  const fetchPremiumData = async () => {
    try {
      const response = await fetch(`/api/missions/${missionId}/premium-analytics?plan=${userPlan}`);
      if (response.ok) {
        const data = await response.json();
        setKpis(data);
      }
    } catch (error) {
      console.error('apos;Erreur lors du chargement des analytics premium:'apos;, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'apos;flex'apos;, justifyContent: 'apos;center'apos;, padding: theme.spacing.xl }}>
        <FontAwesomeIcon icon="spinner" spin style={{ fontSize: 'apos;32px'apos;, color: theme.colors.primary.main }} />
      </div>
    );
  }

  if (!kpis) {
    return (
      <div style={{ 
        textAlign: 'apos;center'apos;, 
        padding: theme.spacing.xl,
        color: theme.colors.neutral[600]
      }}>
        Aucune donnée premium disponible
      </div>
    );
  }

  return (
    <div style={{ padding: theme.spacing.lg }}>
      {/* Header avec KPIs Beriox */}
      <div style={{ 
        display: 'apos;grid'apos;, 
        gridTemplateColumns: userPlan === 'apos;free'apos; ? 'apos;1fr 1fr'apos; : 'apos;1fr 1fr 1fr 1fr'apos;,
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl
      }}>
        
        {/* Beriox Performance Index */}
        <div style={{
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.lg,
          boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.1)'apos;,
          textAlign: 'apos;center'apos;,
          border: `2px solid ${theme.colors.primary.main}`
        }}>
          <div style={{ 
            fontSize: 'apos;48px'apos;, 
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.primary.main,
            marginBottom: theme.spacing.sm
          }}>
            {kpis.bpi}
          </div>
          <div style={{ 
            fontSize: 'apos;14px'apos;, 
            fontWeight: 'apos;600'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.xs
          }}>
            Beriox Performance Index
          </div>
          <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
            Score global de performance
          </div>
          <div style={{
            marginTop: theme.spacing.sm,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            backgroundColor: kpis.bpi >= 80 ? theme.colors.success + 'apos;20'apos; : kpis.bpi >= 60 ? theme.colors.warning + 'apos;20'apos; : theme.colors.error + 'apos;20'apos;,
            borderRadius: 'apos;20px'apos;,
            fontSize: 'apos;12px'apos;,
            color: kpis.bpi >= 80 ? theme.colors.success : kpis.bpi >= 60 ? theme.colors.warning : theme.colors.error,
            fontWeight: 'apos;500'apos;
          }}>
            {kpis.bpi >= 80 ? 'apos;Excellent'apos; : kpis.bpi >= 60 ? 'apos;Bon'apos; : 'apos;À améliorer'apos;}
          </div>
        </div>

        {/* Beriox Trust Score */}
        <div style={{
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.lg,
          boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.1)'apos;,
          textAlign: 'apos;center'apos;,
          border: `2px solid ${theme.colors.secondary}`
        }}>
          <div style={{ 
            fontSize: 'apos;48px'apos;, 
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.secondary,
            marginBottom: theme.spacing.sm
          }}>
            {kpis.trustScore}
          </div>
          <div style={{ 
            fontSize: 'apos;14px'apos;, 
            fontWeight: 'apos;600'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.xs
          }}>
            Beriox Trust Score
          </div>
          <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
            Indice de confiance et réputation
          </div>
          <div style={{
            marginTop: theme.spacing.sm,
            display: 'apos;flex'apos;,
            justifyContent: 'apos;center'apos;,
            gap: 'apos;2px'apos;
          }}>
            {[1, 2, 3, 4, 5].map(star => (
              <FontAwesomeIcon 
                key={star}
                icon="star" 
                style={{
                  color: star <= (kpis.trustScore / 20) ? theme.colors.warning : theme.colors.neutral[300],
                  fontSize: 'apos;12px'apos;
                }}
              />
            ))}
          </div>
        </div>

        {/* Prédictions (Pro+) */}
        {userPlan !== 'apos;free'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.lg,
            boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.1)'apos;,
            textAlign: 'apos;center'apos;
          }}>
            <FontAwesomeIcon 
              icon={kpis.predictiveMetrics.trafficForecast30d.trend === 'apos;up'apos; ? 'apos;arrow-up'apos; : 
                     kpis.predictiveMetrics.trafficForecast30d.trend === 'apos;down'apos; ? 'apos;arrow-down'apos; : 'apos;minus'apos;}
              style={{ 
                fontSize: 'apos;24px'apos;, 
                color: kpis.predictiveMetrics.trafficForecast30d.trend === 'apos;up'apos; ? theme.colors.success : 
                       kpis.predictiveMetrics.trafficForecast30d.trend === 'apos;down'apos; ? theme.colors.error : theme.colors.neutral[500],
                marginBottom: theme.spacing.sm
              }}
            />
            <div style={{ 
              fontSize: 'apos;24px'apos;, 
              fontWeight: 'apos;bold'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.xs
            }}>
              {kpis.predictiveMetrics.trafficForecast30d.predicted.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: 'apos;14px'apos;, 
              fontWeight: 'apos;600'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.xs
            }}>
              Trafic prévu (30j)
            </div>
            <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
              Confiance: {Math.round(kpis.predictiveMetrics.trafficForecast30d.confidence * 100)}%
            </div>
          </div>
        )}

        {/* Alertes (Enterprise) */}
        {userPlan === 'apos;enterprise'apos; && (
          <div style={{
            backgroundColor: 'apos;white'apos;,
            borderRadius: 'apos;16px'apos;,
            padding: theme.spacing.lg,
            boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.1)'apos;,
            textAlign: 'apos;center'apos;
          }}>
            <FontAwesomeIcon 
              icon="exclamation-triangle"
              style={{ 
                fontSize: 'apos;24px'apos;, 
                color: kpis.riskAlerts.length > 0 ? theme.colors.error : theme.colors.success,
                marginBottom: theme.spacing.sm
              }}
            />
            <div style={{ 
              fontSize: 'apos;24px'apos;, 
              fontWeight: 'apos;bold'apos;,
              color: kpis.riskAlerts.length > 0 ? theme.colors.error : theme.colors.success,
              marginBottom: theme.spacing.xs
            }}>
              {kpis.riskAlerts.length}
            </div>
            <div style={{ 
              fontSize: 'apos;14px'apos;, 
              fontWeight: 'apos;600'apos;,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.xs
            }}>
              Alertes Actives
            </div>
            <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
              {kpis.riskAlerts.length === 0 ? 'apos;Tout va bien !'apos; : 'apos;Action requise'apos;}
            </div>
          </div>
        )}
      </div>

      {/* Opportunity Radar (Pro+) */}
      {userPlan !== 'apos;free'apos; && kpis.opportunityRadar.length > 0 && (
        <div style={{
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.xl,
          boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.1)'apos;,
          marginBottom: theme.spacing.xl
        }}>
          <h3 style={{
            fontSize: 'apos;20px'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: theme.spacing.sm
          }}>
            <FontAwesomeIcon icon="bullseye" style={{ color: theme.colors.primary.main }} />
            Beriox Opportunity Radar
            <span style={{
              fontSize: 'apos;12px'apos;,
              fontWeight: 'apos;normal'apos;,
              backgroundColor: theme.colors.primary.light,
              color: theme.colors.primary.dark,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: 'apos;12px'apos;
            }}>
              Top 5 Actions Prioritaires
            </span>
          </h3>

          <div style={{ display: 'apos;grid'apos;, gap: theme.spacing.md }}>
            {kpis.opportunityRadar.map((opportunity, index) => (
              <div key={opportunity.id} style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: 'apos;12px'apos;,
                backgroundColor: theme.colors.neutral[50]
              }}>
                <div style={{
                  width: 'apos;32px'apos;,
                  height: 'apos;32px'apos;,
                  borderRadius: 'apos;50%'apos;,
                  backgroundColor: theme.colors.primary.main,
                  color: 'apos;white'apos;,
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  justifyContent: 'apos;center'apos;,
                  fontWeight: 'apos;bold'apos;,
                  fontSize: 'apos;14px'apos;
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'apos;16px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[900],
                    marginBottom: theme.spacing.xs
                  }}>
                    {opportunity.title}
                  </div>
                  <div style={{
                    fontSize: 'apos;14px'apos;,
                    color: theme.colors.neutral[600],
                    marginBottom: theme.spacing.xs
                  }}>
                    {opportunity.description}
                  </div>
                  <div style={{ display: 'apos;flex'apos;, gap: theme.spacing.sm }}>
                    <span style={{
                      fontSize: 'apos;12px'apos;,
                      padding: `2px 8px`,
                      borderRadius: 'apos;8px'apos;,
                      backgroundColor: opportunity.impact === 'apos;high'apos; ? theme.colors.success + 'apos;20'apos; : 
                                       opportunity.impact === 'apos;medium'apos; ? theme.colors.warning + 'apos;20'apos; : theme.colors.neutral[300],
                      color: opportunity.impact === 'apos;high'apos; ? theme.colors.success : 
                             opportunity.impact === 'apos;medium'apos; ? theme.colors.warning : theme.colors.neutral[600]
                    }}>
                      Impact {opportunity.impact}
                    </span>
                    <span style={{
                      fontSize: 'apos;12px'apos;,
                      padding: `2px 8px`,
                      borderRadius: 'apos;8px'apos;,
                      backgroundColor: theme.colors.neutral[200],
                      color: theme.colors.neutral[600]
                    }}>
                      Effort {opportunity.effort}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'apos;right'apos; }}>
                  <div style={{
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.success,
                    marginBottom: theme.spacing.xs
                  }}>
                    {opportunity.estimatedGain}
                  </div>
                  <div style={{
                    fontSize: 'apos;12px'apos;,
                    color: theme.colors.neutral[500]
                  }}>
                    Priorité: {opportunity.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertes Proactives (Enterprise) */}
      {userPlan === 'apos;enterprise'apos; && kpis.riskAlerts.length > 0 && (
        <div style={{
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.xl,
          boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.1)'apos;,
          marginBottom: theme.spacing.xl
        }}>
          <h3 style={{
            fontSize: 'apos;20px'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: theme.spacing.sm
          }}>
            <FontAwesomeIcon icon="shield" style={{ color: theme.colors.error }} />
            Alertes Proactives
            <span style={{
              fontSize: 'apos;12px'apos;,
              fontWeight: 'apos;normal'apos;,
              backgroundColor: theme.colors.error + 'apos;20'apos;,
              color: theme.colors.error,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: 'apos;12px'apos;
            }}>
              Action Immédiate Requise
            </span>
          </h3>

          <div style={{ display: 'apos;grid'apos;, gap: theme.spacing.md }}>
            {kpis.riskAlerts.map((alert) => (
              <div key={alert.id} style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;flex-start'apos;,
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                border: `2px solid ${alert.type === 'apos;critical'apos; ? theme.colors.error : theme.colors.warning}`,
                borderRadius: 'apos;12px'apos;,
                backgroundColor: alert.type === 'apos;critical'apos; ? theme.colors.error + 'apos;10'apos; : theme.colors.warning + 'apos;10'apos;
              }}>
                <FontAwesomeIcon 
                  icon={alert.type === 'apos;critical'apos; ? 'apos;exclamation-triangle'apos; : 'apos;exclamation-triangle'apos;}
                  style={{
                    fontSize: 'apos;20px'apos;,
                    color: alert.type === 'apos;critical'apos; ? theme.colors.error : theme.colors.warning,
                    marginTop: 'apos;2px'apos;
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'apos;16px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: theme.colors.neutral[900],
                    marginBottom: theme.spacing.xs
                  }}>
                    {alert.title}
                  </div>
                  <div style={{
                    fontSize: 'apos;14px'apos;,
                    color: theme.colors.neutral[600],
                    marginBottom: theme.spacing.sm
                  }}>
                    {alert.description}
                  </div>
                  <div style={{
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;500'apos;,
                    color: theme.colors.neutral[900],
                    padding: theme.spacing.sm,
                    backgroundColor: 'apos;white'apos;,
                    borderRadius: 'apos;8px'apos;,
                    border: `1px solid ${theme.colors.neutral[200]}`
                  }}>
                    <FontAwesomeIcon icon="lightbulb" style={{ marginRight: theme.spacing.xs, color: theme.colors.warning }} />
                    Action recommandée: {alert.action}
                  </div>
                </div>

                <div style={{
                  fontSize: 'apos;12px'apos;,
                  color: theme.colors.neutral[500],
                  textAlign: 'apos;right'apos;
                }}>
                  Détectée le {alert.detectedAt.toLocaleDateString('apos;fr-FR'apos;)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prédictions Détaillées (Pro+) */}
      {userPlan !== 'apos;free'apos; && (
        <div style={{
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: theme.spacing.xl,
          boxShadow: 'apos;0 4px 12px rgba(0, 0, 0, 0.1)'apos;
        }}>
          <h3 style={{
            fontSize: 'apos;20px'apos;,
            fontWeight: 'apos;bold'apos;,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            gap: theme.spacing.sm
          }}>
            <FontAwesomeIcon icon="lightbulb" style={{ color: theme.colors.primary.main }} />
            Prédictions IA - 30 Prochains Jours
          </h3>

          <div style={{ display: 'apos;grid'apos;, gridTemplateColumns: 'apos;1fr 1fr 1fr'apos;, gap: theme.spacing.lg }}>
            {/* Trafic */}
            <div style={{
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: 'apos;12px'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <FontAwesomeIcon icon="chart-line" style={{ fontSize: 'apos;24px'apos;, color: theme.colors.primary.main, marginBottom: theme.spacing.sm }} />
              <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;bold'apos;, color: theme.colors.neutral[900], marginBottom: theme.spacing.xs }}>
                +{((kpis.predictiveMetrics.trafficForecast30d.predicted - kpis.predictiveMetrics.trafficForecast30d.current) / kpis.predictiveMetrics.trafficForecast30d.current * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;500'apos;, marginBottom: theme.spacing.xs }}>
                Croissance Trafic
              </div>
              <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
                {kpis.predictiveMetrics.trafficForecast30d.current.toLocaleString()} → {kpis.predictiveMetrics.trafficForecast30d.predicted.toLocaleString()} visiteurs
              </div>
            </div>

            {/* Conversions */}
            <div style={{
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: 'apos;12px'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <FontAwesomeIcon icon="bullseye" style={{ fontSize: 'apos;24px'apos;, color: theme.colors.success, marginBottom: theme.spacing.sm }} />
              <div style={{ fontSize: 'apos;24px'apos;, fontWeight: 'apos;bold'apos;, color: theme.colors.success, marginBottom: theme.spacing.xs }}>
                +{kpis.predictiveMetrics.conversionForecast.potentialGain.toFixed(1)}%
              </div>
              <div style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;500'apos;, marginBottom: theme.spacing.xs }}>
                Gain Conversions
              </div>
              <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
                {kpis.predictiveMetrics.conversionForecast.currentRate.toFixed(1)}% → {kpis.predictiveMetrics.conversionForecast.predictedRate.toFixed(1)}% taux
              </div>
            </div>

            {/* Risque SEO */}
            <div style={{
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: 'apos;12px'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <FontAwesomeIcon 
                icon="shield" 
                style={{ 
                  fontSize: 'apos;24px'apos;, 
                  color: kpis.predictiveMetrics.seoRiskScore.score > 50 ? theme.colors.error : theme.colors.success,
                  marginBottom: theme.spacing.sm 
                }} 
              />
              <div style={{ 
                fontSize: 'apos;24px'apos;, 
                fontWeight: 'apos;bold'apos;, 
                color: kpis.predictiveMetrics.seoRiskScore.score > 50 ? theme.colors.error : theme.colors.success,
                marginBottom: theme.spacing.xs 
              }}>
                {kpis.predictiveMetrics.seoRiskScore.score}
              </div>
              <div style={{ fontSize: 'apos;14px'apos;, fontWeight: 'apos;500'apos;, marginBottom: theme.spacing.xs }}>
                Score Risque SEO
              </div>
              <div style={{ fontSize: 'apos;12px'apos;, color: theme.colors.neutral[600] }}>
                {kpis.predictiveMetrics.seoRiskScore.score > 50 ? 'apos;Attention requise'apos; : 'apos;Situation stable'apos;}
              </div>
            </div>
          </div>

          {/* Recommandation SEO */}
          {kpis.predictiveMetrics.seoRiskScore.recommendation && (
            <div style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.primary.light,
              borderRadius: 'apos;12px'apos;,
              border: `1px solid ${theme.colors.primary.main}`
            }}>
              <div style={{
                fontSize: 'apos;14px'apos;,
                fontWeight: 'apos;600'apos;,
                color: theme.colors.primary.dark,
                marginBottom: theme.spacing.xs
              }}>
                <FontAwesomeIcon icon="lightbulb" style={{ marginRight: theme.spacing.xs }} />
                Recommandation IA
              </div>
              <div style={{
                fontSize: 'apos;14px'apos;,
                color: theme.colors.primary.dark
              }}>
                {kpis.predictiveMetrics.seoRiskScore.recommendation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
