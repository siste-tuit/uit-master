import React, { useMemo, useState } from 'react';

type TipoCampo = 'text' | 'number' | 'boolean' | 'select' | 'password';

interface CampoConfig {
  nombre: string;
  descripcion: string;
  tipo: TipoCampo;
  valor: string | number | boolean;
  opciones?: string[];
  requerido?: boolean;
}

interface CategoriaConfig {
  id: string;
  nombre: string;
  icono: string;
  campos: CampoConfig[];
}

const categoriasIniciales: CategoriaConfig[] = [
  {
    id: 'db',
    nombre: 'Base de Datos',
    icono: '🗄️',
    campos: [
      { nombre: 'DB_HOST', descripcion: 'Host de la base de datos', tipo: 'text', valor: 'localhost', requerido: true },
      { nombre: 'DB_PORT', descripcion: 'Puerto', tipo: 'number', valor: 5432, requerido: true },
      { nombre: 'DB_USER', descripcion: 'Usuario', tipo: 'text', valor: 'postgres', requerido: true },
      { nombre: 'DB_PASSWORD', descripcion: 'Contraseña', tipo: 'password', valor: 'secret', requerido: true },
    ],
  },
  {
    id: 'auth',
    nombre: 'Autenticación',
    icono: '🔑',
    campos: [
      { nombre: 'JWT_SECRET', descripcion: 'Secreto JWT', tipo: 'password', valor: 'jwt_secret', requerido: true },
      { nombre: 'JWT_EXPIRATION', descripcion: 'Expiración', tipo: 'text', valor: '1h', requerido: true },
      { nombre: 'EMAIL_VERIFICATION', descripcion: 'Verificar email', tipo: 'boolean', valor: true },
    ],
  },
  {
    id: 'sistema',
    nombre: 'Sistema',
    icono: '⚙️',
    campos: [
      { nombre: 'NOMBRE_EMPRESA', descripcion: 'Nombre de la empresa', tipo: 'text', valor: 'ERP Textil S.A.' },
      { nombre: 'IDIOMA_DEFECTO', descripcion: 'Idioma', tipo: 'select', valor: 'es', opciones: ['es', 'en', 'pt'] },
      { nombre: 'MODO_MANTENIMIENTO', descripcion: 'Modo mantenimiento', tipo: 'boolean', valor: false },
    ],
  },
];

const ConfiguracionPage: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaConfig[]>(categoriasIniciales);
  const [activa, setActiva] = useState<string>(categoriasIniciales[0].id);
  const [cambios, setCambios] = useState<Record<string, unknown>>({});

  const categoriaActual = useMemo(() => categorias.find(c => c.id === activa)!, [categorias, activa]);

  const onChangeCampo = (catId: string, campo: CampoConfig, nuevo: unknown) => {
    setCategorias(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        campos: c.campos.map(f => f.nombre === campo.nombre ? { ...f, valor: nuevo as any } : f)
      };
    }));
    setCambios(prev => ({ ...prev, [`${catId}.${campo.nombre}`]: nuevo }));
  };

  const onGuardar = () => {
    if (Object.keys(cambios).length === 0) {
      alert('No hay cambios para guardar.');
      return;
    }
    console.log('Configuración guardada:', cambios);
    alert('Configuración guardada correctamente.');
    setCambios({});
  };

  const onRevertir = () => {
    setCategorias(categoriasIniciales);
    setCambios({});
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuración del Sistema</h1>
          <p className="text-gray-600">Edita parámetros críticos del sistema</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRevertir} className="px-4 py-2 text-gray-700 bg-gray-100 border rounded-lg hover:bg-gray-200">Revertir</button>
          <button onClick={onGuardar} className={`px-4 py-2 rounded-lg text-white ${Object.keys(cambios).length ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`} disabled={!Object.keys(cambios).length}>Guardar ({Object.keys(cambios).length})</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar categorías */}
        <aside className="p-4 bg-white rounded-lg shadow lg:col-span-1">
          <nav className="space-y-2">
            {categorias.map(c => (
              <button key={c.id} onClick={() => setActiva(c.id)} className={`w-full text-left px-3 py-2 rounded-md border ${activa === c.id ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}>
                <span className="mr-2">{c.icono}</span>
                {c.nombre}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <section className="p-6 bg-white rounded-lg shadow lg:col-span-3">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">{categoriaActual.icono} {categoriaActual.nombre}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categoriaActual.campos.map(c => (
              <div key={c.nombre} className="p-4 border rounded-lg">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {c.nombre} {c.requerido && <span className="text-red-600">*</span>}
                  {cambios[`${categoriaActual.id}.${c.nombre}`] !== undefined && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">MODIFICADO</span>
                  )}
                </label>

                {c.tipo === 'text' || c.tipo === 'password' || c.tipo === 'number' ? (
                  <input
                    type={c.tipo}
                    value={String(c.valor)}
                    onChange={(e) => onChangeCampo(categoriaActual.id, c, c.tipo === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                ) : c.tipo === 'boolean' ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(c.valor)}
                      onChange={(e) => onChangeCampo(categoriaActual.id, c, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-600">{c.descripcion}</span>
                  </label>
                ) : (
                  <select
                    value={String(c.valor)}
                    onChange={(e) => onChangeCampo(categoriaActual.id, c, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {(c.opciones || []).map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                )}

                <p className="mt-2 text-xs text-gray-500">{c.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConfiguracionPage;