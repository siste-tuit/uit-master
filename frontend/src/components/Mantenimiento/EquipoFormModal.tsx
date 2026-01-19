// components/Mantenimiento/EquipoFormModal.tsx

"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ⭐ Importamos UsuarioData y useEquipos desde el contexto
import { useEquipos, EquipoData, UsuarioDataEquipo } from '@/context/EquipoContext';

interface EquipoFormModalProps {
    equipoIdToEdit: string | null;
    onClose: () => void;
}

const ESTADOS: EquipoData['estado'][] = ['OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO'];

const initialFormData = {
    id: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: 'OPERATIVO' as EquipoData['estado'],
    linea_produccion: '',
    horas_operacion: 0,
    responsable_id: '' as string | null,
    ubicacion: '',
};

const EquipoFormModal: React.FC<EquipoFormModalProps> = ({ equipoIdToEdit, onClose }) => {
    const { handleCreateUpdate, getEquipoById, usuarios } = useEquipos();
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCreating = useMemo(() => equipoIdToEdit === null, [equipoIdToEdit]);

    // ⭐ isModalOpen es true porque el componente solo se renderiza si la página lo abre
    const isModalOpen = true;

    useEffect(() => {
        // Lógica de reseteo para la creación
        if (isCreating) {
            setFormData(initialFormData);
            setError(null);
            setLoadingData(false);
            return;
        }

        // Lógica de carga para la edición
        if (equipoIdToEdit) {
            setLoadingData(true);
            setError(null);
            const loadEquipo = async () => {
                try {
                    const data = await getEquipoById(equipoIdToEdit);
                    if (data) {
                        setFormData({
                            ...data,
                            id: data.id,
                            descripcion: data.descripcion || '',
                            horas_operacion: data.horas_operacion || 0,
                            responsable_id: data.responsable_id || '',
                            ubicacion: data.ubicacion || '',
                            estado: data.estado,
                        });
                    }
                } catch (err) {
                    setError("No se pudo cargar la información del equipo para edición.");
                } finally {
                    setLoadingData(false);
                }
            };
            loadEquipo();
        }
    }, [equipoIdToEdit, getEquipoById, isCreating]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'horas_operacion' ? (value === '' ? 0 : Number(value)) : value,
        }));
    };

    const handleSelectChange = (name: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const finalResponsableId =
                formData.responsable_id === "null_value" || formData.responsable_id === ""
                    ? null
                    : formData.responsable_id;

            const dataToSubmit = {
                ...formData,
                responsable_id: finalResponsableId,
                horas_operacion: Number(formData.horas_operacion)
            };

            await handleCreateUpdate(dataToSubmit, isCreating);

            onClose();

        } catch (err: any) {
            setError(err.message || `Error al ${isCreating ? "crear" : "actualizar"} el equipo.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData && !isCreating) {
        return (
            <Dialog open={isModalOpen} onOpenChange={onClose}>
                <DialogContent><p className="p-8 text-center text-blue-600">Cargando datos del equipo...</p></DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? '➕ Nuevo Equipo' : `✏️ Editar Equipo: ${formData.nombre}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid items-center grid-cols-2 gap-4">
                        <Label htmlFor="codigo">Código (*)</Label>
                        <Input
                            id="codigo"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            required
                            readOnly={!isCreating}
                            placeholder="EQ005"
                        />
                    </div>
                    <div className="grid items-center grid-cols-2 gap-4">
                        <Label htmlFor="nombre">Nombre (*)</Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Torsedora #5"
                        />
                    </div>

                    <div className="grid items-center grid-cols-2 gap-4">
                        <Label htmlFor="linea_produccion">Línea de Producción (*)</Label>
                        <Input
                            id="linea_produccion"
                            name="linea_produccion"
                            value={formData.linea_produccion}
                            onChange={handleChange}
                            required
                            placeholder="Tejido"
                        />
                    </div>
                    <div className="grid items-center grid-cols-2 gap-4">
                        <Label htmlFor="ubicacion">Ubicación</Label>
                        <Input
                            id="ubicacion"
                            name="ubicacion"
                            value={formData.ubicacion}
                            onChange={handleChange}
                            placeholder="Planta Baja / Sector A"
                        />
                    </div>

                    <div className="grid items-center grid-cols-2 gap-4">
                        <Label htmlFor="estado">Estado (*)</Label>
                        <Select
                            name="estado"
                            value={formData.estado}
                            onValueChange={(val: EquipoData['estado']) => handleSelectChange('estado', val)}
                            required
                        >
                            <SelectTrigger id="estado">
                                <SelectValue placeholder="Selecciona estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {ESTADOS.map(estado => (
                                    <SelectItem key={estado} value={estado}>
                                        {estado.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid items-center grid-cols-2 gap-4">
                        <Label htmlFor="horas_operacion">Horas Operación (h)</Label>
                        <Input
                            id="horas_operacion"
                            name="horas_operacion"
                            type="number"
                            min="0"
                            value={formData.horas_operacion}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="grid items-center grid-cols-2 gap-4">
                        <Label htmlFor="responsable_id">Responsable</Label>
                        <Select
                            name="responsable_id"
                            value={formData.responsable_id || ""}
                            onValueChange={(val) => handleSelectChange('responsable_id', val)}
                        >
                            <SelectTrigger id="responsable_id">
                                <SelectValue placeholder="Asignar responsable" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null_value">(Sin asignar)</SelectItem>
                                {usuarios.map((user: UsuarioDataEquipo) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.nombre_completo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <p className="col-span-2 text-sm text-center text-red-600">{error}</p>
                    )}

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? `${isCreating ? "Creando..." : "Guardando..."}` : `${isCreating ? "Crear Equipo" : "Guardar Cambios"}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EquipoFormModal;