export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: '#5a5fca' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', margin: '1rem 0', color: '#333' }}>Page non trouvée</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>La page que vous cherchez n'existe pas.</p>
      <a href="/" style={{ 
        padding: '12px 24px', 
        background: '#5a5fca', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '6px' 
      }}>
        Retour à l'accueil
      </a>
    </div>
  )
}
