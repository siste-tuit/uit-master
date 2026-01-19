// components/Mantenimiento/CalendarioFormModal.tsx

"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useCalendario, EventoCalendarioData } from '@/context/CalendarioContext';
import { useEquipos, EquipoData } from '@/context/EquipoContext'; // Equipos
import { useOrdenesTrabajo, OrdenTrabajoData } from '@/context/OrdenContext'; // Órdenes existentes

interface CalendarioFormModalProps {
    eventoIdToEdit: string | null;
    onClose: () => void;
}

const PRIORIDADES: EventoCalendarioData['prioridad'][] = ['BAJA', 'MEDIA', 'ALTA'];
const TIPOS: EventoCalendarioData['tipo'][] = ['PREVENTIVO', 'CORRECTIVO', 'INSPECCION'];
const ESTADOS_EVENTO: EventoCalendarioData['estado'][] = ['PROGRAMADO', 'REALIZADO', 'CANCELADO'];


const initialFormData = {
    id: '',
    equipo_id: '' as string,
    nombre_evento: '',
    descripcion: '',
    tipo: 'PREVENTIVO' as EventoCalendarioData['tipo'],
    prioridad: 'MEDIA' as EventoCalendarioData['prioridad'],
    fecha_programada: '',
    hora_inicio: '' as string | null,
    hora_fin: '' as string | null,
    estado: 'PROGRAMADO' as EventoCalendarioData['estado'],
    ot_id: '' as string | null,
};

const CalendarioFormModal: React.FC<CalendarioFormModalProps> = ({ eventoIdToEdit, onClose }) => {
    const { handleCreateUpdate, getEventoById } = useCalendario();
    const { equipos } = useEquipos();
    const { ordenes } = useOrdenesTrabajo();

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCreating = useMemo(() => eventoIdToEdit === null, [eventoIdToEdit]);
    const isModalOpen = true;

    // --- Lógica de Carga para Edición ---
    useEffect(() => {
        // 1. Modo Creación: Reseteamos el formulario
        if (eventoIdToEdit === null) {
            setFormData(initialFormData);
            setError(null);
            setLoadingData(false);
            return;
        }

        // 2. Modo Edición: Cargar datos
        if (eventoIdToEdit) {
            setLoadingData(true);
            setError(null);
            const loadEvento = async () => {
                try {
                    const data = await getEventoById(eventoIdToEdit);
                    if (data) {
                        setFormData({
                            ...data,
                            id: data.id,
                            descripcion: data.descripcion || '',
                            hora_inicio: data.hora_inicio || '',
                            hora_fin: data.hora_fin || '',
                            ot_id: data.ot_id || '',
                            fecha_programada: data.fecha_programada ? new Date(data.fecha_programada).toISOString().split('T')[0] : '',
                            estado: data.estado,
                        });
                    }
                } catch (err) {
                    setError("No se pudo cargar el evento para edición.");
                } finally {
                    setLoadingData(false);
                }
            };
            loadEvento();
        }
    }, [eventoIdToEdit, getEventoById, isCreating]); // Corregido: Usar eventoIdToEdit

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const finalOtId = formData.ot_id === "null_value" || formData.ot_id === "" ? null : formData.ot_id;
            const dataToSubmit = {
                ...formData,
                ot_id: finalOtId,
                hora_inicio: formData.hora_inicio || null,
                hora_fin: formData.hora_fin || null,
                estado: isCreating ? 'PROGRAMADO' : formData.estado,
            };

            await handleCreateUpdate(dataToSubmit, isCreating);
            onClose();

        } catch (err: any) {
            setError(err.message || `Error al ${isCreating ? "crear" : "actualizar"} el evento.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData && !isCreating) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent><p className="p-8 text-center text-blue-600">Cargando evento...</p></DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] bg-white">
                <DialogHeader>
                    <DialogTitle>{isCreating ? '➕ Nuevo Evento de Mantenimiento' : `✏️ Editar Evento: ${formData.nombre_evento}`}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                    {/* Fila 1: Nombre y Equipo */}
                    <div className="col-span-2 space-y-1">
                        <Label htmlFor="nombre_evento">Nombre del Evento (*)</Label>
                        <Input id="nombre_evento" name="nombre_evento" value={formData.nombre_evento} onChange={handleChange} required />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <Label htmlFor="equipo_id">Equipo (*)</Label>
                        <Select name="equipo_id" value={formData.equipo_id} onValueChange={(val) => handleSelectChange('equipo_id', val)} required>
                            <SelectTrigger id="equipo_id"><SelectValue placeholder="Selecciona equipo" /></SelectTrigger>
                            <SelectContent>
                                {equipos.map((e: EquipoData) => (
                                    <SelectItem key={e.id} value={e.id}>{e.nombre} ({e.codigo})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fila 2: Fecha y Horas */}
                    <div className="space-y-1">
                        <Label htmlFor="fecha_programada">Fecha Programada (*)</Label>
                        <Input id="fecha_programada" name="fecha_programada" type="date" value={formData.fecha_programada} onChange={handleChange} required />
                    </div>
                    <div className="flex space-x-2">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="hora_inicio">Inicio</Label>
                            <Input id="hora_inicio" name="hora_inicio" type="time" value={formData.hora_inicio || ''} onChange={handleChange} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="hora_fin">Fin</Label>
                            <Input id="hora_fin" name="hora_fin" type="time" value={formData.hora_fin || ''} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Fila 3: Tipo y Prioridad */}
                    <div className="space-y-1">
                        <Label htmlFor="tipo">Tipo (*)</Label>
                        <Select name="tipo" value={formData.tipo} onValueChange={(val) => handleSelectChange('tipo', val)} required>
                            <SelectTrigger id="tipo"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                {TIPOS.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="prioridad">Prioridad (*)</Label>
                        <Select name="prioridad" value={formData.prioridad} onValueChange={(val) => handleSelectChange('prioridad', val)} required>
                            <SelectTrigger id="prioridad"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                            <SelectContent>
                                {PRIORIDADES.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fila 4: OT relacionada y Estado (Estado solo aparece en edición) */}
                    <div className="col-span-1 space-y-1">
                        <Label htmlFor="ot_id">Relacionar OT</Label>
                        <Select name="ot_id" value={formData.ot_id || ""} onValueChange={(val) => handleSelectChange('ot_id', val)}>
                            <SelectTrigger id="ot_id"><SelectValue placeholder="Opcional" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null_value">(Sin OT)</SelectItem>
                                {ordenes.map((o: OrdenTrabajoData) => (
                                    <SelectItem key={o.id} value={o.id}>{o.titulo} ({o.id})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!isCreating && (
                        <div className="space-y-1">
                            <Label htmlFor="estado">Estado (*)</Label>
                            <Select name="estado" value={formData.estado} onValueChange={(val) => handleSelectChange('estado', val)} required>
                                <SelectTrigger id="estado"><SelectValue placeholder="Estado" /></SelectTrigger>
                                <SelectContent>
                                    {ESTADOS_EVENTO.map(e => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Fila 5: Descripción */}
                    <div className="col-span-2 space-y-1">
                        <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                        <Textarea id="descripcion" name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows={2} />
                    </div>

                    {error && (<p className="col-span-2 text-sm text-center text-red-600">{error}</p>)}

                    <DialogFooter className="col-span-2 mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? `${isCreating ? "Creando..." : "Guardando..."}` : `${isCreating ? "Crear Evento" : "Guardar Cambios"}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CalendarioFormModal;