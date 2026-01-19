// Plugin de Vite para copiar _redirects a la raíz de dist
import { copyFileSync } from 'fs';
import { join } from 'path';

export default function copyRedirects() {
  return {
    name: 'copy-redirects',
    writeBundle() {
      const src = join(process.cwd(), 'public', '_redirects');
      const dest = join(process.cwd(), 'dist', '_redirects');
      try {
        copyFileSync(src, dest);
        console.log('✅ _redirects copiado a dist');
      } catch (error) {
        console.warn('⚠️ No se pudo copiar _redirects:', error.message);
      }
    }
  };
}
