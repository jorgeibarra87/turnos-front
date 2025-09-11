import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, UsersIcon, BoxesIcon, ChevronLeft, ChevronRight, CalendarX, CalendarCog, CalendarCheck2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CrearCuadro from './CrearCuadro';
import { apiCuadroService } from '../Services/apiCuadroService';

export default function TurnosTable() {
    const [cuadros, setCuadros] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);



    // Cargar cuadros usando apiService
    const loadCuadros = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cuadrosAbiertos = await apiCuadroService.cuadros.getCuadros();
            setCuadros(cuadrosAbiertos);

            // Resetear página si es necesario
            const totalPages = Math.ceil(cuadrosAbiertos.length / itemsPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
            }
        } catch (err) {
            console.error('Error al cargar cuadros:', err);
            setError('Error al cargar los cuadros. Intenta nuevamente.');
            setCuadros([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage]);

    // Función para manejar la eliminación (cerrar cuadro)
    const handleDelete = useCallback(async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres cerrar el cuadro "${nombre}"? La versión actual se mantendrá.`)) {
            try {
                await apiCuadroService.cuadros.cerrar(id);
                await loadCuadros();
                alert('Cuadro cerrado exitosamente. La versión se ha mantenido.');
            } catch (error) {
                console.error('Error al cerrar el cuadro:', error);

                if (error.response?.status === 409) {
                    alert('No se puede cerrar el cuadro porque tiene dependencias asociadas');
                } else if (error.response?.status === 404) {
                    alert('El cuadro no fue encontrado');
                } else {
                    alert('Error al cerrar el cuadro');
                }
            }
        }
    }, [loadCuadros]);

    // Función para re-abrir un cuadro
    const handleUnDelete = useCallback(async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres re-abrir el cuadro "${nombre}"? Esto creará una nueva versión del cuadro.`)) {
            try {
                await apiCuadroService.cuadros.abrir(id);
                await loadCuadros();
                alert('Cuadro re-abierto exitosamente con nueva versión.');
            } catch (error) {
                console.error('Error al re-abrir el cuadro:', error);

                if (error.response?.status === 409) {
                    alert('No se puede re-abrir el cuadro porque tiene dependencias asociadas');
                } else if (error.response?.status === 404) {
                    alert('El cuadro no fue encontrado');
                } else {
                    alert('Error al re-abrir el cuadro');
                }
            }
        }
    }, [loadCuadros]);


    useEffect(() => {
        loadCuadros();
    }, [loadCuadros]);

    // Lógica de paginación
    const totalPages = Math.ceil(cuadros.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCuadros = cuadros.slice(startIndex, endIndex);

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
                <CalendarCog size={40} className="text-primary-green-husj" />
                <h1 className="text-4xl font-extrabold text-gray-800">
                    Gestion Cuadros de Turno
                </h1>
            </div>

            {/* Información sobre el manejo de versiones */}
            {/* <div className="mb-3 p-1 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-xs text-blue-700">
                            <strong>Manejo de Versiones:</strong> Al cerrar un cuadro se mantiene su versión actual.
                            Al reabrirlo, se genera automáticamente una nueva versión (ej: 0925_v1 → 0925_v2).
                        </p>
                    </div>
                </div>
            </div> */}


            <div className="flex justify-between items-center mb-4">
                <Link to="/crearCuadro">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2">
                        <CopyPlus size={22} color="white" strokeWidth={2} />
                        Crear Cuadro de Turno
                    </button>
                </Link>

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

            <table className="w-full text-left text-sm">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-3">Id</th>
                        <th className="p-3">Cuadro</th>
                        <th className="p-3 flex items-center gap-2"><UsersIcon />Equipo</th>
                        <th className="p-3">Versión</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCuadros.map((cuadro) => (
                        <tr key={cuadro.idCuadroTurno} className="border-b">
                            <td className="p-3 text-xs">{cuadro.idCuadroTurno}</td>
                            <td className="p-3 text-xs">{cuadro.nombre}</td>
                            <td className="p-3 text-xs">{cuadro?.nombreEquipo || 'Sin equipo'}</td>
                            <td className="p-3 text-xs">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    {cuadro.version || 'N/A'}
                                </span>
                            </td>
                            <td className="p-3 text-xs">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${cuadro.estadoCuadro === 'abierto'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {cuadro.estadoCuadro}
                                </span>
                            </td>
                            <td className="p-3 space-x-3">
                                <Link
                                    to={`/VerCuadro/${cuadro.idCuadroTurno}`}
                                    title={`Ver cuadro: ${cuadro.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors"
                                    />
                                </Link>

                                {/* Botón editar cuadro */}
                                {cuadro.estadoCuadro === 'abierto' && (
                                    <Link
                                        to={`/crearCuadro/editar/${cuadro.idCuadroTurno}`}
                                        title={`Editar cuadro: ${cuadro.nombre}`}
                                        className="inline-block"
                                    >
                                        <Edit
                                            size={18}
                                            className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                        />
                                    </Link>
                                )}

                                {/* Botón cerrar cuadro */}
                                {cuadro.estadoCuadro === 'abierto' && (
                                    <button
                                        onClick={() => handleDelete(cuadro.idCuadroTurno, cuadro.nombre)}
                                        title={`Eliminar cuadro: ${cuadro.nombre}`}
                                        className="inline-block"
                                    >
                                        <CalendarX
                                            size={18}
                                            className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
                                        />
                                    </button>
                                )}

                                {/* Botón abrir cuadro */}
                                {cuadro.estadoCuadro === 'cerrado' && (
                                    <button
                                        onClick={() => handleUnDelete(cuadro.idCuadroTurno, cuadro.nombre)}
                                        title={`Re-Abrir cuadro: ${cuadro.nombre}`}
                                        className="inline-block"
                                    >
                                        <CalendarCheck2
                                            size={18}
                                            className="text-yellow-600 hover:text-yellow-800 cursor-pointer transition-colors"
                                        />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Información de paginación y controles */}
            {cuadros.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Información de registros */}
                    <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, cuadros.length)} de {cuadros.length} registros
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

            {/* Mensaje cuando no hay cuadros */}
            {cuadros.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <BoxesIcon size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay cuadros de turno disponibles</p>
                    <p className="text-sm">Crea tu primer cuadro usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}