import React, { useState } from 'react';

// Componente de prueba simple sin Material-UI
const AppTest: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2E7D32',
          margin: '0 0 20px 0'
        }}>
          🏭 ERP TEXTIL
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#666',
          margin: '0 0 30px 0'
        }}>
          Sistema de Gestión Empresarial
        </p>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(46, 125, 50, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(46, 125, 50, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(46, 125, 50, 0.4)';
          }}
        >
          Contador: {count}
        </button>
        <p style={{
          fontSize: '14px',
          color: '#999',
          margin: '20px 0 0 0'
        }}>
          ✅ Sin Material-UI - Solo React puro
        </p>
      </div>
    </div>
  );
};

export default AppTest;
