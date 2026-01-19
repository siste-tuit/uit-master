// components/Mantenimiento/OrdenFormModal.tsx

"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useOrdenesTrabajo, OrdenTrabajoData } from '@/context/OrdenContext';
import { useEquipos, EquipoData, UsuarioDataEquipo } from '@/context/EquipoContext';
import { useRepuestos, RepuestoData } from '@/context/RepuestoContext'; 

// --- Tipos de Datos ---
interface OrdenFormModalProps {
    ordenIdToEdit: string | null;
    onClose: () => void;
}

interface SelectedRepuesto {
    repuesto_id: string;
    nombre: string;
    cantidad: number;
    stock: number;
}

const PRIORIDADES: OrdenTrabajoData['prioridad'][] = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
const ESTADOS_OT: OrdenTrabajoData['estado'][] = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];

const initialFormData = {
    id: '',
    equipo_id: '' as string,
    titulo: '',
    descripcion: '',
    tipo: 'CORRECTIVO' as OrdenTrabajoData['tipo'],
    estado: 'PENDIENTE' as OrdenTrabajoData['estado'],
    prioridad: 'MEDIA' as OrdenTrabajoData['prioridad'],
    tiempo_estimado_h: 1,
    asignado_a: '' as string | null,
    fecha_vencimiento: '',
};

const OrdenFormModal: React.FC<OrdenFormModalProps> = ({ ordenIdToEdit, onClose }) => {
    const { handleCreateUpdate, getOrdenById } = useOrdenesTrabajo();
    const { equipos, usuarios } = useEquipos();
    const { repuestos: repuestosDisponibles } = useRepuestos(); 
    
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedRepuestos, setSelectedRepuestos] = useState<SelectedRepuesto[]>([]);
    const [currentRepuestoId, setCurrentRepuestoId] = useState<string>('');
    const [currentCantidad, setCurrentCantidad] = useState<number>(1);

    const isCreating = useMemo(() => ordenIdToEdit === null, [ordenIdToEdit]);
    const isModalOpen = true; 

    // --- Lógica de Carga para Edición (incluyendo repuestos) ---
    useEffect(() => {
        if (!ordenIdToEdit) {
            setFormData(initialFormData);
            setSelectedRepuestos([]);
            setError(null);
            setLoadingData(false);
            return;
        }

        setLoadingData(true);
        setError(null);
        const loadOrden = async () => {
            try {
                const data = await getOrdenById(ordenIdToEdit);
                if (data) {
                    setFormData({
                        id: data.id, equipo_id: data.equipo_id, titulo: data.titulo, descripcion: data.descripcion,
                        tipo: data.tipo, estado: data.estado, prioridad: data.prioridad, 
                        tiempo_estimado_h: data.tiempo_estimado_h || 1, asignado_a: data.asignado_a || '',
                        fecha_vencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento).toISOString().split('T')[0] : '',
                    });
                    
                    // Lógica de Carga de Repuestos existentes
                    if (data.repuestos_necesarios) {
                        const loadedRepuestos: SelectedRepuesto[] = data.repuestos_necesarios.map(r => ({
                            repuesto_id: r.repuesto_id,
                            nombre: r.repuesto_nombre,
                            cantidad: r.cantidad_requerida,
                            stock: repuestosDisponibles.find(d => d.id === r.repuesto_id)?.stock || 0
                        }));
                        setSelectedRepuestos(loadedRepuestos);
                    }
                }
            } catch (err) {
                setError("No se pudo cargar la orden de trabajo para edición.");
            } finally {
                setLoadingData(false);
            }
        };
        loadOrden();
    }, [ordenIdToEdit, getOrdenById, repuestosDisponibles]); 

    // --- Handlers de Formulario ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'tiempo_estimado_h' ? (value === '' ? 1 : Number(value)) : value,
        }));
    };

    const handleSelectChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // --- Lógica de Repuestos ---
    const handleAddRepuesto = () => {
        if (!currentRepuestoId || currentCantidad <= 0) return;

        const repuestoInfo = repuestosDisponibles.find(r => r.id === currentRepuestoId);
        if (!repuestoInfo) return;

        const isExisting = selectedRepuestos.find(r => r.repuesto_id === currentRepuestoId);
        const stockDisponible = repuestoInfo.stock;
        const totalRequerido = (isExisting ? isExisting.cantidad : 0) + currentCantidad;

        if (totalRequerido > stockDisponible) {
            setError(`Stock insuficiente. Disponible: ${stockDisponible}. Requerido: ${totalRequerido}.`);
            return;
        }

        if (isExisting) {
            setSelectedRepuestos(prev => 
                prev.map(r => r.repuesto_id === currentRepuestoId ? { ...r, cantidad: r.cantidad + currentCantidad } : r)
            );
        } else {
            setSelectedRepuestos(prev => [
                ...prev,
                { repuesto_id: currentRepuestoId, nombre: repuestoInfo.nombre, cantidad: currentCantidad, stock: stockDisponible }
            ]);
        }

        setError(null);
        setCurrentRepuestoId('');
        setCurrentCantidad(1);
    };

    const handleRemoveRepuesto = (idToRemove: string) => {
        setSelectedRepuestos(prev => prev.filter(r => r.repuesto_id !== idToRemove));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const finalAsignadoAId =
                formData.asignado_a === "null_value" || formData.asignado_a === ""
                    ? null
                    : formData.asignado_a;

            const repuestosPayload = selectedRepuestos.map(r => ({
                repuesto_id: r.repuesto_id,
                cantidad_requerida: r.cantidad,
                // Al editar, si no hay campo 'cantidad_utilizada', se asume la requerida para evitar errores
                cantidad_utilizada: isCreating ? 0 : r.cantidad, 
            }));

            const dataToSubmit = {
                ...formData,
                asignado_a: finalAsignadoAId,
                tiempo_estimado_h: Number(formData.tiempo_estimado_h),
                repuestos: repuestosPayload,
            };

            await handleCreateUpdate(dataToSubmit, isCreating);
            onClose();

        } catch (err: any) {
            setError(err.message || `Error al ${isCreating ? "crear" : "actualizar"} la orden.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData && !isCreating) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent><p className="p-8 text-center text-blue-600">Cargando datos de la orden...</p></DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] bg-white">
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? '➕ Nueva Orden de Trabajo' : `✏️ Editar Orden: ${formData.titulo}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                    {/* 1. Equipo */}
                    <div className="space-y-1">
                        <Label htmlFor="equipo_id">Equipo (*)</Label>
                        <Select name="equipo_id" value={formData.equipo_id} onValueChange={(val) => handleSelectChange('equipo_id', val)} required>
                            <SelectTrigger id="equipo_id"><SelectValue placeholder="Selecciona equipo" /></SelectTrigger>
                            <SelectContent>
                                {equipos.map((equipo: EquipoData) => (
                                    <SelectItem key={equipo.id} value={equipo.id}>{equipo.nombre} ({equipo.codigo})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* 2. Asignado a */}
                    <div className="space-y-1">
                        <Label htmlFor="asignado_a">Asignado a</Label>
                        <Select name="asignado_a" value={formData.asignado_a || ""} onValueChange={(val) => handleSelectChange('asignado_a', val)}>
                            <SelectTrigger id="asignado_a"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null_value">(Sin asignar)</SelectItem>
                                {usuarios.map((user: UsuarioDataEquipo) => (
                                    <SelectItem key={user.id} value={user.id}>{user.nombre_completo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 3. Título */}
                    <div className="col-span-2 space-y-1">
                        <Label htmlFor="titulo">Título (*)</Label>
                        <Input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
                    </div>

                    {/* 4. Descripción */}
                    <div className="col-span-2 space-y-1">
                        <Label htmlFor="descripcion">Descripción (*)</Label>
                        <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
                    </div>
                    
                    {/* 5. Prioridad y Estado */}
                    <div className="space-y-1">
                        <Label htmlFor="prioridad">Prioridad (*)</Label>
                        <Select name="prioridad" value={formData.prioridad} onValueChange={(val) => handleSelectChange('prioridad', val)} required>
                            <SelectTrigger id="prioridad"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                            <SelectContent>
                                {PRIORIDADES.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                         <Label htmlFor="estado">Estado (*)</Label>
                         <Select name="estado" value={formData.estado} onValueChange={(val) => handleSelectChange('estado', val)} required>
                            <SelectTrigger id="estado"><SelectValue placeholder="Estado" /></SelectTrigger>
                            <SelectContent>
                                {ESTADOS_OT.map(e => (<SelectItem key={e} value={e}>{e.replace('_', ' ')}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 6. Tiempo Estimado y Fecha Vencimiento */}
                    <div className="space-y-1">
                        <Label htmlFor="tiempo_estimado_h">Tiempo Estimado (h)</Label>
                        <Input id="tiempo_estimado_h" name="tiempo_estimado_h" type="number" min="1" value={formData.tiempo_estimado_h} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="fecha_vencimiento">Fecha Vencimiento</Label>
                        <Input id="fecha_vencimiento" name="fecha_vencimiento" type="date" value={formData.fecha_vencimiento} onChange={handleChange} />
                    </div>
                    
                    {/* 7. GESTIÓN DE REPUESTOS (CHIPS) */}
                    <div className="col-span-2 p-3 border rounded-md bg-gray-50">
                        <Label className="block mb-2 text-sm font-medium text-gray-700">Repuestos Requeridos</Label>
                        
                        {/* Selector y Cantidad */}
                        <div className="flex mb-3 space-x-2">
                            <Select 
                                value={currentRepuestoId} 
                                onValueChange={setCurrentRepuestoId}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Selecciona un repuesto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {repuestosDisponibles.map((r: RepuestoData) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.nombre} (Stock: {r.stock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                min="1"
                                value={currentCantidad}
                                onChange={(e) => setCurrentCantidad(Number(e.target.value))}
                                className="w-20 text-center"
                            />
                            <Button type="button" onClick={handleAddRepuesto} disabled={!currentRepuestoId || currentCantidad < 1}>
                                Añadir
                            </Button>
                        </div>

                        {/* Chips/Badges de Repuestos Seleccionados */}
                        <div className="flex flex-wrap gap-2 mt-2 overflow-y-auto max-h-24">
                            {selectedRepuestos.length === 0 ? (
                                <p className="text-xs italic text-gray-500">No se han añadido repuestos.</p>
                            ) : (
                                selectedRepuestos.map(r => (
                                    <div 
                                        key={r.repuesto_id} 
                                        className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                                    >
                                        {r.nombre} x {r.cantidad}
                                        <button 
                                            type="button" 
                                            className="ml-2 text-blue-600 hover:text-blue-900"
                                            onClick={() => handleRemoveRepuesto(r.repuesto_id)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>


                    {error && (<p className="col-span-2 text-sm text-center text-red-600">{error}</p>)}

                    <DialogFooter className="col-span-2 mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? `${isCreating ? "Creando..." : "Guardando..."}` : `${isCreating ? "Crear Orden" : "Guardar Cambios"}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OrdenFormModal;