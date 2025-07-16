import { useState } from 'react';

function SimpleTest() {
  const [message, setMessage] = useState('App is working!');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f9ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '2rem',
        color: '#1e40af',
        marginBottom: '1rem'
      }}>
        IntelliNLP Debug Test
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#374151',
        marginBottom: '2rem'
      }}>
        {message}
      </p>
      <button
        onClick={() => setMessage(message === 'App is working!' ? 'Button clicked!' : 'App is working!')}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Debug Info:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280' }}>
          <li>React: ✅ Working</li>
          <li>State: ✅ Working</li>
          <li>Events: ✅ Working</li>
          <li>Rendering: ✅ Working</li>
        </ul>
      </div>
    </div>
  );
}

export default SimpleTest;
