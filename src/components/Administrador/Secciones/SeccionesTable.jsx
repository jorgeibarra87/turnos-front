import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SeccionesTable() {
    const [secciones, setSecciones] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCrearSeccion, setShowCrearSeccion] = useState(false);
    const [showVerSeccion, setShowVerSeccion] = useState(false);
    const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadSecciones();
        loadServicios();
    }, []);

    const loadSecciones = async () => {
        try {
            setLoading(true);
            setError(null);
            // llamada a la API
            const result = await axios.get("http://localhost:8080/seccionesServicio");
            console.log('Secciones cargadas:', result.data);
            let seccionesData = [];
            if (Array.isArray(result.data)) {
                seccionesData = result.data;
            } else {
                seccionesData = result.data.secciones || [];
            }
            setSecciones(seccionesData);
        } catch (err) {
            console.error('Error al cargar secciones:', err);
            setError('Error al cargar las secciones');
            setSecciones([]);
        } finally {
            setLoading(false);
        }
    };

    const loadServicios = async () => {
        try {
            //llamada a la API
            const result = await axios.get("http://localhost:8080/servicio");


            setServicios(result.data || []);
        } catch (err) {
            console.warn('Error al cargar servicios:', err);
            setServicios([]);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombreSeccionServicio) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la seccion "${nombreSeccionServicio}"?`)) {
            try {
                const response = await axios.delete(`http://localhost:8080/seccionesServicio/${id}`);

                // eliminación exitosa
                console.log(`Eliminando seccion con ID: ${id}`);

                // Actualizar la lista local
                setSecciones(prev => prev.filter(p => p.idSeccionServicio !== id));
                alert('seccion eliminada exitosamente');
            } catch (error) {
                console.error('Error al eliminar la seccion:', error.response?.data || error.message);
                // Manejar diferentes tipos de errores
                if (error.response?.status === 409) {
                    alert('No se puede eliminar la seccion porque tiene dependencias asociadas');
                } else if (error.response?.status === 404) {
                    alert('La seccion no fue encontrado');
                } else {
                    alert('Error al eliminar la seccion');
                }
            }
        }
    };

    // Función para manejar ver seccion
    const handleVerSeccion = (seccion) => {
        setSeccionSeleccionada(seccion);
        setShowVerSeccion(true);
    };

    // Función para manejar editar seccion
    const handleEditarSeccion = (seccion) => {
        setSeccionSeleccionada(seccion);
        setModoEdicion(true);
        setShowCrearSeccion(true);
    };

    // Función para crear nuevo seccion
    const handleNuevaSeccion = () => {
        setSeccionSeleccionada(null);
        setModoEdicion(false);
        setShowCrearSeccion(true);
    };

    // Función para cerrar formularios
    const handleCerrarFormularios = () => {
        setShowCrearSeccion(false);
        setShowVerSeccion(false);
        setSeccionSeleccionada(null);
        setModoEdicion(false);
    };

    // Función para obtener el nombre del servicio
    const getSeccionNombre = (seccion) => {
        if (seccion.nombreServicio) {
            return seccion.nombreServicio;
        }
        return 'Sin servicio';
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
                <div className='m-10 text-5xl text-center font-bold'>Ver Todas las Secciones:</div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando secciones...</p>
                </div>
            </div>
        );
    }

    // Mostrar componente de crear/editar seccion
    if (showCrearSeccion) {
        return (
            <CrearEditarSeccion
                seccion={seccionSeleccionada}
                servicios={servicios}
                modoEdicion={modoEdicion}
                onVolver={handleCerrarFormularios}
                onActualizar={loadSecciones}
            />
        );
    }

    // Mostrar componente de ver seccion
    if (showVerSeccion && seccionSeleccionada) {
        return (
            <VerSeccion
                seccion={seccionSeleccionada}
                onVolver={handleCerrarFormularios}
            />
        );
    }


    // Lógica de paginación
    const totalPages = Math.ceil(secciones.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSecciones = secciones.slice(startIndex, endIndex);

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
            <div className='m-10 text-5xl text-center font-bold'>Ver Todas las Secciones:</div>

            {/* Botón para crear nueva seccion */}
            <button
                onClick={handleNuevaSeccion}
                className="mb-1 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2"
            >
                <CopyPlus size={22} color="white" strokeWidth={2} />
                Crear Seccion
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
                        <th className="p-3">Servicio</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 flex items-center justify-centers gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentSecciones.map((seccion) => (
                        <tr key={seccion.idSeccionServicio} className="border-b hover:bg-gray-50">
                            <td className="p-3 border border-gray-200 font-medium">
                                {seccion.idSeccionServicio}
                            </td>
                            <td className="p-3 border border-gray-200">
                                {seccion.nombre || 'Sin nombre'}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getSeccionNombre(seccion)}
                            </td>
                            <td className="p-3 border border-gray-200">
                                <span className={getEstadoColor(seccion.estado)}>
                                    {getEstadoTexto(seccion.estado)}
                                </span>
                            </td>
                            <td className="p-3 border border-gray-200 space-x-6">
                                {/* Botón Ver */}
                                <button
                                    onClick={() => handleVerSeccion(seccion)}
                                    title={`Ver seccion: ${seccion.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors ml-2"
                                    />
                                </button>

                                {/* Botón Editar */}
                                <button
                                    onClick={() => handleEditarSeccion(seccion)}
                                    title={`Editar seccion: ${seccion.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </button>

                                {/* Botón Eliminar */}
                                <button
                                    onClick={() => handleDelete(seccion.idSeccionServicio, seccion.nombre)}
                                    title={`Eliminar seccion: ${seccion.nombre}`}
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
                        Mostrando {startIndex + 1} a {Math.min(endIndex, secciones.length)} de {secciones.length} registros
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

            {/* Mensaje cuando no hay secciones */}
            {secciones.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay secciones disponibles</p>
                    <p className="text-sm">Crea tu primer seccion usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}

// Componente para Crear/Editar Secciones
function CrearEditarSeccion({ seccion, servicios, modoEdicion, onVolver, onActualizar }) {
    const [formData, setFormData] = useState({
        idSeccionServicio: seccion?.idSeccionServicio || '',
        nombre: seccion?.nombre || '',
        idServicio: seccion?.servicios?.idServicio || '',
        estado: seccion?.estado ?? true
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
            setError('El nombre de la seccion es requerido');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const seccionData = {
                idSeccionServicio: formData.idSeccionServicio || null,
                nombre: formData.nombre,
                idServicio: formData.idServicio || null,
                estado: formData.estado
            };

            console.log('Datos a enviar:', seccionData);

            if (modoEdicion) {
                await axios.put(`http://localhost:8080/seccionesServicio/${seccion.idSeccionServicio}`, seccionData);
                console.log(`Actualizando seccion ID: ${seccion.idSeccionServicio}`);
                alert('Seccion actualizada exitosamente');
            } else {
                await axios.post('http://localhost:8080/seccionesServicio', seccionData);
                console.log('Creando nueva seccion');
                alert('Seccion creada exitosamente');
            }

            onActualizar();
            onVolver();

        } catch (err) {
            setError(err.response?.data?.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} la seccion`);
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className='text-3xl font-bold text-gray-800 text-center'>
                    {modoEdicion ? 'Editar Seccion' : 'Crear Nuevo Seccion'}
                </div>

                {modoEdicion && (
                    <div className='p-4 text-center bg-orange-50 border border-orange-200 rounded-lg w-full'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <Edit size={16} className="text-orange-600" />
                            <span className='font-semibold text-orange-800'>Modificando seccion existente</span>
                        </div>
                        <div className='text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {seccion.idSeccionServicio}</div>
                        </div>
                    </div>
                )}

                <div className='w-full grid grid-cols-1 gap-6'>
                    {/* Nombre de la Seccion */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Seccion *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese el nombre de la seccion"
                        />
                    </div>

                    {/* Servicio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Servicio
                        </label>
                        <select
                            value={formData.idServicio}
                            onChange={(e) => handleInputChange('idServicio', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar servicio</option>
                            {servicios.map(servicio => (
                                <option key={servicio.idServicio} value={servicio.idServicio}>
                                    {servicio.nombre}
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

// Componente para Ver Seccion
function VerSeccion({ seccion, onVolver }) {
    const getServicioInfo = () => {
        if (seccion.idServicio) {
            return {
                id: seccion.idServicio,
                nombre: seccion.nombreServicio
            };
        }
        return {
            id: 'No asignado',
            nombre: 'Sin servicio'
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
    const servicioInfo = getServicioInfo();


    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center border-b pb-4'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Información de la Seccion</h1>
                </div>

                {/* Información Principal de la seccion*/}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                    {/* Columna Izquierda */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>ID:</div>
                            <div className='text-gray-900 font-medium'>{seccion.idSeccionServicio}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Nombre:</div>
                            <div className='text-gray-900'>{seccion.nombre || 'Sin nombre'}</div>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Estado:</div>
                            <div>
                                <span className={getEstadoColor(seccion.estado)}>
                                    {getEstadoTexto(seccion.estado)}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Servicio:</div>
                            <div className='text-gray-900'>
                                <div className='font-medium'>{servicioInfo.nombre}</div>
                                {servicioInfo.id !== 'No asignado' && (
                                    <div className='text-xs text-gray-500 mt-1'>ID: {servicioInfo.id}</div>
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