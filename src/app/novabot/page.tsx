"use client"
import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import AuthGuard from "@/components/AuthGuard"
import Icon from "@/components/ui/Icon"
import { useTheme, useStyles } from "@/hooks/useTheme"
type NovaMission = {
  id: string
  title: string
  constat: string
  sources: string[]
  objectif: string
  impactEstime: number
  effortEstime: number
  priorite: number
  planAction: string[]
  risques: string[]
  planB: string
  historique: string
  tags: string[]
  createdAt: Date
  status: 'pending' | 'validated' | 'rejected' | 'implemented'
  jpbFeedback?: string
  agentsRecommandes?: string[]
  raisonnementAgents?: string
}
export default function NovaBotPage() {
  const [loading, setLoading] = useState(false)
  const [generatedMission, setGeneratedMission] = useState<NovaMission | null>(null)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataSources, setDataSources] = useState({
    ga4: false,
    gsc: false,
    ads: false,
    crm: false
  })
  const [missionCount, setMissionCount] = useState(1)
  const [generatedMissions, setGeneratedMissions] = useState<NovaMission[]>([])
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const theme = useTheme()
  const styles = useStyles()
  // Vérifier l'accès premium
  useEffect(() => {
    const checkPremiumAccess = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          const hasAccess = data.user?.premiumAccess?.isActive || false
          setHasPremiumAccess(hasAccess)
          if (!hasAccess) {
            setShowDemo(true)
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification premium:', error)
      }
    }
    checkPremiumAccess()
  }, [])
  const generateMissions = async () => {
    if (!hasPremiumAccess) {
      setError("Accès premium requis pour générer des missions")
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedMission(null)
    setGeneratedMissions([])
    setValidationResult(null)
    try {
      // Récupérer les vraies données des sources activées
      const realDataSources = await fetchRealDataSources()
      const missions: NovaMission[] = []
      // Générer plusieurs missions
      for (let i = 0; i < missionCount; i++) {
        const response = await fetch('/api/novabot/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataSources: realDataSources,
            userContext: {
              industry: 'technology',
              goals: ['growth', 'optimization', 'conversion'],
              currentPlan: 'pro'
            }
          }),
        })
        const data = await response.json()
        if (response.ok && data.success) {
          missions.push(data.mission)
        } else if (data.message) {
          setError(data.message)
          break
        } else {
          setError(data.error || "Erreur lors de la génération")
          break
        }
      }

      if (missions.length > 0) {
        setGeneratedMissions(missions)
        if (missions.length === 1) {
          setGeneratedMission(missions[0])
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
      setError("Erreur lors de la génération des missions")
    } finally {
      setLoading(false)
    }
  }
  // Récupérer les vraies données des sources
  const fetchRealDataSources = async () => {
    const sources = []
    for (const [type, enabled] of Object.entries(dataSources)) {
      if (enabled) {
        try {
          const response = await fetch(`/api/integrations/${type}/data`)
          if (response.ok) {
            const data = await response.json()
            sources.push({
              type,
              data: data.data || getMockData(type),
              lastUpdated: new Date(),
              isReal: true
            })
          } else {
            // Fallback vers les données mockées si l'API échoue
            sources.push({
              type,
              data: getMockData(type),
              lastUpdated: new Date(),
              isReal: false
            })
          }
        } catch (error) {
          console.warn(`Impossible de récupérer les données ${type}:`, error)
          sources.push({
            type,
            data: getMockData(type),
            lastUpdated: new Date(),
            isReal: false
          })
        }
      }
    }

    return sources
  }
  const validateWithJPBot = async (mission?: NovaMission) => {
    const missionToValidate = mission || generatedMission
    if (!missionToValidate) return
    setValidating(true)
    setValidationResult(null)
    try {
      const response = await fetch('/api/novabot/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mission: missionToValidate
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setValidationResult(data)
      } else {
        setError(data.error || "Erreur lors de la validation")
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      setError("Erreur lors de la validation")
    } finally {
      setValidating(false)
    }
  }
  const getMockData = (type: string) => {
    switch (type) {
      case 'ga4':
        return {
          pages: [
            { path: '/services', bounceRate: 75, pageViews: 150 },
            { path: '/contact', bounceRate: 45, pageViews: 80 }
          ],
          conversions: { total: 12, sessions: { total: 1000 } }
        }
      case 'gsc':
        return {
          queries: [
            { query: 'services web', impressions: 2000, ctr: 0.015 },
            { query: 'développement site', impressions: 1500, ctr: 0.025 }
          ],
          pages: [
            { page: '/services', position: 8, impressions: 800 },
            { page: '/contact', position: 15, impressions: 600 }
          ]
        }
      case 'ads':
        return {
          campaigns: [
            { name: 'Campagne Services', cpa: 45, targetCpa: 30 },
            { name: 'Campagne Contact', cpa: 25, targetCpa: 20 }
          ]
        }
      case 'crm':
        return {
          leads: { total: 50, converted: 3 }
        }
      default:
        return {}
    }
  }
  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return '#10b981'
    if (priority >= 1) return '#f59e0b'
    return '#ef4444'
  }
  const getPriorityLabel = (priority: number) => {
    if (priority >= 3) return 'Haute'
    if (priority >= 1) return 'Moyenne'
    return 'Basse'
  }
  // Données de démonstration pour les utilisateurs non premium
  const demoMission: NovaMission = {
    id: 'demo-1',
    title: 'Optimisation du taux de conversion - Page Services',
    constat: 'La page /services a un taux de rebond de 75% et seulement 12 conversions sur 1000 sessions.',
    sources: ['ga4', 'gsc'],
    objectif: 'Réduire le taux de rebond de 75% à 45% et augmenter les conversions de 12 à 25 sur 1000 sessions.',
    impactEstime: 8,
    effortEstime: 6,
    priorite: 3,
    planAction: [
      'Audit UX/UI de la page services',
      'Optimisation du contenu et des CTA',
      'A/B testing des variantes',
      'Amélioration de la vitesse de chargement'
    ],
    risques: [
      'Changements trop drastiques qui pourraient dérouter les utilisateurs',
      'Temps de développement plus long que prévu'
    ],
    planB: 'Implémentation progressive des changements avec monitoring continu',
    historique: 'Page créée il y a 6 mois, pas d\'optimisation majeure depuis',
    tags: ['conversion', 'ux', 'optimisation'],
    createdAt: new Date(),
    status: 'pending',
    agentsRecommandes: ['KarineAI', 'ElodieAI', 'HugoAI'],
    raisonnementAgents: 'KarineAI pour la stratégie, ElodieAI pour le contenu optimisé, HugoAI pour les améliorations techniques'
  }
  // Afficher la démo pour les utilisateurs non premium
  if (showDemo && !hasPremiumAccess) {
    return (
      <AuthGuard>
        <Layout>
          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                fontSize: '48px',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🌌
              </div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#0a2540',
                  margin: '0 0 8px 0',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  NovaBot - Générateur de Missions
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: 0,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  L'architecte d'opportunités basé sur vos données analytiques
                </p>
              </div>
            </div>

            {/* Bannière Premium */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 12px 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                🔒 Accès Premium Requis
              </h2>
              <p style={{
                fontSize: '16px',
                margin: '0 0 20px 0',
                opacity: 0.9,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                NovaBot analyse vos vraies données pour générer des missions personnalisées
              </p>
              <button
                onClick={() => window.location.href = '/pricing'}
                style={{
                  background: 'white',
                  color: '#8b5cf6',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}
              >
                Voir les Plans Premium
              </button>
            </div>

            {/* Exemple de Mission */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                margin: '0 0 16px 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                📋 Exemple de Mission Générée
              </h3>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0a2540',
                  margin: '0 0 12px 0',
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  {demoMission.title}
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#374151' }}>Constat :</strong>
                  <p style={{ margin: '8px 0', color: '#6b7280' }}>{demoMission.constat}</p>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#374151' }}>Objectif :</strong>
                  <p style={{ margin: '8px 0', color: '#6b7280' }}>{demoMission.objectif}</p>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#374151' }}>Agents Recommandés :</strong>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {demoMission.agentsRecommandes?.map(agent => (
                      <span key={agent} style={{
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#374151' }}>Raisonnement :</strong>
                  <p style={{ margin: '8px 0', color: '#6b7280', fontSize: '14px' }}>
                    {demoMission.raisonnementAgents}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '20px'
                }}>
                  <div style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Impact: {demoMission.impactEstime}/10
                  </div>
                  <div style={{
                    background: '#f59e0b',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Effort: {demoMission.effortEstime}/10
                  </div>
                  <div style={{
                    background: getPriorityColor(demoMission.priorite),
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Priorité: {getPriorityLabel(demoMission.priorite)}
                  </div>
                </div>
              </div>
              
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
                margin: '0',
                fontStyle: 'italic'
              }}>
                💡 Avec NovaBot Premium, vous obtiendrez des missions basées sur vos vraies données
              </p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Layout>
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              fontSize: '48px',
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🌌
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#0a2540',
                margin: '0 0 8px 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                NovaBot - Générateur de Missions
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                L'architecte d'opportunités basé sur vos données analytiques
              </p>
            </div>
          </div>

          {/* Configuration des sources de données */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0a2540',
              margin: '0 0 16px 0',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              📊 Sources de Données
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Sélectionnez les sources de données que NovaBot doit analyser pour générer des missions pertinentes
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {Object.entries(dataSources).map(([key, enabled]) => (
                <label key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  border: `2px solid ${enabled ? '#8b5cf6' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: enabled ? '#f3f4f6' : 'white'
                }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setDataSources(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${enabled ? '#8b5cf6' : '#d1d5db'}`,
                    borderRadius: '4px',
                    background: enabled ? '#8b5cf6' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {enabled && '✓'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0a2540',
                      textTransform: 'uppercase',
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      {key.toUpperCase()}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      {key === 'ga4' && 'Google Analytics 4'}
                      {key === 'gsc' && 'Google Search Console'}
                      {key === 'ads' && 'Google Ads'}
                      {key === 'crm' && 'CRM'}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#374151',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Nombre de missions à générer:
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={missionCount}
                  onChange={(e) => setMissionCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  style={{
                    width: '60px',
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </label>
            </div>

            <button
              onClick={generateMissions}
              disabled={loading || Object.values(dataSources).every(v => !v)}
              style={{
                background: loading || Object.values(dataSources).every(v => !v) 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading || Object.values(dataSources).every(v => !v) ? 'not-allowed' : 'pointer',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
                fontSize: '14px',
                color: '#ef4444',
                margin: '12px 0 0 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                ⚠️ Veuillez sélectionner au moins une source de données
              </p>
            )}
          </div>

          {/* Affichage des missions générées */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              color: '#dc2626'
            }}>
              <strong>Erreur :</strong> {error}
            </div>
          )}

          {generatedMissions.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                margin: '0 0 16px 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                🎯 Missions Générées ({generatedMissions.length})
              </h3>

              {generatedMissions.map((mission, index) => (
                <div key={mission.id} style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: index < generatedMissions.length - 1 ? '16px' : '0'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#0a2540',
                    margin: '0 0 12px 0',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    {mission.title}
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ color: '#374151' }}>Constat :</strong>
                    <p style={{ margin: '8px 0', color: '#6b7280' }}>{mission.constat}</p>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ color: '#374151' }}>Objectif :</strong>
                    <p style={{ margin: '8px 0', color: '#6b7280' }}>{mission.objectif}</p>
                  </div>

                  {mission.agentsRecommandes && (
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#374151' }}>Agents Recommandés :</strong>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginTop: '8px',
                        flexWrap: 'wrap'
                      }}>
                        {mission.agentsRecommandes.map(agent => (
                          <span key={agent} style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {agent}
                          </span>
                        ))}
                      </div>
                      {mission.raisonnementAgents && (
                        <p style={{ 
                          margin: '8px 0', 
                          color: '#6b7280', 
                          fontSize: '14px',
                          fontStyle: 'italic'
                        }}>
                          💡 {mission.raisonnementAgents}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      Impact: {mission.impactEstime}/10
                    </div>
                    <div style={{
                      background: '#f59e0b',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      Effort: {mission.effortEstime}/10
                    </div>
                    <div style={{
                      background: getPriorityColor(mission.priorite),
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      Priorité: {getPriorityLabel(mission.priorite)}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '16px'
                  }}>
                    <button
                      onClick={() => {
                        // Créer une mission à partir de cette recommandation
                        window.location.href = `/missions?from-nova=${encodeURIComponent(JSON.stringify(mission))}`
                      }}
                      style={{
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}
                    >
                      <div style={{ marginRight: '6px' }}>
                        <Icon name="plus" />
                      </div>
                      Créer cette Mission
                    </button>
                    
                    <button
                      onClick={() => validateWithJPBot(mission)}
                      disabled={validating}
                      style={{
                        background: 'transparent',
                        color: '#8b5cf6',
                        border: '1px solid #8b5cf6',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: validating ? 'not-allowed' : 'pointer',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
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
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0a2540',
                margin: '0 0 16px 0',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                🦉 Validation JPBot
              </h3>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#374151' }}>Verdict :</strong>
                  <span style={{
                    color: validationResult.approved ? '#10b981' : '#ef4444',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {validationResult.approved ? '✅ Approuvé' : '❌ Rejeté'}
                  </span>
                </div>
                
                {validationResult.feedback && (
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ color: '#374151' }}>Feedback :</strong>
                    <p style={{ margin: '8px 0', color: '#6b7280' }}>
                      {validationResult.feedback}
                    </p>
                  </div>
                )}
                
                {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                  <div>
                    <strong style={{ color: '#374151' }}>Suggestions d'amélioration :</strong>
                    <ul style={{ margin: '8px 0', color: '#6b7280', paddingLeft: '20px' }}>
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
  )
}
