import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { procesosService, macroprocesosService, procesoUtils } from '../../Services/apiProcesoService';

export default function ProcesosTable() {
    const [procesos, setProcesos] = useState([]);
    const [macroprocesos, setMacroprocesos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCrearProceso, setShowCrearProceso] = useState(false);
    const [showVerProceso, setShowVerProceso] = useState(false);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadProcesos();
        loadMacroprocesos();
    }, []);

    const loadProcesos = async () => {
        try {
            setLoading(true);
            setError(null);

            const procesosData = await procesosService.getAll();
            console.log('Procesos cargados:', procesosData);
            setProcesos(Array.isArray(procesosData) ? procesosData : []);
        } catch (err) {
            console.error('Error al cargar procesos:', err);
            setError(err.message);
            setProcesos([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMacroprocesos = async () => {
        try {
            const macroprocesosData = await macroprocesosService.getAll();
            console.log('Macroprocesos cargados:', macroprocesosData);
            setMacroprocesos(Array.isArray(macroprocesosData) ? macroprocesosData : []);
        } catch (err) {
            console.warn('Error al cargar macroprocesos:', err);
            setMacroprocesos([]);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombreProceso) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el proceso "${nombreProceso}"?`)) {
            try {
                await procesosService.delete(id);
                console.log(`Eliminando proceso con ID: ${id}`);

                // Actualizar la lista local
                setProcesos(prev => prev.filter(p => p.idProceso !== id));
                alert('Proceso eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar el proceso:', error);
                alert(error.message);
            }
        }
    };

    // Función para manejar ver proceso
    const handleVerProceso = (proceso) => {
        setProcesoSeleccionado(proceso);
        setShowVerProceso(true);
    };

    // Función para manejar editar proceso
    const handleEditarProceso = (proceso) => {
        setProcesoSeleccionado(proceso);
        setModoEdicion(true);
        setShowCrearProceso(true);
    };

    // Función para crear nuevo proceso
    const handleNuevoProceso = () => {
        setProcesoSeleccionado(null);
        setModoEdicion(false);
        setShowCrearProceso(true);
    };

    // Función para cerrar formularios
    const handleCerrarFormularios = () => {
        setShowCrearProceso(false);
        setShowVerProceso(false);
        setProcesoSeleccionado(null);
        setModoEdicion(false);
    };

    // Función para obtener el nombre del macroproceso usando utilidad
    const getMacroprocesoNombre = (proceso) => {
        return procesoUtils.getMacroprocesoNombre(proceso, macroprocesos);
    };

    // Función para obtener el estado en texto
    const getEstadoTexto = (estado) => {
        return estado ? 'Activo' : 'Inactivo';
    };

    // Función para obtener el color del estado
    const getEstadoColor = (estado) => {
        return estado
            ? 'text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium'
            : 'text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium';
    };

    if (loading) {
        return (
            <div className="m-8 p-6 bg-white shadow rounded">
                <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Procesos:</div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando procesos...</p>
                </div>
            </div>
        );
    }

    // Mostrar componente de crear/editar proceso
    if (showCrearProceso) {
        return (
            <CrearEditarProceso
                proceso={procesoSeleccionado}
                macroprocesos={macroprocesos}
                modoEdicion={modoEdicion}
                onVolver={handleCerrarFormularios}
                onActualizar={loadProcesos}
            />
        );
    }

    // Mostrar componente de ver proceso
    if (showVerProceso && procesoSeleccionado) {
        return (
            <VerProceso
                proceso={procesoSeleccionado}
                macroprocesos={macroprocesos}
                onVolver={handleCerrarFormularios}
            />
        );
    }

    // Lógica de paginación
    const totalPages = Math.ceil(procesos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProcesos = procesos.slice(startIndex, endIndex);

    // Funciones para cambiar página
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Función para generar números de página visibles
    const getVisiblePageNumbers = () => {
        const delta = 2; // Número de páginas
        const range = [];
        const rangeWithDots = [];

        // Calcular el rango de páginas a mostrar
        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        // Agregar primera página
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        // Agregar páginas del rango
        rangeWithDots.push(...range);

        // Agregar última página
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="m-8 p-6 bg-white shadow rounded">
            <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Procesos:</div>

            {/* Botón para crear nuevo proceso */}
            <button
                onClick={handleNuevoProceso}
                className="mb-1 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2"
            >
                <CopyPlus size={22} color="white" strokeWidth={2} />
                Crear Proceso
            </button>

            {/* Mostrar error si existe */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                    {error}
                </div>
            )}

            {/* Selector de elementos por página */}
            <div className="flex items-center justify-end gap-2 pb-1">
                <span className="text-sm text-gray-600">Mostrar:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Resetear a primera página
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">por página</span>
            </div>

            {/* Tabla de procesos */}
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Macroproceso</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 flex items-center justify-centers gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentProcesos.map((proceso) => (
                        <tr key={proceso.idProceso} className="border-b hover:bg-gray-50">
                            <td className="p-3 border border-gray-200 font-medium">
                                {proceso.idProceso}
                            </td>
                            <td className="p-3 border border-gray-200">
                                {proceso.nombre || 'Sin nombre'}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getMacroprocesoNombre(proceso)}
                            </td>
                            <td className="p-3 border border-gray-200">
                                <span className={getEstadoColor(proceso.estado)}>
                                    {getEstadoTexto(proceso.estado)}
                                </span>
                            </td>
                            <td className="p-3 border border-gray-200 space-x-6">
                                {/* Botón Ver */}
                                <button
                                    onClick={() => handleVerProceso(proceso)}
                                    title={`Ver proceso: ${proceso.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors ml-2"
                                    />
                                </button>

                                {/* Botón Editar */}
                                <button
                                    onClick={() => handleEditarProceso(proceso)}
                                    title={`Editar proceso: ${proceso.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </button>

                                {/* Botón Eliminar */}
                                <button
                                    onClick={() => handleDelete(proceso.idProceso, proceso.nombre)}
                                    title={`Eliminar proceso: ${proceso.nombre}`}
                                    className="inline-block"
                                >
                                    <Trash2
                                        size={18}
                                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
                                    />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Información de paginación y controles */}
            {procesos.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Información de registros */}
                    <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, procesos.length)} de {procesos.length} registros
                    </div>

                    {/* Controles de paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            {/* Botón anterior */}
                            <button
                                onClick={goToPrevious}
                                disabled={currentPage === 1}
                                className={`p-2 rounded ${currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {/* Números de página */}
                            {getVisiblePageNumbers().map((pageNumber, index) => (
                                <button
                                    key={index}
                                    onClick={() => pageNumber !== '...' && goToPage(pageNumber)}
                                    disabled={pageNumber === '...'}
                                    className={`px-3 py-1 rounded text-sm ${pageNumber === currentPage
                                        ? 'bg-blue-500 text-white'
                                        : pageNumber === '...'
                                            ? 'text-gray-400 cursor-default'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            {/* Botón siguiente */}
                            <button
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded ${currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Mensaje cuando no hay procesos */}
            {procesos.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay procesos disponibles</p>
                    <p className="text-sm">Crea tu primer proceso usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}

// Componente para Crear/Editar Proceso
function CrearEditarProceso({ proceso, macroprocesos, modoEdicion, onVolver, onActualizar }) {
    const [formData, setFormData] = useState({
        nombre: proceso?.nombre || '',
        idMacroproceso: proceso?.idMacroproceso || '',
        estado: proceso?.estado ?? true
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGuardar = async () => {
        if (!formData.nombre.trim()) {
            setError('El nombre del proceso es requerido');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const procesoData = {
                nombre: formData.nombre,
                idMacroproceso: formData.idMacroproceso || null,
                estado: formData.estado
            };

            console.log('Datos a enviar:', procesoData);

            if (modoEdicion) {
                await procesosService.update(proceso.idProceso, procesoData);
                console.log(`Actualizando proceso ID: ${proceso.idProceso}`);
                alert('Proceso actualizado exitosamente');
            } else {
                await procesosService.create(procesoData);
                console.log('Creando nuevo proceso');
                alert('Proceso creado exitosamente');
            }

            onActualizar();
            onVolver();

        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className='text-3xl font-bold text-gray-800 text-center'>
                    {modoEdicion ? 'Editar Proceso' : 'Crear Nuevo Proceso'}
                </div>

                {modoEdicion && (
                    <div className='p-4 text-center bg-orange-50 border border-orange-200 rounded-lg w-full'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <Edit size={16} className="text-orange-600" />
                            <span className='font-semibold text-orange-800'>Modificando proceso existente</span>
                        </div>
                        <div className='text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {proceso.idProceso}</div>
                        </div>
                    </div>
                )}

                <div className='w-full grid grid-cols-1 gap-6'>
                    {/* Nombre del Proceso */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Proceso *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese el nombre del proceso"
                            disabled={saving}
                        />
                    </div>

                    {/* Macroproceso */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Macroproceso
                        </label>
                        <select
                            value={formData.idMacroproceso}
                            onChange={(e) => handleInputChange('idMacroproceso', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        >
                            <option value="">Seleccionar macroproceso</option>
                            {macroprocesos.map(macro => (
                                <option key={macro.idMacroproceso} value={macro.idMacroproceso}>
                                    {macro.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) => handleInputChange('estado', e.target.value === 'true')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        >
                            <option value={true}>Activo</option>
                            <option value={false}>Inactivo</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                        {error}
                    </div>
                )}

                <div className='flex justify-center items-center gap-4 mt-6'>
                    <button
                        onClick={handleGuardar}
                        disabled={saving || !formData.nombre.trim()}
                        className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving || !formData.nombre.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {saving ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear')}
                    </button>
                    <button
                        onClick={onVolver}
                        disabled={saving}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Componente para Ver Proceso
function VerProceso({ proceso, macroprocesos, onVolver }) {
    const getEstadoTexto = (estado) => {
        return estado ? 'Activo' : 'Inactivo';
    };

    const getEstadoColor = (estado) => {
        return estado
            ? 'text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium'
            : 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium';
    };

    // Usar utilidad para obtener información del macroproceso
    const macroprocesoInfo = procesoUtils.getMacroprocesoInfo(proceso, macroprocesos);

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center border-b pb-4'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Información del Proceso</h1>
                </div>

                {/* Información Principal del Proceso */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                    {/* Columna Izquierda */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>ID Proceso:</div>
                            <div className='text-gray-900 font-medium'>{proceso.idProceso}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Nombre:</div>
                            <div className='text-gray-900'>{proceso.nombre || 'Sin nombre'}</div>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Estado:</div>
                            <div>
                                <span className={getEstadoColor(proceso.estado)}>
                                    {getEstadoTexto(proceso.estado)}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Macroproceso:</div>
                            <div className='text-gray-900'>
                                <div className='font-medium'>{macroprocesoInfo.nombre}</div>
                                {macroprocesoInfo.id !== 'No asignado' && (
                                    <div className='text-xs text-gray-500 mt-1'>ID: {macroprocesoInfo.id}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de volver */}
                <div className='flex justify-center gap-4 pt-4 border-t'>
                    <button
                        onClick={onVolver}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
                    >
                        <Eye size={20} />
                        Volver al Listado
                    </button>
                </div>
            </div>
        </div>
    );
}
