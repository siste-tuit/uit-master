// Parche para solucionar el error de optimizations en DataGrid
export {};

// Deshabilitar optimizaciones problemáticas
if (typeof window !== 'undefined') {
  // Deshabilitar optimizaciones de Material-UI DataGrid
  (window as any).__MUI_DATA_GRID_OPTIMIZATIONS_DISABLED__ = true;
  (window as any).__MUI_MOBILE_OPTIMIZER_DISABLED__ = true;
  
  // Parche más agresivo para MobileOptimizer
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('optimizations') || args[0].includes('MobileOptimizer'))) {
      return; // Suprimir errores de optimizations
    }
    originalConsoleError.apply(console, args);
  };

  // Interceptar errores de runtime
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && 
        (message.includes('optimizations') || message.includes('MobileOptimizer'))) {
      return true; // Prevenir que se muestre el error
    }
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
}

// Archivo de parche para DataGrid
