import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    subseccionesService,
    seccionesService,
    subseccionesValidation,
    subseccionesUtils
} from '../../Services/apiSubseccionesService';

export default function SubseccionesTable() {
    const [subsecciones, setSubsecciones] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCrearSubseccion, setShowCrearSubseccion] = useState(false);
    const [showVerSubseccion, setShowVerSubseccion] = useState(false);
    const [subseccionSeleccionada, setSubseccionSeleccionada] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadSubsecciones();
        loadSecciones();
    }, []);

    const loadSubsecciones = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await subseccionesService.getAll();
            console.log('Subsecciones cargadas:', data);
            setSubsecciones(data);
        } catch (err) {
            console.error('Error al cargar subsecciones:', err);
            setError(err.message || 'Error al cargar las subsecciones');
            setSubsecciones([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSecciones = async () => {
        try {
            const data = await seccionesService.getAll();
            console.log('Secciones cargadas:', data);
            setSecciones(data);
        } catch (err) {
            console.warn('Error al cargar secciones:', err);
            setSecciones([]);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la subsección "${nombre}"?`)) {
            try {
                await subseccionesService.delete(id);
                console.log(`Eliminando subsección con ID: ${id}`);
                setSubsecciones(prev => prev.filter(p => p.idSubseccionServicio !== id));
                alert('Subsección eliminada exitosamente');
            } catch (error) {
                console.error('Error al eliminar la subsección:', error);
                alert(error.message || 'Error al eliminar la subsección');
            }
        }
    };

    // Función para manejar ver subseccion
    const handleVerSubseccion = (subseccion) => {
        setSubseccionSeleccionada(subseccion);
        setShowVerSubseccion(true);
    };

    // Función para manejar editar subseccion
    const handleEditarSubseccion = (subseccion) => {
        setSubseccionSeleccionada(subseccion);
        setModoEdicion(true);
        setShowCrearSubseccion(true);
    };

    // Función para crear nuevo subseccion
    const handleNuevaSubseccion = () => {
        setSubseccionSeleccionada(null);
        setModoEdicion(false);
        setShowCrearSubseccion(true);
    };

    // Función para cerrar formularios
    const handleCerrarFormularios = () => {
        setShowCrearSubseccion(false);
        setShowVerSubseccion(false);
        setSubseccionSeleccionada(null);
        setModoEdicion(false);
    };

    // Función para obtener el nombre de la sección usando utilidades
    const getSeccionNombre = (subseccion) => {
        return subseccionesUtils.getSeccionNombre(subseccion, secciones);
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
                <div className='m-10 text-5xl text-center font-bold'>Ver Todas las Subsecciones:</div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando subsecciones...</p>
                </div>
            </div>
        );
    }

    // Mostrar componente de crear/editar subseccion
    if (showCrearSubseccion) {
        return (
            <CrearEditarSubseccion
                subseccion={subseccionSeleccionada}
                secciones={secciones}
                modoEdicion={modoEdicion}
                onVolver={handleCerrarFormularios}
                onActualizar={loadSubsecciones}
            />
        );
    }

    // Mostrar componente de ver subseccion
    if (showVerSubseccion && subseccionSeleccionada) {
        return (
            <VerSubseccion
                subseccion={subseccionSeleccionada}
                onVolver={handleCerrarFormularios}
            />
        );
    }

    // Lógica de paginación
    const totalPages = Math.ceil(subsecciones.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSubsecciones = subsecciones.slice(startIndex, endIndex);

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
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="m-8 p-6 bg-white shadow rounded">
            <div className='m-10 text-5xl text-center font-bold'>Ver Todas las Subsecciones:</div>

            {/* Botón para crear nueva subseccion */}
            <button
                onClick={handleNuevaSubseccion}
                className="mb-1 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2"
            >
                <CopyPlus size={22} color="white" strokeWidth={2} />
                Crear Subseccion
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
                        setCurrentPage(1);
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

            {/* Tabla de subsecciones */}
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Seccion</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 flex items-center justify-centers gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentSubsecciones.map((subseccion) => (
                        <tr key={subseccion.idSubseccionServicio} className="border-b hover:bg-gray-50">
                            <td className="p-3 border border-gray-200 font-medium">
                                {subseccion.idSubseccionServicio}
                            </td>
                            <td className="p-3 border border-gray-200">
                                {subseccion.nombre || 'Sin nombre'}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getSeccionNombre(subseccion)}
                            </td>
                            <td className="p-3 border border-gray-200">
                                <span className={getEstadoColor(subseccion.estado)}>
                                    {getEstadoTexto(subseccion.estado)}
                                </span>
                            </td>
                            <td className="p-3 border border-gray-200 space-x-6">
                                {/* Botón Ver */}
                                <button
                                    onClick={() => handleVerSubseccion(subseccion)}
                                    title={`Ver subseccion: ${subseccion.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors ml-2"
                                    />
                                </button>

                                {/* Botón Editar */}
                                <button
                                    onClick={() => handleEditarSubseccion(subseccion)}
                                    title={`Editar subseccion: ${subseccion.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </button>

                                {/* Botón Eliminar*/}
                                <button
                                    onClick={() => handleDelete(subseccion.idSubseccionServicio, subseccion.nombre)}
                                    title={`Eliminar subseccion: ${subseccion.nombre}`}
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
            {subsecciones.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Información de registros */}
                    <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, subsecciones.length)} de {subsecciones.length} registros
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

            {/* Mensaje cuando no hay subsecciones */}
            {subsecciones.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay subsecciones disponibles</p>
                    <p className="text-sm">Crea tu primer subseccion usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}

// Componente para Crear/Editar Subsecciones
function CrearEditarSubseccion({ subseccion, secciones, modoEdicion, onVolver, onActualizar }) {
    const [formData, setFormData] = useState({
        nombre: subseccion?.nombre || '',
        idSeccionServicio: subseccion?.idSeccionServicio || '',
        estado: subseccion?.estado ?? true
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
        try {
            setSaving(true);
            setError('');

            // Limpiar y validar datos
            const cleanedData = subseccionesValidation.cleanSubseccionData(formData);
            const validation = subseccionesValidation.validateSubseccionData(cleanedData);

            if (!validation.isValid) {
                setError(validation.errors.join(', '));
                return;
            }

            console.log('Datos a enviar:', cleanedData);

            if (modoEdicion) {
                await subseccionesService.update(subseccion.idSubseccionServicio, cleanedData);
                console.log(`Actualizando subseccion ID: ${subseccion.idSubseccionServicio}`);
                alert('Subsección actualizada exitosamente');
            } else {
                await subseccionesService.create(cleanedData);
                console.log('Creando nueva subsección');
                alert('Subsección creada exitosamente');
            }

            onActualizar();
            onVolver();

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} la subsección`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className='text-3xl font-bold text-gray-800 text-center'>
                    {modoEdicion ? 'Editar Subsección' : 'Crear Nueva Subsección'}
                </div>

                {modoEdicion && (
                    <div className='p-4 text-center bg-orange-50 border border-orange-200 rounded-lg w-full'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <Edit size={16} className="text-orange-600" />
                            <span className='font-semibold text-orange-800'>Modificando subsección existente</span>
                        </div>
                        <div className='text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {subseccion.idSubseccionServicio}</div>
                        </div>
                    </div>
                )}

                <div className='w-full grid grid-cols-1 gap-6'>
                    {/* Nombre de la Subsección */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Subsección *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese el nombre de la subsección"
                            disabled={saving}
                        />
                    </div>

                    {/* Sección */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sección
                        </label>
                        <select
                            value={formData.idSeccionServicio}
                            onChange={(e) => handleInputChange('idSeccionServicio', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        >
                            <option value="">Seleccionar sección</option>
                            {secciones.map(seccion => (
                                <option key={seccion.idSeccionServicio} value={seccion.idSeccionServicio}>
                                    {seccion.nombre}
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

// Componente para Ver Subsección
function VerSubseccion({ subseccion, onVolver }) {
    //obtener información de la sección
    const seccionInfo = subseccionesUtils.getSeccionInfo(subseccion);

    const getEstadoTexto = (estado) => {
        return estado ? 'Activo' : 'Inactivo';
    };

    const getEstadoColor = (estado) => {
        return estado
            ? 'text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium'
            : 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium';
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center border-b pb-4'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Información de la Subsección</h1>
                </div>

                {/* Información Principal de la subsección */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                    {/* Columna Izquierda */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>ID:</div>
                            <div className='text-gray-900 font-medium'>{subseccion.idSubseccionServicio}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Nombre:</div>
                            <div className='text-gray-900'>{subseccion.nombre || 'Sin nombre'}</div>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Estado:</div>
                            <div>
                                <span className={getEstadoColor(subseccion.estado)}>
                                    {getEstadoTexto(subseccion.estado)}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Sección:</div>
                            <div className='text-gray-900'>
                                <div className='font-medium'>{seccionInfo.nombre}</div>
                                {seccionInfo.id !== 'No asignado' && (
                                    <div className='text-xs text-gray-500 mt-1'>ID: {seccionInfo.id}</div>
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
