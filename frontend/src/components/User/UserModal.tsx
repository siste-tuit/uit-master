// components/UserModal.tsx

import React, { useState, useEffect } from 'react';
// Asegúrate de que las rutas a tus componentes Shadcn sean correctas
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

// Definición de tipos
interface UserData {
    id: string;
    name: string;
    email: string;
    role_name: string;
    role_id: number;
    department: string;
    is_active: boolean;
}
interface Role {
    id: number;
    nombre: string;
}
interface Departamento {
    id: number;
    nombre: string;
}

interface UserModalProps {
    user: UserData | null;
    roles: Role[];
    departamentos: Departamento[]; // ✅ nuevo
    onClose: () => void;
    onSubmit: (data: any, isCreating: boolean) => Promise<void>;
}
export const UserModal: React.FC<UserModalProps> = ({ user, roles, departamentos, onClose, onSubmit }) => {
    const isCreating = user === null;
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role_id: user?.role_id?.toString() || (roles.length > 0 ? roles[0].id.toString() : ''),
        department: user?.department || '',
        password: '',
        confirmPassword: ''
    });

    const [modalError, setModalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ajuste inicial para el selector de rol
    useEffect(() => {
        if (!user && !formData.role_id && roles.length > 0) {
            setFormData(prev => ({ ...prev, role_id: roles[0].id.toString() }));
        }
    }, [roles, user, formData.role_id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (modalError) setModalError('');
    };

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({ ...prev, role_id: value }));
        if (modalError) setModalError('');
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');
        setIsSubmitting(true);

        // 1. Validaciones
        if (isCreating && formData.password.length < 6) {
            setModalError('La contraseña debe tener al menos 6 caracteres.');
            setIsSubmitting(false);
            return;
        }
        if (isCreating && formData.password !== formData.confirmPassword) {
            setModalError('Las contraseñas no coinciden.');
            setIsSubmitting(false);
            return;
        }

        // 2. Data a enviar
        const dataToSend = {
            id: user?.id,
            name: formData.name,
            email: formData.email,
            role_id: parseInt(formData.role_id),
            department: formData.department,
            // Si es edición y hay contraseña, se envía como new_password. Si es creación, como password.
            ...(formData.password && !isCreating && { new_password: formData.password }),
            ...(isCreating && { password: formData.password })
        };

        // 3. Llamar a la función onSubmit
        try {
            await onSubmit(dataToSend, isCreating);
        } catch (error) {
            setModalError('Ocurrió un error al guardar los datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{isCreating ? 'Crear Nuevo Usuario' : `Editar Usuario: ${user?.name}`}</DialogTitle>
                    <DialogDescription>
                        {isCreating ? 'Introduce los datos para el nuevo usuario.' : 'Modifica los campos necesarios.'}
                    </DialogDescription>
                </DialogHeader>

                {modalError && (
                    <div className="p-2 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                        {modalError}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">

                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="name" className="text-right">Nombre</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="email" className="text-right">Correo</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" required disabled={!isCreating} />
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="role_id" className="text-right">Rol</Label>
                        <Select onValueChange={handleRoleChange} value={formData.role_id} required>
                            <SelectTrigger id="role_id" className="col-span-3">
                                <SelectValue placeholder="Seleccione un Rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(r => (
                                    <SelectItem key={r.id} value={r.id.toString()} className="capitalize">
                                        {r.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="department" className="text-right">Depto.</Label>
                        <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                        >
                            <SelectTrigger id="department" className="col-span-3">
                                <SelectValue placeholder="Seleccione un departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {departamentos.map(dep => (
                                    <SelectItem key={dep.id} value={dep.nombre}>
                                        {dep.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="password" className="text-right">Contraseña</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={isCreating ? "Contraseña" : "Nueva (dejar vacío para no cambiar)"}
                            value={formData.password}
                            onChange={handleInputChange}
                            className="col-span-3"
                            required={isCreating}
                        />
                    </div>

                    {isCreating && (
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="confirmPassword" className="text-right">Confirmar</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirmar Contraseña"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                'Guardando...'
                            ) : (
                                isCreating ? 'Crear Usuario' : 'Guardar Cambios'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};