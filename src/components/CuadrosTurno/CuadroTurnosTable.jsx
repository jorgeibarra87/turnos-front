import React from 'react';
import { Eye, Edit, Trash2, CopyPlusIcon, CopyPlus, UsersIcon, BoxesIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CrearCuadro from './CrearCuadro';

export default function TurnosTable() {
    const [cuadros, setCuadros] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadCuadros();
    }, []);

    const loadCuadros = async () => {
        const result = await axios.get("http://localhost:8080/cuadro-turnos");
        const cuadrosAbiertos = result.data.filter(cuadro => cuadro.estadoCuadro === 'abierto');
        setCuadros(cuadrosAbiertos);
        // Resetear página si nos quedamos sin elementos en la página actual
        const totalPages = Math.ceil(cuadrosAbiertos.length / itemsPerPage);
        console.log("totalpages", totalPages);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres cerrar el cuadro "${nombre}"?`)) {
            try {
                const response = await axios.put('http://localhost:8080/cuadro-turnos/cambiar-estado', {
                    estadoActual: 'abierto',
                    nuevoEstado: 'cerrado',
                    idsCuadros: [id]
                });

                loadCuadros();
                alert('Cuadro cerrado exitosamente');
                console.log('Respuesta:', response.data);
            } catch (error) {
                console.error('Error al cerrar el cuadro:', error.response?.data || error.message);
                alert('Error al cerrar el cuadro');
            }
        }
    };

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
            <div className='m-10 text-5xl text-center font-bold'>Gestion Cuadros de Turno</div>

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
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3">Cuadro</th>
                        <th className="p-3 flex items-center gap-2"><UsersIcon />Equipo</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCuadros.map((cuadro) => (
                        <tr key={cuadro.idCuadroTurno} className="border-b">
                            <td className="p-3 text-xs">{cuadro.nombre}</td>
                            <td className="p-3 text-xs">{cuadro?.nombreEquipo || 'Sin equipo'}</td>
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

                                <Link
                                    to={`/crearCuadro/editar/${cuadro.idCuadroTurno}`}
                                    title={`Editar cuadro: ${cuadro.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer transition-colors"
                                    />
                                </Link>

                                <button
                                    onClick={() => handleDelete(cuadro.idCuadroTurno, cuadro.nombre)}
                                    title={`Eliminar cuadro: ${cuadro.nombre}`}
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