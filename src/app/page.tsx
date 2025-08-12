export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <main style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#00ff88' }}>
          Beriox AI
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#cccccc' }}>
          Intelligence artificielle avancée
        </p>
        <div>
          <button style={{
            backgroundColor: '#00ff88',
            color: '#1a1a1a',
            border: 'none',
            padding: '12px 24px',
            fontSize: '1.1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Commencer
          </button>
        </div>
      </main>
    </div>
  );
}
