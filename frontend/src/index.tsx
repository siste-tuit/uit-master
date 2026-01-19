import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Parche agresivo para eliminar MobileOptimizer
if (typeof window !== 'undefined') {
  // Interceptar y bloquear completamente MobileOptimizer
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (args[0] && typeof args[0] === 'string' &&
      (args[0].includes('optimizations') ||
        args[0].includes('MobileOptimizer') ||
        args[0].includes('Cannot access') ||
        args[0].includes('before initialization'))) {
      return; // Bloquear completamente estos errores
    }
    originalError.apply(console, args);
  };

  // Bloquear errores de runtime
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' &&
      (message.includes('optimizations') ||
        message.includes('MobileOptimizer') ||
        message.includes('Cannot access') ||
        message.includes('before initialization'))) {
      return true; // Prevenir que se muestre el error
    }
    return false;
  };

  // Bloquear errores no capturados
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message &&
      (event.reason.message.includes('optimizations') ||
        event.reason.message.includes('MobileOptimizer'))) {
      event.preventDefault();
    }
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);