import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface TrabajadorPlanilla {
  id: string;
  nombre_completo: string;
  dni: string | null;
  telefono: string | null;
  cargo: string | null;
  fecha_ingreso: string | null;
  is_activo: number | boolean;
  usuario: string | null;
  departamento_usuario: string | null;
}

const ContabilidadPlanillaPage: React.FC = () => {
  const { user } = useAuth();
  const isGerencia = user?.role === 'gerencia';
  const [trabajadores, setTrabajadores] = useState<TrabajadorPlanilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchPlanilla = async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
          setError(null);
        }
        const token = localStorage.getItem('erp_token');
        const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/planilla`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) throw new Error('No se pudo cargar la planilla');
        const data = await res.json();
        if (!isMounted) return;
        setTrabajadores(data || []);
      } catch (err: any) {
        if (!isMounted) return;
        if (showLoading) {
          setError(err.message || 'Error al cargar planilla');
        }
      } finally {
        if (isMounted && showLoading) setLoading(false);
      }
    };

    fetchPlanilla(true);
    if (isGerencia) {
      intervalId = setInterval(() => fetchPlanilla(false), 30000);
    }
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGerencia]);

  const totalActivos = useMemo(
    () => trabajadores.filter(t => Boolean(t.is_activo)).length,
    [trabajadores]
  );

  const handleExportarTrabajadorPDF = (trabajador: TrabajadorPlanilla) => {
    const pdf = new jsPDF();
    const margin = 14;
    let y = 20;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('PLANILLA - DETALLE DE TRABAJADOR', margin, y);
    y += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const rows = [
      ['Nombre', trabajador.nombre_completo],
      ['DNI', trabajador.dni || '-'],
      ['Cargo', trabajador.cargo || '-'],
      ['Departamento', trabajador.departamento_usuario || '-'],
      ['Usuario', trabajador.usuario || '-'],
      ['Fecha ingreso', trabajador.fecha_ingreso || '-'],
      ['Estado', trabajador.is_activo ? 'Activo' : 'Inactivo']
    ];

    rows.forEach(([label, value]) => {
      pdf.text(`${label}:`, margin, y);
      pdf.text(String(value), margin + 45, y);
      y += 7;
    });

    pdf.setFontSize(9);
    pdf.text(`Generado: ${new Date().toLocaleString('es-PE')}`, margin, y + 8);

    const fileName = `Planilla_${trabajador.nombre_completo.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
  };

  const handleExportarPlanillaPDF = (lista: TrabajadorPlanilla[]) => {
    const pdf = new jsPDF();
    const margin = 12;
    let y = 16;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('PLANILLA GENERAL', margin, y);
    y += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Total trabajadores: ${lista.length}`, margin, y);
    pdf.text(`Activos: ${totalActivos}`, margin + 80, y);
    y += 8;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Nombre', margin, y);
    pdf.text('Cargo', margin + 70, y);
    pdf.text('Estado', margin + 130, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');

    lista.forEach((t) => {
      if (y > 270) {
        pdf.addPage();
        y = 16;
      }
      pdf.text(t.nombre_completo, margin, y);
      pdf.text(t.cargo || '-', margin + 70, y);
      pdf.text(t.is_activo ? 'Activo' : 'Inactivo', margin + 130, y);
      y += 6;
    });

    pdf.setFontSize(9);
    pdf.text(`Generado: ${new Date().toLocaleString('es-PE')}`, margin, 285);

    pdf.save(`Planilla_General_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Planilla</h1>
        <p className="text-sm text-gray-500">Listado general de trabajadores y estado.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleExportarPlanillaPDF(trabajadores)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
        >
          Exportar planilla PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total trabajadores</p>
          <p className="text-2xl font-bold text-gray-800">{trabajadores.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">{totalActivos}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Inactivos</p>
          <p className="text-2xl font-bold text-red-600">{trabajadores.length - totalActivos}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Trabajadores</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando planilla...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : trabajadores.length === 0 ? (
          <p className="text-sm text-gray-500">No hay trabajadores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">DNI</th>
                  <th className="py-2 pr-4">Cargo</th>
                  <th className="py-2 pr-4">Departamento</th>
                  <th className="py-2 pr-4">Usuario</th>
                  <th className="py-2 pr-4">Ingreso</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2 text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {trabajadores.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-800">{t.nombre_completo}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.dni || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.cargo || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.departamento_usuario || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.usuario || '-'}</td>
                    <td className="py-2 pr-4 text-gray-600">{t.fecha_ingreso || '-'}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        t.is_activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.is_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleExportarTrabajadorPDF(t)}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContabilidadPlanillaPage;
