'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/hooks/useTheme';
import { BerioxKPIs, OpportunityItem, RiskAlert } from '@/lib/premium-analytics';

interface PremiumDashboardProps {
  missionId: string;
  userPlan: 'free' | 'pro' | 'enterprise';
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
      console.error('Erreur lors du chargement des analytics premium:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing.xl }}>
        <FontAwesomeIcon icon="spinner" spin style={{ fontSize: '32px', color: theme.colors.primary.main }} />
      </div>
    );
  }

  if (!kpis) {
    return (
      <div style={{ 
        textAlign: 'center', 
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
        display: 'grid', 
        gridTemplateColumns: userPlan === 'free' ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl
      }}>
        
        {/* Beriox Performance Index */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: theme.spacing.lg,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          border: `2px solid ${theme.colors.primary.main}`
        }}>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 'bold',
            color: theme.colors.primary.main,
            marginBottom: theme.spacing.sm
          }}>
            {kpis.bpi}
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.xs
          }}>
            Beriox Performance Index
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
            Score global de performance
          </div>
          <div style={{
            marginTop: theme.spacing.sm,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            backgroundColor: kpis.bpi >= 80 ? theme.colors.success + '20' : kpis.bpi >= 60 ? theme.colors.warning + '20' : theme.colors.error + '20',
            borderRadius: '20px',
            fontSize: '12px',
            color: kpis.bpi >= 80 ? theme.colors.success : kpis.bpi >= 60 ? theme.colors.warning : theme.colors.error,
            fontWeight: '500'
          }}>
            {kpis.bpi >= 80 ? 'Excellent' : kpis.bpi >= 60 ? 'Bon' : 'À améliorer'}
          </div>
        </div>

        {/* Beriox Trust Score */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: theme.spacing.lg,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          border: `2px solid ${theme.colors.secondary}`
        }}>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 'bold',
            color: theme.colors.secondary,
            marginBottom: theme.spacing.sm
          }}>
            {kpis.trustScore}
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.xs
          }}>
            Beriox Trust Score
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
            Indice de confiance et réputation
          </div>
          <div style={{
            marginTop: theme.spacing.sm,
            display: 'flex',
            justifyContent: 'center',
            gap: '2px'
          }}>
            {[1, 2, 3, 4, 5].map(star => (
              <FontAwesomeIcon 
                key={star}
                icon="star" 
                style={{
                  color: star <= (kpis.trustScore / 20) ? theme.colors.warning : theme.colors.neutral[300],
                  fontSize: '12px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Prédictions (Pro+) */}
        {userPlan !== 'free' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.lg,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <FontAwesomeIcon 
              icon={kpis.predictiveMetrics.trafficForecast30d.trend === 'up' ? 'arrow-up' : 
                     kpis.predictiveMetrics.trafficForecast30d.trend === 'down' ? 'arrow-down' : 'minus'}
              style={{ 
                fontSize: '24px', 
                color: kpis.predictiveMetrics.trafficForecast30d.trend === 'up' ? theme.colors.success : 
                       kpis.predictiveMetrics.trafficForecast30d.trend === 'down' ? theme.colors.error : theme.colors.neutral[500],
                marginBottom: theme.spacing.sm
              }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.xs
            }}>
              {kpis.predictiveMetrics.trafficForecast30d.predicted.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.xs
            }}>
              Trafic prévu (30j)
            </div>
            <div style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
              Confiance: {Math.round(kpis.predictiveMetrics.trafficForecast30d.confidence * 100)}%
            </div>
          </div>
        )}

        {/* Alertes (Enterprise) */}
        {userPlan === 'enterprise' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: theme.spacing.lg,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <FontAwesomeIcon 
              icon="exclamation-triangle"
              style={{ 
                fontSize: '24px', 
                color: kpis.riskAlerts.length > 0 ? theme.colors.error : theme.colors.success,
                marginBottom: theme.spacing.sm
              }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: kpis.riskAlerts.length > 0 ? theme.colors.error : theme.colors.success,
              marginBottom: theme.spacing.xs
            }}>
              {kpis.riskAlerts.length}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.xs
            }}>
              Alertes Actives
            </div>
            <div style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
              {kpis.riskAlerts.length === 0 ? 'Tout va bien !' : 'Action requise'}
            </div>
          </div>
        )}
      </div>

      {/* Opportunity Radar (Pro+) */}
      {userPlan !== 'free' && kpis.opportunityRadar.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: theme.spacing.xl,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: theme.spacing.xl
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            <FontAwesomeIcon icon="bullseye" style={{ color: theme.colors.primary.main }} />
            Beriox Opportunity Radar
            <span style={{
              fontSize: '12px',
              fontWeight: 'normal',
              backgroundColor: theme.colors.primary.light,
              color: theme.colors.primary.dark,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: '12px'
            }}>
              Top 5 Actions Prioritaires
            </span>
          </h3>

          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            {kpis.opportunityRadar.map((opportunity, index) => (
              <div key={opportunity.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.neutral[200]}`,
                borderRadius: '12px',
                backgroundColor: theme.colors.neutral[50]
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.primary.main,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.colors.neutral[900],
                    marginBottom: theme.spacing.xs
                  }}>
                    {opportunity.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: theme.colors.neutral[600],
                    marginBottom: theme.spacing.xs
                  }}>
                    {opportunity.description}
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <span style={{
                      fontSize: '12px',
                      padding: `2px 8px`,
                      borderRadius: '8px',
                      backgroundColor: opportunity.impact === 'high' ? theme.colors.success + '20' : 
                                       opportunity.impact === 'medium' ? theme.colors.warning + '20' : theme.colors.neutral[300],
                      color: opportunity.impact === 'high' ? theme.colors.success : 
                             opportunity.impact === 'medium' ? theme.colors.warning : theme.colors.neutral[600]
                    }}>
                      Impact {opportunity.impact}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: `2px 8px`,
                      borderRadius: '8px',
                      backgroundColor: theme.colors.neutral[200],
                      color: theme.colors.neutral[600]
                    }}>
                      Effort {opportunity.effort}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.success,
                    marginBottom: theme.spacing.xs
                  }}>
                    {opportunity.estimatedGain}
                  </div>
                  <div style={{
                    fontSize: '12px',
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
      {userPlan === 'enterprise' && kpis.riskAlerts.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: theme.spacing.xl,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: theme.spacing.xl
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            <FontAwesomeIcon icon="shield" style={{ color: theme.colors.error }} />
            Alertes Proactives
            <span style={{
              fontSize: '12px',
              fontWeight: 'normal',
              backgroundColor: theme.colors.error + '20',
              color: theme.colors.error,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: '12px'
            }}>
              Action Immédiate Requise
            </span>
          </h3>

          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            {kpis.riskAlerts.map((alert) => (
              <div key={alert.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                border: `2px solid ${alert.type === 'critical' ? theme.colors.error : theme.colors.warning}`,
                borderRadius: '12px',
                backgroundColor: alert.type === 'critical' ? theme.colors.error + '10' : theme.colors.warning + '10'
              }}>
                <FontAwesomeIcon 
                  icon={alert.type === 'critical' ? 'exclamation-triangle' : 'exclamation-triangle'}
                  style={{
                    fontSize: '20px',
                    color: alert.type === 'critical' ? theme.colors.error : theme.colors.warning,
                    marginTop: '2px'
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.colors.neutral[900],
                    marginBottom: theme.spacing.xs
                  }}>
                    {alert.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: theme.colors.neutral[600],
                    marginBottom: theme.spacing.sm
                  }}>
                    {alert.description}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.colors.neutral[900],
                    padding: theme.spacing.sm,
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.neutral[200]}`
                  }}>
                    <FontAwesomeIcon icon="lightbulb" style={{ marginRight: theme.spacing.xs, color: theme.colors.warning }} />
                    Action recommandée: {alert.action}
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: theme.colors.neutral[500],
                  textAlign: 'right'
                }}>
                  Détectée le {alert.detectedAt.toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prédictions Détaillées (Pro+) */}
      {userPlan !== 'free' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: theme.spacing.xl,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.lg,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            <FontAwesomeIcon icon="lightbulb" style={{ color: theme.colors.primary.main }} />
            Prédictions IA - 30 Prochains Jours
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: theme.spacing.lg }}>
            {/* Trafic */}
            <div style={{
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="chart-line" style={{ fontSize: '24px', color: theme.colors.primary.main, marginBottom: theme.spacing.sm }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.neutral[900], marginBottom: theme.spacing.xs }}>
                +{((kpis.predictiveMetrics.trafficForecast30d.predicted - kpis.predictiveMetrics.trafficForecast30d.current) / kpis.predictiveMetrics.trafficForecast30d.current * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: theme.spacing.xs }}>
                Croissance Trafic
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
                {kpis.predictiveMetrics.trafficForecast30d.current.toLocaleString()} → {kpis.predictiveMetrics.trafficForecast30d.predicted.toLocaleString()} visiteurs
              </div>
            </div>

            {/* Conversions */}
            <div style={{
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon="bullseye" style={{ fontSize: '24px', color: theme.colors.success, marginBottom: theme.spacing.sm }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.success, marginBottom: theme.spacing.xs }}>
                +{kpis.predictiveMetrics.conversionForecast.potentialGain.toFixed(1)}%
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: theme.spacing.xs }}>
                Gain Conversions
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
                {kpis.predictiveMetrics.conversionForecast.currentRate.toFixed(1)}% → {kpis.predictiveMetrics.conversionForecast.predictedRate.toFixed(1)}% taux
              </div>
            </div>

            {/* Risque SEO */}
            <div style={{
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.neutral[200]}`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon 
                icon="shield" 
                style={{ 
                  fontSize: '24px', 
                  color: kpis.predictiveMetrics.seoRiskScore.score > 50 ? theme.colors.error : theme.colors.success,
                  marginBottom: theme.spacing.sm 
                }} 
              />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: kpis.predictiveMetrics.seoRiskScore.score > 50 ? theme.colors.error : theme.colors.success,
                marginBottom: theme.spacing.xs 
              }}>
                {kpis.predictiveMetrics.seoRiskScore.score}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: theme.spacing.xs }}>
                Score Risque SEO
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.neutral[600] }}>
                {kpis.predictiveMetrics.seoRiskScore.score > 50 ? 'Attention requise' : 'Situation stable'}
              </div>
            </div>
          </div>

          {/* Recommandation SEO */}
          {kpis.predictiveMetrics.seoRiskScore.recommendation && (
            <div style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.primary.light,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.primary.main}`
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.primary.dark,
                marginBottom: theme.spacing.xs
              }}>
                <FontAwesomeIcon icon="lightbulb" style={{ marginRight: theme.spacing.xs }} />
                Recommandation IA
              </div>
              <div style={{
                fontSize: '14px',
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
