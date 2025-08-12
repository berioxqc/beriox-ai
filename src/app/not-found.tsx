export default function NotFound() {
  return (
    <div style={{ 
      display: 'apos;flex'apos;, 
      flexDirection: 'apos;column'apos;, 
      alignItems: 'apos;center'apos;, 
      justifyContent: 'apos;center'apos;, 
      minHeight: 'apos;100vh'apos;,
      fontFamily: 'apos;-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'apos;
    }}>
      <h1 style={{ fontSize: 'apos;4rem'apos;, margin: 0, color: 'apos;#5a5fca'apos; }}>404</h1>
      <h2 style={{ fontSize: 'apos;1.5rem'apos;, margin: 'apos;1rem 0'apos;, color: 'apos;#333'apos; }}>Page non trouvée</h2>
      <p style={{ color: 'apos;#666'apos;, marginBottom: 'apos;2rem'apos; }}>La page que vous cherchez n'apos;existe pas.</p>
      <a href="/" style={{ 
        padding: 'apos;12px 24px'apos;, 
        background: 'apos;#5a5fca'apos;, 
        color: 'apos;white'apos;, 
        textDecoration: 'apos;none'apos;, 
        borderRadius: 'apos;6px'apos; 
      }}>
        Retour à l'apos;accueil
      </a>
    </div>
  );
}
