"use client"
import Layout from "@/components/Layout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0a2540',
            margin: '0 0 16px 0'
          }}>
            <FontAwesomeIcon icon="shield-alt" style={{ marginRight: '12px', color: '#635bff' }} />
            Politique de Confidentialité
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            margin: 0
          }}>
            Conforme à la Loi 25 du Québec sur la protection des renseignements personnels
          </p>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#10b98120',
            color: '#10b981',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            ✅ Dernière mise à jour : {new Date().toLocaleDateString('fr-CA')}
          </div>
        </div>

        {/* Contenu */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
          border: '1px solid #e3e8ee',
          lineHeight: '1.7',
          fontSize: '16px',
          color: '#374151'
        }}>
          
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="info-circle" style={{ color: '#635bff' }} />
              1. Qui sommes-nous ?
            </h2>
            <p>
              Beriox AI est une plateforme d'intelligence artificielle qui vous aide dans vos tâches quotidiennes 
              de marketing, développement web et création de contenu. Nous sommes situés au Québec, Canada, et 
              nous nous engageons à respecter la Loi 25 sur la protection des renseignements personnels.
            </p>
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <strong>Responsable de la protection des données :</strong><br/>
              Jean-François Rioux-Bergeron<br/>
              <strong>Téléphone :</strong> 418 321-6767<br/>
              <strong>Courriel :</strong> info@beriox.ca
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="database" style={{ color: '#f59e0b' }} />
              2. Quelles données collectons-nous ?
            </h2>
            
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0a2540', marginTop: '24px' }}>
              Données d'identification
            </h3>
            <ul>
              <li>Nom complet</li>
              <li>Adresse courriel</li>
              <li>Photo de profil (via Google OAuth)</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0a2540', marginTop: '24px' }}>
              Données d'utilisation
            </h3>
            <ul>
              <li>Missions créées et leurs contenus</li>
              <li>Interactions avec les agents IA</li>
              <li>Préférences d'utilisation</li>
              <li>Statistiques d'usage (anonymisées)</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0a2540', marginTop: '24px' }}>
              Données techniques
            </h3>
            <ul>
              <li>Adresse IP (anonymisée après 30 jours)</li>
              <li>Type de navigateur et système d'exploitation</li>
              <li>Pages visitées et temps passé</li>
              <li>Cookies de session (essentiels uniquement)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="bullseye" style={{ color: '#10b981' }} />
              3. Pourquoi collectons-nous ces données ?
            </h2>
            
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e3e8ee'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#0a2540' }}>✅ Finalités légitimes :</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Fournir nos services d'IA personnalisés</li>
                  <li>Améliorer votre expérience utilisateur</li>
                  <li>Assurer la sécurité de la plateforme</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="user-check" style={{ color: '#8b5cf6' }} />
              4. Vos droits (Loi 25)
            </h2>
            
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#92400e' }}>
                🎯 Vous avez le contrôle total de vos données
              </h4>
              <p style={{ margin: 0, color: '#92400e' }}>
                Conformément à la Loi 25, vous pouvez exercer ces droits à tout moment, gratuitement.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {[
                { icon: 'eye', title: 'Droit d\'accès', desc: 'Consulter toutes vos données' },
                { icon: 'edit', title: 'Droit de rectification', desc: 'Corriger vos informations' },
                { icon: 'trash', title: 'Droit d\'effacement', desc: 'Supprimer votre compte' },
                { icon: 'download', title: 'Portabilité', desc: 'Exporter vos données' },
                { icon: 'ban', title: 'Opposition', desc: 'Refuser certains traitements' },
                { icon: 'pause', title: 'Limitation', desc: 'Suspendre le traitement' }
              ].map((right, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e3e8ee',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <FontAwesomeIcon 
                    icon={right.icon as any} 
                    style={{ 
                      fontSize: '24px', 
                      color: '#635bff',
                      marginBottom: '8px'
                    }} 
                  />
                  <h5 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540'
                  }}>
                    {right.title}
                  </h5>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {right.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: '600' }}>
                Pour exercer vos droits, contactez-nous :
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a 
                  href="mailto:info@beriox.ca?subject=Exercice de mes droits - Loi 25"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#635bff',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  <FontAwesomeIcon icon="envelope" />
                  info@beriox.ca
                </a>
                <a 
                  href="tel:4183216767"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  <FontAwesomeIcon icon="phone" />
                  418 321-6767
                </a>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="clock" style={{ color: '#ef4444' }} />
              5. Combien de temps conservons-nous vos données ?
            </h2>
            
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <span style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  COMPTE ACTIF
                </span>
                <span>Tant que votre compte est utilisé</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <span style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  INACTIF
                </span>
                <span>2 ans après la dernière connexion</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  SUPPRESSION
                </span>
                <span>Immédiate sur demande (sauf obligations légales)</span>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="shield-alt" style={{ color: '#10b981' }} />
              6. Comment protégeons-nous vos données ?
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {[
                { icon: 'lock', title: 'Chiffrement', desc: 'HTTPS/TLS en transit\nAES-256 au repos' },
                { icon: 'server', title: 'Hébergement', desc: 'Serveurs au Canada\nCertifiés ISO 27001' },
                { icon: 'key', title: 'Accès', desc: 'Authentification 2FA\nAccès minimal requis' },
                { icon: 'backup', title: 'Sauvegarde', desc: 'Backups chiffrés\nRécupération testée' }
              ].map((security, index) => (
                <div key={index} style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <FontAwesomeIcon 
                    icon={security.icon as any} 
                    style={{ 
                      fontSize: '24px', 
                      color: '#10b981',
                      marginBottom: '8px'
                    }} 
                  />
                  <h5 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0a2540'
                  }}>
                    {security.title}
                  </h5>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#059669',
                    whiteSpace: 'pre-line'
                  }}>
                    {security.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="cookie-bite" style={{ color: '#8b5cf6' }} />
              7. Cookies et technologies similaires
            </h2>
            
            <p style={{ marginBottom: '16px' }}>
              Nous utilisons uniquement des cookies essentiels au fonctionnement de la plateforme :
            </p>
            
            <div style={{
              backgroundColor: '#faf5ff',
              border: '1px solid #d8b4fe',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#7c3aed' }}>Cookies essentiels uniquement :</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#7c3aed' }}>
                <li>Session d'authentification (next-auth)</li>
                <li>Préférences de langue</li>
                <li>Protection CSRF</li>
              </ul>
            </div>
            
            <p style={{ 
              marginTop: '16px',
              fontSize: '14px',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              Aucun cookie de tracking, publicité ou analytics tiers.
            </p>
          </section>

          <section>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0a2540',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon="phone" style={{ color: '#635bff' }} />
              8. Nous contacter
            </h2>
            
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e3e8ee',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <p style={{ margin: '0 0 16px 0' }}>
                Pour toute question concernant cette politique ou vos données personnelles :
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <h5 style={{ margin: '0 0 8px 0', color: '#0a2540' }}>Contact</h5>
                  <div style={{ fontSize: '14px' }}>
                    <a href="mailto:info@beriox.ca" style={{ color: '#635bff', textDecoration: 'none', display: 'block' }}>
                      info@beriox.ca
                    </a>
                    <a href="tel:4183216767" style={{ color: '#10b981', textDecoration: 'none' }}>
                      418 321-6767
                    </a>
                  </div>
                </div>
                
                <div>
                  <h5 style={{ margin: '0 0 8px 0', color: '#0a2540' }}>Délai de réponse</h5>
                  <span style={{ color: '#6b7280' }}>Maximum 30 jours (Loi 25)</span>
                </div>
                
                <div>
                  <h5 style={{ margin: '0 0 8px 0', color: '#0a2540' }}>Langue</h5>
                  <span style={{ color: '#6b7280' }}>Français / English</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '24px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e3e8ee'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FontAwesomeIcon icon="certificate" style={{ color: '#10b981' }} />
            <span style={{ fontWeight: '600', color: '#0a2540' }}>
              Conforme à la Loi 25 du Québec
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Cette politique est régulièrement mise à jour pour assurer notre conformité.
          </p>
        </div>
      </div>
    </Layout>
  )
}
