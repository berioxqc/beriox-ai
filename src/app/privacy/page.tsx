"use client";
import Layout from "@/components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <div style={{
        maxWidth: 'apos;800px'apos;,
        margin: 'apos;0 auto'apos;,
        padding: 'apos;32px 24px'apos;
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'apos;center'apos;,
          marginBottom: 'apos;48px'apos;
        }}>
          <h1 style={{
            fontSize: 'apos;32px'apos;,
            fontWeight: 'apos;700'apos;,
            color: 'apos;#0a2540'apos;,
            margin: 'apos;0 0 16px 0'apos;
          }}>
            <FontAwesomeIcon icon="shield-alt" style={{ marginRight: 'apos;12px'apos;, color: 'apos;#635bff'apos; }} />
            Politique de Confidentialité
          </h1>
          <p style={{
            fontSize: 'apos;18px'apos;,
            color: 'apos;#6b7280'apos;,
            margin: 0
          }}>
            Conforme à la Loi 25 du Québec sur la protection des renseignements personnels
          </p>
          <div style={{
            display: 'apos;inline-block'apos;,
            backgroundColor: 'apos;#10b98120'apos;,
            color: 'apos;#10b981'apos;,
            padding: 'apos;8px 16px'apos;,
            borderRadius: 'apos;20px'apos;,
            fontSize: 'apos;14px'apos;,
            fontWeight: 'apos;600'apos;,
            marginTop: 'apos;16px'apos;
          }}>
            ✅ Dernière mise à jour : {new Date().toLocaleDateString('apos;fr-CA'apos;)}
          </div>
        </div>

        {/* Contenu */}
        <div style={{
          backgroundColor: 'apos;white'apos;,
          borderRadius: 'apos;16px'apos;,
          padding: 'apos;32px'apos;,
          boxShadow: 'apos;0 1px 3px rgba(16, 24, 40, 0.1)'apos;,
          border: 'apos;1px solid #e3e8ee'apos;,
          lineHeight: 'apos;1.7'apos;,
          fontSize: 'apos;16px'apos;,
          color: 'apos;#374151'apos;
        }}>
          
          <section style={{ marginBottom: 'apos;32px'apos; }}>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="info-circle" style={{ color: 'apos;#635bff'apos; }} />
              1. Qui sommes-nous ?
            </h2>
            <p>
              Beriox AI est une plateforme d'apos;intelligence artificielle qui vous aide dans vos tâches quotidiennes 
              de marketing, développement web et création de contenu. Nous sommes situés au Québec, Canada, et 
              nous nous engageons à respecter la Loi 25 sur la protection des renseignements personnels.
            </p>
            <div style={{
              backgroundColor: 'apos;#eff6ff'apos;,
              border: 'apos;1px solid #bfdbfe'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              marginTop: 'apos;16px'apos;
            }}>
              <strong>Responsable de la protection des données :</strong><br/>
              Jean-François Rioux-Bergeron<br/>
              <strong>Téléphone :</strong> 418 321-6767<br/>
              <strong>Courriel :</strong> info@beriox.ca
            </div>
          </section>

          <section style={{ marginBottom: 'apos;32px'apos; }}>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="database" style={{ color: 'apos;#f59e0b'apos; }} />
              2. Quelles données collectons-nous ?
            </h2>
            
            <h3 style={{ fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#0a2540'apos;, marginTop: 'apos;24px'apos; }}>
              Données d'apos;identification
            </h3>
            <ul>
              <li>Nom complet</li>
              <li>Adresse courriel</li>
              <li>Photo de profil (via Google OAuth)</li>
            </ul>

            <h3 style={{ fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#0a2540'apos;, marginTop: 'apos;24px'apos; }}>
              Données d'apos;utilisation
            </h3>
            <ul>
              <li>Missions créées et leurs contenus</li>
              <li>Interactions avec les agents IA</li>
              <li>Préférences d'apos;utilisation</li>
              <li>Statistiques d'apos;usage (anonymisées)</li>
            </ul>

            <h3 style={{ fontSize: 'apos;18px'apos;, fontWeight: 'apos;600'apos;, color: 'apos;#0a2540'apos;, marginTop: 'apos;24px'apos; }}>
              Données techniques
            </h3>
            <ul>
              <li>Adresse IP (anonymisée après 30 jours)</li>
              <li>Type de navigateur et système d'apos;exploitation</li>
              <li>Pages visitées et temps passé</li>
              <li>Cookies de session (essentiels uniquement)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'apos;32px'apos; }}>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="bullseye" style={{ color: 'apos;#10b981'apos; }} />
              3. Pourquoi collectons-nous ces données ?
            </h2>
            
            <div style={{
              display: 'apos;grid'apos;,
              gap: 'apos;16px'apos;
            }}>
              <div style={{
                backgroundColor: 'apos;#f8fafc'apos;,
                padding: 'apos;16px'apos;,
                borderRadius: 'apos;8px'apos;,
                border: 'apos;1px solid #e3e8ee'apos;
              }}>
                <h4 style={{ margin: 'apos;0 0 8px 0'apos;, color: 'apos;#0a2540'apos; }}>✅ Finalités légitimes :</h4>
                <ul style={{ margin: 0, paddingLeft: 'apos;20px'apos; }}>
                  <li>Fournir nos services d'apos;IA personnalisés</li>
                  <li>Améliorer votre expérience utilisateur</li>
                  <li>Assurer la sécurité de la plateforme</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 'apos;32px'apos; }}>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="user-check" style={{ color: 'apos;#8b5cf6'apos; }} />
              4. Vos droits (Loi 25)
            </h2>
            
            <div style={{
              backgroundColor: 'apos;#fef3c7'apos;,
              border: 'apos;1px solid #fbbf24'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;20px'apos;,
              marginBottom: 'apos;20px'apos;
            }}>
              <h4 style={{ margin: 'apos;0 0 12px 0'apos;, color: 'apos;#92400e'apos; }}>
                🎯 Vous avez le contrôle total de vos données
              </h4>
              <p style={{ margin: 0, color: 'apos;#92400e'apos; }}>
                Conformément à la Loi 25, vous pouvez exercer ces droits à tout moment, gratuitement.
              </p>
            </div>

            <div style={{
              display: 'apos;grid'apos;,
              gridTemplateColumns: 'apos;repeat(auto-fit, minmax(250px, 1fr))'apos;,
              gap: 'apos;16px'apos;
            }}>
              {[
                { icon: 'apos;eye'apos;, title: 'apos;Droit d\'apos;accès'apos;, desc: 'apos;Consulter toutes vos données'apos; },
                { icon: 'apos;edit'apos;, title: 'apos;Droit de rectification'apos;, desc: 'apos;Corriger vos informations'apos; },
                { icon: 'apos;trash'apos;, title: 'apos;Droit d\'apos;effacement'apos;, desc: 'apos;Supprimer votre compte'apos; },
                { icon: 'apos;download'apos;, title: 'apos;Portabilité'apos;, desc: 'apos;Exporter vos données'apos; },
                { icon: 'apos;ban'apos;, title: 'apos;Opposition'apos;, desc: 'apos;Refuser certains traitements'apos; },
                { icon: 'apos;pause'apos;, title: 'apos;Limitation'apos;, desc: 'apos;Suspendre le traitement'apos; }
              ].map((right, index) => (
                <div key={index} style={{
                  backgroundColor: 'apos;white'apos;,
                  border: 'apos;1px solid #e3e8ee'apos;,
                  borderRadius: 'apos;8px'apos;,
                  padding: 'apos;16px'apos;,
                  textAlign: 'apos;center'apos;
                }}>
                  <FontAwesomeIcon 
                    icon={right.icon as any} 
                    style={{ 
                      fontSize: 'apos;24px'apos;, 
                      color: 'apos;#635bff'apos;,
                      marginBottom: 'apos;8px'apos;
                    }} 
                  />
                  <h5 style={{
                    margin: 'apos;0 0 8px 0'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;
                  }}>
                    {right.title}
                  </h5>
                  <p style={{
                    margin: 0,
                    fontSize: 'apos;12px'apos;,
                    color: 'apos;#6b7280'apos;
                  }}>
                    {right.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: 'apos;#eff6ff'apos;,
              border: 'apos;1px solid #bfdbfe'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;,
              marginTop: 'apos;20px'apos;,
              textAlign: 'apos;center'apos;
            }}>
              <p style={{ margin: 'apos;0 0 12px 0'apos;, fontWeight: 'apos;600'apos; }}>
                Pour exercer vos droits, contactez-nous :
              </p>
              <div style={{ display: 'apos;flex'apos;, gap: 'apos;12px'apos;, justifyContent: 'apos;center'apos;, flexWrap: 'apos;wrap'apos; }}>
                <a 
                  href="mailto:info@beriox.ca?subject=Exercice de mes droits - Loi 25"
                  style={{
                    display: 'apos;inline-flex'apos;,
                    alignItems: 'apos;center'apos;,
                    gap: 'apos;8px'apos;,
                    backgroundColor: 'apos;#635bff'apos;,
                    color: 'apos;white'apos;,
                    padding: 'apos;12px 20px'apos;,
                    borderRadius: 'apos;8px'apos;,
                    textDecoration: 'apos;none'apos;,
                    fontWeight: 'apos;600'apos;,
                    fontSize: 'apos;14px'apos;
                  }}
                >
                  <FontAwesomeIcon icon="envelope" />
                  info@beriox.ca
                </a>
                <a 
                  href="tel:4183216767"
                  style={{
                    display: 'apos;inline-flex'apos;,
                    alignItems: 'apos;center'apos;,
                    gap: 'apos;8px'apos;,
                    backgroundColor: 'apos;#10b981'apos;,
                    color: 'apos;white'apos;,
                    padding: 'apos;12px 20px'apos;,
                    borderRadius: 'apos;8px'apos;,
                    textDecoration: 'apos;none'apos;,
                    fontWeight: 'apos;600'apos;,
                    fontSize: 'apos;14px'apos;
                  }}
                >
                  <FontAwesomeIcon icon="phone" />
                  418 321-6767
                </a>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 'apos;32px'apos; }}>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="clock" style={{ color: 'apos;#ef4444'apos; }} />
              5. Combien de temps conservons-nous vos données ?
            </h2>
            
            <div style={{
              display: 'apos;grid'apos;,
              gap: 'apos;12px'apos;
            }}>
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: 'apos;12px'apos;,
                padding: 'apos;12px'apos;,
                backgroundColor: 'apos;#f8fafc'apos;,
                borderRadius: 'apos;8px'apos;
              }}>
                <span style={{
                  backgroundColor: 'apos;#10b981'apos;,
                  color: 'apos;white'apos;,
                  padding: 'apos;4px 8px'apos;,
                  borderRadius: 'apos;4px'apos;,
                  fontSize: 'apos;12px'apos;,
                  fontWeight: 'apos;600'apos;
                }}>
                  COMPTE ACTIF
                </span>
                <span>Tant que votre compte est utilisé</span>
              </div>
              
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: 'apos;12px'apos;,
                padding: 'apos;12px'apos;,
                backgroundColor: 'apos;#f8fafc'apos;,
                borderRadius: 'apos;8px'apos;
              }}>
                <span style={{
                  backgroundColor: 'apos;#f59e0b'apos;,
                  color: 'apos;white'apos;,
                  padding: 'apos;4px 8px'apos;,
                  borderRadius: 'apos;4px'apos;,
                  fontSize: 'apos;12px'apos;,
                  fontWeight: 'apos;600'apos;
                }}>
                  INACTIF
                </span>
                <span>2 ans après la dernière connexion</span>
              </div>
              
              <div style={{
                display: 'apos;flex'apos;,
                alignItems: 'apos;center'apos;,
                gap: 'apos;12px'apos;,
                padding: 'apos;12px'apos;,
                backgroundColor: 'apos;#f8fafc'apos;,
                borderRadius: 'apos;8px'apos;
              }}>
                <span style={{
                  backgroundColor: 'apos;#ef4444'apos;,
                  color: 'apos;white'apos;,
                  padding: 'apos;4px 8px'apos;,
                  borderRadius: 'apos;4px'apos;,
                  fontSize: 'apos;12px'apos;,
                  fontWeight: 'apos;600'apos;
                }}>
                  SUPPRESSION
                </span>
                <span>Immédiate sur demande (sauf obligations légales)</span>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 'apos;32px'apos; }}>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="shield-alt" style={{ color: 'apos;#10b981'apos; }} />
              6. Comment protégeons-nous vos données ?
            </h2>
            
            <div style={{
              display: 'apos;grid'apos;,
              gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
              gap: 'apos;16px'apos;
            }}>
              {[
                { icon: 'apos;lock'apos;, title: 'apos;Chiffrement'apos;, desc: 'apos;HTTPS/TLS en transit\nAES-256 au repos'apos; },
                { icon: 'apos;server'apos;, title: 'apos;Hébergement'apos;, desc: 'apos;Serveurs au Canada\nCertifiés ISO 27001'apos; },
                { icon: 'apos;key'apos;, title: 'apos;Accès'apos;, desc: 'apos;Authentification 2FA\nAccès minimal requis'apos; },
                { icon: 'apos;backup'apos;, title: 'apos;Sauvegarde'apos;, desc: 'apos;Backups chiffrés\nRécupération testée'apos; }
              ].map((security, index) => (
                <div key={index} style={{
                  backgroundColor: 'apos;#f0fdf4'apos;,
                  border: 'apos;1px solid #bbf7d0'apos;,
                  borderRadius: 'apos;8px'apos;,
                  padding: 'apos;16px'apos;,
                  textAlign: 'apos;center'apos;
                }}>
                  <FontAwesomeIcon 
                    icon={security.icon as any} 
                    style={{ 
                      fontSize: 'apos;24px'apos;, 
                      color: 'apos;#10b981'apos;,
                      marginBottom: 'apos;8px'apos;
                    }} 
                  />
                  <h5 style={{
                    margin: 'apos;0 0 8px 0'apos;,
                    fontSize: 'apos;14px'apos;,
                    fontWeight: 'apos;600'apos;,
                    color: 'apos;#0a2540'apos;
                  }}>
                    {security.title}
                  </h5>
                  <p style={{
                    margin: 0,
                    fontSize: 'apos;12px'apos;,
                    color: 'apos;#059669'apos;,
                    whiteSpace: 'apos;pre-line'apos;
                  }}>
                    {security.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 'apos;32px'apos; }}>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="cookie-bite" style={{ color: 'apos;#8b5cf6'apos; }} />
              7. Cookies et technologies similaires
            </h2>
            
            <p style={{ marginBottom: 'apos;16px'apos; }}>
              Nous utilisons uniquement des cookies essentiels au fonctionnement de la plateforme :
            </p>
            
            <div style={{
              backgroundColor: 'apos;#faf5ff'apos;,
              border: 'apos;1px solid #d8b4fe'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;16px'apos;
            }}>
              <h4 style={{ margin: 'apos;0 0 8px 0'apos;, color: 'apos;#7c3aed'apos; }}>Cookies essentiels uniquement :</h4>
              <ul style={{ margin: 0, paddingLeft: 'apos;20px'apos;, color: 'apos;#7c3aed'apos; }}>
                <li>Session d'apos;authentification (next-auth)</li>
                <li>Préférences de langue</li>
                <li>Protection CSRF</li>
              </ul>
            </div>
            
            <p style={{ 
              marginTop: 'apos;16px'apos;,
              fontSize: 'apos;14px'apos;,
              color: 'apos;#6b7280'apos;,
              fontStyle: 'apos;italic'apos;
            }}>
              Aucun cookie de tracking, publicité ou analytics tiers.
            </p>
          </section>

          <section>
            <h2 style={{
              fontSize: 'apos;24px'apos;,
              fontWeight: 'apos;600'apos;,
              color: 'apos;#0a2540'apos;,
              marginBottom: 'apos;16px'apos;,
              display: 'apos;flex'apos;,
              alignItems: 'apos;center'apos;,
              gap: 'apos;8px'apos;
            }}>
              <FontAwesomeIcon icon="phone" style={{ color: 'apos;#635bff'apos; }} />
              8. Nous contacter
            </h2>
            
            <div style={{
              backgroundColor: 'apos;#f8fafc'apos;,
              border: 'apos;1px solid #e3e8ee'apos;,
              borderRadius: 'apos;8px'apos;,
              padding: 'apos;20px'apos;
            }}>
              <p style={{ margin: 'apos;0 0 16px 0'apos; }}>
                Pour toute question concernant cette politique ou vos données personnelles :
              </p>
              
              <div style={{
                display: 'apos;grid'apos;,
                gridTemplateColumns: 'apos;repeat(auto-fit, minmax(200px, 1fr))'apos;,
                gap: 'apos;16px'apos;
              }}>
                <div>
                  <h5 style={{ margin: 'apos;0 0 8px 0'apos;, color: 'apos;#0a2540'apos; }}>Contact</h5>
                  <div style={{ fontSize: 'apos;14px'apos; }}>
                    <a href="mailto:info@beriox.ca" style={{ color: 'apos;#635bff'apos;, textDecoration: 'apos;none'apos;, display: 'apos;block'apos; }}>
                      info@beriox.ca
                    </a>
                    <a href="tel:4183216767" style={{ color: 'apos;#10b981'apos;, textDecoration: 'apos;none'apos; }}>
                      418 321-6767
                    </a>
                  </div>
                </div>
                
                <div>
                  <h5 style={{ margin: 'apos;0 0 8px 0'apos;, color: 'apos;#0a2540'apos; }}>Délai de réponse</h5>
                  <span style={{ color: 'apos;#6b7280'apos; }}>Maximum 30 jours (Loi 25)</span>
                </div>
                
                <div>
                  <h5 style={{ margin: 'apos;0 0 8px 0'apos;, color: 'apos;#0a2540'apos; }}>Langue</h5>
                  <span style={{ color: 'apos;#6b7280'apos; }}>Français / English</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'apos;center'apos;,
          marginTop: 'apos;48px'apos;,
          padding: 'apos;24px'apos;,
          backgroundColor: 'apos;#f8fafc'apos;,
          borderRadius: 'apos;12px'apos;,
          border: 'apos;1px solid #e3e8ee'apos;
        }}>
          <div style={{
            display: 'apos;flex'apos;,
            alignItems: 'apos;center'apos;,
            justifyContent: 'apos;center'apos;,
            gap: 'apos;8px'apos;,
            marginBottom: 'apos;8px'apos;
          }}>
            <FontAwesomeIcon icon="certificate" style={{ color: 'apos;#10b981'apos; }} />
            <span style={{ fontWeight: 'apos;600'apos;, color: 'apos;#0a2540'apos; }}>
              Conforme à la Loi 25 du Québec
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: 'apos;14px'apos;,
            color: 'apos;#6b7280'apos;
          }}>
            Cette politique est régulièrement mise à jour pour assurer notre conformité.
          </p>
        </div>
      </div>
    </Layout>
  );
}
