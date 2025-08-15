import React from 'react';
import { X, User, Clock, Calendar, MapPin, FileText } from 'lucide-react';

const ModalDetalleTurno = ({ turno, isOpen, onClose, cuadroNombre, equipoNombre }) => {
    if (!isOpen || !turno) return null;
    console.log('Detalles del turno:', turno);
    console.log('cuadroNombre', cuadroNombre);
    console.log('equipoNombre', equipoNombre);
    return (
        <div className="fixed inset-0 bg-primary-blue-nav bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white bg-opacity-50 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Detalles del Turno</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Información básica */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <User className="text-blue-600" size={20} />
                            Información del Turno
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Nombre Cuadro Turno:</label>
                                <p className="text-sm font-font-medium">{cuadroNombre}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Persona Asignada:</label>
                                <p className="text-sm font-medium">{turno.nombrePersona}</p>
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-600">Perfil:</label>
                                <p className="text-lg">{turno.perfil}</p>
                            </div> */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-600">Estado:</label>
                                <span className={`px-2 py-1 rounded-full text-sm font-medium ${turno.estadoTurno === 'abierto'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {turno.estadoTurno}
                                </span>
                            </div> */}
                        </div>
                    </div>

                    {/* Información de fechas y horarios */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="text-green-600" size={20} />
                            Fechas y Horarios
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Fecha Inicio:</label>
                                <p className="text-lg">{turno.fechaInicio}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Fecha Fin:</label>
                                <p className="text-lg">{turno.fechaFin}</p>
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-600">Hora Inicio:</label>
                                <p className="text-lg flex items-center gap-1">
                                    <Clock size={16} />
                                    {turno.horaInicio}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Hora Fin:</label>
                                <p className="text-lg flex items-center gap-1">
                                    <Clock size={16} />
                                    {turno.horaFin}
                                </p>
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Total Horas:</label>
                                <p className="text-xl font-bold text-blue-600">{turno.totalHoras}h</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Jornada:</label>
                                <p className="text-lg">{turno.jornada}</p>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <FileText className="text-yellow-600" size={20} />
                            Información Adicional
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-600">Cuadro ID:</label>
                                <p className="text-lg">{turno.idCuadroTurno}</p>
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Versión:</label>
                                <p className="text-lg">{turno.version || 'N/A'}</p>
                            </div>
                            {turno.comentarios && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600">Comentarios:</label>
                                    <p className="text-lg">{turno.comentarios}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleTurno;
