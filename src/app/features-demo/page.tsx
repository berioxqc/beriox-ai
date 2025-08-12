"use client"
import React from 'react'
import Dashboard from '@/components/Dashboard'
import ExportSystem from '@/components/ExportSystem'
import { Icon } from '@/components/ui/Icon'
export default function FeaturesDemoPage() {
  return (
    <div className="features-demo">
      <div className="demo-header">
        <h1>🚀 Nouvelles Fonctionnalités Beriox AI</h1>
        <p>Découvrez les améliorations apportées à votre plateforme</p>
      </div>

      <div className="demo-content">
        {/* Section Dashboard */}
        <section className="feature-section">
          <div className="section-header">
            <div className="feature-icon">
              <Icon name="chart-line" size="2x" />
            </div>
            <div className="feature-info">
              <h2>Dashboard Personnalisable</h2>
              <p>Créez votre tableau de bord sur mesure avec des widgets configurables</p>
            </div>
          </div>
          <div className="feature-demo">
            <Dashboard />
          </div>
        </section>

        {/* Section Export */}
        <section className="feature-section">
          <div className="section-header">
            <div className="feature-icon">
              <Icon name="download" size="2x" />
            </div>
            <div className="feature-info">
              <h2>Système d'Export Avancé</h2>
              <p>Exportez vos données en PDF, Excel ou CSV avec des graphiques personnalisés</p>
            </div>
          </div>
          <div className="feature-demo">
            <ExportSystem />
          </div>
        </section>

        {/* Section Notifications */}
        <section className="feature-section">
          <div className="section-header">
            <div className="feature-icon">
              <Icon name="bell" size="2x" />
            </div>
            <div className="feature-info">
              <h2>Notifications Intelligentes</h2>
              <p>Système d'alertes en temps réel avec filtres et actions rapides</p>
            </div>
          </div>
          <div className="feature-demo">
            <div className="notification-demo">
              <div className="demo-notification">
                <div className="notification-header">
                  <Icon name="lightbulb" style={{ color: '#ea580c' }} />
                  <span>Nouvelle opportunité détectée</span>
                  <span className="notification-time">Il y a 30 min</span>
                </div>
                <div className="notification-content">
                  Votre concurrent a baissé ses prix de 15%. Action recommandée.
                </div>
                <div className="notification-actions">
                  <button className="action-btn">Voir l'analyse</button>
                  <button className="action-btn secondary">Ignorer</button>
                </div>
              </div>

              <div className="demo-notification critical">
                <div className="notification-header">
                  <Icon name="exclamation-triangle" style={{ color: '#dc2626' }} />
                  <span>Erreur de sécurité critique</span>
                  <span className="notification-time">Il y a 2h</span>
                </div>
                <div className="notification-content">
                  Vulnérabilité SSL détectée sur votre domaine principal.
                </div>
                <div className="notification-actions">
                  <button className="action-btn urgent">Corriger maintenant</button>
                </div>
              </div>

              <div className="demo-notification success">
                <div className="notification-header">
                  <Icon name="check-circle" style={{ color: '#10b981' }} />
                  <span>Mission terminée</span>
                  <span className="notification-time">Il y a 4h</span>
                </div>
                <div className="notification-content">
                  L'analyse SEO Amazon a été complétée avec succès.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Icônes */}
        <section className="feature-section">
          <div className="section-header">
            <div className="feature-icon">
              <Icon name="puzzle-piece" size="2x" />
            </div>
            <div className="feature-info">
              <h2>Système d'Icônes Centralisé</h2>
              <p>Plus de 80 icônes FontAwesome organisées et optimisées</p>
            </div>
          </div>
          <div className="feature-demo">
            <div className="icons-showcase">
              <div className="icon-category">
                <h3>Navigation</h3>
                <div className="icon-grid">
                  {['home', 'tasks', 'users', 'cog', 'plus', 'search', 'user', 'dollar-sign'].map(icon => (
                    <div key={icon} className="icon-item">
                      <Icon name={icon} size="lg" />
                      <span>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="icon-category">
                <h3>Actions</h3>
                <div className="icon-grid">
                  {['play', 'stop', 'pause', 'refresh', 'edit', 'trash', 'save', 'check'].map(icon => (
                    <div key={icon} className="icon-item">
                      <Icon name={icon} size="lg" />
                      <span>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="icon-category">
                <h3>Statuts</h3>
                <div className="icon-grid">
                  {['spinner', 'exclamation-triangle', 'info-circle', 'check-circle', 'times-circle'].map(icon => (
                    <div key={icon} className="icon-item">
                      <Icon name={icon} size="lg" />
                      <span>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Améliorations UX */}
        <section className="feature-section">
          <div className="section-header">
            <div className="feature-icon">
              <Icon name="universal-access" size="2x" />
            </div>
            <div className="feature-info">
              <h2>Améliorations UX</h2>
              <p>Interface plus intuitive et responsive pour une meilleure expérience utilisateur</p>
            </div>
          </div>
          <div className="feature-demo">
            <div className="ux-improvements">
              <div className="improvement-card">
                <Icon name="mobile" size="lg" />
                <h4>Design Responsive</h4>
                <p>Interface adaptée à tous les écrans</p>
              </div>
              <div className="improvement-card">
                <Icon name="bolt" size="lg" />
                <h4>Performance Optimisée</h4>
                <p>Chargement plus rapide et fluide</p>
              </div>
              <div className="improvement-card">
                <Icon name="shield" size="lg" />
                <h4>Sécurité Renforcée</h4>
                <p>Protection des données utilisateur</p>
              </div>
              <div className="improvement-card">
                <Icon name="cog" size="lg" />
                <h4>Personnalisation</h4>
                <p>Interface personnalisable selon vos besoins</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .features-demo {
          min-height: 100vh
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)
          padding: 24px
        }

        .demo-header {
          text-align: center
          margin-bottom: 48px
        }

        .demo-header h1 {
          font-size: 2.5rem
          font-weight: 800
          background: linear-gradient(135deg, #3b82f6, #8b5cf6)
          -webkit-background-clip: text
          -webkit-text-fill-color: transparent
          margin-bottom: 16px
        }

        .demo-header p {
          font-size: 1.2rem
          color: #64748b
          max-width: 600px
          margin: 0 auto
        }

        .demo-content {
          max-width: 1400px
          margin: 0 auto
        }

        .feature-section {
          background: white
          border-radius: 16px
          padding: 32px
          margin-bottom: 32px
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)
          border: 1px solid #e2e8f0
        }

        .section-header {
          display: flex
          align-items: center
          gap: 20px
          margin-bottom: 32px
        }

        .feature-icon {
          width: 64px
          height: 64px
          background: linear-gradient(135deg, #3b82f6, #8b5cf6)
          border-radius: 16px
          display: flex
          align-items: center
          justify-content: center
          color: white
          flex-shrink: 0
        }

        .feature-info h2 {
          font-size: 1.5rem
          font-weight: 700
          color: #1a1a1a
          margin: 0 0 8px 0
        }

        .feature-info p {
          font-size: 1rem
          color: #64748b
          margin: 0
          line-height: 1.6
        }

        .feature-demo {
          border: 1px solid #e2e8f0
          border-radius: 12px
          overflow: hidden
        }

        /* Notification Demo */
        .notification-demo {
          padding: 24px
          background: #f8fafc
        }

        .demo-notification {
          background: white
          border-radius: 12px
          padding: 20px
          margin-bottom: 16px
          border-left: 4px solid #3b82f6
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
        }

        .demo-notification.critical {
          border-left-color: #dc2626
          background: #fef2f2
        }

        .demo-notification.success {
          border-left-color: #10b981
          background: #f0fdf4
        }

        .notification-header {
          display: flex
          align-items: center
          gap: 12px
          margin-bottom: 12px
          font-weight: 600
          color: #1a1a1a
        }

        .notification-time {
          margin-left: auto
          font-size: 12px
          color: #64748b
          font-weight: 400
        }

        .notification-content {
          color: #64748b
          margin-bottom: 16px
          line-height: 1.5
        }

        .notification-actions {
          display: flex
          gap: 8px
        }

        .action-btn {
          padding: 8px 16px
          border: 1px solid #3b82f6
          border-radius: 6px
          background: white
          color: #3b82f6
          font-size: 12px
          font-weight: 500
          cursor: pointer
          transition: all 0.2s
        }

        .action-btn:hover {
          background: #3b82f6
          color: white
        }

        .action-btn.secondary {
          border-color: #e2e8f0
          color: #64748b
        }

        .action-btn.secondary:hover {
          background: #f1f5f9
        }

        .action-btn.urgent {
          background: #dc2626
          color: white
          border-color: #dc2626
        }

        .action-btn.urgent:hover {
          background: #b91c1c
        }

        /* Icons Showcase */
        .icons-showcase {
          padding: 24px
          background: #f8fafc
        }

        .icon-category {
          margin-bottom: 32px
        }

        .icon-category h3 {
          font-size: 1.1rem
          font-weight: 600
          color: #1a1a1a
          margin-bottom: 16px
          padding-bottom: 8px
          border-bottom: 2px solid #e2e8f0
        }

        .icon-grid {
          display: grid
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))
          gap: 16px
        }

        .icon-item {
          display: flex
          flex-direction: column
          align-items: center
          gap: 8px
          padding: 16px
          background: white
          border-radius: 8px
          border: 1px solid #e2e8f0
          transition: all 0.2s
        }

        .icon-item:hover {
          transform: translateY(-2px)
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
        }

        .icon-item span {
          font-size: 11px
          color: #64748b
          text-align: center
          font-weight: 500
        }

        /* UX Improvements */
        .ux-improvements {
          padding: 24px
          background: #f8fafc
          display: grid
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
          gap: 24px
        }

        .improvement-card {
          background: white
          padding: 24px
          border-radius: 12px
          text-align: center
          border: 1px solid #e2e8f0
          transition: all 0.3s
        }

        .improvement-card:hover {
          transform: translateY(-4px)
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15)
        }

        .improvement-card h4 {
          font-size: 1.1rem
          font-weight: 600
          color: #1a1a1a
          margin: 16px 0 8px 0
        }

        .improvement-card p {
          font-size: 14px
          color: #64748b
          margin: 0
          line-height: 1.5
        }

        /* Responsive */
        @media (max-width: 768px) {
          .features-demo {
            padding: 16px
          }

          .demo-header h1 {
            font-size: 2rem
          }

          .section-header {
            flex-direction: column
            text-align: center
          }

          .feature-icon {
            width: 48px
            height: 48px
          }

          .icon-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr))
          }

          .ux-improvements {
            grid-template-columns: 1fr
          }
        }
      `}</style>
    </div>
  )
}
