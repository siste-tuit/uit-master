"use client";
import React, { useEffect, useState } from "react";
import type { ConfiguracionEmpresa } from "@/types"; // Importamos tu tipo
import { useAuth } from '../../context/AuthContext';

import API_BASE_URL_CORE from '../../config/api';
const API_URL = API_BASE_URL_CORE;

const AdminConfigPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'gerencia';
  const [config, setConfig] = useState<ConfiguracionEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Obtener configuración al cargar
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/configuracion`);
        if (!res.ok) throw new Error("Error al obtener configuración");
        const data: ConfiguracionEmpresa = await res.json();
        setConfig(data);
      } catch (err) {
        console.error("Error al cargar configuración:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // 🔹 Manejar cambios en inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // if (!config) return;
    // const { name, type, value, checked } = e.target;
    // setConfig({
    //   ...config,
    //   [name]: type === "checkbox" ? checked : value,
    // });
  };

  // 🔹 Guardar cambios
  const handleSave = async () => {
    if (isReadOnly) return;
    if (!config) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/configuracion/${config.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Error al guardar configuración");
      setMessage("✅ Cambios guardados correctamente.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Cargando configuración...</p>;
  if (!config) return <p className="p-6 text-gray-600">No hay datos de configuración.</p>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Configuración del Sistema</h1>
        <p className="text-gray-600">Parámetros globales del ERP y preferencias.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel General */}
        <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-4 font-semibold text-gray-800">General</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Nombre de la empresa</span>
              <input
                name="nombre"
                value={config.nombre}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">RUC</span>
              <input
                name="ruc"
                value={config.ruc}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Dirección</span>
              <input
                name="direccion"
                value={config.direccion}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Teléfono</span>
              <input
                name="telefono"
                value={config.telefono}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Email</span>
              <input
                name="email"
                type="email"
                value={config.email}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Moneda</span>
              <select
                name="moneda"
                value={config.moneda}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              >
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Zona horaria</span>
              <select
                name="zona_horaria"
                value={config.zona_horaria}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              >
                <option value="America/Lima (GMT-5)">America/Lima (GMT-5)</option>
                <option value="America/Bogota (GMT-5)">America/Bogota (GMT-5)</option>
              </select>
            </label>

            {!isReadOnly && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            )}
          </div>
        </div>

        {/* Panel Seguridad */}
        {/* <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-4 font-semibold text-gray-800">Seguridad</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Política de contraseñas</span>
              <select
                name="politica_contrasena"
                value={config.politica_contrasena}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border rounded-lg"
              >
                <option value="Equilibrada">Equilibrada</option>
                <option value="Estricta">Estricta</option>
                <option value="Laxa">Laxa</option>
              </select>
            </label>

            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="forzar_2fa"
                checked={config.forzar_2fa}
                onChange={handleChange}
                className="rounded"
              />
              <span>Forzar 2FA a administradores</span>
            </label>

            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="bloqueo_ips"
                checked={config.bloqueo_ips}
                onChange={handleChange}
                className="rounded"
              />
              <span>Bloquear IPs sospechosas automáticamente</span>
            </label>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {saving ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
        </div> */}
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default AdminConfigPage;
