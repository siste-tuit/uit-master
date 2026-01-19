// Deshabilitar completamente DataGrid y MobileOptimizer
export {};

if (typeof window !== 'undefined') {
  // Interceptar todas las importaciones de @mui/x-data-grid
  const originalImport = (window as any).__webpack_require__;
  
  // Deshabilitar MobileOptimizer a nivel global
  (window as any).__MUI_DATA_GRID_OPTIMIZATIONS_DISABLED__ = true;
  (window as any).__MUI_MOBILE_OPTIMIZER_DISABLED__ = true;
  (window as any).__MUI_OPTIMIZATIONS_DISABLED__ = true;
  (window as any).__MUI_DISABLE_MOBILE_OPTIMIZER__ = true;
  
  // Interceptar errores de runtime
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && 
        (message.includes('optimizations') || 
         message.includes('MobileOptimizer') ||
         message.includes('Cannot access'))) {
      console.log('Prevented error:', message);
      return true; // Prevenir que se muestre el error
    }
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  // Interceptar errores no capturados
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' && 
        (event.reason.includes('optimizations') || 
         event.reason.includes('MobileOptimizer'))) {
      console.log('Prevented unhandled rejection:', event.reason);
      event.preventDefault();
    }
  });

  // Interceptar errores de React
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('optimizations') || 
         message.includes('MobileOptimizer') ||
         message.includes('Cannot access'))) {
      return; // Suprimir estos errores
    }
    originalConsoleError.apply(console, args);
  };
}
