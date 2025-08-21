import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ServiciosTable() {
    const [servicios, setServicios] = useState([]);
    const [bloques, setBloques] = useState([]);
    const [procesos, setProcesos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCrearServicio, setShowCrearServicio] = useState(false);
    const [showVerServicio, setShowVerServicio] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadServicios();
        loadBloques();
        loadProcesos();
    }, []);

    const loadServicios = async () => {
        try {
            setLoading(true);
            setError(null);
            // llamada a la API
            const result = await axios.get("http://localhost:8080/servicio");
            console.log('Servicios cargados:', result.data);
            let serviciosData = [];
            if (Array.isArray(result.data)) {
                serviciosData = result.data;
            } else {
                serviciosData = result.data.servicios || [];
            }
            setServicios(serviciosData);
        } catch (err) {
            console.error('Error al cargar servicios:', err);
            setError('Error al cargar los servicios');
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    const loadBloques = async () => {
        try {
            //llamada a la API
            const result = await axios.get("http://localhost:8080/bloqueServicio");


            setBloques(result.data || []);
        } catch (err) {
            console.warn('Error al cargar bloques:', err);
            setBloques([]);
        }
    };

    const loadProcesos = async () => {
        try {
            //llamada a la API
            const result = await axios.get("http://localhost:8080/procesos");


            setProcesos(result.data || []);
        } catch (err) {
            console.warn('Error al cargar procesos:', err);
            setProcesos([]);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombreServicio) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${nombreServicio}"?`)) {
            try {
                const response = await axios.delete(`http://localhost:8080/servicio/${id}`);

                // eliminación exitosa
                console.log(`Eliminando servicio con ID: ${id}`);

                // Actualizar la lista local
                setServicios(prev => prev.filter(p => p.idServicio !== id));
                alert('Servicio eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar el servicio:', error.response?.data || error.message);
                // Manejar diferentes tipos de errores
                if (error.response?.status === 409) {
                    alert('No se puede eliminar el servicio porque tiene dependencias asociadas');
                } else if (error.response?.status === 404) {
                    alert('El servicio no fue encontrado');
                } else {
                    alert('Error al eliminar el servicio');
                }
            }
        }
    };

    // Función para manejar ver servicio
    const handleVerServicio = (servicio) => {
        setServicioSeleccionado(servicio);
        setShowVerServicio(true);
    };

    // Función para manejar editar servicio
    const handleEditarServicio = (servicio) => {
        setServicioSeleccionado(servicio);
        setModoEdicion(true);
        setShowCrearServicio(true);
    };

    // Función para crear nuevo servicio
    const handleNuevoServicio = () => {
        setServicioSeleccionado(null);
        setModoEdicion(false);
        setShowCrearServicio(true);
    };

    // Función para cerrar formularios
    const handleCerrarFormularios = () => {
        setShowCrearServicio(false);
        setShowVerServicio(false);
        setServicioSeleccionado(null);
        setModoEdicion(false);
    };

    // Función para obtener el nombre del bloque
    const getBloqueNombre = (servicio) => {
        if (servicio.nombreBloqueServicio) {
            return servicio.nombreBloqueServicio;
        }
        return 'Sin bloque';
    };

    // Función para obtener el nombre del proceso
    const getProcesoNombre = (servicio) => {
        if (servicio.nombreProceso) {
            return servicio.nombreProceso;
        }
        return 'Sin proceso';
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
                <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Servicios:</div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando servicios...</p>
                </div>
            </div>
        );
    }

    // Mostrar componente de crear/editar servicio
    if (showCrearServicio) {
        return (
            <CrearEditarServicio
                servicio={servicioSeleccionado}
                bloques={bloques}
                procesos={procesos}
                modoEdicion={modoEdicion}
                onVolver={handleCerrarFormularios}
                onActualizar={loadServicios}
            />
        );
    }

    // Mostrar componente de ver servicio
    if (showVerServicio && servicioSeleccionado) {
        return (
            <VerServicio
                servicio={servicioSeleccionado}
                onVolver={handleCerrarFormularios}
            />
        );
    }


    // Lógica de paginación
    const totalPages = Math.ceil(servicios.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentServicios = servicios.slice(startIndex, endIndex);

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
            <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Servicios:</div>

            {/* Botón para crear nuevo servicio */}
            <button
                onClick={handleNuevoServicio}
                className="mb-1 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2"
            >
                <CopyPlus size={22} color="white" strokeWidth={2} />
                Crear Servicio
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

            {/* Tabla de servicios */}
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">bloque</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Proceso</th>
                        <th className="p-3 flex items-center justify-centers gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentServicios.map((servicio) => (
                        <tr key={servicio.idServicio} className="border-b hover:bg-gray-50">
                            <td className="p-3 border border-gray-200 font-medium">
                                {servicio.idServicio}
                            </td>
                            <td className="p-3 border border-gray-200">
                                {servicio.nombre || 'Sin nombre'}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getBloqueNombre(servicio)}
                            </td>
                            <td className="p-3 border border-gray-200">
                                <span className={getEstadoColor(servicio.estado)}>
                                    {getEstadoTexto(servicio.estado)}
                                </span>
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getProcesoNombre(servicio)}
                            </td>
                            <td className="p-3 border border-gray-200 space-x-6">
                                {/* Botón Ver */}
                                <button
                                    onClick={() => handleVerServicio(servicio)}
                                    title={`Ver servicio: ${servicio.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors ml-2"
                                    />
                                </button>

                                {/* Botón Editar */}
                                <button
                                    onClick={() => handleEditarServicio(servicio)}
                                    title={`Editar servicio: ${servicio.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </button>

                                {/* Botón Eliminar */}
                                <button
                                    onClick={() => handleDelete(servicio.idServicio, servicio.nombre)}
                                    title={`Eliminar servicio: ${servicio.nombre}`}
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
            {servicios.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Información de registros */}
                    <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, servicios.length)} de {servicios.length} registros
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

            {/* Mensaje cuando no hay servicios */}
            {servicios.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay servicios disponibles</p>
                    <p className="text-sm">Crea tu primer servicio usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}

// Componente para Crear/Editar Servicio
function CrearEditarServicio({ servicio, bloques, procesos, modoEdicion, onVolver, onActualizar }) {
    const [formData, setFormData] = useState({
        nombre: servicio?.nombre || '',
        idBloqueServicio: servicio?.bloques?.idBloqueServicio || '',
        estado: servicio?.estado ?? true,
        idProceso: servicio?.procesos?.idProceso || '',
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
            setError('El nombre del servicio es requerido');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const servicioData = {
                nombre: formData.nombre,
                idBloqueServicio: formData.idBloqueServicio || null,
                estado: formData.estado,
                idProceso: formData.idProceso || null
            };

            console.log('Datos a enviar:', servicioData);

            if (modoEdicion) {
                await axios.put(`http://localhost:8080/servicio/${servicio.idServicio}`, servicioData);
                console.log(`Actualizando servicio ID: ${servicio.idServicio}`);
                alert('Servicio actualizado exitosamente');
            } else {
                await axios.post('http://localhost:8080/servicio', servicioData);
                console.log('Creando nuevo servicio');
                alert('Servicio creado exitosamente');
            }

            onActualizar();
            onVolver();

        } catch (err) {
            setError(err.response?.data?.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} el servicio`);
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className='text-3xl font-bold text-gray-800 text-center'>
                    {modoEdicion ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                </div>

                {modoEdicion && (
                    <div className='p-4 text-center bg-orange-50 border border-orange-200 rounded-lg w-full'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <Edit size={16} className="text-orange-600" />
                            <span className='font-semibold text-orange-800'>Modificando servicio existente</span>
                        </div>
                        <div className='text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {servicio.idServicio}</div>
                        </div>
                    </div>
                )}

                <div className='w-full grid grid-cols-1 gap-6'>
                    {/* Nombre del Servicio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Servicio *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese el nombre del servicio"
                        />
                    </div>

                    {/* bloque */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            bloque
                        </label>
                        <select
                            value={formData.idBloqueServicio}
                            onChange={(e) => handleInputChange('idBloqueServicio', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar bloque</option>
                            {bloques.map(bloque => (
                                <option key={bloque.id} value={bloque.id}>
                                    {bloque.nombre
                                    }
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

                    {/* Proceso*/}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Proceso
                        </label>
                        <select
                            value={formData.idProceso}
                            onChange={(e) => handleInputChange('idProceso', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar proceso</option>
                            {procesos.map(proceso => (
                                <option key={proceso.id} value={proceso.id}>
                                    {proceso.nombre
                                    }
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

// Componente para Ver Servicio
function VerServicio({ servicio, onVolver }) {
    const getbloqueInfo = () => {
        if (servicio.idBloqueServicio
        ) {
            return {
                id: servicio.idBloqueServicio,
                nombre: servicio.nombreBloqueServicio

            };
        }
        return {
            id: 'No asignado',
            nombre: 'Sin bloque'
        };
    };

    const getprocesoInfo = () => {
        if (servicio.idProceso
        ) {
            return {
                id: servicio.idProceso,
                nombre: servicio.nombreProceso

            };
        }
        return {
            id: 'No asignado',
            nombre: 'Sin proceso'
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
    const bloqueInfo = getbloqueInfo();
    const procesoInfo = getprocesoInfo();


    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center border-b pb-4'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Información del Servicio</h1>
                </div>

                {/* Información Principal del Servicio */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                    {/* Columna Izquierda */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>ID Servicio:</div>
                            <div className='text-gray-900 font-medium'>{servicio.idServicio}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Nombre:</div>
                            <div className='text-gray-900'>{servicio.nombre || 'Sin nombre'}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>bloque:</div>
                            <div className='text-gray-900'>
                                <div className='font-medium'>{bloqueInfo.nombre}</div>
                                {bloqueInfo.id !== 'No asignado' && (
                                    <div className='text-xs text-gray-500 mt-1'>ID: {bloqueInfo.id}</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Columna Derecha */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Estado:</div>
                            <div>
                                <span className={getEstadoColor(servicio.estado)}>
                                    {getEstadoTexto(servicio.estado)}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-3'>
                            <div className='w-32 font-semibold text-gray-700 text-sm'>Proceso:</div>
                            <div className='text-gray-900'>
                                <div className='font-medium'>{procesoInfo.nombre}</div>
                                {bloqueInfo.id !== 'No asignado' && (
                                    <div className='text-xs text-gray-500 mt-1'>ID: {procesoInfo.id}</div>
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