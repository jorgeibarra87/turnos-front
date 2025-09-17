import React from 'react';
import { Eye, Edit, Trash2, CopyPlusIcon, CopyPlus, UsersIcon, BoxesIcon, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { apiEquipoService } from '../Services/apiEquipoService';


export default function EquiposTable() {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Cargar equipos
    const loadEquipos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const equiposData = await apiEquipoService.equipos.getEquiposActivos();
            setEquipos(equiposData);

            // Resetear página si es necesario
            const totalPages = Math.ceil(equiposData.length / itemsPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
            }
        } catch (err) {
            console.error('Error al cargar equipos:', err);
            setError('Error al cargar los equipos. Intenta nuevamente.');
            setEquipos([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage]);

    //eliminación
    const handleDelete = useCallback(async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el equipo "${nombre}"?`)) {
            try {
                // verificar dependencias
                const deleteCheck = await apiEquipoService.equipos.canDelete(id);

                if (!deleteCheck.canDelete) {
                    alert(`No se puede eliminar el equipo "${nombre}" porque tiene ${deleteCheck.cuadrosCount} cuadro(s) de turno asociado(s). Primero debe cerrar o eliminar los cuadros de turno.`);
                    return;
                }

                // Usar apiEquipoService para eliminar
                await apiEquipoService.equipos.delete(id);
                await loadEquipos(); // Recargar lista
                alert('Equipo eliminado exitosamente');

            } catch (error) {
                console.error('Error al eliminar el equipo:', error);

                if (error.response?.status === 409) {
                    alert('No se puede eliminar el equipo porque tiene cuadros de turno asociados');
                } else if (error.response?.status === 404) {
                    alert('El equipo no fue encontrado');
                } else {
                    alert('Error al eliminar el equipo');
                }
            }
        }
    }, [loadEquipos]);

    useEffect(() => {
        loadEquipos();
    }, [loadEquipos]);

    // Función para obtener el número de miembros
    const getMiembrosCount = async (equipoId) => {
        try {
            const miembros = await apiEquipoService.equipos.getMiembros(equipoId);
            return miembros.length || 0;
        } catch (error) {
            console.warn(`No se pudo obtener el número de miembros para el equipo ${equipoId}`);
            return 0;
        }
    };

    // Función para extraer la categoría del nombre del equipo
    const extractCategory = (nombre) => {
        if (!nombre) return 'N/A';

        const parts = nombre.split('_');
        if (parts.length >= 2 && parts[0] === 'Equipo') {
            return parts[1]; // Retorna la categoría (Servicio, Proceso, etc.)
        }
        return 'Personalizado'; // Si no sigue
    };

    // Función para extraer el área/proceso
    /* const extractArea = (nombre) => {
        if (!nombre) return 'N/A';

        const parts = nombre.split('_');
        if (parts.length >= 3 && parts[0] === 'Equipo') {
            return parts[2]; // Retorna el área/proceso (UCI1, etc.)
        }
        return nombre; // Si no sigue
    }; */

    if (loading) {
        return (
            <div className="m-8 p-6 bg-white shadow rounded">
                <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                    <Users size={40} className="text-primary-green-husj" />
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Gestión de Equipos
                    </h1>
                </div>

                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando equipos...</p>
                </div>
            </div>
        );
    }


    // Lógica de paginación
    const totalPages = Math.ceil(equipos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEquipos = equipos.slice(startIndex, endIndex);

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
            <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                <Users size={40} className="text-primary-green-husj" />
                <h1 className="text-4xl font-extrabold text-gray-800">
                    Gestión de Equipos
                </h1>
            </div>

            {/* Botón para crear nuevo equipo */}
            <div className="flex justify-between items-center mb-4">
                <Link to="/crearEquipo">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2">
                        <CopyPlus size={22} color="white" strokeWidth={2} />
                        Crear Equipo
                    </button>
                </Link>

                {/* Información adicional */}
                {/* <div className="text-sm text-gray-600">
                    Total equipos: {equipos.length}
                </div> */}

                {/* Selector de elementos por página */}
                <div className="flex items-center gap-2">
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

            </div>

            {/* Mostrar error si existe */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                    {error}
                </div>
            )}


            {/* Tabla de equipos */}
            <table className="w-full text-left text-sm">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Nombre del Equipo</th>
                        <th className="p-3 flex items-center gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentEquipos.map((equipo) => (
                        <tr key={equipo.idEquipo || equipo.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-xs font-mono">
                                {equipo.idEquipo || equipo.id}
                            </td>
                            <td className="p-3 text-xs font-medium">
                                {equipo.nombre || 'Sin nombre'}
                            </td>
                            <td className="p-3 space-x-3">
                                {/* Botón Ver - Link a vista detallada de equipo */}
                                <Link
                                    to={`/verEquipo/${equipo.idEquipo || equipo.id}`}
                                    title={`Ver equipo: ${equipo.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors"
                                    />
                                </Link>

                                {/* Botón Editar - Link dinámico con ID */}
                                <Link
                                    to={`/crearEquipo/editar/${equipo.idEquipo || equipo.id}`}
                                    title={`Editar equipo: ${equipo.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </Link>
                                {/* Botón Eliminar */}
                                {/* <button
                                    onClick={() => handleDelete(equipo.idEquipo || equipo.id, equipo.nombre)}
                                    title={`Eliminar equipo: ${equipo.nombre}`}
                                    className="inline-block"
                                >
                                    <Trash2
                                        size={18}
                                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
                                    />
                                </button> */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Información de paginación y controles */}
            {equipos.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Información de registros */}
                    <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, equipos.length)} de {equipos.length} registros
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

            {/* Mensaje cuando no hay equipos */}
            {equipos.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay equipos disponibles</p>
                    <p className="text-sm">Crea tu primer equipo usando el botón de arriba</p>
                </div>
            )}


        </div>
    );
}