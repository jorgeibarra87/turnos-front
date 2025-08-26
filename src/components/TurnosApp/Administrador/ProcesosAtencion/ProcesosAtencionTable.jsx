import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    procesosAtencionService,
    cuadrosTurnoService,
    procesosService,
    procesoAtencionUtils
} from '../../Services/apiProcesosAtencionService';

export default function ProcesosAtencionTable() {
    const [procesosAtencion, setProcesosAtencion] = useState([]);
    const [cuadros, setCuadros] = useState([]);
    const [procesos, setProcesos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCrearProcesoAtencion, setShowCrearProcesoAtencion] = useState(false);
    const [showVerProcesoAtencion, setShowVerProcesoAtencion] = useState(false);
    const [procesoAtencionSeleccionado, setProcesoAtencionSeleccionado] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadProcesosAtencion();
        loadCuadros();
        loadProcesos();
    }, []);

    const loadProcesosAtencion = async () => {
        try {
            setLoading(true);
            setError(null);

            const procesosAtencionData = await procesosAtencionService.getAll();
            console.log('Procesos Atención cargados:', procesosAtencionData);
            setProcesosAtencion(Array.isArray(procesosAtencionData) ? procesosAtencionData : []);
        } catch (err) {
            console.error('Error al cargar procesos atención:', err);
            setError(err.message);
            setProcesosAtencion([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCuadros = async () => {
        try {
            const cuadrosData = await cuadrosTurnoService.getAll();
            console.log('Cuadros cargados:', cuadrosData);
            setCuadros(Array.isArray(cuadrosData) ? cuadrosData : []);
        } catch (err) {
            console.warn('Error al cargar cuadros:', err);
            setCuadros([]);
        }
    };

    const loadProcesos = async () => {
        try {
            const procesosData = await procesosService.getAll();
            console.log('Procesos cargados:', procesosData);
            setProcesos(Array.isArray(procesosData) ? procesosData : []);
        } catch (err) {
            console.warn('Error al cargar procesos:', err);
            setProcesos([]);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombreProcesoAtencion) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el proceso de atención "${nombreProcesoAtencion}"?`)) {
            try {
                await procesosAtencionService.delete(id);
                console.log(`Eliminando proceso atención con ID: ${id}`);

                // Actualizar la lista local
                setProcesosAtencion(prev => prev.filter(p => p.idProcesoAtencion !== id));
                alert('Proceso de Atención eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar el proceso atención:', error);
                alert(error.message);
            }
        }
    };

    // Función para manejar ver proceso de atención
    const handleVerProcesoAtencion = (procesoAtencion) => {
        setProcesoAtencionSeleccionado(procesoAtencion);
        setShowVerProcesoAtencion(true);
    };

    // Función para manejar editar proceso de atención
    const handleEditarProcesoAtencion = (procesoAtencion) => {
        setProcesoAtencionSeleccionado(procesoAtencion);
        setModoEdicion(true);
        setShowCrearProcesoAtencion(true);
    };

    // Función para crear nuevo proceso de atención
    const handleNuevoProcesoAtencion = () => {
        setProcesoAtencionSeleccionado(null);
        setModoEdicion(false);
        setShowCrearProcesoAtencion(true);
    };

    // Función para cerrar formularios
    const handleCerrarFormularios = () => {
        setShowCrearProcesoAtencion(false);
        setShowVerProcesoAtencion(false);
        setProcesoAtencionSeleccionado(null);
        setModoEdicion(false);
    };

    // Función para obtener el nombre del cuadro usando utilidades
    const getCuadroNombre = (procesoAtencion) => {
        return procesoAtencionUtils.getCuadroNombre(procesoAtencion, cuadros);
    };

    // Función para obtener el nombre del proceso usando utilidades
    const getProcesoNombre = (procesoAtencion) => {
        return procesoAtencionUtils.getProcesoNombre(procesoAtencion, procesos);
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
                <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Procesos de Atención:</div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando Procesos de Atención...</p>
                </div>
            </div>
        );
    }

    // Mostrar componente de crear/editar proceso de atención
    if (showCrearProcesoAtencion) {
        return (
            <CrearEditarProcesoAtencion
                procesoAtencion={procesoAtencionSeleccionado}
                cuadros={cuadros}
                procesos={procesos}
                modoEdicion={modoEdicion}
                onVolver={handleCerrarFormularios}
                onActualizar={loadProcesosAtencion}
            />
        );
    }

    // Mostrar componente de ver proceso de atención
    if (showVerProcesoAtencion && procesoAtencionSeleccionado) {
        return (
            <VerProcesoAtencion
                procesoAtencion={procesoAtencionSeleccionado}
                cuadros={cuadros}
                procesos={procesos}
                onVolver={handleCerrarFormularios}
            />
        );
    }

    // Lógica de paginación
    const totalPages = Math.ceil(procesosAtencion.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProcesosAtencion = procesosAtencion.slice(startIndex, endIndex);

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
        const delta = 2; // Número de páginas a mostrar a cada lado de la página actual
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
            <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Procesos de Atención:</div>

            {/* Botón para crear nuevo Proceso de Atención */}
            <button
                onClick={handleNuevoProcesoAtencion}
                className="mb-1 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2"
            >
                <CopyPlus size={22} color="white" strokeWidth={2} />
                Crear Proceso de Atención
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

            {/* Tabla de procesos de atención */}
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Detalle</th>
                        <th className="p-3">Cuadro</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Proceso</th>
                        <th className="p-3 flex items-center justify-centers gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentProcesosAtencion.map((procesoAtencion) => (
                        <tr key={procesoAtencion.idProcesoAtencion} className="border-b hover:bg-gray-50">
                            <td className="p-3 border border-gray-200 font-medium">
                                {procesoAtencion.idProcesoAtencion}
                            </td>
                            <td className="p-3 border border-gray-200">
                                {procesoAtencion.detalle || 'Sin detalle'}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getCuadroNombre(procesoAtencion)}
                            </td>
                            <td className="p-3 border border-gray-200">
                                <span className={getEstadoColor(procesoAtencion.estado)}>
                                    {getEstadoTexto(procesoAtencion.estado)}
                                </span>
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getProcesoNombre(procesoAtencion)}
                            </td>
                            <td className="p-3 border border-gray-200 space-x-6">
                                {/* Botón Ver */}
                                <button
                                    onClick={() => handleVerProcesoAtencion(procesoAtencion)}
                                    title={`Ver proceso atención: ${procesoAtencion.detalle}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors ml-2"
                                    />
                                </button>

                                {/* Botón Editar */}
                                <button
                                    onClick={() => handleEditarProcesoAtencion(procesoAtencion)}
                                    title={`Editar proceso atención: ${procesoAtencion.detalle}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </button>

                                {/* Botón Eliminar */}
                                <button
                                    onClick={() => handleDelete(procesoAtencion.idProcesoAtencion, procesoAtencion.detalle)}
                                    title={`Eliminar proceso atención: ${procesoAtencion.detalle}`}
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
            {procesosAtencion.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Información de registros */}
                    <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, procesosAtencion.length)} de {procesosAtencion.length} registros
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

            {/* Mensaje cuando no hay procesos de atención */}
            {procesosAtencion.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay procesos de atención disponibles</p>
                    <p className="text-sm">Crea tu primer proceso de atención usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}

// Componente para Crear/Editar Proceso de Atención
function CrearEditarProcesoAtencion({ procesoAtencion, cuadros, procesos, modoEdicion, onVolver, onActualizar }) {
    const [formData, setFormData] = useState({
        detalle: procesoAtencion?.detalle || '',
        idCuadroTurno: procesoAtencion?.idCuadroTurno || '',
        estado: procesoAtencion?.estado ?? true,
        idProceso: procesoAtencion?.idProceso || '',
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
        if (!formData.detalle.trim()) {
            setError('El detalle del proceso de atención es requerido');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const procesoAtencionData = {
                detalle: formData.detalle,
                idCuadro: formData.idCuadroTurno || null,
                estado: formData.estado,
                idProceso: formData.idProceso || null
            };

            console.log('Datos a enviar:', procesoAtencionData);

            if (modoEdicion) {
                await procesosAtencionService.update(procesoAtencion.idProcesoAtencion, procesoAtencionData);
                console.log(`Actualizando Proceso Atención ID: ${procesoAtencion.idProcesoAtencion}`);
                alert('Proceso de Atención actualizado exitosamente');
            } else {
                await procesosAtencionService.create(procesoAtencionData);
                console.log('Creando nuevo proceso atención');
                alert('Proceso de Atención creado exitosamente');
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
                    {modoEdicion ? 'Editar Proceso de Atención' : 'Crear Nuevo Proceso de Atención'}
                </div>

                {modoEdicion && (
                    <div className='p-4 text-center bg-orange-50 border border-orange-200 rounded-lg w-full'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <Edit size={16} className="text-orange-600" />
                            <span className='font-semibold text-orange-800'>Modificando proceso de atención existente</span>
                        </div>
                        <div className='text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {procesoAtencion.idProcesoAtencion}</div>
                        </div>
                    </div>
                )}

                <div className='w-full grid grid-cols-1 gap-6'>
                    {/* Detalle del Proceso Atención */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detalle del Proceso de Atención *
                        </label>
                        <input
                            type="text"
                            value={formData.detalle}
                            onChange={(e) => handleInputChange('detalle', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese el detalle del proceso de atención"
                            disabled={saving}
                        />
                    </div>

                    {/* Cuadro */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cuadro de Turno
                        </label>
                        <select
                            value={formData.idCuadroTurno}
                            onChange={(e) => handleInputChange('idCuadroTurno', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        >
                            <option value="">Seleccionar Cuadro</option>
                            {cuadros.map(cuadro => (
                                <option key={cuadro.id} value={cuadro.id}>
                                    {cuadro.nombre}
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

                    {/* Proceso */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Proceso
                        </label>
                        <select
                            value={formData.idProceso}
                            onChange={(e) => handleInputChange('idProceso', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        >
                            <option value="">Seleccionar proceso</option>
                            {procesos.map(proceso => (
                                <option key={proceso.idProceso} value={proceso.idProceso}>
                                    {proceso.nombre}
                                </option>
                            ))}
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
                        disabled={saving || !formData.detalle.trim()}
                        className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving || !formData.detalle.trim()
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

// Componente para Ver Proceso de Atención
function VerProcesoAtencion({ procesoAtencion, cuadros, procesos, onVolver }) {
    const getEstadoTexto = (estado) => {
        return estado ? 'Activo' : 'Inactivo';
    };

    const getEstadoColor = (estado) => {
        return estado
            ? 'text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium'
            : 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium';
    };

    // Usar utilidades para obtener información de dependencias
    const cuadroInfo = procesoAtencionUtils.getCuadroInfo(procesoAtencion, cuadros);
    const procesoInfo = procesoAtencionUtils.getProcesoInfo(procesoAtencion, procesos);

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center border-b pb-4'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Información del Proceso de Atención</h1>
                </div>

                {/* Información Principal del Proceso de Atención */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                    {/* Columna Izquierda */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>ID:</div>
                            <div className='text-gray-900 font-medium'>{procesoAtencion.idProcesoAtencion}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Detalle:</div>
                            <div className='text-gray-900'>{procesoAtencion.detalle || 'Sin detalle'}</div>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Estado:</div>
                            <div>
                                <span className={getEstadoColor(procesoAtencion.estado)}>
                                    {getEstadoTexto(procesoAtencion.estado)}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Proceso:</div>
                            <div className='text-gray-900'>
                                <div className='font-medium'>{procesoInfo.nombre}</div>
                                {procesoInfo.id !== 'No asignado' && (
                                    <div className='text-xs text-gray-500 mt-1'>ID: {procesoInfo.id}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del Cuadro */}
                <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                    <div className='w-32 font-semibold text-gray-700 text-sm'>Cuadro:</div>
                    <div className='text-gray-900'>
                        <div className='font-medium'>{cuadroInfo.nombre}</div>
                        {cuadroInfo.id !== 'No asignado' && (
                            <div className='text-xs text-gray-500 mt-1'>ID: {cuadroInfo.id}</div>
                        )}
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
