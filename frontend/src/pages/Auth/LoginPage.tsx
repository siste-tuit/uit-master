import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = await login(formData.email, formData.password);
    if (!success) {
      // 🚨 CAMBIO CLAVE: Mensaje de error genérico por seguridad.
      setError('Correo electrónico o contraseña incorrectos.');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 sm:px-6 lg:px-8">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-primary-100 opacity-20"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-secondary-100 opacity-20"></div>
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-accent-100 opacity-10"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 overflow-hidden rounded-3xl shadow-lg bg-white/60">
            <img
              src="/assets/images/logos/arriba.png"
              alt="Logo ERP Textil"
              className="object-cover w-full h-full p-2"
            />
          </div>
          <h2 className="mb-2 text-4xl font-bold text-gray-900">
            ERP Textil
          </h2>
          <p className="text-lg font-medium text-gray-600">
            Sistema de Gestión Empresarial
          </p>
          <div className="w-16 h-1 mx-auto mt-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"></div>
        </div>

        {/* Formulario de login */}
        <div className="px-8 py-10 border shadow-2xl glass-effect rounded-2xl border-white/30">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Bienvenido</h3>
            <p className="text-gray-600">Inicia sesión para acceder al sistema</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="input-label">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 input-field"
                  placeholder="usuario@textil.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="input-label">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50 animate-pulse">
                <div className="flex items-center">
                  <div className="mr-3 text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full py-3 text-lg font-semibold btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 mr-3 border-b-2 border-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Sección de credenciales demo eliminada a solicitud */}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">
            © ERP Textil. Sistema de Gestión Empresarial.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;