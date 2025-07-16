function MinimalTest() {
  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          color: '#1e40af', 
          fontSize: '2rem', 
          marginBottom: '20px' 
        }}>
          🚀 IntelliNLP - Frontend Test
        </h1>
        
        <p style={{ 
          color: '#374151', 
          fontSize: '1.1rem', 
          marginBottom: '20px' 
        }}>
          ✅ React is working!<br/>
          ✅ Styles are loading!<br/>
          ✅ Frontend is visible!
        </p>

        <div style={{
          background: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '10px' }}>Navigation Test:</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['Summarizer', 'Quiz', 'Q&A', 'Code', 'Formal'].map(item => (
              <button
                key={item}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => alert(`${item} clicked!`)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <textarea
            placeholder="Enter some text here..."
            style={{
              width: '100%',
              height: '100px',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button
            style={{
              background: '#10b981',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '16px'
            }}
            onClick={() => alert('Processing text!')}
          >
            🔄 Process Text
          </button>
        </div>
      </div>
    </div>
  );
}

export default MinimalTest;
