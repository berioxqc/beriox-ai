"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
export default function ConsentPage() {
  const router = useRouter()
  const [consents, setConsents] = useState({
    essential: true, // Toujours requis
    dataProcessing: false,
    communications: false,
    improvements: false
  })
  const [hasReadPolicy, setHasReadPolicy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleConsentChange = (key: keyof typeof consents) => {
    if (key === 'essential') return; // Ne peut pas être désactivé
    
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  const canProceed = consents.dataProcessing && hasReadPolicy
  const handleSubmit = async () => {
    if (!canProceed) return
    setIsSubmitting(true)
    // Enregistrer les consentements dans le localStorage pour la session
    localStorage.setItem('beriox_consents', JSON.stringify({
      ...consents,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }))
    // Rediriger vers la page de connexion
    router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/'))
  }
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #635bff, #3b82f6)',
          color: 'white',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FontAwesomeIcon icon="shield-alt" style={{ fontSize: '28px' }} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            Protection de vos données
          </h1>
          <p style={{
            fontSize: '16px',
            opacity: 0.9,
            margin: 0
          }}>
            Conformément à la Loi 25, votre consentement est requis
          </p>
        </div>

        {/* Contenu */}
        <div style={{ padding: '32px' }}>
          
          {/* Message d'introduction */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <FontAwesomeIcon 
                icon="info-circle" 
                style={{ 
                  color: '#3b82f6',
                  fontSize: '20px',
                  marginTop: '2px',
                  flexShrink: 0
                }} 
              />
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e40af',
                  margin: '0 0 8px 0'
                }}>
                  Pourquoi cette étape ?
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#1e40af',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  La Loi 25 du Québec nous oblige à obtenir votre consentement explicite avant de 
                  collecter et traiter vos données personnelles. Vous gardez le contrôle total.
                </p>
              </div>
            </div>
          </div>

          {/* Options de consentement */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px'
            }}>
              Vos choix de consentement
            </h3>

            {/* Consentement essentiel */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0
                }}>
                  <FontAwesomeIcon icon="check" style={{ color: 'white', fontSize: '12px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540',
                    margin: '0 0 4px 0'
                  }}>
                    ✅ Fonctionnement essentiel (requis)
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#059669',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Authentification, sécurité, sauvegarde de vos missions. 
                    Nécessaire pour utiliser Beriox AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Consentement traitement des données */}
            <div style={{
              backgroundColor: consents.dataProcessing ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${consents.dataProcessing ? '#bfdbfe' : '#e3e8ee'}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onClick={() => handleConsentChange('dataProcessing')}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: consents.dataProcessing ? '#3b82f6' : 'white',
                  border: `2px solid ${consents.dataProcessing ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  {consents.dataProcessing && (
                    <FontAwesomeIcon icon="check" style={{ color: 'white', fontSize: '12px' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540',
                    margin: '0 0 4px 0'
                  }}>
                    🤖 Traitement par IA (requis pour utiliser le service)
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Analyse de vos demandes par nos agents IA, génération de réponses personnalisées, 
                    amélioration de nos algorithmes.
                  </p>
                </div>
              </div>
            </div>

            {/* Communications */}
            <div style={{
              backgroundColor: consents.communications ? '#fef3c7' : '#f8fafc',
              border: `1px solid ${consents.communications ? '#fbbf24' : '#e3e8ee'}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onClick={() => handleConsentChange('communications')}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: consents.communications ? '#f59e0b' : 'white',
                  border: `2px solid ${consents.communications ? '#f59e0b' : '#d1d5db'}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  {consents.communications && (
                    <FontAwesomeIcon icon="check" style={{ color: 'white', fontSize: '12px' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540',
                    margin: '0 0 4px 0'
                  }}>
                    📧 Communications (optionnel)
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Nouvelles fonctionnalités, conseils d'utilisation, mises à jour importantes. 
                    Vous pouvez vous désabonner à tout moment.
                  </p>
                </div>
              </div>
            </div>

            {/* Améliorations */}
            <div style={{
              backgroundColor: consents.improvements ? '#f3e8ff' : '#f8fafc',
              border: `1px solid ${consents.improvements ? '#c4b5fd' : '#e3e8ee'}`,
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onClick={() => handleConsentChange('improvements')}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: consents.improvements ? '#8b5cf6' : 'white',
                  border: `2px solid ${consents.improvements ? '#8b5cf6' : '#d1d5db'}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  {consents.improvements && (
                    <FontAwesomeIcon icon="check" style={{ color: 'white', fontSize: '12px' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540',
                    margin: '0 0 4px 0'
                  }}>
                    📊 Amélioration du service (optionnel)
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Analyse anonymisée d'utilisation pour améliorer nos services. 
                    Aucune donnée personnelle partagée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lecture de la politique */}
          <div style={{
            backgroundColor: '#fef7f7',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: hasReadPolicy ? '#ef4444' : 'white',
                border: `2px solid ${hasReadPolicy ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }} onClick={() => setHasReadPolicy(!hasReadPolicy)}>
                {hasReadPolicy && (
                  <FontAwesomeIcon icon="check" style={{ color: 'white', fontSize: '12px' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  <strong>J'ai lu et j'accepte la </strong>
                  <Link 
                    href="/privacy" 
                    target="_blank"
                    style={{
                      color: '#dc2626',
                      textDecoration: 'underline',
                      fontWeight: '600'
                    }}
                  >
                    Politique de Confidentialité
                  </Link>
                  <strong> conforme à la Loi 25</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Annuler
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              style={{
                flex: 2,
                padding: '12px 20px',
                backgroundColor: canProceed ? '#635bff' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: canProceed ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Validation...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="arrow-right" />
                  Continuer vers Beriox AI
                </>
              )}
            </button>
          </div>

          {/* Message d'information */}
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            <FontAwesomeIcon icon="info-circle" style={{ marginRight: '4px' }} />
            Vous pouvez modifier ces consentements à tout moment dans vos paramètres.
          </div>
        </div>
      </div>
    </div>
  )
}
