"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function ConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState({
    essential: true, // Toujours requis
    dataProcessing: false,
    communications: false,
    improvements: false
  });
  const [hasReadPolicy, setHasReadPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsentChange = (key: keyof typeof consents) => {
    if (key === 'apos;essential'apos;) return; // Ne peut pas être désactivé
    
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const canProceed = consents.dataProcessing && hasReadPolicy;

  const handleSubmit = async () => {
    if (!canProceed) return;
    
    setIsSubmitting(true);
    
    // Enregistrer les consentements dans le localStorage pour la session
    localStorage.setItem('apos;beriox_consents'apos;, JSON.stringify({
      ...consents,
      timestamp: new Date().toISOString(),
      version: 'apos;1.0'apos;
    }));
    
    // Rediriger vers la page de connexion
    router.push('apos;/auth/signin?callbackUrl='apos; + encodeURIComponent('apos;/'apos;));
  };

  return (
    <div style={{
      minHeight: 'apos;100vh'apos;,
      backgroundColor: 'apos;#f8fafc'apos;,
      display: 'apos;flex'apos;,
      alignItems: 'apos;center'apos;,
      justifyContent: 'apos;center'apos;,
      padding: 'apos;20px'apos;
    }}>
      <div style={{
        maxWidth: 'apos;600px'apos;,
        width: 'apos;100%'apos;,
        backgroundColor: 'apos;white'apos;,
        borderRadius: 'apos;16px'apos;,
        boxShadow: 'apos;0 10px 25px rgba(0, 0, 0, 0.1)'apos;,
        overflow: 'apos;hidden'apos;
      }}>
        {/* Header */}
        <div style={{
          background: 'apos;linear-gradient(135deg, #635bff, #3b82f6)'apos;,
          color: 'apos;white'apos;,
          padding: 'apos;32px'apos;,
          textAlign: 'apos;center'apos;
        }}>
          <div style={{
            width: 'apos;64px'apos;,
            height: 'apos;64px'apos;,
            backgroundColor: 'apos;rgba(255, 255, 255, 0.2)'apos;,
            borderRadius: 'apos;50%'apos;,
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            margin: 'apos;0 auto 16px'apos;
          }}>
            <FontAwesomeIcon icon="shield-alt" style={{ fontSize: 'apos;28px'apos; }} />
          </div>
          <h1 style={{
            fontSize: 'apos;24px'apos;,
            fontWeight: 'apos;700'apos;,
            margin: 'apos;0 0 8px 0'apos;
          }}>
            Protection de vos données
          </h1>
          <p style={{
            fontSize: 'apos;16px'apos;,
            opacity: 0.9,
            margin: 0
          }}>
            Conformément à la Loi 25, votre consentement est requis
          </p>
        </div>

        {/* Contenu */}
        <div style={{ padding: 'apos;32px'apos; }}>
          
          {/* Message d'apos;introduction */}
          <div style={{
            backgroundColor: 'apos;#eff6ff'apos;,
            border: 'apos;1px solid #bfdbfe'apos;,
            borderRadius: 'apos;8px'apos;,
            padding: 'apos;16px'apos;,
            marginBottom: 'apos;24px'apos;
          }}>
            <div style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;flex-start'apos;,
              gap: 'apos;12px'apos;
            }}>
              <FontAwesomeIcon 
                icon="info-circle" 
                style={{ 
                  color: 'apos;#3b82f6'apos;,
                  fontSize: 'apos;20px'apos;,
                  marginTop: 'apos;2px'apos;,
                  flexShrink: 0
                }} 
              />
              <div>
                <h3 style={{
                  fontSize: 'apos;16px'apos;,
                  fontWeight: 'apos;600'apos;,
                  color: 'apos;#1e40af'apos;,
                  margin: 'apos;0 0 8px 0'apos;
                }}>
                  Pourquoi cette étape ?
                </h3>
                <p style={{
                  fontSize: 'apos;14px'apos;,
                  color: 'apos;#1e40af'apos;,
                  margin: 0,
                  lineHeight: 'apos;1.5'apos;
                }}>
                  La Loi 25 du Québec nous oblige à obtenir votre consentement explicite avant de 
                  collecter et traiter vos données personnelles. Vous gardez le contrôle total.
                </p>
              </div>
            </div>
          </div>

          {/* Options de consentement */}
          <div style={{ marginBottom: 'apos;24px'apos; }}>
            <h3 style={{
              fontSize: 'apos;18px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;
            }}>
              Vos choix de consentement
            </h3>

            {/* Consentement essentiel */}
            <div style={{
              backgroundColor: 'apos;#f0fdf4'apos;,
              border: 'apos;1px solid #bbf7d0'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              marginBottom: 'apos;12px'apos;
            }}>
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;flex-start'apos;,
                gap: 'apos;12px'apos;
              }}>
                <div style={{
                  width: 'apos;20px'apos;,
                  height: 'apos;20px'apos;,
                  backgroundColor: 'apos;#10b981'apos;,
                  borderRadius: 'apos;4px'apos;,
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  justifyContent: 'apos;center'apos;,
                  marginTop: 'apos;2px'apos;,
                  flexShrink: 0
                }}>
                  <FontAwesomeIcon icon="check" style={{ color: 'apos;white'apos;, fontSize: 'apos;12px'apos; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    margin: 'apos;0 0 4px 0'apos;
                  }}>
                    ✅ Fonctionnement essentiel (requis)
                  </h4>
                  <p style={{
                    fontSize: 'apos;13px'apos;,
                    color: 'apos;#059669'apos;,
                    margin: 0,
                    lineHeight: 'apos;1.4'apos;
                  }}>
                    Authentification, sécurité, sauvegarde de vos missions. 
                    Nécessaire pour utiliser Beriox AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Consentement traitement des données */}
            <div style={{
              backgroundColor: consents.dataProcessing ? 'apos;#eff6ff'apos; : 'apos;#f8fafc'apos;,
              border: `1px solid ${consents.dataProcessing ? 'apos;#bfdbfe'apos; : 'apos;#e3e8ee'apos;}`,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              marginBottom: 'apos;12px'apos;,
              cursor: 'apos;pointer'apos;,
              transition: 'apos;all 0.2s'apos;
            }} onClick={() => handleConsentChange('apos;dataProcessing'apos;)}>
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;flex-start'apos;,
                gap: 'apos;12px'apos;
              }}>
                <div style={{
                  width: 'apos;20px'apos;,
                  height: 'apos;20px'apos;,
                  backgroundColor: consents.dataProcessing ? 'apos;#3b82f6'apos; : 'apos;white'apos;,
                  border: `2px solid ${consents.dataProcessing ? 'apos;#3b82f6'apos; : 'apos;#d1d5db'apos;}`,
                  borderRadius: 'apos;4px'apos;,
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  justifyContent: 'apos;center'apos;,
                  marginTop: 'apos;2px'apos;,
                  flexShrink: 0,
                  transition: 'apos;all 0.2s'apos;
                }}>
                  {consents.dataProcessing && (
                    <FontAwesomeIcon icon="check" style={{ color: 'apos;white'apos;, fontSize: 'apos;12px'apos; }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    margin: 'apos;0 0 4px 0'apos;
                  }}>
                    🤖 Traitement par IA (requis pour utiliser le service)
                  </h4>
                  <p style={{
                    fontSize: 'apos;13px'apos;,
                    color: 'apos;#6b7280'apos;,
                    margin: 0,
                    lineHeight: 'apos;1.4'apos;
                  }}>
                    Analyse de vos demandes par nos agents IA, génération de réponses personnalisées, 
                    amélioration de nos algorithmes.
                  </p>
                </div>
              </div>
            </div>

            {/* Communications */}
            <div style={{
              backgroundColor: consents.communications ? 'apos;#fef3c7'apos; : 'apos;#f8fafc'apos;,
              border: `1px solid ${consents.communications ? 'apos;#fbbf24'apos; : 'apos;#e3e8ee'apos;}`,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              marginBottom: 'apos;12px'apos;,
              cursor: 'apos;pointer'apos;,
              transition: 'apos;all 0.2s'apos;
            }} onClick={() => handleConsentChange('apos;communications'apos;)}>
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;flex-start'apos;,
                gap: 'apos;12px'apos;
              }}>
                <div style={{
                  width: 'apos;20px'apos;,
                  height: 'apos;20px'apos;,
                  backgroundColor: consents.communications ? 'apos;#f59e0b'apos; : 'apos;white'apos;,
                  border: `2px solid ${consents.communications ? 'apos;#f59e0b'apos; : 'apos;#d1d5db'apos;}`,
                  borderRadius: 'apos;4px'apos;,
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  justifyContent: 'apos;center'apos;,
                  marginTop: 'apos;2px'apos;,
                  flexShrink: 0,
                  transition: 'apos;all 0.2s'apos;
                }}>
                  {consents.communications && (
                    <FontAwesomeIcon icon="check" style={{ color: 'apos;white'apos;, fontSize: 'apos;12px'apos; }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    margin: 'apos;0 0 4px 0'apos;
                  }}>
                    📧 Communications (optionnel)
                  </h4>
                  <p style={{
                    fontSize: 'apos;13px'apos;,
                    color: 'apos;#6b7280'apos;,
                    margin: 0,
                    lineHeight: 'apos;1.4'apos;
                  }}>
                    Nouvelles fonctionnalités, conseils d'apos;utilisation, mises à jour importantes. 
                    Vous pouvez vous désabonner à tout moment.
                  </p>
                </div>
              </div>
            </div>

            {/* Améliorations */}
            <div style={{
              backgroundColor: consents.improvements ? 'apos;#f3e8ff'apos; : 'apos;#f8fafc'apos;,
              border: `1px solid ${consents.improvements ? 'apos;#c4b5fd'apos; : 'apos;#e3e8ee'apos;}`,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              cursor: 'apos;pointer'apos;,
              transition: 'apos;all 0.2s'apos;
            }} onClick={() => handleConsentChange('apos;improvements'apos;)}>
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;flex-start'apos;,
                gap: 'apos;12px'apos;
              }}>
                <div style={{
                  width: 'apos;20px'apos;,
                  height: 'apos;20px'apos;,
                  backgroundColor: consents.improvements ? 'apos;#8b5cf6'apos; : 'apos;white'apos;,
                  border: `2px solid ${consents.improvements ? 'apos;#8b5cf6'apos; : 'apos;#d1d5db'apos;}`,
                  borderRadius: 'apos;4px'apos;,
                  display: 'apos;flex'apos;,
                  alignItems: 'apos;center'apos;,
                  justifyContent: 'apos;center'apos;,
                  marginTop: 'apos;2px'apos;,
                  flexShrink: 0,
                  transition: 'apos;all 0.2s'apos;
                }}>
                  {consents.improvements && (
                    <FontAwesomeIcon icon="check" style={{ color: 'apos;white'apos;, fontSize: 'apos;12px'apos; }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;,
                    margin: 'apos;0 0 4px 0'apos;
                  }}>
                    📊 Amélioration du service (optionnel)
                  </h4>
                  <p style={{
                    fontSize: 'apos;13px'apos;,
                    color: 'apos;#6b7280'apos;,
                    margin: 0,
                    lineHeight: 'apos;1.4'apos;
                  }}>
                    Analyse anonymisée d'apos;utilisation pour améliorer nos services. 
                    Aucune donnée personnelle partagée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lecture de la politique */}
          <div style={{
            backgroundColor: 'apos;#fef7f7'apos;,
            border: 'apos;1px solid #fecaca'apos;,
            borderRadius: 'apos;8px'apos;,
            padding: 'apos;16px'apos;,
            marginBottom: 'apos;24px'apos;
          }}>
            <div style={{
              display: 'apos;flex'apos;,
              alignItems: 'apos;flex-start'apos;,
              gap: 'apos;12px'apos;
            }}>
              <div style={{
                width: 'apos;20px'apos;,
                height: 'apos;20px'apos;,
                backgroundColor: hasReadPolicy ? 'apos;#ef4444'apos; : 'apos;white'apos;,
                border: `2px solid ${hasReadPolicy ? 'apos;#ef4444'apos; : 'apos;#d1d5db'apos;}`,
                borderRadius: 'apos;4px'apos;,
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                justifyContent: 'apos;center'apos;,
                marginTop: 'apos;2px'apos;,
                flexShrink: 0,
                cursor: 'apos;pointer'apos;,
                transition: 'apos;all 0.2s'apos;
              }} onClick={() => setHasReadPolicy(!hasReadPolicy)}>
                {hasReadPolicy && (
                  <FontAwesomeIcon icon="check" style={{ color: 'apos;white'apos;, fontSize: 'apos;12px'apos; }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 'apos;14px'apos;,
                  color: 'apos;#dc2626'apos;,
                  margin: 0,
                  lineHeight: 'apos;1.4'apos;
                }}>
                  <strong>J'apos;ai lu et j'apos;accepte la </strong>
                  <Link 
                    href="/privacy" 
                    target="_blank"
                    style={{
                      color: 'apos;#dc2626'apos;,
                      textDecoration: 'apos;underline'apos;,
                      fontWeight: 'apos;600'apos;
                    }}
                  >
                    Politique de Confidentialité
                  </Link>
                  <strong> conforme à la Loi 25</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'apos;action */}
          <div style={{
            display: 'apos;flex'apos;,
            gap: 'apos;12px'apos;,
            marginBottom: 'apos;16px'apos;
          }}>
            <button
              onClick={() => router.push('apos;/'apos;)}
              style={{
                flex: 1,
                padding: 'apos;12px 20px'apos;,
                backgroundColor: 'apos;white'apos;,
                border: 'apos;1px solid #d1d5db'apos;,
                borderRadius: 'apos;8px'apos;,
                color: 'apos;#6b7280'apos;,
                fontSize: 'apos;14px'apos;,
                fontWeight: 'apos;600'apos;,
                cursor: 'apos;pointer'apos;,
                transition: 'apos;all 0.2s'apos;
              }}
            >
              Annuler
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              style={{
                flex: 2,
                padding: 'apos;12px 20px'apos;,
                backgroundColor: canProceed ? 'apos;#635bff'apos; : 'apos;#9ca3af'apos;,
                border: 'apos;none'apos;,
                borderRadius: 'apos;8px'apos;,
                color: 'apos;white'apos;,
                fontSize: 'apos;14px'apos;,
                fontWeight: 'apos;600'apos;,
                cursor: canProceed ? 'apos;pointer'apos; : 'apos;not-allowed'apos;,
                transition: 'apos;all 0.2s'apos;,
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                justifyContent: 'apos;center'apos;,
                gap: 'apos;8px'apos;
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: 'apos;16px'apos;,
                    height: 'apos;16px'apos;,
                    border: 'apos;2px solid rgba(255,255,255,0.3)'apos;,
                    borderTop: 'apos;2px solid white'apos;,
                    borderRadius: 'apos;50%'apos;,
                    animation: 'apos;spin 1s linear infinite'apos;
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

          {/* Message d'apos;information */}
          <div style={{
            textAlign: 'apos;center'apos;,
            fontSize: 'apos;12px'apos;,
            color: 'apos;#6b7280'apos;,
            lineHeight: 'apos;1.4'apos;
          }}>
            <FontAwesomeIcon icon="info-circle" style={{ marginRight: 'apos;4px'apos; }} />
            Vous pouvez modifier ces consentements à tout moment dans vos paramètres.
          </div>
        </div>
      </div>
    </div>
  );
}
