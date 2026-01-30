import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface Factura {
  id: string;
  referencia: string;
  categoria: string;
  monto: number;
  descripcion: string | null;
  fecha: string;
  status: string;
}

const ContabilidadFacturasPage: React.FC = () => {
  const { user } = useAuth();
  const isGerencia = user?.role === 'gerencia';
  const isMountedRef = useRef(true);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    referencia: '',
    categoria: 'Factura',
    monto: '',
    descripcion: '',
    fecha: ''
  });

  const fetchFacturas = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }
      const token = localStorage.getItem('erp_token');
      const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/facturas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!res.ok) throw new Error('No se pudieron cargar las facturas');
      const data = await res.json();
      if (!isMountedRef.current) return;
      setFacturas(data || []);
    } catch (err: any) {
      if (showLoading && isMountedRef.current) {
        setError(err.message || 'Error al cargar facturas');
      }
    } finally {
      if (showLoading && isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const safeFetch = async (showLoading = true) => {
      if (!isMountedRef.current) return;
      await fetchFacturas(showLoading);
    };

    safeFetch(true);
    if (isGerencia) {
      intervalId = setInterval(() => safeFetch(false), 30000);
    }
    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGerencia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGerencia) return;
    try {
      const token = localStorage.getItem('erp_token');
      const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/facturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('No se pudo crear la factura');
      setForm({ referencia: '', categoria: 'Factura', monto: '', descripcion: '', fecha: '' });
      fetchFacturas();
    } catch (err: any) {
      setError(err.message || 'Error al crear factura');
    }
  };

  const handleExportarFacturaPDF = (factura: Factura) => {
    const pdf = new jsPDF();
    const margin = 14;
    let y = 20;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('FACTURA', margin, y);
    y += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const rows = [
      ['Referencia', factura.referencia],
      ['Categoria', factura.categoria],
      ['Monto', `S/ ${Number(factura.monto).toFixed(2)}`],
      ['Fecha', factura.fecha],
      ['Estado', factura.status],
      ['Descripcion', factura.descripcion || '-']
    ];

    rows.forEach(([label, value]) => {
      pdf.text(`${label}:`, margin, y);
      pdf.text(String(value), margin + 40, y);
      y += 7;
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    pdf.setFontSize(9);
    pdf.text(`Generado: ${new Date().toLocaleString('es-PE')}`, margin, y + 8);

    const fileName = `Factura_${factura.referencia || factura.id.substring(0, 8)}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facturas</h1>
          <p className="text-sm text-gray-500">Gestión de facturas emitidas.</p>
        </div>
      </header>

      {!isGerencia && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Nueva factura</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Referencia (opcional)"
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Categoría"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Monto"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Fecha (YYYY-MM-DD)"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <button className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm md:col-span-1">
              Guardar
            </button>
          </form>
        </div>
      )}

      {isGerencia && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          Modo solo lectura para Gerencia. Actualiza automaticamente cada 30 segundos.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Listado de facturas</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando facturas...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : facturas.length === 0 ? (
          <p className="text-sm text-gray-500">No hay facturas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2 pr-4">Referencia</th>
                  <th className="py-2 pr-4">Categoría</th>
                  <th className="py-2 pr-4">Monto</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Descripción</th>
                  <th className="py-2 text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  <tr key={factura.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{factura.referencia}</td>
                    <td className="py-2 pr-4">{factura.categoria}</td>
                    <td className="py-2 pr-4">S/ {Number(factura.monto).toFixed(2)}</td>
                    <td className="py-2 pr-4">{factura.fecha}</td>
                    <td className="py-2 pr-4">{factura.status}</td>
                    <td className="py-2">{factura.descripcion || '-'}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleExportarFacturaPDF(factura)}
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

export default ContabilidadFacturasPage;
