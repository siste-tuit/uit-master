import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import API_BASE_URL_CORE from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface FacturaItem {
  id: string;
  item_descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal_item: number;
}

interface Factura {
  id: string;
  referencia: string;
  fecha_emision: string;
  cliente_nombre: string;
  cliente_direccion?: string | null;
  cliente_identificacion?: string | null;
  subtotal: number;
  igv: number;
  total: number;
  status: string;
  user_name?: string | null;
  items?: FacturaItem[];
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
    fecha_emision: new Date().toISOString().split('T')[0],
    cliente_nombre: '',
    cliente_direccion: '',
    cliente_identificacion: '',
    items: [{ item_descripcion: '', cantidad: 1, precio_unitario: 0, subtotal_item: 0 }] as { item_descripcion: string; cantidad: number; precio_unitario: number; subtotal_item: number }[]
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
    const itemsValidos = form.items.filter(i => i.item_descripcion.trim() && i.cantidad > 0);
    if (itemsValidos.length === 0) {
      setError('Agrega al menos un ítem con descripción y cantidad');
      return;
    }
    const subtotal = itemsValidos.reduce((s, i) => s + (i.cantidad * i.precio_unitario), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    const payload = {
      referencia: form.referencia,
      fecha_emision: form.fecha_emision,
      cliente_nombre: form.cliente_nombre,
      cliente_direccion: form.cliente_direccion || null,
      cliente_identificacion: form.cliente_identificacion || null,
      subtotal: Math.round(subtotal * 100) / 100,
      igv: Math.round(igv * 100) / 100,
      total: Math.round(total * 100) / 100,
      items: itemsValidos.map(i => ({
        item_descripcion: i.item_descripcion,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
        subtotal_item: Math.round(i.cantidad * i.precio_unitario * 100) / 100
      }))
    };
    try {
      const token = localStorage.getItem('erp_token');
      const res = await fetch(`${API_BASE_URL_CORE}/contabilidad/facturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('No se pudo crear la factura');
      setForm({
        referencia: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        cliente_nombre: '',
        cliente_direccion: '',
        cliente_identificacion: '',
        items: [{ item_descripcion: '', cantidad: 1, precio_unitario: 0, subtotal_item: 0 }]
      });
      setError(null);
      fetchFacturas();
    } catch (err: any) {
      setError(err.message || 'Error al crear factura');
    }
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { item_descripcion: '', cantidad: 1, precio_unitario: 0, subtotal_item: 0 }] }));
  };
  const updateItem = (idx: number, field: string, value: string | number) => {
    setForm(f => {
      const items = [...f.items];
      (items[idx] as any)[field] = value;
      if (field === 'cantidad' || field === 'precio_unitario') {
        items[idx].subtotal_item = items[idx].cantidad * items[idx].precio_unitario;
      }
      return { ...f, items };
    });
  };
  const removeItem = (idx: number) => {
    if (form.items.length <= 1) return;
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
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
      ['Fecha', factura.fecha_emision],
      ['Cliente', factura.cliente_nombre],
      ['Identificación', factura.cliente_identificacion || '-'],
      ['Subtotal', `S/ ${Number(factura.subtotal || 0).toFixed(2)}`],
      ['IGV', `S/ ${Number(factura.igv || 0).toFixed(2)}`],
      ['Total', `S/ ${Number(factura.total || 0).toFixed(2)}`],
      ['Estado', factura.status]
    ];

    rows.forEach(([label, value]) => {
      pdf.text(`${label}:`, margin, y);
      pdf.text(String(value), margin + 45, y);
      y += 7;
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    if (factura.items && factura.items.length > 0) {
      y += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detalle de ítems', margin, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      factura.items.forEach(it => {
        pdf.text(`${it.item_descripcion} - Cant: ${it.cantidad} x S/ ${it.precio_unitario} = S/ ${it.subtotal_item}`, margin, y);
        y += 5;
      });
    }

    pdf.setFontSize(9);
    pdf.text(`Generado: ${new Date().toLocaleString('es-PE')}`, margin, Math.min(y + 8, 285));

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Referencia *"
                value={form.referencia}
                onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                required
              />
              <input
                type="date"
                className="border rounded-lg px-3 py-2 text-sm"
                value={form.fecha_emision}
                onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                required
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
                placeholder="Cliente (nombre/razón social) *"
                value={form.cliente_nombre}
                onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })}
                required
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="DNI/RUC"
                value={form.cliente_identificacion}
                onChange={(e) => setForm({ ...form, cliente_identificacion: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
                placeholder="Dirección"
                value={form.cliente_direccion}
                onChange={(e) => setForm({ ...form, cliente_direccion: e.target.value })}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Ítems</span>
                <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Agregar ítem</button>
              </div>
              <div className="space-y-2">
                {form.items.map((it, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2 items-center">
                    <input
                      className="border rounded px-2 py-1.5 text-sm flex-1 min-w-[120px]"
                      placeholder="Descripción"
                      value={it.item_descripcion}
                      onChange={(e) => updateItem(idx, 'item_descripcion', e.target.value)}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="border rounded px-2 py-1.5 text-sm w-20"
                      placeholder="Cant"
                      value={it.cantidad === 0 ? '' : it.cantidad}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const val = raw === '' ? 0 : parseInt(raw, 10);
                        updateItem(idx, 'cantidad', val < 1 ? (raw === '' ? 0 : 1) : val);
                      }}
                      onBlur={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const val = raw === '' ? 0 : parseInt(raw, 10);
                        if (val < 1) updateItem(idx, 'cantidad', 1);
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="border rounded px-2 py-1.5 text-sm w-24"
                      placeholder="P. Unit"
                      value={it.precio_unitario || ''}
                      onChange={(e) => updateItem(idx, 'precio_unitario', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-sm text-gray-500 w-20">S/ {(it.cantidad * it.precio_unitario).toFixed(2)}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 text-sm" disabled={form.items.length <= 1}>✕</button>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm">
              Guardar factura
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
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  <tr key={factura.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{factura.referencia}</td>
                    <td className="py-2 pr-4">{factura.fecha_emision}</td>
                    <td className="py-2 pr-4">{factura.cliente_nombre}</td>
                    <td className="py-2 pr-4">S/ {Number(factura.total || 0).toFixed(2)}</td>
                    <td className="py-2 pr-4">{factura.status}</td>
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
