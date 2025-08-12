import { pricingPlans, stripeUtils } from '../lib/stripe-config';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '2rem',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>
          Beriox AI
        </h1>
        <nav>
          <button style={{
            backgroundColor: '#00ff88',
            color: '#0a0a0a',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Se connecter
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            background: 'linear-gradient(45deg, #00ff88, #00ccff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Intelligence Artificielle Avancée
          </h2>
          <p style={{
            fontSize: '1.3rem',
            color: '#cccccc',
            marginBottom: '2rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Découvrez nos agents IA spécialisés pour automatiser vos tâches, analyser vos données et transformer votre productivité.
          </p>
          <button style={{
            backgroundColor: '#00ff88',
            color: '#0a0a0a',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1.1rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '1rem'
          }}>
            Commencer gratuitement
          </button>
          <button style={{
            backgroundColor: 'transparent',
            color: '#00ff88',
            border: '2px solid #00ff88',
            padding: '15px 30px',
            fontSize: '1.1rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Voir la démo
          </button>
        </section>

        {/* Features Section */}
        <section style={{
          padding: '4rem 2rem',
          backgroundColor: '#111',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '2.5rem',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#00ff88'
          }}>
            Fonctionnalités
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>🤖 Agents IA Spécialisés</h4>
              <p>Nos agents IA sont conçus pour des tâches spécifiques : analyse de données, automatisation, support client.</p>
            </div>
            <div style={{
              padding: '2rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>📊 Analytics Avancées</h4>
              <p>Suivez vos performances avec des tableaux de bord détaillés et des insights en temps réel.</p>
            </div>
            <div style={{
              padding: '2rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>🔗 Intégrations</h4>
              <p>Connectez Beriox AI à vos outils existants pour une intégration transparente.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '2.5rem',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#00ff88'
          }}>
            Plans de tarification
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {Object.entries(pricingPlans).map(([key, plan]) => (
              <div key={key} style={{
                padding: '2rem',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                border: '2px solid #333',
                position: 'relative'
              }}>
                <h4 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>{plan.name}</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {stripeUtils.formatPrice(plan.price * 100, plan.currency)}/{plan.interval}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #333'
                    }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <button style={{
                  width: '100%',
                  backgroundColor: '#00ff88',
                  color: '#0a0a0a',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                  Choisir ce plan
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        borderTop: '1px solid #333',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>&copy; 2024 Beriox AI. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
