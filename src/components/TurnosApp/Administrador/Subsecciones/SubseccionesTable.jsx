import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

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
            // llamada a la API
            const result = await axios.get("http://localhost:8080/subseccionesServicio");
            console.log('Subsecciones cargadas:', result.data);
            let subseccionesData = [];
            if (Array.isArray(result.data)) {
                subseccionesData = result.data;
            } else {
                subseccionesData = result.data.secciones || [];
            }
            setSubsecciones(subseccionesData);
        } catch (err) {
            console.error('Error al cargar subsecciones:', err);
            setError('Error al cargar las subsecciones');
            setSubsecciones([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSecciones = async () => {
        try {
            //llamada a la API
            const result = await axios.get("http://localhost:8080/seccionesServicio");


            setSecciones(result.data || []);
        } catch (err) {
            console.warn('Error al cargar secciones:', err);
            setSecciones([]);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la subseccion "${nombre}"?`)) {
            try {
                const response = await axios.delete(`http://localhost:8080/subseccionesServicio/${id}`);

                // eliminación exitosa
                console.log(`Eliminando subseccion con ID: ${id}`);

                // Actualizar la lista local
                setSubsecciones(prev => prev.filter(p => p.idSubseccionServicio !== id));
                alert('subseccion eliminada exitosamente');
            } catch (error) {
                console.error('Error al eliminar la subseccion:', error.response?.data || error.message);
                // Manejar diferentes tipos de errores
                if (error.response?.status === 409) {
                    alert('No se puede eliminar la subseccion porque tiene dependencias asociadas');
                } else if (error.response?.status === 404) {
                    alert('La subseccion no fue encontrado');
                } else {
                    alert('Error al eliminar la subseccion');
                }
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

    // Función para obtener el nombre de la subseccion
    const getSubseccionNombre = (subseccion) => {
        if (subseccion.nombreSeccion) {
            return subseccion.nombreSeccion;
        }
        return 'Sin seccion';
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
    const totalPages = Math.ceil(secciones.length / itemsPerPage);
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

            {/* Tabla de secciones */}
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
                                {getSubseccionNombre(subseccion)}
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

                                {/* Botón Eliminar */}
                                <button
                                    onClick={() => handleDelete(subseccion.idSeccionServicio, subseccion.nombre)}
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
            {secciones.length > 0 && (
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
            {secciones.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay subsecciones disponibles</p>
                    <p className="text-sm">Crea tu primer subseccion usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}

// Componente para Crear/Editar Secciones
function CrearEditarSubseccion({ subseccion, secciones, modoEdicion, onVolver, onActualizar }) {
    const [formData, setFormData] = useState({
        idSubseccionServicio: subseccion?.idSubseccionServicio || '',
        nombre: subseccion?.nombre || '',
        idSeccion: subseccion?.secciones?.idSeccionServicio || '',
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
        if (!formData.nombre.trim()) {
            setError('El nombre de la subseccion es requerido');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const subseccionData = {
                idSubseccionServicio: formData.idSubseccionServicio || null,
                nombre: formData.nombre,
                idSeccionServicio: formData.idSeccionServicio || null,
                estado: formData.estado
            };

            console.log('Datos a enviar:', subseccionData);

            if (modoEdicion) {
                await axios.put(`http://localhost:8080/seccionesServicio/${subseccion.idSeccionServicio}`, subseccionData);
                console.log(`Actualizando subseccion ID: ${subseccion.idSeccionServicio}`);
                alert('Subseccion actualizada exitosamente');
            } else {
                await axios.post('http://localhost:8080/seccionesServicio', subseccionData);
                console.log('Creando nueva subseccion');
                alert('Subseccion creada exitosamente');
            }

            onActualizar();
            onVolver();

        } catch (err) {
            setError(err.response?.data?.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} la subseccion`);
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className='text-3xl font-bold text-gray-800 text-center'>
                    {modoEdicion ? 'Editar Subseccion' : 'Crear Nuevo Subseccion'}
                </div>

                {modoEdicion && (
                    <div className='p-4 text-center bg-orange-50 border border-orange-200 rounded-lg w-full'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <Edit size={16} className="text-orange-600" />
                            <span className='font-semibold text-orange-800'>Modificando subseccion existente</span>
                        </div>
                        <div className='text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {subseccion.idSeccionServicio}</div>
                        </div>
                    </div>
                )}

                <div className='w-full grid grid-cols-1 gap-6'>
                    {/* Nombre de la Subseccion */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Subseccion *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese el nombre de la subseccion"
                        />
                    </div>

                    {/* Seccion */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seccion
                        </label>
                        <select
                            value={formData.idSeccionServicio}
                            onChange={(e) => handleInputChange('idSeccionServicio', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar seccion</option>
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
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Componente para Ver Subseccion
function VerSubseccion({ subseccion, onVolver }) {
    const getSeccionInfo = () => {
        if (subseccion.idSeccionServicio) {
            return {
                id: subseccion.idSeccionServicio,
                nombre: subseccion.nombreSeccion
            };
        }
        return {
            id: 'No asignado',
            nombre: 'Sin seccion'
        };
    };

    const getEstadoTexto = (estado) => {
        return estado ? 'Activo' : 'Inactivo';
    };

    const getEstadoColor = (estado) => {
        return estado
            ? 'text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium'
            : 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium';
    };
    const seccionInfo = getSeccionInfo();


    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center border-b pb-4'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Información de la Subseccion</h1>
                </div>

                {/* Información Principal de la subseccion*/}
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
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Seccion:</div>
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