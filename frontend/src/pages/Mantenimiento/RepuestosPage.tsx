// pages/RepuestosPage.tsx

"use client";
import React, { useState } from 'react';
import { useRepuestos, RepuestoData } from '@/context/RepuestoContext';
import RepuestoFormModal from '@/components/Mantenimiento/RepuestoFormModal';
import { Label } from '@/components/ui/label';

type ModalMode = string | null; // Usamos null para cerrado, string (ID o "new") para abierto.

const formatCurrency = (amount: number) => `$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

const RepuestosPage: React.FC = () => {
  const { repuestos, loading, error } = useRepuestos();
  const [modalRepuestoId, setModalRepuestoId] = useState<ModalMode>(null);

  // --- Handlers de Modal ---
  const handleOpenCreateModal = () => setModalRepuestoId("new"); // Usamos "new" para forzar el cambio de estado
  const handleOpenEditModal = (id: string) => setModalRepuestoId(id);
  const handleCloseModal = () => setModalRepuestoId(null);

  // --- Lógica de Filtros y Totales ---
  const [query, setQuery] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  const categoriasUnicas = Array.from(new Set(repuestos.map(r => r.categoria))).filter(Boolean);

  const filteredRepuestos: RepuestoData[] = repuestos.filter((r) => {
    const byCat = filtroCategoria === 'todas' || r.categoria === filtroCategoria;
    const q = query.trim().toLowerCase();
    const searchString = `${r.codigo} ${r.nombre} ${r.proveedor} ${r.ubicacion}`.toLowerCase();
    const byQuery = !q || searchString.includes(q);
    return byCat && byQuery;
  });

  const totalItems = filteredRepuestos.length;
  const stockBajoCount = repuestos.filter(r => r.stock < r.stock_minimo).length;
  const valorTotal = repuestos.reduce((sum, r) => sum + (r.stock * r.costo), 0);

  const getStockBadge = (actual: number, minimo: number) => {
    if (actual <= 0) return 'bg-red-100 text-red-800';
    if (actual < minimo) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const IndicatorCard = ({ title, value, isWarning = false }: { title: string, value: string | number, isWarning?: boolean }) => (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${isWarning ? 'text-yellow-700' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen p-6 text-xl text-center text-blue-600">Cargando Inventario... 🛠️</div>;
  }

  if (error) {
    return <div className="min-h-screen p-6 text-xl text-center text-red-600">Error al cargar: {error}</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">🔩 Repuestos</h1>
        <p className="text-gray-600">Inventario de repuestos críticos para mantenimiento</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <IndicatorCard title="Items" value={totalItems} />
        <IndicatorCard title="Stock bajo" value={stockBajoCount} isWarning={stockBajoCount > 0} />
        <IndicatorCard title="Valor Total" value={formatCurrency(valorTotal)} />
      </div>

      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Buscar por ID, nombre, proveedor o ubicación"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md md:w-64 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas las categorías</option>
            {categoriasUnicas.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md md:w-40 hover:bg-blue-700"
            onClick={handleOpenCreateModal}
          >
            + Nuevo repuesto
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Categoría</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ubicación</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Proveedor</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Costo</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRepuestos.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-700">{r.codigo}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                <td className="px-4 py-3 capitalize">{r.categoria}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockBadge(r.stock, r.stock_minimo)}`}>
                    {r.stock} / min {r.stock_minimo}
                  </span>
                </td>
                <td className="px-4 py-3">{r.ubicacion}</td>
                <td className="px-4 py-3">{r.proveedor}</td>
                <td className="px-4 py-3">{formatCurrency(r.costo)}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => handleOpenEditModal(r.id)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalRepuestoId !== null && (
        <RepuestoFormModal
          repuestoIdToEdit={modalRepuestoId === "new" ? null : modalRepuestoId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RepuestosPage;