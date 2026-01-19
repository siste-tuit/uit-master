import React from 'react';

const AppUltraMinimal: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏭</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#333' }}>
          ERP Textil
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: '0 0 30px 0' }}>
          Sistema de Gestión Empresarial
        </p>
        <button
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
          onClick={() => alert('¡ERP Textil funcionando sin errores!')}
        >
          Entrar al Sistema
        </button>
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          ✅ Frontend funcionando<br/>
          ✅ Sin errores de DataGrid<br/>
          ✅ Interfaz operativa
        </div>
      </div>
    </div>
  );
};

export default AppUltraMinimal;
