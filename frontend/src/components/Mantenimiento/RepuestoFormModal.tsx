// components/Mantenimiento/RepuestoFormModal.tsx

"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRepuestos, RepuestoData } from '@/context/RepuestoContext';

interface RepuestoFormModalProps {
    repuestoIdToEdit: string | null;
    onClose: () => void;
}

const CATEGORIAS_MOCK: string[] = ['Mecanico', 'Electrico', 'Neumatico', 'Hidraulico', 'Lubricantes'];

const initialFormData = {
    id: '',
    codigo: '',
    nombre: '',
    categoria: '',
    stock: 0,
    stock_minimo: 5,
    ubicacion: '',
    proveedor: '',
    costo: 0.00,
    is_critico: false,
};

const RepuestoFormModal: React.FC<RepuestoFormModalProps> = ({ repuestoIdToEdit, onClose }) => {
    const { handleCreateUpdate, getRepuestoById } = useRepuestos();
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCreating = useMemo(() => repuestoIdToEdit === null, [repuestoIdToEdit]);
    // El modal siempre está abierto mientras esté montado en el DOM (ya que la página decide montarlo)
    const isModalOpen = true;

    useEffect(() => {
        // Lógica de reseteo para la creación
        if (isCreating) {
            setFormData(initialFormData);
            setError(null);
            setLoadingData(false);
            return;
        }

        // Lógica de carga para edición (repuestoIdToEdit es un ID)
        if (repuestoIdToEdit) {
            setLoadingData(true);
            setError(null);
            const loadRepuesto = async () => {
                try {
                    const data = await getRepuestoById(repuestoIdToEdit);
                    if (data) {
                        setFormData({
                            ...data,
                            id: data.id,
                            stock: data.stock || 0,
                            stock_minimo: data.stock_minimo || 5,
                            costo: data.costo || 0.00,
                            is_critico: data.is_critico || false,
                            ubicacion: data.ubicacion || '',
                            proveedor: data.proveedor || '',
                        });
                    }
                } catch (err) {
                    setError("No se pudo cargar la información del repuesto para edición.");
                } finally {
                    setLoadingData(false);
                }
            };
            loadRepuesto();
        }
    }, [repuestoIdToEdit, getRepuestoById, isCreating]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number'
                ? (value === '' ? 0 : Number(value))
                : type === 'checkbox'
                    ? checked
                    : value,
        }));
    };

    const handleSelectChange = (name: keyof typeof formData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_critico: checked,
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const dataToSubmit = {
                ...formData,
                stock: Number(formData.stock),
                stock_minimo: Number(formData.stock_minimo),
                costo: Number(formData.costo),
            };

            await handleCreateUpdate(dataToSubmit, isCreating);
            onClose();

        } catch (err: any) {
            setError(err.message || `Error al ${isCreating ? "crear" : "actualizar"} el repuesto.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData && !isCreating) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent><p className="p-8 text-center text-blue-600">Cargando datos del repuesto...</p></DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? '➕ Nuevo Repuesto' : `✏️ Editar Repuesto: ${formData.nombre}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="codigo">Código (*)</Label>
                        <Input id="codigo" name="codigo" value={formData.codigo} onChange={handleChange} required readOnly={!isCreating} placeholder="R-006" />
                    </div>
                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="nombre">Nombre (*)</Label>
                        <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Correa 5M720" />
                    </div>

                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="categoria">Categoría (*)</Label>
                        <Select name="categoria" value={formData.categoria} onValueChange={(val) => handleSelectChange('categoria', val)} required>
                            <SelectTrigger id="categoria"><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
                            <SelectContent>
                                {CATEGORIAS_MOCK.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="proveedor">Proveedor</Label>
                        <Input id="proveedor" name="proveedor" value={formData.proveedor} onChange={handleChange} placeholder="Gates/SKF" />
                    </div>

                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="stock">Stock Actual (*)</Label>
                        <Input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} required />
                    </div>
                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="stock_minimo">Stock Mínimo (*)</Label>
                        <Input id="stock_minimo" name="stock_minimo" type="number" min="0" value={formData.stock_minimo} onChange={handleChange} required />
                    </div>

                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="costo">Costo Unidad (*)</Label>
                        <Input id="costo" name="costo" type="number" min="0" step="0.01" value={formData.costo} onChange={handleChange} required />
                    </div>
                    <div className="grid items-center grid-cols-1 gap-4">
                        <Label htmlFor="ubicacion">Ubicación</Label>
                        <Input id="ubicacion" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="A1-05" />
                    </div>

                    <div className="flex items-center col-span-2 space-x-2">
                        <Checkbox
                            id="is_critico"
                            name="is_critico"
                            checked={formData.is_critico}
                            onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="is_critico" className="text-sm font-medium leading-none">
                            Repuesto Crítico
                        </Label>
                    </div>

                    {error && (<p className="col-span-2 text-sm text-center text-red-600">{error}</p>)}

                    <DialogFooter className="col-span-2 mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? `${isCreating ? "Creando..." : "Guardando..."}` : `${isCreating ? "Crear Repuesto" : "Guardar Cambios"}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RepuestoFormModal;