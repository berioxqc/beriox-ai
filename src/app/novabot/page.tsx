"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Icon from "@/components/ui/Icon";
import { useTheme, useStyles } from "@/hooks/useTheme";

type NovaMission = {
  id: string;
  title: string;
  constat: string;
  sources: string[];
  objectif: string;
  impactEstime: number;
  effortEstime: number;
  priorite: number;
  planAction: string[];
  risques: string[];
  planB: string;
  historique: string;
  tags: string[];
  createdAt: Date;
  status: 'apos;pending'apos; | 'apos;validated'apos; | 'apos;rejected'apos; | 'apos;implemented'apos;;
  jpbFeedback?: string;
  agentsRecommandes?: string[];
  raisonnementAgents?: string;
};

export default function NovaBotPage() {
  const [loading, setLoading] = useState(false);
  const [generatedMission, setGeneratedMission] = useState<NovaMission | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState({
    ga4: false,
    gsc: false,
    ads: false,
    crm: false
  });
  const [missionCount, setMissionCount] = useState(1);
  const [generatedMissions, setGeneratedMissions] = useState<NovaMission[]>([]);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const theme = useTheme();
  const styles = useStyles();

  // Vérifier l'apos;accès premium
  useEffect(() => {
    const checkPremiumAccess = async () => {
      try {
        const response = await fetch('apos;/api/user/profile'apos;);
        if (response.ok) {
          const data = await response.json();
          const hasAccess = data.user?.premiumAccess?.isActive || false;
          setHasPremiumAccess(hasAccess);
          if (!hasAccess) {
            setShowDemo(true);
          }
        }
      } catch (error) {
        console.error('apos;Erreur lors de la vérification premium:'apos;, error);
      }
    };

    checkPremiumAccess();
  }, []);

  const generateMissions = async () => {
    if (!hasPremiumAccess) {
      setError("Accès premium requis pour générer des missions");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedMission(null);
    setGeneratedMissions([]);
    setValidationResult(null);

    try {
      // Récupérer les vraies données des sources activées
      const realDataSources = await fetchRealDataSources();

      const missions: NovaMission[] = [];
      
      // Générer plusieurs missions
      for (let i = 0; i < missionCount; i++) {
        const response = await fetch('apos;/api/novabot/generate'apos;, {
          method: 'apos;POST'apos;,
          headers: {
            'apos;Content-Type'apos;: 'apos;application/json'apos;,
          },
          body: JSON.stringify({
            dataSources: realDataSources,
            userContext: {
              industry: 'apos;technology'apos;,
              goals: ['apos;growth'apos;, 'apos;optimization'apos;, 'apos;conversion'apos;],
              currentPlan: 'apos;pro'apos;
            }
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          missions.push(data.mission);
        } else if (data.message) {
          setError(data.message);
          break;
        } else {
          setError(data.error || "Erreur lors de la génération");
          break;
        }
      }

      if (missions.length > 0) {
        setGeneratedMissions(missions);
        if (missions.length === 1) {
          setGeneratedMission(missions[0]);
        }
      }
    } catch (error) {
      console.error('apos;Erreur lors de la génération:'apos;, error);
      setError("Erreur lors de la génération des missions");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les vraies données des sources
  const fetchRealDataSources = async () => {
    const sources = [];
    
    for (const [type, enabled] of Object.entries(dataSources)) {
      if (enabled) {
        try {
          const response = await fetch(`/api/integrations/${type}/data`);
          if (response.ok) {
            const data = await response.json();
            sources.push({
              type,
              data: data.data || getMockData(type),
              lastUpdated: new Date(),
              isReal: true
            });
          } else {
            // Fallback vers les données mockées si l'apos;API échoue
            sources.push({
              type,
              data: getMockData(type),
              lastUpdated: new Date(),
              isReal: false
            });
          }
        } catch (error) {
          console.warn(`Impossible de récupérer les données ${type}:`, error);
          sources.push({
            type,
            data: getMockData(type),
            lastUpdated: new Date(),
            isReal: false
          });
        }
      }
    }

    return sources;
  };

  const validateWithJPBot = async (mission?: NovaMission) => {
    const missionToValidate = mission || generatedMission;
    if (!missionToValidate) return;

    setValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('apos;/api/novabot/validate'apos;, {
        method: 'apos;POST'apos;,
        headers: {
          'apos;Content-Type'apos;: 'apos;application/json'apos;,
        },
        body: JSON.stringify({
          mission: missionToValidate
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult(data);
      } else {
        setError(data.error || "Erreur lors de la validation");
      }
    } catch (error) {
      console.error('apos;Erreur lors de la validation:'apos;, error);
      setError("Erreur lors de la validation");
    } finally {
      setValidating(false);
    }
  };

  const getMockData = (type: string) => {
    switch (type) {
      case 'apos;ga4'apos;:
        return {
          pages: [
            { path: 'apos;/services'apos;, bounceRate: 75, pageViews: 150 },
            { path: 'apos;/contact'apos;, bounceRate: 45, pageViews: 80 }
          ],
          conversions: { total: 12, sessions: { total: 1000 } }
        };
      case 'apos;gsc'apos;:
        return {
          queries: [
            { query: 'apos;services web'apos;, impressions: 2000, ctr: 0.015 },
            { query: 'apos;développement site'apos;, impressions: 1500, ctr: 0.025 }
          ],
          pages: [
            { page: 'apos;/services'apos;, position: 8, impressions: 800 },
            { page: 'apos;/contact'apos;, position: 15, impressions: 600 }
          ]
        };
      case 'apos;ads'apos;:
        return {
          campaigns: [
            { name: 'apos;Campagne Services'apos;, cpa: 45, targetCpa: 30 },
            { name: 'apos;Campagne Contact'apos;, cpa: 25, targetCpa: 20 }
          ]
        };
      case 'apos;crm'apos;:
        return {
          leads: { total: 50, converted: 3 }
        };
      default:
        return {};
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'apos;#10b981'apos;;
    if (priority >= 1) return 'apos;#f59e0b'apos;;
    return 'apos;#ef4444'apos;;
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 3) return 'apos;Haute'apos;;
    if (priority >= 1) return 'apos;Moyenne'apos;;
    return 'apos;Basse'apos;;
  };

  // Données de démonstration pour les utilisateurs non premium
  const demoMission: NovaMission = {
    id: 'apos;demo-1'apos;,
    title: 'apos;Optimisation du taux de conversion - Page Services'apos;,
    constat: 'apos;La page /services a un taux de rebond de 75% et seulement 12 conversions sur 1000 sessions.'apos;,
    sources: ['apos;ga4'apos;, 'apos;gsc'apos;],
    objectif: 'apos;Réduire le taux de rebond de 75% à 45% et augmenter les conversions de 12 à 25 sur 1000 sessions.'apos;,
    impactEstime: 8,
    effortEstime: 6,
    priorite: 3,
    planAction: [
      'apos;Audit UX/UI de la page services'apos;,
      'apos;Optimisation du contenu et des CTA'apos;,
      'apos;A/B testing des variantes'apos;,
      'apos;Amélioration de la vitesse de chargement'apos;
    ],
    risques: [
      'apos;Changements trop drastiques qui pourraient dérouter les utilisateurs'apos;,
      'apos;Temps de développement plus long que prévu'apos;
    ],
    planB: 'apos;Implémentation progressive des changements avec monitoring continu'apos;,
    historique: 'apos;Page créée il y a 6 mois, pas d\'apos;optimisation majeure depuis'apos;,
    tags: ['apos;conversion'apos;, 'apos;ux'apos;, 'apos;optimisation'apos;],
    createdAt: new Date(),
    status: 'apos;pending'apos;,
    agentsRecommandes: ['apos;KarineAI'apos;, 'apos;ElodieAI'apos;, 'apos;HugoAI'apos;],
    raisonnementAgents: 'apos;KarineAI pour la stratégie, ElodieAI pour le contenu optimisé, HugoAI pour les améliorations techniques'apos;
  };

  // Afficher la démo pour les utilisateurs non premium
  if (showDemo && !hasPremiumAccess) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{ padding: 'apos;24px'apos; }}>
            {/* Header */}
            <div style={{ 
              display: 'apos;flex'apos;, 
              alignItems: 'apos;center'apos;,
              gap: 'apos;16px'apos;,
              marginBottom: 'apos;32px'apos;
            }}>
              <div style={{
                fontSize: 'apos;48px'apos;,
                background: 'apos;linear-gradient(135deg, #8b5cf6, #a855f7)'apos;,
                WebkitBackgroundClip: 'apos;text'apos;,
                WebkitTextFillColor: 'apos;transparent'apos;,
                backgroundClip: 'apos;text'apos;
              }}>
                🌌
              </div>
              <div>
                <h1 style={{
                  fontSize: 'apos;32px'apos;,
                  fontWeight: 'apos;700'apos;,
                  color: 'apos;#0a2540'apos;,
                  margin: 'apos;0 0 8px 0'apos;,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                }}>
                  NovaBot - Générateur de Missions
                </h1>
                <p style={{
                  fontSize: 'apos;16px'apos;,
                  color: 'apos;#6b7280'apos;,
                  margin: 0,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                }}>
                  L'apos;architecte d'apos;opportunités basé sur vos données analytiques
                </p>
              </div>
            </div>

            {/* Bannière Premium */}
            <div style={{
              background: 'apos;linear-gradient(135deg, #8b5cf6, #a855f7)'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: 'apos;24px'apos;,
              marginBottom: 'apos;24px'apos;,
              color: 'apos;white'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <h2 style={{
                fontSize: 'apos;24px'apos;,
                fontWeight: 'apos;700'apos;,
                margin: 'apos;0 0 12px 0'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                🔒 Accès Premium Requis
              </h2>
              <p style={{
                fontSize: 'apos;16px'apos;,
                margin: 'apos;0 0 20px 0'apos;,
                opacity: 0.9,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                NovaBot analyse vos vraies données pour générer des missions personnalisées
              </p>
              <button
                onClick={() => window.location.href = 'apos;/pricing'apos;}
                style={{
                  background: 'apos;white'apos;,
                  color: 'apos;#8b5cf6'apos;,
                  border: 'apos;none'apos;,
                  padding: 'apos;12px 24px'apos;,
                  borderRadius: 'apos;8px'apos;,
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  cursor: 'apos;pointer'apos;,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                }}
              >
                Voir les Plans Premium
              </button>
            </div>

            {/* Exemple de Mission */}
            <div style={{
              background: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: 'apos;24px'apos;,
              marginBottom: 'apos;24px'apos;,
              boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
              border: 'apos;1px solid #e5e7eb'apos;
            }}>
              <h3 style={{
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#0a2540'apos;,
                margin: 'apos;0 0 16px 0'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                📋 Exemple de Mission Générée
              </h3>
              
              <div style={{
                background: 'apos;#f8fafc'apos;,
                borderRadius: 'apos;8px'apos;,
                padding: 'apos;20px'apos;,
                marginBottom: 'apos;16px'apos;
              }}>
                <h4 style={{
                  fontSize: 'apos;18px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: 'apos;#0a2540'apos;,
                  margin: 'apos;0 0 12px 0'apos;,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                }}>
                  {demoMission.title}
                </h4>
                
                <div style={{ marginBottom: 'apos;16px'apos; }}>
                  <strong style={{ color: 'apos;#374151'apos; }}>Constat :</strong>
                  <p style={{ margin: 'apos;8px 0'apos;, color: 'apos;#6b7280'apos; }}>{demoMission.constat}</p>
                </div>
                
                <div style={{ marginBottom: 'apos;16px'apos; }}>
                  <strong style={{ color: 'apos;#374151'apos; }}>Objectif :</strong>
                  <p style={{ margin: 'apos;8px 0'apos;, color: 'apos;#6b7280'apos; }}>{demoMission.objectif}</p>
                </div>
                
                <div style={{ marginBottom: 'apos;16px'apos; }}>
                  <strong style={{ color: 'apos;#374151'apos; }}>Agents Recommandés :</strong>
                  <div style={{ 
                    display: 'apos;flex'apos;, 
                    gap: 'apos;8px'apos;, 
                    marginTop: 'apos;8px'apos;,
                    flexWrap: 'apos;wrap'apos;
                  }}>
                    {demoMission.agentsRecommandes?.map(agent => (
                      <span key={agent} style={{
                        background: 'apos;#e0e7ff'apos;,
                        color: 'apos;#3730a3'apos;,
                        padding: 'apos;4px 8px'apos;,
                        borderRadius: 'apos;4px'apos;,
                        fontSize: 'apos;12px'apos;,
                        fontWeight: 'apos;500'apos;
                      }}>
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: 'apos;16px'apos; }}>
                  <strong style={{ color: 'apos;#374151'apos; }}>Raisonnement :</strong>
                  <p style={{ margin: 'apos;8px 0'apos;, color: 'apos;#6b7280'apos;, fontSize: 'apos;14px'apos; }}>
                    {demoMission.raisonnementAgents}
                  </p>
                </div>
                
                <div style={{
                  display: 'apos;flex'apos;,
                  gap: 'apos;16px'apos;,
                  marginTop: 'apos;20px'apos;
                }}>
                  <div style={{
                    background: 'apos;#10b981'apos;,
                    color: 'apos;white'apos;,
                    padding: 'apos;8px 12px'apos;,
                    borderRadius: 'apos;6px'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;500'apos;
                  }}>
                    Impact: {demoMission.impactEstime}/10
                  </div>
                  <div style={{
                    background: 'apos;#f59e0b'apos;,
                    color: 'apos;white'apos;,
                    padding: 'apos;8px 12px'apos;,
                    borderRadius: 'apos;6px'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;500'apos;
                  }}>
                    Effort: {demoMission.effortEstime}/10
                  </div>
                  <div style={{
                    background: getPriorityColor(demoMission.priorite),
                    color: 'apos;white'apos;,
                    padding: 'apos;8px 12px'apos;,
                    borderRadius: 'apos;6px'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;500'apos;
                  }}>
                    Priorité: {getPriorityLabel(demoMission.priorite)}
                  </div>
                </div>
              </div>
              
              <p style={{
                fontSize: 'apos;14px'apos;,
                color: 'apos;#6b7280'apos;,
                textAlign: 'apos;center'apos;,
                margin: 'apos;0'apos;,
                fontStyle: 'apos;italic'apos;
              }}>
                💡 Avec NovaBot Premium, vous obtiendrez des missions basées sur vos vraies données
              </p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div style={{ padding: 'apos;24px'apos; }}>
          {/* Header */}
          <div style={{ 
            display: 'apos;flex'apos;, 
            alignItems: 'apos;center'apos;,
            gap: 'apos;16px'apos;,
            marginBottom: 'apos;32px'apos;
          }}>
            <div style={{
              fontSize: 'apos;48px'apos;,
              background: 'apos;linear-gradient(135deg, #8b5cf6, #a855f7)'apos;,
              WebkitBackgroundClip: 'apos;text'apos;,
              WebkitTextFillColor: 'apos;transparent'apos;,
              backgroundClip: 'apos;text'apos;
            }}>
              🌌
            </div>
            <div>
              <h1 style={{
                fontSize: 'apos;32px'apos;,
                fontWeight: 'apos;700'apos;,
                color: 'apos;#0a2540'apos;,
                margin: 'apos;0 0 8px 0'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                NovaBot - Générateur de Missions
              </h1>
              <p style={{
                fontSize: 'apos;16px'apos;,
                color: 'apos;#6b7280'apos;,
                margin: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                L'apos;architecte d'apos;opportunités basé sur vos données analytiques
              </p>
            </div>
          </div>

          {/* Configuration des sources de données */}
          <div style={{
            background: 'apos;white'apos;,
            borderRadius: 'apos;12px'apos;,
            padding: 'apos;24px'apos;,
            marginBottom: 'apos;24px'apos;,
            boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
            border: 'apos;1px solid #e5e7eb'apos;
          }}>
            <h3 style={{
              fontSize: 'apos;20px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              margin: 'apos;0 0 16px 0'apos;,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
            }}>
              📊 Sources de Données
            </h3>
            
            <p style={{
              fontSize: 'apos;14px'apos;,
              color: 'apos;#6b7280'apos;,
              margin: 'apos;0 0 20px 0'apos;,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
            }}>
              Sélectionnez les sources de données que NovaBot doit analyser pour générer des missions pertinentes
            </p>

            <div style={{
              display: 'apos;grid'apos;,
              gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
              gap: 'apos;16px'apos;,
              marginBottom: 'apos;24px'apos;
            }}>
              {Object.entries(dataSources).map(([key, enabled]) => (
                <label key={key} style={{
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  gap: 'apos;12px'apos;,
                  padding: 'apos;16px'apos;,
                  border: `2px solid ${enabled ? 'apos;#8b5cf6'apos; : 'apos;#e5e7eb'apos;}`,
                  borderRadius: 'apos;8px'apos;,
                  cursor: 'apos;pointer'apos;,
                  transition: 'apos;all 0.2s'apos;,
                  background: enabled ? 'apos;#f3f4f6'apos; : 'apos;white'apos;
                }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setDataSources(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    style={{ display: 'apos;none'apos; }}
                  />
                  <div style={{
                    width: 'apos;20px'apos;,
                    height: 'apos;20px'apos;,
                    border: `2px solid ${enabled ? 'apos;#8b5cf6'apos; : 'apos;#d1d5db'apos;}`,
                    borderRadius: 'apos;4px'apos;,
                    background: enabled ? 'apos;#8b5cf6'apos; : 'apos;white'apos;,
                    display: 'apos;flex'apos;,
                    alignItems: 'apos;center'apos;,
                    justifyContent: 'apos;center'apos;,
                    color: 'apos;white'apos;,
                    fontSize: 'apos;12px'apos;,
                    fontWeight: 'apos;bold'apos;
                  }}>
                    {enabled && 'apos;✓'apos;}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 'apos;16px'apos;,
                      fontWeight: 'apos;600'apos;,
                      color: 'apos;#0a2540'apos;,
                      textTransform: 'apos;uppercase'apos;,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                    }}>
                      {key.toUpperCase()}
                    </div>
                    <div style={{
                      fontSize: 'apos;14px'apos;,
                      color: 'apos;#6b7280'apos;,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                    }}>
                      {key === 'apos;ga4'apos; && 'apos;Google Analytics 4'apos;}
                      {key === 'apos;gsc'apos; && 'apos;Google Search Console'apos;}
                      {key === 'apos;ads'apos; && 'apos;Google Ads'apos;}
                      {key === 'apos;crm'apos; && 'apos;CRM'apos;}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;16px'apos;,
              marginBottom: 'apos;20px'apos;
            }}>
              <label style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: 'apos;8px'apos;,
                fontSize: 'apos;14px'apos;,
                color: 'apos;#374151'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                Nombre de missions à générer:
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={missionCount}
                  onChange={(e) => setMissionCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  style={{
                    width: 'apos;60px'apos;,
                    padding: 'apos;4px 8px'apos;,
                    border: 'apos;1px solid #d1d5db'apos;,
                    borderRadius: 'apos;4px'apos;,
                    fontSize: 'apos;14px'apos;
                  }}
                />
              </label>
            </div>

            <button
              onClick={generateMissions}
              disabled={loading || Object.values(dataSources).every(v => !v)}
              style={{
                background: loading || Object.values(dataSources).every(v => !v) 
                  ? 'apos;#9ca3af'apos; 
                  : 'apos;linear-gradient(135deg, #8b5cf6, #a855f7)'apos;,
                color: 'apos;white'apos;,
                border: 'apos;none'apos;,
                padding: 'apos;12px 24px'apos;,
                borderRadius: 'apos;8px'apos;,
                fontSize: 'apos;16px'apos;,
                fontWeight: 'apos;600'apos;,
                cursor: loading || Object.values(dataSources).every(v => !v) ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif",
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: 'apos;8px'apos;
              }}
            >
              {loading ? (
                <>
                  <div className="animate-spin">
                    <Icon name="refresh" />
                  </div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Icon name="brain" />
                  Générer des Missions
                </>
              )}
            </button>

            {Object.values(dataSources).every(v => !v) && (
              <p style={{
                fontSize: 'apos;14px'apos;,
                color: 'apos;#ef4444'apos;,
                margin: 'apos;12px 0 0 0'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                ⚠️ Veuillez sélectionner au moins une source de données
              </p>
            )}
          </div>

          {/* Affichage des missions générées */}
          {error && (
            <div style={{
              background: 'apos;#fef2f2'apos;,
              border: 'apos;1px solid #fecaca'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              marginBottom: 'apos;24px'apos;,
              color: 'apos;#dc2626'apos;
            }}>
              <strong>Erreur :</strong> {error}
            </div>
          )}

          {generatedMissions.length > 0 && (
            <div style={{
              background: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: 'apos;24px'apos;,
              marginBottom: 'apos;24px'apos;,
              boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
              border: 'apos;1px solid #e5e7eb'apos;
            }}>
              <h3 style={{
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#0a2540'apos;,
                margin: 'apos;0 0 16px 0'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                🎯 Missions Générées ({generatedMissions.length})
              </h3>

              {generatedMissions.map((mission, index) => (
                <div key={mission.id} style={{
                  background: 'apos;#f8fafc'apos;,
                  borderRadius: 'apos;8px'apos;,
                  padding: 'apos;20px'apos;,
                  marginBottom: index < generatedMissions.length - 1 ? 'apos;16px'apos; : 'apos;0'apos;
                }}>
                  <h4 style={{
                    fontSize: 'apos;18px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    margin: 'apos;0 0 12px 0'apos;,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                  }}>
                    {mission.title}
                  </h4>
                  
                  <div style={{ marginBottom: 'apos;16px'apos; }}>
                    <strong style={{ color: 'apos;#374151'apos; }}>Constat :</strong>
                    <p style={{ margin: 'apos;8px 0'apos;, color: 'apos;#6b7280'apos; }}>{mission.constat}</p>
                  </div>
                  
                  <div style={{ marginBottom: 'apos;16px'apos; }}>
                    <strong style={{ color: 'apos;#374151'apos; }}>Objectif :</strong>
                    <p style={{ margin: 'apos;8px 0'apos;, color: 'apos;#6b7280'apos; }}>{mission.objectif}</p>
                  </div>

                  {mission.agentsRecommandes && (
                    <div style={{ marginBottom: 'apos;16px'apos; }}>
                      <strong style={{ color: 'apos;#374151'apos; }}>Agents Recommandés :</strong>
                      <div style={{ 
                        display: 'apos;flex'apos;, 
                        gap: 'apos;8px'apos;, 
                        marginTop: 'apos;8px'apos;,
                        flexWrap: 'apos;wrap'apos;
                      }}>
                        {mission.agentsRecommandes.map(agent => (
                          <span key={agent} style={{
                            background: 'apos;#e0e7ff'apos;,
                            color: 'apos;#3730a3'apos;,
                            padding: 'apos;4px 8px'apos;,
                            borderRadius: 'apos;4px'apos;,
                            fontSize: 'apos;12px'apos;,
                            fontWeight: 'apos;500'apos;
                          }}>
                            {agent}
                          </span>
                        ))}
                      </div>
                      {mission.raisonnementAgents && (
                        <p style={{ 
                          margin: 'apos;8px 0'apos;, 
                          color: 'apos;#6b7280'apos;, 
                          fontSize: 'apos;14px'apos;,
                          fontStyle: 'apos;italic'apos;
                        }}>
                          💡 {mission.raisonnementAgents}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'apos;flex'apos;,
                    gap: 'apos;16px'apos;,
                    marginTop: 'apos;20px'apos;,
                    flexWrap: 'apos;wrap'apos;
                  }}>
                    <div style={{
                      background: 'apos;#10b981'apos;,
                      color: 'apos;white'apos;,
                      padding: 'apos;8px 12px'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;,
                      fontWeight: 'apos;500'apos;
                    }}>
                      Impact: {mission.impactEstime}/10
                    </div>
                    <div style={{
                      background: 'apos;#f59e0b'apos;,
                      color: 'apos;white'apos;,
                      padding: 'apos;8px 12px'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;,
                      fontWeight: 'apos;500'apos;
                    }}>
                      Effort: {mission.effortEstime}/10
                    </div>
                    <div style={{
                      background: getPriorityColor(mission.priorite),
                      color: 'apos;white'apos;,
                      padding: 'apos;8px 12px'apos;,
                      borderRadius: 'apos;6px'apos;,
                      fontSize: 'apos;14px'apos;,
                      fontWeight: 'apos;500'apos;
                    }}>
                      Priorité: {getPriorityLabel(mission.priorite)}
                    </div>
                  </div>

                  <div style={{
                    display: 'apos;flex'apos;,
                    gap: 'apos;12px'apos;,
                    marginTop: 'apos;16px'apos;
                  }}>
                    <button
                      onClick={() => {
                        // Créer une mission à partir de cette recommandation
                        window.location.href = `/missions?from-nova=${encodeURIComponent(JSON.stringify(mission))}`;
                      }}
                      style={{
                        background: 'apos;#8b5cf6'apos;,
                        color: 'apos;white'apos;,
                        border: 'apos;none'apos;,
                        padding: 'apos;8px 16px'apos;,
                        borderRadius: 'apos;6px'apos;,
                        fontSize: 'apos;14px'apos;,
                        fontWeight: 'apos;500'apos;,
                        cursor: 'apos;pointer'apos;,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                      }}
                    >
                      <div style={{ marginRight: 'apos;6px'apos; }}>
                        <Icon name="plus" />
                      </div>
                      Créer cette Mission
                    </button>
                    
                    <button
                      onClick={() => validateWithJPBot(mission)}
                      disabled={validating}
                      style={{
                        background: 'apos;transparent'apos;,
                        color: 'apos;#8b5cf6'apos;,
                        border: 'apos;1px solid #8b5cf6'apos;,
                        padding: 'apos;8px 16px'apos;,
                        borderRadius: 'apos;6px'apos;,
                        fontSize: 'apos;14px'apos;,
                        fontWeight: 'apos;500'apos;,
                        cursor: validating ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
                      }}
                    >
                      {validating ? (
                        <>
                          <div className="animate-spin">
                            <Icon name="refresh" />
                          </div>
                          Validation...
                        </>
                      ) : (
                        <>
                          <Icon name="check" />
                          Valider avec JPBot
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Résultat de la validation JPBot */}
          {validationResult && (
            <div style={{
              background: 'apos;white'apos;,
              borderRadius: 'apos;12px'apos;,
              padding: 'apos;24px'apos;,
              marginBottom: 'apos;24px'apos;,
              boxShadow: 'apos;0 4px 6px -1px rgba(0, 0, 0, 0.1)'apos;,
              border: 'apos;1px solid #e5e7eb'apos;
            }}>
              <h3 style={{
                fontSize: 'apos;20px'apos;,
                fontWeight: 'apos;600'apos;,
                color: 'apos;#0a2540'apos;,
                margin: 'apos;0 0 16px 0'apos;,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'apos;Segoe UI'apos;, Roboto, sans-serif"
              }}>
                🦉 Validation JPBot
              </h3>
              
              <div style={{
                background: 'apos;#f8fafc'apos;,
                borderRadius: 'apos;8px'apos;,
                padding: 'apos;20px'apos;
              }}>
                <div style={{ marginBottom: 'apos;16px'apos; }}>
                  <strong style={{ color: 'apos;#374151'apos; }}>Verdict :</strong>
                  <span style={{
                    color: validationResult.approved ? 'apos;#10b981'apos; : 'apos;#ef4444'apos;,
                    fontWeight: 'apos;600'apos;,
                    marginLeft: 'apos;8px'apos;
                  }}>
                    {validationResult.approved ? 'apos;✅ Approuvé'apos; : 'apos;❌ Rejeté'apos;}
                  </span>
                </div>
                
                {validationResult.feedback && (
                  <div style={{ marginBottom: 'apos;16px'apos; }}>
                    <strong style={{ color: 'apos;#374151'apos; }}>Feedback :</strong>
                    <p style={{ margin: 'apos;8px 0'apos;, color: 'apos;#6b7280'apos; }}>
                      {validationResult.feedback}
                    </p>
                  </div>
                )}
                
                {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                  <div>
                    <strong style={{ color: 'apos;#374151'apos; }}>Suggestions d'apos;amélioration :</strong>
                    <ul style={{ margin: 'apos;8px 0'apos;, color: 'apos;#6b7280'apos;, paddingLeft: 'apos;20px'apos; }}>
                      {validationResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
