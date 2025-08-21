import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar } from 'lucide-react';

const ModalEditarTurno = ({ turno, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        fechaInicio: '',
        fechaFin: '',
        horaInicio: '',
        horaFin: '',
        observaciones: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (turno) {
            setFormData({
                fechaInicio: turno.fechaInicio || '',
                fechaFin: turno.fechaFin || '',
                horaInicio: turno.horaInicio || '',
                horaFin: turno.horaFin || '',
                observaciones: turno.observaciones || ''
            });
        }
    }, [turno]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.fechaInicio) {
            nuevosErrores.fechaInicio = 'La fecha de inicio es requerida';
        }
        if (!formData.fechaFin) {
            nuevosErrores.fechaFin = 'La fecha de fin es requerida';
        }
        if (!formData.horaInicio) {
            nuevosErrores.horaInicio = 'La hora de inicio es requerida';
        }
        if (!formData.horaFin) {
            nuevosErrores.horaFin = 'La hora de fin es requerida';
        }

        if (formData.fechaInicio && formData.fechaFin) {
            if (new Date(formData.fechaInicio) > new Date(formData.fechaFin)) {
                nuevosErrores.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
            }
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        try {
            setLoading(true);
            await onSave(turno.idTurno, {
                ...turno,
                ...formData
            });
        } catch (error) {
            console.error('Error al guardar turno:', error);
            setErrors({ submit: 'Error al guardar los cambios. Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !turno) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Editar Turno</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Contenido */}
                    <div className="p-6 space-y-6">
                        {/* Información no editable */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Información del Turno</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">ID Turno:</label>
                                    <p className="text-lg font-semibold">{turno.idTurno}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Persona:</label>
                                    <p className="text-lg">{turno.nombrePersona}</p>
                                </div>
                            </div>
                        </div>

                        {/* Campos editables */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="text-blue-600" size={20} />
                                Fechas y Horarios
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaInicio"
                                        value={formData.fechaInicio}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fechaInicio ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    {errors.fechaInicio && (
                                        <p className="text-red-500 text-sm mt-1">{errors.fechaInicio}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Fin *
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaFin"
                                        value={formData.fechaFin}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fechaFin ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    {errors.fechaFin && (
                                        <p className="text-red-500 text-sm mt-1">{errors.fechaFin}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora Inicio *
                                    </label>
                                    <input
                                        type="time"
                                        name="horaInicio"
                                        value={formData.horaInicio}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.horaInicio ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    {errors.horaInicio && (
                                        <p className="text-red-500 text-sm mt-1">{errors.horaInicio}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora Fin *
                                    </label>
                                    <input
                                        type="time"
                                        name="horaFin"
                                        value={formData.horaFin}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.horaFin ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    {errors.horaFin && (
                                        <p className="text-red-500 text-sm mt-1">{errors.horaFin}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ingresa observaciones adicionales..."
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">{errors.submit}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalEditarTurno;
